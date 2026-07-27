from django.contrib import admin
from events.models import Driver, Event, EventDepartmentInvite, EventEmployeeInvite, EventAttachment, Notification


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'company', 'phone', 'is_active')
    search_fields = ('full_name', 'phone')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'company', 'event_date', 'start_time', 'created_by')
    list_filter = ('type', 'event_date', 'company')
    search_fields = ('title', 'content')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'recipient', 'is_read', 'created_at')
    list_filter = ('type', 'is_read', 'created_at')
    search_fields = ('title', 'body')


admin.site.register(EventDepartmentInvite)
admin.site.register(EventEmployeeInvite)
admin.site.register(EventAttachment)
