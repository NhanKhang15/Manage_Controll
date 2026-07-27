from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from events.models import Event, Driver, Notification
from events.serializers import EventSerializer, DriverSerializer, NotificationSerializer
from events.services import get_employee_from_request, create_event
from integrations.minio_storage import upload_file_to_minio


@api_view(['GET'])
def get_events(request):
    company_id = request.query_params.get('company_id')
    year = request.query_params.get('year')
    month = request.query_params.get('month')

    current_emp = get_employee_from_request(request)

    queryset = Event.objects.all()

    if company_id:
        queryset = queryset.filter(company_id=company_id)

    if year:
        queryset = queryset.filter(event_date__year=year)
    if month:
        queryset = queryset.filter(event_date__month=month)

    if current_emp:
        emp_dept_ids = current_emp.employee_departments.values_list('department_id', flat=True)
        queryset = queryset.filter(
            Q(created_by=current_emp) |
            Q(invite_all_company=True) |
            Q(employee_invites__employee=current_emp) |
            Q(department_invites__department_id__in=emp_dept_ids)
        ).distinct()

    serializer = EventSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_event_view(request):
    current_emp = get_employee_from_request(request)
    data = request.data.copy()

    invited_dept_ids = data.get('invited_department_ids', [])
    invited_emp_ids = data.get('invited_employee_ids', [])
    attachment_urls = data.get('attachment_urls', [])

    try:
        event = create_event(
            data=data,
            creator=current_emp,
            invited_department_ids=invited_dept_ids,
            invited_employee_ids=invited_emp_ids,
            attachment_urls=attachment_urls
        )
        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except ValueError as e:
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_drivers(request):
    company_id = request.query_params.get('company_id')
    queryset = Driver.objects.filter(is_active=True)
    if company_id:
        queryset = queryset.filter(company_id=company_id)

    serializer = DriverSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_notifications(request):
    unread_only = request.query_params.get('unread_only')
    current_emp = get_employee_from_request(request)

    queryset = Notification.objects.all()
    if current_emp:
        queryset = queryset.filter(recipient=current_emp)

    if unread_only and unread_only.lower() in ('true', '1'):
        queryset = queryset.filter(is_read=False)

    serializer = NotificationSerializer(queryset, many=True)
    return Response(serializer.data)


@api_view(['PATCH'])
def mark_notification_read(request, pk):
    try:
        notification = Notification.objects.get(id=pk)
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        return Response(NotificationSerializer(notification).data)
    except Notification.DoesNotExist:
        return Response({'detail': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
def mark_all_notifications_read(request):
    current_emp = get_employee_from_request(request)
    queryset = Notification.objects.filter(is_read=False)
    if current_emp:
        queryset = queryset.filter(recipient=current_emp)

    queryset.update(is_read=True, read_at=timezone.now())
    return Response({'detail': 'Marked all notifications as read'})


@api_view(['POST'])
def upload_file_view(request):
    if 'file' not in request.FILES:
        return Response({'detail': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)

    file_obj = request.FILES['file']
    try:
        res = upload_file_to_minio(file_obj)
        return Response(res, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
