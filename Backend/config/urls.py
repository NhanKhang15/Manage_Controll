from django.contrib import admin
from django.urls import path
from companies import views as company_views
from projects import views as project_views
from tasks import views as task_views
from employees import views as employee_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/companies/', company_views.company_tree, name='company_tree'),
    path('api/companies/create-with-folder/', company_views.create_company_with_folder, name='create_company_with_folder'),
    path('api/companies/<str:pk>/', company_views.delete_company, name='delete_company'),
    path('api/projects/', project_views.create_project, name='create_project'),
    path('api/projects/<str:pk>/', project_views.delete_project, name='delete_project'),
    path('api/tasks/', task_views.create_task, name='create_task'),
    path('api/tasks/reorder/', task_views.reorder_tasks, name='reorder_tasks'),
    path('api/tasks/<str:pk>/', task_views.update_task, name='update_task'),
    path('api/tasks/<str:pk>/', task_views.delete_task, name='delete_task'),
    path('api/task-assignments/', task_views.create_task_assignment, name='create_task_assignment'),
    path('api/employees/', employee_views.get_employees, name='get_employees'),
]
