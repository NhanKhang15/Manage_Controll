import json
from datetime import timedelta

from django.core import signing
from django.http import HttpResponse
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from companies.models import Company
from employees.models import EmployeeCompany
from employees.services import get_employee_from_request
from integrations.crypto import encrypt_api_key
from integrations.models import AuditLog, CompanyAISetting, GoogleDriveConfig
from integrations.google_drive import sync_entire_tree_to_drive, verify_write_access
from integrations.google_oauth import build_authorization_url, exchange_code_for_tokens, fetch_userinfo_email

MANAGER_ROLES = ('Giám đốc', 'Quản lý')

ACTION_LABEL = {'create': 'Tạo mới', 'update': 'Cập nhật', 'delete': 'Xoá', 'login': 'Đăng nhập'}

DRIVE_OAUTH_STATE_SALT = 'google-drive-oauth'


def _is_manager(employee, company_id):
    return EmployeeCompany.objects.filter(
        employee=employee, company_id=company_id, role_in_company__in=MANAGER_ROLES
    ).exists()


def _resolve_drive_root_id(company_id):
    """Kết nối Drive gắn ở công ty gốc — công ty con tự động dùng chung kết nối
    của công ty gốc, nên tự quy về root thay vì bắt frontend phải biết trước
    company_id nào là gốc. Trả None nếu company_id không tồn tại."""
    company = Company.objects.filter(id=company_id).first()
    return company.drive_account_company_id if company else None


def _google_drive_config_payload(cfg, company_id=None, **extra):
    if cfg is None:
        return {
            'company_id': company_id,
            'is_connected': False,
            'connected_email': None,
            'root_folder_id': None,
            'root_folder_url': None,
            'updated_at': None,
            **extra,
        }
    return {
        'company_id': cfg.company_id,
        'is_connected': bool(cfg.refresh_token_encrypted),
        'connected_email': cfg.connected_email,
        'root_folder_id': cfg.root_folder_id,
        'root_folder_url': cfg.root_folder_url,
        'updated_at': cfg.updated_at,
        **extra,
    }


@api_view(['GET'])
def recent_activity_view(request):
    current_emp = get_employee_from_request(request)
    if current_emp is None:
        return Response({'detail': 'Chưa xác thực'}, status=status.HTTP_403_FORBIDDEN)

    company_id = request.query_params.get('company_id')
    try:
        limit = min(int(request.query_params.get('limit', 20)), 100)
    except ValueError:
        limit = 20

    qs = AuditLog.objects.select_related('changed_by').order_by('-created_at')
    if company_id:
        qs = qs.filter(company_id=company_id)

    data = [
        {
            'id': a.id,
            'action': a.action,
            'description': a.description or f'{ACTION_LABEL.get(a.action, a.action)} {a.table_name}',
            'actor_id': a.changed_by_id,
            'actor_name': a.changed_by.full_name if a.changed_by else 'Hệ thống',
            'actor_avatar_url': a.changed_by.avatar_url if a.changed_by else None,
            'created_at': a.created_at,
        }
        for a in qs[:limit]
    ]
    return Response(data)


@api_view(['GET', 'PUT'])
def ai_settings_view(request):
    current_emp = get_employee_from_request(request)
    if current_emp is None:
        return Response({'detail': 'Tài khoản chưa gắn với nhân viên nào'}, status=status.HTTP_403_FORBIDDEN)

    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    setting = CompanyAISetting.objects.filter(company_id=company_id).first()

    if request.method == 'GET':
        return Response({
            'company_id': company_id,
            'is_ai_enabled': setting.is_ai_enabled if setting else False,
            'has_api_key': bool(setting and setting.api_key_encrypted) if setting else False,
        })

    is_manager = EmployeeCompany.objects.filter(
        employee=current_emp, company_id=company_id, role_in_company__in=MANAGER_ROLES
    ).exists()
    if not is_manager:
        return Response(
            {'detail': 'Chỉ Giám đốc/Quản lý mới được cấu hình AI'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if setting is None:
        setting = CompanyAISetting(company_id=company_id)

    api_key = request.data.get('api_key')
    if api_key:
        setting.api_key_encrypted = encrypt_api_key(api_key)

    if 'is_ai_enabled' in request.data:
        setting.is_ai_enabled = bool(request.data.get('is_ai_enabled'))

    setting.updated_by = current_emp
    setting.save()

    return Response({
        'company_id': company_id,
        'is_ai_enabled': setting.is_ai_enabled,
        'has_api_key': bool(setting.api_key_encrypted),
    })


@api_view(['GET', 'PUT'])
def google_drive_config_view(request):
    current_emp = get_employee_from_request(request)
    if current_emp is None:
        return Response({'detail': 'Tài khoản chưa gắn với nhân viên nào'}, status=status.HTTP_403_FORBIDDEN)

    requested_company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not requested_company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    root_id = _resolve_drive_root_id(requested_company_id)
    if root_id is None:
        return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    cfg = GoogleDriveConfig.objects.filter(company_id=root_id).first()

    if request.method == 'GET':
        return Response(_google_drive_config_payload(cfg, company_id=root_id))

    if not _is_manager(current_emp, requested_company_id):
        return Response(
            {'detail': 'Chỉ Giám đốc/Quản lý của công ty này mới được cấu hình Google Drive'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if cfg is None or not cfg.refresh_token_encrypted:
        return Response(
            {'detail': 'Chưa kết nối tài khoản Google — bấm "Đăng nhập bằng Google" trước khi lưu thư mục'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if 'root_folder_id' in request.data:
        cfg.root_folder_id = (request.data.get('root_folder_id') or '').strip() or None
    if 'root_folder_url' in request.data:
        cfg.root_folder_url = (request.data.get('root_folder_url') or '').strip() or None

    cfg.updated_by = current_emp
    cfg.save()

    verify_error = None
    resync_result = None

    if cfg.root_folder_id:
        try:
            verify_write_access(root_id, cfg.root_folder_id)
        except Exception as e:
            who = cfg.connected_email or 'tài khoản Google đã kết nối'
            verify_error = f'Không tạo được nội dung trong thư mục gốc — kiểm tra đã chia sẻ quyền Chỉnh sửa (Editor), không phải chỉ Xem, thư mục đó cho {who} chưa. Chi tiết: {e}'

        if verify_error is None:
            # "Đổi tài khoản/thư mục và đồng bộ luôn": nếu người dùng chọn xoá liên
            # kết cũ (đổi hẳn sang tài khoản khác), null hết ID cũ trước — nếu
            # không, sync_entire_tree_to_drive sẽ tưởng các bản ghi này đã đồng bộ
            # rồi (ID không rỗng) dù tài khoản mới không có quyền xem file cũ đó.
            # Chỉ áp dụng cho ĐÚNG công ty này (và công ty con của nó).
            if request.data.get('reset_existing_links'):
                from companies.models import Department
                from projects.models import Project
                from tasks.models import Task

                group_ids = [root_id]
                frontier = [root_id]
                while frontier:
                    children_ids = list(Company.objects.filter(parent_id__in=frontier).values_list('id', flat=True))
                    group_ids.extend(children_ids)
                    frontier = children_ids

                Company.objects.filter(id__in=group_ids).update(drive_folder_id=None, drive_folder_url=None)
                Department.objects.filter(company_id__in=group_ids).update(drive_folder_id=None, drive_folder_url=None)
                Project.objects.filter(company_id__in=group_ids).update(drive_folder_id=None, drive_folder_url=None)
                Task.objects.filter(project__company_id__in=group_ids).update(drive_file_id=None, drive_file_url=None)
                Task.objects.filter(department__company_id__in=group_ids).update(drive_file_id=None, drive_file_url=None)

            resync_result = sync_entire_tree_to_drive(root_id)

    return Response(_google_drive_config_payload(
        cfg, company_id=root_id, verified=verify_error is None, verify_error=verify_error, resync=resync_result,
    ))


@api_view(['POST'])
def google_drive_oauth_start_view(request):
    """Trả về link đăng nhập Google — frontend mở link này trong popup."""
    current_emp = get_employee_from_request(request)
    if current_emp is None:
        return Response({'detail': 'Tài khoản chưa gắn với nhân viên nào'}, status=status.HTTP_403_FORBIDDEN)

    requested_company_id = request.data.get('company_id')
    if not requested_company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    root_id = _resolve_drive_root_id(requested_company_id)
    if root_id is None:
        return Response({'detail': 'Công ty không tồn tại'}, status=status.HTTP_404_NOT_FOUND)

    if not _is_manager(current_emp, requested_company_id):
        return Response(
            {'detail': 'Chỉ Giám đốc/Quản lý của công ty này mới được kết nối Google Drive'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if not settings.GOOGLE_OAUTH_CLIENT_ID or not settings.GOOGLE_OAUTH_CLIENT_SECRET:
        return Response(
            {'detail': 'Server chưa cấu hình GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET trong .env'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    state = signing.dumps({'company_id': root_id, 'employee_id': current_emp.id}, salt=DRIVE_OAUTH_STATE_SALT)
    return Response({'auth_url': build_authorization_url(state)})


def _oauth_popup_response(success: bool, message: str = '', email: str = '', company_id: str = ''):
    payload = json.dumps({
        'type': 'google-drive-oauth-result',
        'success': success,
        'message': message,
        'email': email,
        'company_id': company_id,
    })
    body = (
        'Đã kết nối Google Drive, cửa sổ này sẽ tự đóng...'
        if success else f'Kết nối Google Drive thất bại: {message}'
    )
    html = (
        "<!doctype html><html><body style=\"font-family:sans-serif;padding:24px;\">"
        f"<script>window.opener && window.opener.postMessage({payload}, '*'); window.close();</script>"
        f"<p>{body}</p>"
        "</body></html>"
    )
    return HttpResponse(html)


def google_drive_oauth_callback_view(request):
    """Google redirect thẳng về đây (không qua JWT của app) sau khi người dùng
    bấm Cho phép — chạy trong popup, đóng cửa sổ và báo kết quả về cho trang
    Cài đặt qua postMessage."""
    error = request.GET.get('error')
    if error:
        return _oauth_popup_response(False, message=error)

    code = request.GET.get('code')
    state = request.GET.get('state')
    if not code or not state:
        return _oauth_popup_response(False, message='Thiếu mã xác thực từ Google')

    try:
        data = signing.loads(state, salt=DRIVE_OAUTH_STATE_SALT, max_age=600)
    except signing.BadSignature:
        return _oauth_popup_response(False, message='Phiên kết nối không hợp lệ hoặc đã hết hạn, vui lòng thử lại')

    company_id = data['company_id']
    employee_id = data.get('employee_id')

    try:
        tokens = exchange_code_for_tokens(code)
        email = fetch_userinfo_email(tokens['access_token'])
    except Exception as e:
        return _oauth_popup_response(False, message=str(e), company_id=company_id)

    cfg, _created = GoogleDriveConfig.objects.get_or_create(company_id=company_id)
    cfg.connected_email = email
    cfg.access_token_encrypted = encrypt_api_key(tokens['access_token'])
    if tokens.get('refresh_token'):
        # Google chỉ trả refresh_token khi thật sự cần (lần đầu, hoặc do ta ép
        # prompt=consent) — luôn ghi đè để đảm bảo đổi tài khoản là có token mới.
        cfg.refresh_token_encrypted = encrypt_api_key(tokens['refresh_token'])
    cfg.token_expiry = timezone.now() + timedelta(seconds=tokens.get('expires_in', 3600))
    cfg.updated_by_id = employee_id
    cfg.save()

    return _oauth_popup_response(True, email=email, company_id=company_id)
