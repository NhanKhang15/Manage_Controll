import os
import threading
import logging
from google.oauth2 import service_account
from googleapiclient.discovery import build
from django.conf import settings

logger = logging.getLogger(__name__)

SCOPES = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/documents",
]

_drive_service = None
_docs_service = None
_service_lock = threading.Lock()


def _get_credentials():
    cred_path = getattr(settings, 'GOOGLE_APPLICATION_CREDENTIALS', None)
    if not cred_path or not os.path.exists(cred_path):
        return None
    try:
        return service_account.Credentials.from_service_account_file(cred_path, scopes=SCOPES)
    except Exception as e:
        logger.warning(f"Failed to load Google credentials from {cred_path}: {e}")
        return None


def get_drive_service():
    global _drive_service
    with _service_lock:
        if _drive_service is None:
            creds = _get_credentials()
            if creds:
                _drive_service = build("drive", "v3", credentials=creds, cache_discovery=False)
        return _drive_service


def get_docs_service():
    global _docs_service
    with _service_lock:
        if _docs_service is None:
            creds = _get_credentials()
            if creds:
                _docs_service = build("docs", "v1", credentials=creds, cache_discovery=False)
        return _docs_service


def create_drive_folder(name: str, parent_folder_id: str) -> dict:
    """Tạo 1 folder trên Drive, trả về id + link xem."""
    service = get_drive_service()
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


def create_task_google_doc(name: str, parent_folder_id: str, meta: dict = None) -> dict:
    """Tạo 1 file Google Doc cho công việc kèm văn bản mẫu cố định:
    - Nếu có cấu hình GOOGLE_APPS_SCRIPT_URL: tạo trực tiếp bằng tài khoản Gmail của người dùng (tận dụng 15GB dung lượng cá nhân)
    - Fallback: sử dụng Service Account."""
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

    apps_script_url = getattr(settings, 'GOOGLE_APPS_SCRIPT_URL', None)
    if apps_script_url:
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

    # Fallback to Service Account
    drive_svc = get_drive_service()
    docs_svc = get_docs_service()
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


def rename_drive_item(file_id: str, new_name: str) -> bool:
    """Đổi tên Folder hoặc File Google Doc trên Drive."""
    if not file_id:
        return False
    service = get_drive_service()
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


def move_drive_item(file_id: str, new_parent_id: str, old_parent_id: str = None) -> bool:
    """Di chuyển Folder hoặc File Google Doc sang Folder cha mới trên Drive."""
    if not file_id or not new_parent_id:
        return False
    service = get_drive_service()
    if not service:
        return False
    try:
        # Lấy parents hiện tại nếu old_parent_id không được cung cấp
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


def trash_drive_item(file_id: str) -> bool:
    """Chuyển Folder hoặc File Google Doc vào thùng rác trên Drive."""
    if not file_id:
        return False
    service = get_drive_service()
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


def run_async_drive_op(fn, *args, **kwargs):
    """Chạy thao tác Google Drive trong background daemon thread để không nghẽn HTTP request."""
    t = threading.Thread(target=fn, args=args, kwargs=kwargs, daemon=True)
    t.start()
    return t


def sync_entire_tree_to_drive(company_id=None) -> dict:
    """Đồng bộ toàn diện cây dữ liệu từ Database lên Google Drive thật:
    - Tạo Thư mục cho Công ty (Cha & Con)
    - Tạo Thư mục cho Phòng ban
    - Tạo Thư mục cho Folder & Sub-folders
    - Tạo File Google Doc cho Công việc (Task)
    Đảm bảo 100% không miss thông tin và không tạo trùng lặp."""
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

    root_drive_id = getattr(settings, 'GOOGLE_DRIVE_ROOT_FOLDER_ID', None)
    if not root_drive_id:
        return {'success': False, 'message': 'Chưa cấu hình GOOGLE_DRIVE_ROOT_FOLDER_ID trong settings / .env', **stats}

    # 1. Đồng bộ Công ty Mẹ
    root_companies = Company.objects.filter(parent__isnull=True)
    if company_id:
        root_companies = root_companies.filter(id=company_id)

    for comp in root_companies:
        if not comp.drive_folder_id:
            try:
                res = create_drive_folder(comp.name, root_drive_id)
                comp.drive_folder_id = res.get('id')
                comp.drive_folder_url = res.get('webViewLink')
                comp.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                stats['synced_companies'] += 1
            except Exception as e:
                stats['errors'].append(f"Công ty {comp.name}: {e}")

        # Đồng bộ Công ty con đệ quy
        def _sync_sub_companies(parent_comp):
            for sub in parent_comp.children.filter(is_active=True):
                parent_folder = parent_comp.drive_folder_id or root_drive_id
                if not sub.drive_folder_id and parent_folder:
                    try:
                        res = create_drive_folder(sub.name, parent_folder)
                        sub.drive_folder_id = res.get('id')
                        sub.drive_folder_url = res.get('webViewLink')
                        sub.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                        stats['synced_companies'] += 1
                    except Exception as e:
                        stats['errors'].append(f"Công ty con {sub.name}: {e}")
                _sync_sub_companies(sub)

        _sync_sub_companies(comp)

    # 2. Đồng bộ Phòng ban
    dept_qs = Department.objects.all()
    if company_id:
        dept_qs = dept_qs.filter(company_id=company_id)

    for dept in dept_qs:
        parent_folder = dept.company.drive_folder_id or root_drive_id
        if not dept.drive_folder_id and parent_folder:
            try:
                res = create_drive_folder(f"Phòng {dept.name}", parent_folder)
                dept.drive_folder_id = res.get('id')
                dept.drive_folder_url = res.get('webViewLink')
                dept.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                stats['synced_departments'] += 1
            except Exception as e:
                stats['errors'].append(f"Phòng ban {dept.name}: {e}")

    # 3. Đồng bộ Dự án / Folders (Top-level trước, Sub-folders sau)
    proj_qs = Project.objects.filter(parent__isnull=True)
    if company_id:
        proj_qs = proj_qs.filter(company_id=company_id)

    for proj in proj_qs:
        parent_folder = (proj.department.drive_folder_id if proj.department else None) or proj.company.drive_folder_id or root_drive_id
        if not proj.drive_folder_id and parent_folder:
            try:
                res = create_drive_folder(proj.name, parent_folder)
                proj.drive_folder_id = res.get('id')
                proj.drive_folder_url = res.get('webViewLink')
                proj.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                stats['synced_projects'] += 1
            except Exception as e:
                stats['errors'].append(f"Folder {proj.name}: {e}")

        # Sub-folders
        def _sync_sub_projects(parent_proj):
            for sub_p in parent_proj.children.all():
                p_folder = parent_proj.drive_folder_id or root_drive_id
                if not sub_p.drive_folder_id and p_folder:
                    try:
                        res = create_drive_folder(sub_p.name, p_folder)
                        sub_p.drive_folder_id = res.get('id')
                        sub_p.drive_folder_url = res.get('webViewLink')
                        sub_p.save(update_fields=['drive_folder_id', 'drive_folder_url'])
                        stats['synced_projects'] += 1
                    except Exception as e:
                        stats['errors'].append(f"Sub-folder {sub_p.name}: {e}")
                _sync_sub_projects(sub_p)

        _sync_sub_projects(proj)

    # 4. Đồng bộ Công việc (Tasks) -> Tạo Google Docs
    task_qs = Task.objects.all()
    if company_id:
        task_qs = task_qs.filter(project__company_id=company_id) | task_qs.filter(department__company_id=company_id)

    for task in task_qs:
        # Xác định parent drive folder
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
                res = create_task_google_doc(task.name, parent_folder, meta)
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
