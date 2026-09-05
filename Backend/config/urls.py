from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from companies import views as company_views
from projects import views as project_views
from tasks import views as task_views
from tasks import templates_views as task_templates_views
from employees import views as employee_views
from employees import auth_views as employee_auth_views
from employees import scoring_views
from events import views as event_views
from meetings import views as meeting_views
from integrations import views as integrations_views
from assistant import views as assistant_views
from proposals import views as proposal_views
from clients import views as client_views
from recruitment import views as recruitment_views

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', employee_auth_views.login_view, name='auth_login'),
    path('api/auth/register/', employee_auth_views.register_view, name='auth_register'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('api/auth/me/', employee_auth_views.me_view, name='auth_me'),

    path('api/companies/', company_views.company_tree, name='company_tree'),
    path('api/companies/options/', company_views.company_options, name='company_options'),
    path('api/companies/create-with-folder/', company_views.create_company_with_folder, name='create_company_with_folder'),
    path('api/companies/sync-drive/', company_views.sync_drive_view, name='sync_drive'),
    path('api/companies/<str:pk>/alert-settings/', company_views.company_alert_settings, name='company_alert_settings'),
    path('api/companies/<str:pk>/', company_views.delete_company, name='delete_company'),
    path('api/projects/', project_views.create_project, name='create_project'),
    path('api/projects/options/', project_views.project_options, name='project_options'),
    path('api/projects/<str:pk>/', project_views.delete_project, name='delete_project'),
    path('api/tasks/', task_views.create_task, name='create_task'),
    path('api/tasks/all/', task_views.all_tasks_view, name='all_tasks'),
    path('api/tasks/mine/', task_views.my_tasks_view, name='my_tasks'),
    path('api/tasks/department/', task_views.department_tasks_view, name='department_tasks'),
    path('api/tasks/reorder/', task_views.reorder_tasks, name='reorder_tasks'),
    path('api/tasks/<str:task_id>/checklist/', task_views.task_checklist, name='task_checklist'),
    path('api/tasks/<str:pk>/', task_views.task_detail, name='task_detail'),
    path('api/task-assignments/', task_views.create_task_assignment, name='create_task_assignment'),
    path('api/checklist-items/<str:pk>/', task_views.checklist_item_detail, name='checklist_item_detail'),
    path('api/proposals/', proposal_views.proposals_view, name='proposals'),
    path('api/proposals/<str:pk>/decide/', proposal_views.proposal_decide_view, name='proposal_decide'),
    path('api/employees/', employee_views.get_employees, name='get_employees'),
    path('api/employees/pending/', employee_views.pending_employees, name='pending_employees'),
    path('api/employees/<str:pk>/approve/', employee_views.approve_employee, name='approve_employee'),
    path('api/employees/<str:pk>/reject/', employee_views.reject_employee, name='reject_employee'),
    path('api/employees/<str:pk>/react/', employee_views.react_to_employee, name='react_to_employee'),
    path('api/departments/', company_views.get_departments, name='get_departments'),
    path('api/departments/<str:pk>/', company_views.delete_department, name='delete_department'),

    # Điểm/Level: Xếp hạng, Bảng vàng, Cấp bậc
    path('api/scoring/leaderboard/', scoring_views.leaderboard_view, name='scoring_leaderboard'),
    path('api/scoring/formula/', scoring_views.formula_view, name='scoring_formula'),
    path('api/scoring/levels/', scoring_views.levels_view, name='scoring_levels'),
    path('api/scoring/levels/<str:pk>/', scoring_views.level_detail_view, name='scoring_level_detail'),
    path('api/scoring/recalculate/', scoring_views.recalculate_view, name='scoring_recalculate'),

    # Mẫu việc · Lặp định kỳ · Phụ thuộc
    path('api/task-templates/', task_templates_views.task_templates_view, name='task_templates'),
    path('api/task-templates/<str:pk>/', task_templates_views.task_template_detail_view, name='task_template_detail'),
    path('api/task-recurring/', task_templates_views.recurring_tasks_view, name='recurring_tasks'),
    path('api/task-recurring/<str:pk>/', task_templates_views.recurring_task_detail_view, name='recurring_task_detail'),
    path('api/task-dependencies/', task_templates_views.task_dependencies_view, name='task_dependencies'),
    path('api/task-dependencies/<str:pk>/', task_templates_views.task_dependency_detail_view, name='task_dependency_detail'),

    # Khách hàng (CRM)
    path('api/clients/', client_views.clients_view, name='clients'),
    path('api/clients/<str:pk>/', client_views.client_detail_view, name='client_detail'),
    path('api/clients/<str:pk>/comments/', client_views.client_comments_view, name='client_comments'),

    # Tuyển dụng (ATS)
    path('api/recruitment/jobs/', recruitment_views.job_postings_view, name='job_postings'),
    path('api/recruitment/jobs/<str:pk>/', recruitment_views.job_posting_detail_view, name='job_posting_detail'),
    path('api/recruitment/jobs/<str:pk>/candidates/', recruitment_views.job_candidates_view, name='job_candidates'),
    path('api/recruitment/candidates/<str:pk>/', recruitment_views.candidate_detail_view, name='candidate_detail'),
    path('api/recruitment/generate-jd/', recruitment_views.generate_jd_view, name='generate_jd'),
    # Công khai — trang ứng tuyển không đăng nhập (xem recruitment.views)
    path('api/recruitment/public/<str:token>/', recruitment_views.public_job_posting_view, name='public_job_posting'),
    path('api/recruitment/public/<str:token>/apply/', recruitment_views.public_apply_view, name='public_apply'),

    # Events & Drivers
    path('api/events/', event_views.get_events, name='get_events'),
    path('api/events/create/', event_views.create_event_view, name='create_event'),
    path('api/events/<str:pk>/', event_views.event_detail_view, name='event_detail'),
    path('api/drivers/', event_views.get_drivers, name='get_drivers'),

    # Notifications
    path('api/notifications/', event_views.get_notifications, name='get_notifications'),
    path('api/notifications/<str:pk>/read/', event_views.mark_notification_read, name='mark_notification_read'),
    path('api/notifications/read-all/', event_views.mark_all_notifications_read, name='mark_all_notifications_read'),

    # Upload
    path('api/upload/', event_views.upload_file_view, name='upload_file'),

    # Meeting transcripts (Ghi âm & Tóm tắt cuộc họp)
    path('api/meeting-transcripts/', meeting_views.meeting_transcripts_view, name='meeting_transcripts'),
    path('api/meeting-transcripts/<str:pk>/', meeting_views.meeting_transcript_delete_view, name='meeting_transcript_delete'),
    path('api/meeting-transcripts/<str:pk>/summarize/', meeting_views.meeting_transcript_summarize_view, name='meeting_transcript_summarize'),

    # AI settings (module AI dùng chung)
    path('api/settings/ai/', integrations_views.ai_settings_view, name='ai_settings'),
    path('api/activity/', integrations_views.recent_activity_view, name='recent_activity'),
    path('api/integrations/google-drive/config/', integrations_views.google_drive_config_view, name='google_drive_config'),
    path('api/integrations/google-drive/oauth/start/', integrations_views.google_drive_oauth_start_view, name='google_drive_oauth_start'),
    path('api/integrations/google-drive/oauth/callback/', integrations_views.google_drive_oauth_callback_view, name='google_drive_oauth_callback'),

    # Trợ lý AI (chatbot + tool-calling)
    path('api/assistant/conversations/', assistant_views.conversations_view, name='assistant_conversations'),
    path('api/assistant/conversations/<str:pk>/', assistant_views.conversation_delete_view, name='assistant_conversation_delete'),
    path('api/assistant/conversations/<str:pk>/messages/', assistant_views.conversation_messages_view, name='assistant_conversation_messages'),
]
