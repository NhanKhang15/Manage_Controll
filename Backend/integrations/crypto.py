import base64
import hashlib
import os

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings


def _get_fernet() -> Fernet:
    """Khoá mã hoá cho các secret nhạy cảm lưu trong DB (vd. Claude API key).

    Ưu tiên biến môi trường AI_ENCRYPTION_KEY (Fernet key chuẩn, 32 byte
    url-safe base64). Nếu chưa set, fallback derive từ SECRET_KEY để môi
    trường dev chạy được ngay không cần cấu hình thêm — production nên set
    AI_ENCRYPTION_KEY riêng vì SECRET_KEY có thể bị xoay vòng độc lập.
    """
    raw_key = os.getenv('AI_ENCRYPTION_KEY')
    if raw_key:
        return Fernet(raw_key.encode())

    derived = base64.urlsafe_b64encode(hashlib.sha256(settings.SECRET_KEY.encode()).digest())
    return Fernet(derived)


def encrypt_api_key(plain_text: str) -> str:
    if not plain_text:
        return ''
    return _get_fernet().encrypt(plain_text.encode()).decode()


def decrypt_api_key(encrypted_text: str) -> str:
    if not encrypted_text:
        return ''
    try:
        return _get_fernet().decrypt(encrypted_text.encode()).decode()
    except InvalidToken:
        raise ValueError("Không thể giải mã API key — dữ liệu hỏng hoặc sai khoá mã hoá")
