from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Employee, EmployeeCompany


@api_view(['GET'])
def get_employees(request):
    company_id = request.query_params.get('company_id')
    if company_id:
        emp_ids = EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', flat=True)
        employees = Employee.objects.filter(id__in=emp_ids, is_active=True)
    else:
        employees = Employee.objects.filter(is_active=True)

    data = [
        {
            'id': str(e.id),
            'full_name': e.full_name,
            'email': e.email,
            'position_title': e.position_title
        }
        for e in employees
    ]
    return Response(data)
