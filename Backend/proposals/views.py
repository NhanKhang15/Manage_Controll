from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from employees.models import EmployeeCompany
from employees.services import get_employee_from_request
from .models import Proposal
from .serializers import ProposalSerializer


def _can_approve(employee, company_id):
    return EmployeeCompany.objects.filter(
        employee=employee, company_id=company_id, can_approve_proposals=True
    ).exists()


@api_view(['GET', 'POST'])
def proposals_view(request):
    employee = get_employee_from_request(request)
    if employee is None:
        return Response({'detail': 'Chưa xác thực'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        company_id = request.query_params.get('company_id')
        scope = request.query_params.get('scope', 'pending')  # pending | mine | all
        qs = Proposal.objects.select_related('requester', 'decided_by')
        if company_id:
            qs = qs.filter(company_id=company_id)
        if scope == 'pending':
            qs = qs.filter(status='pending')
        elif scope == 'mine':
            qs = qs.filter(requester=employee)
        return Response(ProposalSerializer(qs, many=True).data)

    company_id = request.data.get('company_id')
    title = (request.data.get('title') or '').strip()
    if not company_id:
        return Response({'detail': 'Thiếu công ty'}, status=status.HTTP_400_BAD_REQUEST)
    if not title:
        return Response({'detail': 'Tiêu đề không được để trống'}, status=status.HTTP_400_BAD_REQUEST)

    proposal = Proposal.objects.create(
        company_id=company_id,
        title=title,
        amount=request.data.get('amount') or None,
        note=(request.data.get('note') or '').strip(),
        requester=employee,
    )
    return Response(ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
def proposal_decide_view(request, pk):
    employee = get_employee_from_request(request)
    if employee is None:
        return Response({'detail': 'Chưa xác thực'}, status=status.HTTP_403_FORBIDDEN)

    try:
        proposal = Proposal.objects.get(id=pk)
    except Proposal.DoesNotExist:
        return Response({'detail': 'Không tìm thấy đề xuất'}, status=status.HTTP_404_NOT_FOUND)

    if not _can_approve(employee, proposal.company_id):
        return Response(
            {'detail': 'Bạn không có quyền duyệt đề xuất trong công ty này'},
            status=status.HTTP_403_FORBIDDEN,
        )

    decision = request.data.get('status')
    if decision not in ('approved', 'rejected'):
        return Response({'detail': 'status phải là approved hoặc rejected'}, status=status.HTTP_400_BAD_REQUEST)
    if proposal.status != 'pending':
        return Response({'detail': 'Đề xuất này đã được xử lý'}, status=status.HTTP_400_BAD_REQUEST)

    proposal.status = decision
    proposal.decided_by = employee
    proposal.decided_at = timezone.now()
    proposal.save(update_fields=['status', 'decided_by', 'decided_at', 'updated_at'])
    return Response(ProposalSerializer(proposal).data)
