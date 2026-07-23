import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from django.conf import settings

SCOPES = ["https://www.googleapis.com/auth/drive"]


def get_drive_service():
    credentials = service_account.Credentials.from_service_account_file(
        settings.GOOGLE_APPLICATION_CREDENTIALS, scopes=SCOPES
    )
    return build("drive", "v3", credentials=credentials)


def create_drive_folder(name: str, parent_folder_id: str) -> dict:
    """Tạo 1 folder trên Drive, trả về id + link xem."""
    service = get_drive_service()
    file_metadata = {
        "name": name,
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_folder_id],
    }
    folder = service.files().create(
        body=file_metadata, fields="id, webViewLink"
    ).execute()
    return {"id": folder["id"], "webViewLink": folder["webViewLink"]}
