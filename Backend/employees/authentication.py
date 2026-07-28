from rest_framework_simplejwt.authentication import JWTAuthentication
from integrations.current_user import set_current_employee


class TrackingJWTAuthentication(JWTAuthentication):
    """JWTAuthentication chuẩn của simplejwt, cộng thêm: sau khi xác thực thành
    công thì lưu employee hiện tại vào thread-local (integrations.current_user)
    để audit log (integrations/audit.py) biết "ai thực hiện hành động".

    Lý do không dùng Django MIDDLEWARE cho việc này: MIDDLEWARE chạy trước khi
    DRF xác thực JWT, nên tại thời điểm middleware chạy, request.user vẫn là
    AnonymousUser — phải hook vào đúng lớp authentication này mới lấy đúng lúc.
    """

    def authenticate(self, request):
        result = super().authenticate(request)
        if result is not None:
            user, _token = result
            set_current_employee(getattr(user, 'employee', None))
        return result
