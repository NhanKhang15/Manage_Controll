"""Vòng lặp điều phối hội thoại Trợ lý AI: gọi LLM kèm tools, thực thi tool,
đưa kết quả trở lại LLM cho đến khi có câu trả lời text cuối cùng."""
import json

from integrations.ai_client import call_llm
from .models import Message
from .prompts import build_system_prompt
from .tools import TOOL_SCHEMAS, dispatch_tool

MAX_TOOL_ITERATIONS = 5
DEFAULT_TITLE = 'Cuộc trò chuyện mới'


def send_message(conversation, employee, user_content):
    Message.objects.create(conversation=conversation, role='user', content=user_content)

    llm_messages = [
        {"role": m['role'], "content": m['content']}
        for m in conversation.messages.order_by('created_at').values('role', 'content')
    ]
    system_prompt = build_system_prompt(employee, conversation.company)

    final_text = "Yêu cầu cần quá nhiều bước xử lý, vui lòng thử chia nhỏ câu hỏi."
    for _ in range(MAX_TOOL_ITERATIONS):
        result = call_llm(
            messages=llm_messages,
            company_id=conversation.company_id,
            max_tokens=1200,
            system_prompt=system_prompt,
            tools=TOOL_SCHEMAS,
        )
        tool_calls = result.get('tool_calls')
        if not tool_calls:
            final_text = result.get('content') or "Xin lỗi, tôi chưa có câu trả lời phù hợp."
            break

        llm_messages.append({"role": "assistant", "content": result.get('content'), "tool_calls": tool_calls})
        for call in tool_calls:
            name = call['function']['name']
            try:
                args = json.loads(call['function']['arguments'] or '{}')
            except json.JSONDecodeError:
                args = {}
            try:
                tool_result = dispatch_tool(name, employee, conversation.company_id, args)
            except Exception as exc:
                tool_result = {"ok": False, "error": str(exc)}
            llm_messages.append({
                "role": "tool",
                "tool_call_id": call['id'],
                "content": json.dumps(tool_result, ensure_ascii=False, default=str),
            })

    assistant_msg = Message.objects.create(conversation=conversation, role='assistant', content=final_text)

    if conversation.title == DEFAULT_TITLE:
        conversation.title = user_content.strip()[:60]
    conversation.save(update_fields=['title', 'updated_at'])

    return assistant_msg
