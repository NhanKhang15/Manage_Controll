def get_employee_from_request(request):
    """Danh tính nhân viên hiện tại, lấy từ request.user đã được xác thực qua JWT
    (xem employees.authentication.TrackingJWTAuthentication). Không còn đọc header
    tự chế — nếu request chưa xác thực hoặc user chưa gắn Employee, trả về None.
    """
    user = getattr(request, 'user', None)
    if user is None or not user.is_authenticated:
        return None
    return getattr(user, 'employee', None)
