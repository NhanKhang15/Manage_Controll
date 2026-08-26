from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, EmployeeCompany


@api_view(['GET'])
def get_employees(request):
    company_id = request.query_params.get('company_id')
    search = request.query_params.get('search', '').strip()
    limit_param = request.query_params.get('limit')
    # compact=1: bỏ email/phone khỏi payload cho những nơi chỉ cần chọn người
    # (gán PIC/người phối hợp...) và không hiển thị 2 trường này — giảm dữ liệu
    # cá nhân trả về không cần thiết.
    compact = request.query_params.get('compact', '').lower() in ('1', 'true')

    qs = Employee.objects.filter(is_active=True, user__isnull=False).prefetch_related('employee_departments__department')
    
    if company_id:
        emp_ids = EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', flat=True)
        qs = qs.filter(id__in=emp_ids)

    if search:
        qs = qs.filter(Q(full_name__icontains=search) | Q(email__icontains=search))

    if limit_param:
        try:
            limit = min(int(limit_param), 200)
            qs = qs[:limit]
        except ValueError:
            pass

    data = []
    for e in qs:
        primary_dept = ""
        depts = list(e.employee_departments.all())
        emp_dept = next((d for d in depts if d.is_primary), depts[0] if depts else None)
        if emp_dept and emp_dept.department:
            primary_dept = emp_dept.department.name

        row = {
            'id': str(e.id),
            'full_name': e.full_name,
            'avatar_initials_source': e.full_name,
            'primary_department_name': primary_dept,
            'has_account': True,
            'position_title': e.position_title,
            'avatar_url': e.avatar_url,
        }
        if not compact:
            row['email'] = e.email
            row['phone'] = e.phone
        data.append(row)

    return Response(data)
