import os
from django.conf import settings
from minio import Minio


def get_minio_client():
    endpoint = getattr(settings, 'MINIO_ENDPOINT', os.getenv('MINIO_ENDPOINT', 'localhost:9000'))
    access_key = getattr(settings, 'MINIO_ACCESS_KEY', os.getenv('MINIO_ACCESS_KEY', 'minioadmin'))
    secret_key = getattr(settings, 'MINIO_SECRET_KEY', os.getenv('MINIO_SECRET_KEY', 'minioadmin'))
    secure = getattr(settings, 'MINIO_USE_SSL', False)
    return Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)


def upload_file_to_minio(file_obj, filename=None):
    client = get_minio_client()
    bucket_name = getattr(settings, 'MINIO_BUCKET_NAME', os.getenv('MINIO_BUCKET_NAME', 'vela-attachments'))

    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)

    name = filename or getattr(file_obj, 'name', 'file')
    object_name = f"uploads/{name}"

    file_size = getattr(file_obj, 'size', 0)
    client.put_object(
        bucket_name,
        object_name,
        file_obj,
        length=file_size,
        content_type=getattr(file_obj, 'content_type', 'application/octet-stream')
    )

    external_endpoint = getattr(settings, 'MINIO_EXTERNAL_URL', f"http://{client._base_url}")
    file_url = f"{external_endpoint}/{bucket_name}/{object_name}"
    return {'url': file_url, 'name': name}
