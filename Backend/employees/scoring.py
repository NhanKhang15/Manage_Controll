"""Điểm/level thật của nhân viên — tính từ Task đã hoàn thành (effort_points, đúng hạn),
dùng chung cho 3 trang Xếp hạng/Bảng vàng/Cấp bậc. Công thức lấy từ PointsFormulaConfig
của công ty (CEO cấu hình ở trang Cấp bậc), không hardcode."""
from collections import defaultdict
from django.db.models import Q

from .models import PointsFormulaConfig, LevelTier


def get_or_create_formula(company_id):
    config, _ = PointsFormulaConfig.objects.get_or_create(
        company_id=company_id, defaults={'points_per_effort_unit': 3, 'on_time_bonus': 5, 'auto_apply_salary': True}
    )
    return config


def ensure_default_level_tiers(company_id):
    """Tạo thang Lv1-7 mặc định (khớp trang mẫu) nếu công ty chưa có bậc nào."""
    if LevelTier.objects.filter(company_id=company_id).exists():
        return
    defaults = [
        (1, 'Thử việc', 0, 8_000_000, 0, 'Theo HĐ'),
        (2, 'Chính thức', 500, 12_000_000, 500_000, 'BHXH đầy đủ'),
        (3, 'Vững vàng', 1000, 18_000_000, 1_000_000, '+ Thưởng quý'),
        (4, 'Nòng cốt', 1800, 25_000_000, 2_000_000, '+ Du lịch năm'),
        (5, 'Chuyên gia', 2800, 35_000_000, 3_000_000, '+ ESOP / thưởng cổ phần'),
        (6, 'Lãnh đạo', 4000, 50_000_000, 4_000_000, '+ Cổ phần & phúc lợi BOD'),
        (7, 'Bậc 7', 5500, 70_000_000, 5_000_000, '+ Phúc lợi cấp cao'),
    ]
    LevelTier.objects.bulk_create([
        LevelTier(
            company_id=company_id, level=lvl, name=name, min_points=pts,
            base_salary=salary, allowance=allw, benefits=benefits, order_index=lvl,
        )
        for lvl, name, pts, salary, allw, benefits in defaults
    ])


def tier_for_points(tiers, points):
    """tiers: list LevelTier đã sort theo level tăng dần. -> tier cao nhất mà points đạt được."""
    eligible = [t for t in tiers if points >= t.min_points]
    return eligible[-1] if eligible else (tiers[0] if tiers else None)


def _task_points(effort_points, due_date, completed_at, config):
    effort = effort_points or 1
    points = effort * config.points_per_effort_unit
    on_time = due_date is None or (completed_at is not None and completed_at.date() <= due_date)
    if on_time:
        points += config.on_time_bonus
    return points


def compute_points_for_employees(employee_ids, company_id, period_start=None, period_end=None):
    """-> dict employee_id -> {'total_points': int, 'period_points': int}.
    total_points: toàn bộ lịch sử. period_points: chỉ Task hoàn thành trong [period_start, period_end)
    (dùng cho Bảng vàng lọc theo kỳ); None cả 2 mốc = period_points == total_points."""
    from tasks.models import Task

    config = get_or_create_formula(company_id)
    qs = Task.objects.filter(
        Q(project__company_id=company_id) | Q(department__company_id=company_id),
        is_completed=True,
        assignments__employee_id__in=employee_ids,
        assignments__role='assignee',
    ).values('assignments__employee_id', 'effort_points', 'due_date', 'completed_at')

    totals = defaultdict(int)
    periods = defaultdict(int)
    for row in qs:
        emp_id = row['assignments__employee_id']
        pts = _task_points(row['effort_points'], row['due_date'], row['completed_at'], config)
        totals[emp_id] += pts
        completed_at = row['completed_at']
        in_period = (
            period_start is None or period_end is None
            or (completed_at is not None and period_start <= completed_at < period_end)
        )
        if in_period:
            periods[emp_id] += pts

    return {eid: {'total_points': totals.get(eid, 0), 'period_points': periods.get(eid, 0)} for eid in employee_ids}
