from django.contrib import admin
from .models import JobPosting, Candidate


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'department', 'status', 'public_token', 'created_at')
    list_filter = ('company', 'status')
    search_fields = ('title', 'public_token')


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'job_posting', 'stage', 'source', 'created_at')
    list_filter = ('stage',)
    search_fields = ('full_name', 'email', 'phone')
