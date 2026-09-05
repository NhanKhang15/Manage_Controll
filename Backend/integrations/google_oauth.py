from urllib.parse import urlencode

import requests
from django.conf import settings

AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo"

OAUTH_SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
    "openid",
    "email",
]


def build_authorization_url(state: str) -> str:
    params = {
        "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
        "response_type": "code",
        "scope": " ".join(OAUTH_SCOPES),
        "access_type": "offline",
        # Ép Google luôn trả refresh_token, kể cả khi tài khoản này đã từng
        # cho phép trước đó — cần thiết vì mỗi lần "đổi tài khoản" phải chắc
        # chắn có refresh_token MỚI đúng cho tài khoản vừa chọn.
        "prompt": "consent",
        "state": state,
    }
    return f"{AUTH_ENDPOINT}?{urlencode(params)}"


def exchange_code_for_tokens(code: str) -> dict:
    resp = requests.post(TOKEN_ENDPOINT, data={
        "code": code,
        "client_id": settings.GOOGLE_OAUTH_CLIENT_ID,
        "client_secret": settings.GOOGLE_OAUTH_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_OAUTH_REDIRECT_URI,
        "grant_type": "authorization_code",
    }, timeout=15)
    resp.raise_for_status()
    return resp.json()


def fetch_userinfo_email(access_token: str) -> str:
    resp = requests.get(
        USERINFO_ENDPOINT, headers={"Authorization": f"Bearer {access_token}"}, timeout=15
    )
    resp.raise_for_status()
    return resp.json().get("email")
