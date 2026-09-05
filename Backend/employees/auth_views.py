from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from employees.models import Employee, EmployeeCompany
from employees.serializers import EmployeeSerializer
from integrations.models import AuditLog


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'detail': 'Vui lòng nhập email và mật khẩu'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=email, password=password)
    if user is None or not user.is_active:
        return Response({'detail': 'Email hoặc mật khẩu không đúng'}, status=status.HTTP_401_UNAUTHORIZED)

    employee = getattr(user, 'employee', None)
    if employee is not None and not employee.is_approved:
        return Response(
            {'detail': 'Tài khoản đang chờ quản lý duyệt, vui lòng thử lại sau'},
            status=status.HTTP_403_FORBIDDEN,
        )

    refresh = RefreshToken.for_user(user)

    if employee is not None:
        company_link = employee.employee_companies.first()
        AuditLog.objects.create(
            table_name='employees',
            record_id=str(employee.id),
            action='login',
            company_id=company_link.company_id if company_link else None,
            description='đăng nhập',
            changed_by=employee,
        )

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    full_name = (request.data.get('full_name') or '').strip()
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''
    company_id = request.data.get('company_id', '').strip() if request.data.get('company_id') else ''

    if not full_name or not email or not password:
        return Response({'detail': 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_email(email)
    except DjangoValidationError:
        return Response({'detail': 'Email không hợp lệ'}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({'detail': 'Mật khẩu phải có ít nhất 6 ký tự'}, status=status.HTTP_400_BAD_REQUEST)

    if Employee.objects.filter(email=email).exists():
        return Response({'detail': 'Email này đã được đăng ký'}, status=status.HTTP_400_BAD_REQUEST)

    User = get_user_model()
    if User.objects.filter(username=email).exists():
        return Response({'detail': 'Email này đã được đăng ký'}, status=status.HTTP_400_BAD_REQUEST)

    # create_user() tự gọi set_password() bên trong, băm mật khẩu bằng PBKDF2
    # trước khi lưu — cột auth_user.password không bao giờ chứa plaintext.
    user = User.objects.create_user(username=email, email=email, password=password)

    # Tài khoản tự đăng ký ở trạng thái chờ duyệt (is_approved=False) — chưa đăng
    # nhập được cho tới khi người có quyền duyệt trong trang Nhân sự → Chờ duyệt
    # (xem employees.views.approve_employee, employees.auth_views.login_view).
    employee = Employee.objects.create(user=user, full_name=full_name, email=email, is_approved=False)

    # Tự động gắn nhân viên vào công ty (nếu có company_id hoặc fallback công ty đầu tiên)
    from companies.models import Company
    target_company = None
    if company_id:
        target_company = Company.objects.filter(id=company_id).first()
    if not target_company:
        target_company = Company.objects.first()
    if target_company:
        EmployeeCompany.objects.get_or_create(employee=employee, company=target_company)

    return Response(
        {'detail': 'Đăng ký thành công! Tài khoản của bạn đang chờ quản lý duyệt trước khi đăng nhập được.'},
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
def me_view(request):
    employee = getattr(request.user, 'employee', None)
    if employee is None:
        return Response({'detail': 'Tài khoản chưa được gắn với nhân viên nào'}, status=status.HTTP_404_NOT_FOUND)

    return Response(EmployeeSerializer(employee).data)
