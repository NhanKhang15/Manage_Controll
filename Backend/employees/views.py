from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, EmployeeCompany


@api_view(['GET'])
def get_employees(request):
    company_id = request.query_params.get('company_id')
    qs = Employee.objects.filter(is_active=True, user__isnull=False)
    if company_id:
        emp_ids = EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', flat=True)
        qs = qs.filter(id__in=emp_ids)

    data = []
    for e in qs:
        primary_dept = ""
        emp_dept = e.employee_departments.filter(is_primary=True).first()
        if not emp_dept:
            emp_dept = e.employee_departments.first()
        if emp_dept:
            primary_dept = emp_dept.department.name

        data.append({
            'id': str(e.id),
            'full_name': e.full_name,
            'avatar_initials_source': e.full_name,
            'primary_department_name': primary_dept,
            'has_account': True,
            'email': e.email,
            'position_title': e.position_title,
            'avatar_url': e.avatar_url,
            'phone': e.phone,
        })

    return Response(data)
