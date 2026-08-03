"""Module AI trung tâm — MỌI tính năng gọi LLM (tóm tắt cuộc họp, sau này là
Trợ lý/chatbot) đều phải đi qua call_llm() ở đây. Không nơi nào khác trong
codebase được gọi thẳng OpenRouter/requests cho việc này.

Provider hiện tại: OpenRouter (https://openrouter.ai) — API tương thích chuẩn
OpenAI chat completions, cho phép đổi model bên dưới mà không phải sửa lại
bất kỳ call site nào (meetings/services.py chỉ biết đến call_llm()).
"""
import os

import requests

from integrations.crypto import decrypt_api_key
from integrations.models import CompanyAISetting

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-2.5-flash"


class AIConfigError(Exception):
    """AI chưa được cấu hình/bật cho công ty này — lỗi nghiệp vụ rõ ràng,
    view nên trả 400/422 kèm message này thay vì để lộ traceback 500."""
    pass


def call_llm(
    messages: list[dict],
    company_id: str,
    max_tokens: int = 1000,
    system_prompt: str | None = None,
    stream: bool = False,
    tools: list[dict] | None = None,
) -> str | dict:
    """Hàm DUY NHẤT gọi LLM (qua OpenRouter) trong toàn hệ thống.

    messages: dạng [{"role": "user"/"assistant", "content": "..."}] — hỗ trợ
    multi-turn ngay từ đầu để tái sử dụng được cho Trợ lý (chatbot) sau này.
    stream: để False cho các tác vụ một lượt (tóm tắt); chatbot sau này bật
    True để trả chữ dần (Server-Sent Events chuẩn OpenAI).
    tools: schema function-calling chuẩn OpenAI (Trợ lý AI dùng). Khi truyền
    tools, hàm trả về nguyên message dict (có thể chứa "tool_calls") thay vì
    chuỗi text, để caller tự xử lý vòng lặp gọi tool — không phá vỡ các call
    site cũ (tóm tắt cuộc họp...) vốn không truyền tools và vẫn nhận về string.
    """
    setting = CompanyAISetting.objects.filter(company_id=company_id).first()

    if setting is not None:
        # Công ty đã có cấu hình riêng trong Settings — nguồn này luôn ưu
        # tiên hơn OPENROUTER_API_KEY ở .env (bên dưới), kể cả khi tắt AI.
        if not setting.is_ai_enabled:
            raise AIConfigError("Tính năng AI đang tắt cho công ty này")
        try:
            api_key = decrypt_api_key(setting.api_key_encrypted)
        except ValueError as exc:
            raise AIConfigError(str(exc))
        if not api_key:
            raise AIConfigError("API key không hợp lệ")
    else:
        # Chưa cấu hình riêng cho công ty này -> fallback OPENROUTER_API_KEY
        # ở .env (dùng chung cho toàn hệ thống, tiện cho dev/single-tenant).
        api_key = os.getenv('OPENROUTER_API_KEY')
        if not api_key:
            raise AIConfigError("Công ty chưa cấu hình AI — vui lòng nhập API key ở Thiết lập AI")

    payload_messages = list(messages)
    if system_prompt:
        payload_messages = [{"role": "system", "content": system_prompt}, *payload_messages]

    payload = {
        "model": DEFAULT_MODEL,
        "messages": payload_messages,
        "max_tokens": max_tokens,
        "stream": stream,
    }
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    if stream:
        # Chatbot (giai đoạn sau) sẽ tự xử lý response streaming này để trả
        # chữ dần. Chưa có caller nào dùng stream=True ở giai đoạn hiện tại.
        response = requests.post(OPENROUTER_URL, json=payload, headers=headers, stream=True, timeout=60)
        response.raise_for_status()
        return response

    response = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=60)
    response.raise_for_status()
    data = response.json()
    message = data["choices"][0]["message"]
    return message if tools else message["content"]
