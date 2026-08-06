"""Vòng lặp điều phối hội thoại Trợ lý AI: gọi LLM kèm tools, thực thi tool,
đưa kết quả trở lại LLM cho đến khi có câu trả lời text cuối cùng."""
import json

from integrations.ai_client import call_llm
from .models import Message
from .prompts import build_system_prompt
from .tools import TOOL_SCHEMAS, dispatch_tool

MAX_TOOL_ITERATIONS = 5
DEFAULT_TITLE = 'Cuộc trò chuyện mới'


def _to_llm_content(row):
    """Chèn thông tin tệp đính kèm (nếu có) vào nội dung gửi cho LLM — AI chỉ
    biết tên/link tệp, không đọc được nội dung bên trong tệp."""
    text = row['content']
    if row['attachment_name']:
        note = f"\n\n[Tệp đính kèm: {row['attachment_name']}]"
        if row['attachment_url']:
            note += f" ({row['attachment_url']})"
        text += note
    return text


def send_message(conversation, employee, user_content, attachment_url=None, attachment_name=None):
    Message.objects.create(
        conversation=conversation,
        role='user',
        content=user_content,
        attachment_url=attachment_url,
        attachment_name=attachment_name,
    )

    llm_messages = [
        {"role": m['role'], "content": _to_llm_content(m)}
        for m in conversation.messages.order_by('created_at').values(
            'role', 'content', 'attachment_url', 'attachment_name'
        )
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
