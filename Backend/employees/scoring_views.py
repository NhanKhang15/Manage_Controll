from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Employee, EmployeeCompany, LevelTier
from .scoring import compute_points_for_employees, ensure_default_level_tiers, get_or_create_formula, tier_for_points
from .views import _with_social_stats
from .rating import compute_rating_stats


def _period_bounds(period):
    now = timezone.now()
    if period == 'today':
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start, start + timedelta(days=1)
    if period == 'week':
        start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        return start, start + timedelta(days=7)
    if period == 'month':
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        next_month = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
        return start, next_month
    if period == 'year':
        start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        return start, start.replace(year=start.year + 1)
    return None, None


@api_view(['GET'])
def leaderboard_view(request):
    """Dùng chung cho trang Xếp hạng (sort theo total_points) và Bảng vàng
    (sort theo period_points theo kỳ) — 1 nguồn điểm thật, không random theo index nữa."""
    company_id = request.query_params.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)
    period = request.query_params.get('period', 'all')

    ensure_default_level_tiers(company_id)
    tiers = list(LevelTier.objects.filter(company_id=company_id).order_by('level'))

    emp_ids = EmployeeCompany.objects.filter(company_id=company_id).values_list('employee_id', flat=True)
    employees = list(
        _with_social_stats(Employee.objects.filter(id__in=emp_ids, is_active=True, is_approved=True, user__isnull=False))
        .prefetch_related('employee_departments__department')
    )

    period_start, period_end = _period_bounds(period)
    points_by_emp = compute_points_for_employees([e.id for e in employees], company_id, period_start, period_end)

    data = []
    for e in employees:
        pts = points_by_emp.get(e.id, {'total_points': 0, 'period_points': 0})
        tier = tier_for_points(tiers, pts['total_points'])
        depts = list(e.employee_departments.all())
        primary = next((d for d in depts if d.is_primary), depts[0] if depts else None)
        rating, _, _ = compute_rating_stats(e.likes_count, e.dislikes_count)
        data.append({
            'id': e.id,
            'full_name': e.full_name,
            'position_title': e.position_title,
            'department': primary.department.name if primary and primary.department else None,
            'total_points': pts['total_points'],
            'period_points': pts['period_points'],
            'level': tier.level if tier else 1,
            'level_title': tier.name if tier else '',
            'rating': rating,
        })

    return Response(data)


@api_view(['GET', 'PUT'])
def formula_view(request):
    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    config = get_or_create_formula(company_id)

    if request.method == 'PUT':
        data = request.data
        if 'points_per_effort_unit' in data:
            config.points_per_effort_unit = int(data['points_per_effort_unit'])
        if 'on_time_bonus' in data:
            config.on_time_bonus = int(data['on_time_bonus'])
        if 'auto_apply_salary' in data:
            config.auto_apply_salary = bool(data['auto_apply_salary'])
        config.save()

    return Response({
        'company_id': config.company_id,
        'points_per_effort_unit': config.points_per_effort_unit,
        'on_time_bonus': config.on_time_bonus,
        'auto_apply_salary': config.auto_apply_salary,
    })


def _serialize_tier(t):
    return {
        'id': t.id, 'level': t.level, 'name': t.name, 'min_points': t.min_points,
        'base_salary': t.base_salary, 'allowance': t.allowance, 'benefits': t.benefits,
    }


@api_view(['GET', 'POST'])
def levels_view(request):
    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        data = request.data
        next_level = (LevelTier.objects.filter(company_id=company_id).order_by('-level').values_list('level', flat=True).first() or 0) + 1
        tier = LevelTier.objects.create(
            company_id=company_id,
            level=data.get('level') or next_level,
            name=data.get('name', f'Bậc {next_level}'),
            min_points=data.get('min_points', 0),
            base_salary=data.get('base_salary', 0),
            allowance=data.get('allowance', 0),
            benefits=data.get('benefits', ''),
            order_index=data.get('level') or next_level,
        )
        return Response(_serialize_tier(tier), status=status.HTTP_201_CREATED)

    ensure_default_level_tiers(company_id)
    tiers = LevelTier.objects.filter(company_id=company_id).order_by('level')
    return Response([_serialize_tier(t) for t in tiers])


@api_view(['PATCH', 'DELETE'])
def level_detail_view(request, pk):
    try:
        tier = LevelTier.objects.get(id=pk)
    except LevelTier.DoesNotExist:
        return Response({'detail': 'Không tìm thấy bậc'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        tier.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    data = request.data
    for field in ('name', 'min_points', 'base_salary', 'allowance', 'benefits'):
        if field in data:
            setattr(tier, field, data[field])
    tier.save()
    return Response(_serialize_tier(tier))


@api_view(['POST'])
def recalculate_view(request):
    """'Tính lại điểm & áp bậc lương cho toàn công ty' — điểm/level bản thân đã tính
    sống (live) mỗi lần gọi leaderboard_view; nút này chỉ GHI kết quả (level/lương/phụ
    cấp hiện tại) vào EmployeeCompany khi auto_apply_salary bật, để trang Bảng lương
    đọc được sau này."""
    company_id = request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    config = get_or_create_formula(company_id)
    ensure_default_level_tiers(company_id)
    tiers = list(LevelTier.objects.filter(company_id=company_id).order_by('level'))

    links = list(EmployeeCompany.objects.filter(company_id=company_id))
    points_by_emp = compute_points_for_employees([l.employee_id for l in links], company_id)

    updated = 0
    for link in links:
        pts = points_by_emp.get(link.employee_id, {'total_points': 0})['total_points']
        tier = tier_for_points(tiers, pts)
        if not tier:
            continue
        link.current_level = tier.level
        if config.auto_apply_salary:
            link.base_salary = tier.base_salary
            link.allowance = tier.allowance
        link.save(update_fields=['current_level', 'base_salary', 'allowance'])
        updated += 1

    return Response({'updated': updated, 'auto_applied_salary': config.auto_apply_salary})
