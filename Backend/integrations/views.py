from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from employees.models import EmployeeCompany
from employees.services import get_employee_from_request
from integrations.crypto import encrypt_api_key
from integrations.models import CompanyAISetting

MANAGER_ROLES = ('Giám đốc', 'Quản lý')


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
