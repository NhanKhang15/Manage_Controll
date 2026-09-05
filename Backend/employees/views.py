from django.db.models import Count, Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, EmployeeCompany, EmployeeReaction
from .rating import compute_rating_stats
from .services import get_employee_from_request


def _with_social_stats(qs):
    return qs.annotate(
        direct_reports_count=Count('direct_reports', filter=Q(direct_reports__is_active=True), distinct=True),
        likes_count=Count('reactions_received', filter=Q(reactions_received__reaction=EmployeeReaction.LIKE), distinct=True),
        dislikes_count=Count('reactions_received', filter=Q(reactions_received__reaction=EmployeeReaction.DISLIKE), distinct=True),
    )


def _serialize_employee(e, *, role_by_emp, viewer_reaction_by_emp, compact):
    primary_dept = ""
    depts = list(e.employee_departments.all())
    emp_dept = next((d for d in depts if d.is_primary), depts[0] if depts else None)
    if emp_dept and emp_dept.department:
        primary_dept = emp_dept.department.name

    rating, points, level = compute_rating_stats(e.likes_count, e.dislikes_count)

    row = {
        'id': str(e.id),
        'full_name': e.full_name,
        'avatar_initials_source': e.full_name,
        'primary_department_name': primary_dept,
        'has_account': True,
        'position_title': e.position_title,
        'avatar_url': e.avatar_url,
        'role_in_company': role_by_emp.get(e.id),
        'manager_id': str(e.manager_id) if e.manager_id else None,
        'manager_name': e.manager.full_name if e.manager_id else None,
        'manager_title': e.manager.position_title if e.manager_id else None,
        'direct_reports_count': e.direct_reports_count,
        'likes_count': e.likes_count,
        'dislikes_count': e.dislikes_count,
        'rating': rating,
        'points': points,
        'level': level,
        'viewer_reaction': viewer_reaction_by_emp.get(e.id),
    }
    if not compact:
        row['email'] = e.email
        row['phone'] = e.phone
        row['zalo'] = e.zalo
    return row


@api_view(['GET'])
def get_employees(request):
    company_id = request.query_params.get('company_id')
    search = request.query_params.get('search', '').strip()
    limit_param = request.query_params.get('limit')
    # compact=1: bỏ email/phone/zalo khỏi payload cho những nơi chỉ cần chọn người
    # (gán PIC/người phối hợp...) và không hiển thị các trường này — giảm dữ liệu
    # cá nhân trả về không cần thiết.
    compact = request.query_params.get('compact', '').lower() in ('1', 'true')

    qs = _with_social_stats(
        Employee.objects.filter(is_active=True, is_approved=True, user__isnull=False)
        .select_related('manager')
        .prefetch_related('employee_departments__department')
    )

    role_by_emp = {}
    if company_id:
        role_by_emp = dict(
            EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', 'role_in_company')
        )
        qs = qs.filter(id__in=role_by_emp.keys())

    if search:
        qs = qs.filter(Q(full_name__icontains=search) | Q(email__icontains=search))

    if limit_param:
        try:
            limit = min(int(limit_param), 200)
            qs = qs[:limit]
        except ValueError:
            pass

    viewer = get_employee_from_request(request)
    viewer_reaction_by_emp = {}
    if viewer:
        viewer_reaction_by_emp = dict(
            EmployeeReaction.objects.filter(from_employee=viewer).values_list('to_employee_id', 'reaction')
        )

    data = [
        _serialize_employee(e, role_by_emp=role_by_emp, viewer_reaction_by_emp=viewer_reaction_by_emp, compact=compact)
        for e in qs
    ]
    return Response(data)


def _can_manage_pending(reviewer, company_id):
    """Ai được duyệt/từ chối tài khoản chờ duyệt của công ty này — tái dùng đúng
    quyền can_approve_proposals sẵn có (thường là BOD/HR) thay vì thêm cờ quyền mới."""
    if not reviewer or not company_id:
        return False
    return EmployeeCompany.objects.filter(
        employee=reviewer, company_id=company_id, can_approve_proposals=True
    ).exists()


@api_view(['GET'])
def pending_employees(request):
    """Nhân viên tự đăng ký, chưa được duyệt (is_approved=False) trong công ty —
    dữ liệu cho tab 'Chờ duyệt' ở trang Nhân sự."""
    company_id = request.query_params.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    emp_ids = EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', flat=True)
    qs = Employee.objects.filter(id__in=emp_ids, is_approved=False, user__isnull=False).order_by('created_at')

    reviewer = get_employee_from_request(request)
    data = [
        {
            'id': str(e.id),
            'full_name': e.full_name,
            'email': e.email,
            'created_at': e.created_at,
        }
        for e in qs
    ]
    return Response({'results': data, 'can_manage': _can_manage_pending(reviewer, company_id)})


@api_view(['POST'])
def approve_employee(request, pk):
    try:
        employee = Employee.objects.get(id=pk, is_approved=False)
    except Employee.DoesNotExist:
        return Response({'detail': 'Không tìm thấy tài khoản đang chờ duyệt'}, status=status.HTTP_404_NOT_FOUND)

    link = employee.employee_companies.first()
    reviewer = get_employee_from_request(request)
    if not _can_manage_pending(reviewer, link.company_id if link else None):
        return Response({'detail': 'Bạn không có quyền duyệt tài khoản'}, status=status.HTTP_403_FORBIDDEN)

    employee.is_approved = True
    employee.save(update_fields=['is_approved'])
    return Response({'id': str(employee.id), 'is_approved': True})


@api_view(['POST'])
def reject_employee(request, pk):
    try:
        employee = Employee.objects.get(id=pk, is_approved=False)
    except Employee.DoesNotExist:
        return Response({'detail': 'Không tìm thấy tài khoản đang chờ duyệt'}, status=status.HTTP_404_NOT_FOUND)

    link = employee.employee_companies.first()
    reviewer = get_employee_from_request(request)
    if not _can_manage_pending(reviewer, link.company_id if link else None):
        return Response({'detail': 'Bạn không có quyền từ chối tài khoản'}, status=status.HTTP_403_FORBIDDEN)

    # Xoá cả User đăng nhập gắn với nhân viên này — tài khoản chưa từng được duyệt
    # nên không có dữ liệu nào khác phụ thuộc, xoá sạch thay vì chỉ đánh dấu ẩn.
    user = employee.user
    if user:
        user.delete()
    else:
        employee.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def react_to_employee(request, pk):
    from_employee = get_employee_from_request(request)
    if from_employee is None:
        return Response({'detail': 'Chưa xác thực'}, status=status.HTTP_403_FORBIDDEN)

    reaction_type = request.data.get('type')
    if reaction_type not in (EmployeeReaction.LIKE, EmployeeReaction.DISLIKE):
        return Response({'detail': 'type phải là "like" hoặc "dislike"'}, status=status.HTTP_400_BAD_REQUEST)

    if str(from_employee.id) == str(pk):
        return Response({'detail': 'Không thể tự đánh giá chính mình'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        to_employee = Employee.objects.get(id=pk)
    except Employee.DoesNotExist:
        return Response({'detail': 'Không tìm thấy nhân viên'}, status=status.HTTP_404_NOT_FOUND)

    existing = EmployeeReaction.objects.filter(from_employee=from_employee, to_employee=to_employee).first()
    if existing and existing.reaction == reaction_type:
        existing.delete()
        viewer_reaction = None
    elif existing:
        existing.reaction = reaction_type
        existing.save(update_fields=['reaction'])
        viewer_reaction = reaction_type
    else:
        EmployeeReaction.objects.create(from_employee=from_employee, to_employee=to_employee, reaction=reaction_type)
        viewer_reaction = reaction_type

    likes = EmployeeReaction.objects.filter(to_employee=to_employee, reaction=EmployeeReaction.LIKE).count()
    dislikes = EmployeeReaction.objects.filter(to_employee=to_employee, reaction=EmployeeReaction.DISLIKE).count()
    rating, points, level = compute_rating_stats(likes, dislikes)

    return Response({
        'likes_count': likes,
        'dislikes_count': dislikes,
        'rating': rating,
        'points': points,
        'level': level,
        'viewer_reaction': viewer_reaction,
    })
