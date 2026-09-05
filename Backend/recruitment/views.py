from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import JobPosting, Candidate
from companies.models import Department
from employees.services import get_employee_from_request
from integrations.ai_client import call_llm, AIConfigError
from integrations.minio_storage import upload_file_to_minio

CV_MAX_BYTES = 10 * 1024 * 1024  # 10MB
CV_ALLOWED_EXT = ('.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png')


def _serialize_posting(p, *, public=False):
    data = {
        'id': p.id,
        'title': p.title,
        'department': p.department.name if p.department_id else None,
        'level': p.level,
        'jd': p.jd,
        'status': p.status,
        'public_token': p.public_token,
    }
    if not public:
        data.update({
            'department_id': p.department_id,
            'requirements_note': p.requirements_note,
            'channels': p.channels,
            'created_at': p.created_at,
            'candidate_count': p.candidates.count(),
        })
    return data


def _serialize_candidate(c):
    return {
        'id': c.id,
        'full_name': c.full_name,
        'email': c.email,
        'phone': c.phone,
        'cv_file_url': c.cv_file_url,
        'cv_file_name': c.cv_file_name,
        'cover_letter': c.cover_letter,
        'source': c.source,
        'stage': c.stage,
        'interview_at': c.interview_at,
        'rating': c.rating,
        'created_at': c.created_at,
    }


@api_view(['GET', 'POST'])
def job_postings_view(request):
    company_id = request.query_params.get('company_id') or request.data.get('company_id')
    if not company_id:
        return Response({'detail': 'Thiếu company_id'}, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'POST':
        data = request.data
        title = (data.get('title') or '').strip()
        if not title:
            return Response({'detail': 'Vị trí tuyển không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

        department = None
        if data.get('department_id'):
            department = Department.objects.filter(id=data['department_id']).first()

        posting = JobPosting.objects.create(
            company_id=company_id,
            title=title,
            department=department,
            level=(data.get('level') or '').strip(),
            requirements_note=(data.get('requirements_note') or '').strip(),
            jd=data.get('jd') or '',
            channels=(data.get('channels') or '').strip(),
            created_by=get_employee_from_request(request),
        )
        return Response(_serialize_posting(posting), status=status.HTTP_201_CREATED)

    postings = JobPosting.objects.filter(company_id=company_id).select_related('department')
    return Response([_serialize_posting(p) for p in postings])


@api_view(['PATCH'])
def job_posting_detail_view(request, pk):
    try:
        posting = JobPosting.objects.get(id=pk)
    except JobPosting.DoesNotExist:
        return Response({'detail': 'Không tìm thấy tin tuyển dụng'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    if 'status' in data:
        posting.status = data['status']
    if 'jd' in data:
        posting.jd = data['jd']
    if 'channels' in data:
        posting.channels = data['channels']
    posting.save()
    return Response(_serialize_posting(posting))


@api_view(['GET'])
def job_candidates_view(request, pk):
    try:
        posting = JobPosting.objects.get(id=pk)
    except JobPosting.DoesNotExist:
        return Response({'detail': 'Không tìm thấy tin tuyển dụng'}, status=status.HTTP_404_NOT_FOUND)
    return Response([_serialize_candidate(c) for c in posting.candidates.all()])


@api_view(['PATCH'])
def candidate_detail_view(request, pk):
    try:
        candidate = Candidate.objects.get(id=pk)
    except Candidate.DoesNotExist:
        return Response({'detail': 'Không tìm thấy ứng viên'}, status=status.HTTP_404_NOT_FOUND)

    data = request.data
    if 'stage' in data:
        candidate.stage = data['stage']
    if 'interview_at' in data:
        candidate.interview_at = data['interview_at'] or None
    if 'rating' in data:
        candidate.rating = data['rating'] if data['rating'] not in ('', None) else None
    candidate.save()
    return Response(_serialize_candidate(candidate))


@api_view(['GET'])
@permission_classes([AllowAny])
def public_job_posting_view(request, token):
    """Trang ứng tuyển công khai đọc thông tin tin tuyển dụng qua token — không cần đăng nhập."""
    try:
        posting = JobPosting.objects.select_related('department', 'company').get(public_token=token, status='open')
    except JobPosting.DoesNotExist:
        return Response({'detail': 'Tin tuyển dụng không tồn tại hoặc đã đóng'}, status=status.HTTP_404_NOT_FOUND)

    data = _serialize_posting(posting, public=True)
    data['company_name'] = posting.company.name
    return Response(data)


@api_view(['POST'])
@permission_classes([AllowAny])
def public_apply_view(request, token):
    """Ứng viên nộp CV qua link công khai — không cần đăng nhập. CV upload thẳng
    lên MinIO (tái dùng integrations.minio_storage, không qua endpoint /api/upload/
    có sẵn vì endpoint đó yêu cầu đăng nhập — người ứng tuyển thì không)."""
    try:
        posting = JobPosting.objects.get(public_token=token, status='open')
    except JobPosting.DoesNotExist:
        return Response({'detail': 'Tin tuyển dụng không tồn tại hoặc đã đóng'}, status=status.HTTP_404_NOT_FOUND)

    full_name = (request.data.get('full_name') or '').strip()
    if not full_name:
        return Response({'detail': 'Vui lòng nhập họ và tên'}, status=status.HTTP_400_BAD_REQUEST)

    cv_file_url = None
    cv_file_name = None
    cv_file = request.FILES.get('cv_file')
    if cv_file:
        ext = ('.' + cv_file.name.rsplit('.', 1)[-1].lower()) if '.' in cv_file.name else ''
        if ext not in CV_ALLOWED_EXT:
            return Response(
                {'detail': f'Định dạng CV không hợp lệ — chỉ nhận {", ".join(CV_ALLOWED_EXT)}'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if cv_file.size > CV_MAX_BYTES:
            return Response({'detail': 'File CV vượt quá 10MB'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            res = upload_file_to_minio(cv_file)
            cv_file_url = res['url']
            cv_file_name = res['name']
        except Exception as e:
            return Response({'detail': f'Tải CV lên thất bại: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    candidate = Candidate.objects.create(
        job_posting=posting,
        full_name=full_name,
        email=(request.data.get('email') or '').strip() or None,
        phone=(request.data.get('phone') or '').strip(),
        cover_letter=(request.data.get('cover_letter') or '').strip(),
        cv_file_url=cv_file_url,
        cv_file_name=cv_file_name,
    )
    return Response({'id': candidate.id}, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def generate_jd_view(request):
    """AI viết JD thật (tái dùng integrations.ai_client.call_llm — dùng chung với
    Trợ lý AI/tóm tắt cuộc họp). Công ty chưa bật/ cấu hình AI thì rơi về mẫu JD
    dựng sẵn (giữ nguyên hành vi demo cũ) thay vì lỗi cứng."""
    data = request.data
    title = (data.get('title') or '').strip()
    if not title:
        return Response({'detail': 'Vui lòng nhập vị trí tuyển'}, status=status.HTTP_400_BAD_REQUEST)
    department = data.get('department') or ''
    level = data.get('level') or ''
    requirements_note = data.get('requirements_note') or ''
    company_id = data.get('company_id')

    prompt = (
        f"Viết bản mô tả công việc (JD) tiếng Việt cho vị trí tuyển dụng sau:\n"
        f"- Vị trí: {title}\n- Phòng ban: {department or 'chưa rõ'}\n- Cấp bậc: {level or 'chưa rõ'}\n"
        f"- Yêu cầu thêm: {requirements_note or 'không có'}\n\n"
        f"Trình bày gồm: Mô tả công việc, Nhiệm vụ chính (đánh số), Yêu cầu ứng viên, Quyền lợi. "
        f"Viết ngắn gọn, chuyên nghiệp, không thêm lời dẫn ngoài JD."
    )

    if company_id:
        try:
            jd = call_llm(messages=[{"role": "user", "content": prompt}], company_id=company_id, max_tokens=800)
            return Response({'jd': jd, 'source': 'ai'})
        except AIConfigError:
            pass  # công ty chưa cấu hình AI — rơi về mẫu dựng sẵn bên dưới
        except Exception as e:
            return Response({'detail': f'AI viết JD thất bại: {e}'}, status=status.HTTP_502_BAD_GATEWAY)

    fallback_jd = (
        f"MÔ TẢ CÔNG VIỆC VỊ TRÍ: {title.upper()}\n"
        f"• Phòng ban: {department or '—'}\n• Cấp bậc: {level or '—'}\n"
        f"• Yêu cầu: {requirements_note or 'Có kinh nghiệm tương đương, kỹ năng làm việc nhóm tốt.'}\n\n"
        f"NHIỆM VỤ CHÍNH:\n1. Phối hợp cùng nhóm hoàn thành các chỉ tiêu công việc được giao.\n"
        f"2. Lập báo cáo định kỳ cho cấp quản lý.\n3. Thực hiện các nhiệm vụ phát sinh theo chỉ đạo.\n\n"
        f"QUYỀN LỢI:\n• Mức lương cạnh tranh theo năng lực.\n• BHXH, BHYT đầy đủ theo quy định nhà nước.\n"
        f"• Môi trường làm việc năng động, lộ trình thăng tiến rõ ràng."
    )
    return Response({'jd': fallback_jd, 'source': 'template'})
