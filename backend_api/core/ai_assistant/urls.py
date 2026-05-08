from django.urls import path
from . import views

urlpatterns = [
    path('', views.AskSAGEView.as_view(), name='ask_sage'),
    path('ask/', views.AskSAGEView.as_view(), name='ask_sage_alt'),
    path('generate-quiz/', views.GenerateQuizView.as_view(), name='generate_quiz'),
]