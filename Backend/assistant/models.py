import uuid
from django.db import models
from companies.models import Company
from employees.models import Employee


class Conversation(models.Model):
    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='assistant_conversations', db_column='company_id')
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='assistant_conversations', db_column='employee_id')
    title = models.CharField(max_length=255, default='Cuộc trò chuyện mới')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assistant_conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.title} ({self.employee.full_name})"


class Message(models.Model):
    ROLE_CHOICES = (
        ('user', 'Người dùng'),
        ('assistant', 'Trợ lý'),
    )

    id = models.CharField(max_length=36, primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages', db_column='conversation_id')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    attachment_url = models.CharField(max_length=500, null=True, blank=True)
    attachment_name = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assistant_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"
