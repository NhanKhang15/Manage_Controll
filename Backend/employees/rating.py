"""Công thức rating/điểm/level của nhân viên — tính thật từ số like/dislike thật
(bảng EmployeeReaction), không random/hardcode. Đơn giản có chủ đích, có thể tinh
chỉnh sau; điểm mấu chốt là xác định (deterministic) và dựa trên dữ liệu thật."""


def compute_rating_stats(likes: int, dislikes: int) -> tuple[float, int, int]:
    """-> (rating 1.0–5.0, points >= 0, level >= 1)."""
    total = likes + dislikes
    if total == 0:
        rating = 4.0  # chưa ai đánh giá — điểm khởi đầu trung tính
    else:
        net_ratio = (likes - dislikes) / total  # -1..1
        rating = max(1.0, min(5.0, round(4.0 + net_ratio, 1)))

    points = max(0, likes * 2 - dislikes)
    level = 1 + points // 20  # cứ 20 điểm lên 1 cấp

    return rating, points, level
