from django.contrib import admin
from .models import ChatSession, ChatMessage, Quiz, QuizQuestion

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'created_at')
    search_fields = ('title', 'user__username')

@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz')

admin.site.register(ChatSession)
admin.site.register(ChatMessage)
