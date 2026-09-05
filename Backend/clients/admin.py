from django.contrib import admin
from .models import Client, ClientComment


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'status', 'owner', 'created_at')
    list_filter = ('company', 'status')
    search_fields = ('name', 'contact_name', 'email', 'phone')


@admin.register(ClientComment)
class ClientCommentAdmin(admin.ModelAdmin):
    list_display = ('client', 'author', 'is_internal', 'created_at')
    list_filter = ('is_internal',)
    search_fields = ('client__name', 'content')
