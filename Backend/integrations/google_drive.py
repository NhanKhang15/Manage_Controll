import logging
import os
import threading

from django.conf import settings
from django.db.models import Q
from django.utils import timezone
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleAuthRequest
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
]


def _get_db_config(company_id):
    """Kết nối Drive của 1 công ty gốc — mỗi công ty đăng nhập 1 tài khoản
    Gmail cá nhân riêng qua OAuth (Cài đặt → Google Drive)."""
    if not company_id:
        return None
    try:
        from integrations.models import GoogleDriveConfig
        return GoogleDriveConfig.objects.filter(company_id=company_id).first()
    except Exception:
        return None


def get_root_folder_id(company_id):
    cfg = _get_db_config(company_id)
    if cfg and cfg.root_folder_id:
        return cfg.root_folder_id
    # Công ty chưa tự kết nối tài khoản riêng -> tạm dùng thư mục gốc dùng
    # chung cấu hình sẵn trong .env (tương thích ngược với trước khi có OAuth).
    return getattr(settings, 'GOOGLE_DRIVE_ROOT_FOLDER_ID', None)


def _get_oauth_credentials(company_id):
    """Lấy credentials OAuth của công ty, tự làm mới access token nếu hết hạn."""
    cfg = _get_db_config(company_id)
    if not cfg or not cfg.refresh_token_encrypted:
        return None

    from integrations.crypto import decrypt_api_key, encrypt_api_key

    creds = Credentials(
        token=decrypt_api_key(cfg.access_token_encrypted) if cfg.access_token_encrypted else None,
        refresh_token=decrypt_api_key(cfg.refresh_token_encrypted),
        token_uri="https://oauth2.googleapis.com/token",
        client_id=getattr(settings, 'GOOGLE_OAUTH_CLIENT_ID', None),
        client_secret=getattr(settings, 'GOOGLE_OAUTH_CLIENT_SECRET', None),
        scopes=SCOPES,
    )

    needs_refresh = not creds.token or (cfg.token_expiry and cfg.token_expiry <= timezone.now())
    if needs_refresh:
        try:
            creds.refresh(GoogleAuthRequest())
        except Exception as e:
            logger.warning(f"Failed to refresh Google OAuth token for company {company_id}: {e}")
            return None
        expiry = creds.expiry
        if expiry and timezone.is_naive(expiry):
            expiry = timezone.make_aware(expiry, timezone.utc)
        cfg.access_token_encrypted = encrypt_api_key(creds.token)
        cfg.token_expiry = expiry
        cfg.save(update_fields=['access_token_encrypted', 'token_expiry'])

    return creds


def _get_credentials(company_id=None):
    creds = _get_oauth_credentials(company_id)
    if creds:
        return creds

    # Công ty chưa kết nối OAuth riêng -> fallback Service Account dùng chung
    # cấu hình sẵn trong .env (hành vi cũ trước khi có kết nối theo công ty).
    cred_path = getattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS', None)
    if not cred_path or not os.path.exists(cred_path):
        return None
    try:
        return service_account.Credentials.from_service_account_file(cred_path, scopes=SCOPES)
    except Exception as e:
        logger.warning(f"Failed to load Google credentials from {cred_path}: {e}")
        return None


def get_drive_service(company_id=None):
    creds = _get_credentials(company_id)
    if not creds:
        return None
    return build("drive", "v3", credentials=creds, cache_discovery=False)


def get_docs_service(company_id=None):
    creds = _get_credentials(company_id)
    if not creds:
        return None
    return build("docs", "v1", credentials=creds, cache_discovery=False)


def create_drive_folder(company_id: str, name: str, parent_folder_id: str) -> dict:
    """Tạo 1 folder trên Drive, trả về id + link xem."""
    service = get_drive_service(company_id)
    if not service or not parent_folder_id:
        return {"id": None, "webViewLink": None}

    file_metadata = {
        "name": name.strip(),
        "mimeType": "application/vnd.google-apps.folder",
        "parents": [parent_folder_id],
    }
    folder = service.files().create(
        body=file_metadata, fields="id, webViewLink", supportsAllDrives=True
    ).execute()
    return {"id": folder.get("id"), "webViewLink": folder.get("webViewLink")}


def create_task_google_doc(company_id: str, name: str, parent_folder_id: str, meta: dict = None) -> dict:
    """Tạo 1 file Google Doc cho công việc kèm văn bản mẫu cố định. Công ty đã
    kết nối OAuth bằng chính tài khoản Gmail của họ -> tạo trực tiếp, dùng
    dung lượng cá nhân của chính họ, không cần "mẹo" Apps Script nữa. Công ty
    nào chưa kết nối riêng (đang rơi về Service Account dùng chung) mới cần
    mẹo Apps Script vì Service Account không có dung lượng lưu trữ riêng."""
    m = meta or {}
    company_str = m.get('company', '---')
    dept_str = m.get('department', '---')
    proj_str = m.get('project', '---')
    pic_str = m.get('pic', 'Chưa phân công')
    status_str = m.get('status', 'Cần làm')
    notes_str = m.get('notes', 'Chưa có ghi chú.')

    content = (
        f"HỒ SƠ CÔNG VIỆC: {name.strip().upper()}\n"
        f"{'='*65}\n\n"
        f"1. THÔNG TIN PHÂN CÔNG & QUẢN LÝ\n"
        f"• Pháp nhân / Công ty : {company_str}\n"
        f"• Phòng ban quản lý   : {dept_str}\n"
        f"• Thư mục / Dự án     : {proj_str}\n"
        f"• Người phụ trách (PIC): {pic_str}\n"
        f"• Trạng thái hiện tại : [{status_str}]\n\n"
        f"{'-'*65}\n"
        f"2. YÊU CẦU & MÔ TẢ CÔNG VIỆC\n"
        f"{notes_str}\n\n"
        f"{'-'*65}\n"
        f"3. NỘI DUNG THỰC HIỆN & BÁO CÁO KẾT QUẢ\n"
        f"(Nhân viên soạn thảo nội dung, dán liên kết tài liệu, hình ảnh và biên bản nghiệm thu tại đây...)\n\n"
    )

    cfg = _get_db_config(company_id)
    is_oauth_connected = bool(cfg and cfg.refresh_token_encrypted)
    apps_script_url = getattr(settings, 'GOOGLE_APPS_SCRIPT_URL', None)
    if not is_oauth_connected and apps_script_url:
        try:
            import requests
            payload = {
                "name": name.strip(),
                "parent_folder_id": parent_folder_id,
                "content": content
            }
            resp = requests.post(apps_script_url, json=payload, timeout=30)
            if resp.status_code == 200:
                res_data = resp.json()
                if res_data.get('success', True) and res_data.get('id'):
                    return {"id": res_data.get('id'), "webViewLink": res_data.get('webViewLink')}
                else:
                    logger.warning(f"Apps Script returned error: {res_data.get('error')}")
        except Exception as e:
            logger.warning(f"Failed to create Google Doc via Apps Script: {e}")

    drive_svc = get_drive_service(company_id)
    docs_svc = get_docs_service(company_id)
    if not drive_svc or not parent_folder_id:
        return {"id": None, "webViewLink": None}

    file_metadata = {
        "name": name.strip(),
        "mimeType": "application/vnd.google-apps.document",
        "parents": [parent_folder_id],
    }
    doc_file = drive_svc.files().create(
        body=file_metadata, fields="id, webViewLink", supportsAllDrives=True
    ).execute()
    doc_id = doc_file.get("id")
    web_link = doc_file.get("webViewLink")

    if docs_svc and doc_id:
        try:
            docs_svc.documents().batchUpdate(
                documentId=doc_id,
                body={'requests': [{'insertText': {'location': {'index': 1}, 'text': content}}]}
            ).execute()
        except Exception as e:
            logger.warning(f"Failed to populate initial Google Doc template: {e}")

    return {"id": doc_id, "webViewLink": web_link}


def rename_drive_item(company_id: str, file_id: str, new_name: str) -> bool:
    """Đổi tên Folder hoặc File Google Doc trên Drive."""
    if not file_id:
        return False
    service = get_drive_service(company_id)
    if not service:
        return False
    try:
        service.files().update(
            fileId=file_id,
            body={"name": new_name.strip()},
            supportsAllDrives=True
        ).execute()
        return True
    except Exception as e:
        logger.warning(f"Failed to rename Drive item {file_id}: {e}")
        return False


def move_drive_item(company_id: str, file_id: str, new_parent_id: str, old_parent_id: str = None) -> bool:
    """Di chuyển Folder hoặc File Google Doc sang Folder cha mới trên Drive."""
    if not file_id or not new_parent_id:
        return False
    service = get_drive_service(company_id)
    if not service:
        return False
    try:
        if not old_parent_id:
            file_meta = service.files().get(fileId=file_id, fields="parents", supportsAllDrives=True).execute()
            old_parent_id = ",".join(file_meta.get("parents", []))

        service.files().update(
            fileId=file_id,
            addParents=new_parent_id,
            removeParents=old_parent_id,
            fields="id, parents",
            supportsAllDrives=True
        ).execute()
        return True
    except Exception as e:
        logger.warning(f"Failed to move Drive item {file_id} to {new_parent_id}: {e}")
        return False


def trash_drive_item(company_id: str, file_id: str) -> bool:
    """Chuyển Folder hoặc File Google Doc vào thùng rác trên Drive."""
    if not file_id:
        return False
    service = get_drive_service(company_id)
    if not service:
        return False
    try:
        service.files().update(
            fileId=file_id,
            body={"trashed": True},
            supportsAllDrives=True
        ).execute()
        return True
    except Exception as e:
        logger.warning(f"Failed to trash Drive item {file_id}: {e}")
        return False


def verify_write_access(company_id: str, folder_id: str):
    """Kiểm tra thật sự tạo được nội dung trong thư mục gốc (không chỉ xem được).
    `files().get()` vẫn thành công dù tài khoản chỉ được chia sẻ quyền Xem, nên
    chỉ đọc metadata không phát hiện được thiếu quyền Chỉnh sửa (Editor) — ở đây
    tạo thử 1 folder con rồi xoá ngay để chắc chắn có quyền ghi."""
    service = get_drive_service(company_id)
    if not service:
        raise RuntimeError('Không khởi tạo được kết nối Drive')

    probe = service.files().create(
        body={
            "name": ".verify_probe",
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [folder_id],
        },
        fields="id",
        supportsAllDrives=True,
    ).execute()
    probe_id = probe.get("id")
    if probe_id:
        try:
            service.files().update(fileId=probe_id, body={"trashed": True}, supportsAllDrives=True).execute()
        except Exception as e:
            logger.warning(f"Failed to clean up Drive verify probe {probe_id}: {e}")


def run_async_drive_op(fn, *args, **kwargs):
    """Chạy thao tác Google Drive trong background daemon thread để không nghẽn HTTP request."""
    t = threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True)
    t.start()
    return t


def sync_entire_tree_to_drive(company_id) -> dict:
    """Đồng bộ toàn diện cây dữ liệu của 1 công ty gốc (và các công ty
    con/phòng ban/dự án/việc bên trong) lên Google Drive thật. Bắt buộc truyền
    company_id vì mỗi công ty gốc dùng 1 tài khoản Drive riêng — không còn
    đồng bộ "tất cả công ty" trong 1 lần vì mỗi công ty có thể là tài khoản
    Google khác nhau."""
    from companies.models import Company, Department
    from projects.models import Project
    from tasks.models import Task

    stats = {
        'synced_companies': 0,
        'synced_departments': 0,
        'synced_projects': 0,
        'synced_tasks': 0,
        'errors': []
    }

    if not company_id:
        return {'success': False, 'message': 'Thiếu company_id để đồng bộ', **stats}

    root_drive_id = get_root_folder_id(company_id)
    if not root_drive_id:
        return {'success': False, 'message': 'Chưa cấu hình thư mục gốc Google Drive (vào Thiết lập → Google Drive)', **stats}

    try:
        comp = Company.objects.get(id=company_id, parent__isnull=True)
    except Company.DoesNotExist:
        return {'success': False, 'message': 'company_id không phải công ty gốc', **stats}

    if not comp.drive_folder_id:
        try:
            res = create_drive_folder(company_id, comp.name, root_drive_id)
            comp.drive_folder_id = res.get('id')
            comp.drive_folder_url = res.get('webViewLink')
            comp.save(update_fields=['drive_folder_id', 'drive_folder_url'])
            stats['synced_companies'] += 1
        except Exception as e:
            stats['errors'].append(f"Công ty {comp.name}: {e}")

    def _sync_sub_companies(parent_comp):
        for sub in parent_comp.children.filter(is_active=True):
            parent_folder = parent_comp.drive_folder_id or root_drive_id
            if not sub.drive_folder_id and parent_folder:
                try:
                    res = create_drive_folder(company_id, sub.name, parent_folder)
                    sub.drive_folder_id = res.get('id')
                    sub.drive_folder_url = res.get('webViewLink')
                    sub.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                    stats['synced_companies'] += 1
                except Exception as e:
                    stats['errors'].append(f"Công ty con {sub.name}: {e}")
            _sync_sub_companies(sub)

    _sync_sub_companies(comp)

    # Toàn bộ công ty con (mọi cấp) thuộc nhóm pháp nhân này — cùng dùng chung
    # Drive của công ty gốc, nên phòng ban/dự án/việc của công ty con dù ở cấp
    # sâu bao nhiêu vẫn phải được gộp vào lần đồng bộ này.
    group_company_ids = [comp.id]
    frontier = [comp.id]
    while frontier:
        children_ids = list(Company.objects.filter(parent_id__in=frontier).values_list('id', flat=True))
        group_company_ids.extend(children_ids)
        frontier = children_ids

    dept_qs = Department.objects.filter(company_id__in=group_company_ids)
    for dept in dept_qs:
        parent_folder = dept.company.drive_folder_id or root_drive_id
        if not dept.drive_folder_id and parent_folder:
            try:
                res = create_drive_folder(company_id, f"Phòng {dept.name}", parent_folder)
                dept.drive_folder_id = res.get('id')
                dept.drive_folder_url = res.get('webViewLink')
                dept.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                stats['synced_departments'] += 1
            except Exception as e:
                stats['errors'].append(f"Phòng ban {dept.name}: {e}")

    proj_qs = Project.objects.filter(parent__isnull=True, company_id__in=group_company_ids)
    for proj in proj_qs:
        parent_folder = (proj.department.drive_folder_id if proj.department else None) or proj.company.drive_folder_id or root_drive_id
        if not proj.drive_folder_id and parent_folder:
            try:
                res = create_drive_folder(company_id, proj.name, parent_folder)
                proj.drive_folder_id = res.get('id')
                proj.drive_folder_url = res.get('webViewLink')
                proj.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                stats['synced_projects'] += 1
            except Exception as e:
                stats['errors'].append(f"Folder {proj.name}: {e}")

        def _sync_sub_projects(parent_proj):
            for sub_p in parent_proj.children.all():
                p_folder = parent_proj.drive_folder_id or root_drive_id
                if not sub_p.drive_folder_id and p_folder:
                    try:
                        res = create_drive_folder(company_id, sub_p.name, p_folder)
                        sub_p.drive_folder_id = res.get('id')
                        sub_p.drive_folder_url = res.get('webViewLink')
                        sub_p.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                        stats['synced_projects'] += 1
                    except Exception as e:
                        stats['errors'].append(f"Sub-folder {sub_p.name}: {e}")
                _sync_sub_projects(sub_p)

        _sync_sub_projects(proj)

    task_qs = Task.objects.filter(
        Q(project__company_id__in=group_company_ids) | Q(department__company_id__in=group_company_ids)
    )

    for task in task_qs:
        parent_folder = None
        if task.project and task.project.drive_folder_id:
            parent_folder = task.project.drive_folder_id
        elif task.department and task.department.drive_folder_id:
            parent_folder = task.department.drive_folder_id
        elif task.project and task.project.company.drive_folder_id:
            parent_folder = task.project.company.drive_folder_id
        elif task.department and task.department.company.drive_folder_id:
            parent_folder = task.department.company.drive_folder_id
        else:
            parent_folder = root_drive_id

        if not task.drive_file_id and parent_folder:
            try:
                meta = {
                    'company': task.department.company.name if (task.department and task.department.company) else (task.project.company.name if (task.project and task.project.company) else ''),
                    'department': task.department.name if task.department else '',
                    'project': task.project.name if task.project else '',
                    'pic': task.pic.full_name if task.pic else '',
                    'status': task.status or 'Cần làm',
                    'notes': task.notes or ''
                }
                res = create_task_google_doc(company_id, task.name, parent_folder, meta)
                task.drive_file_id = res.get('id')
                task.drive_file_url = res.get('webViewLink')
                task.save(update_fields=['drive_file_id', 'drive_file_url'])
                stats['synced_tasks'] += 1
            except Exception as e:
                stats['errors'].append(f"Công việc {task.name}: {e}")

    return {
        'success': True,
        'message': f"Đã đồng bộ {stats['synced_companies']} công ty, {stats['synced_departments']} phòng ban, {stats['synced_projects']} folder và {stats['synced_tasks']} file Google Docs lên Drive!",
        **stats
    }
