from django.urls import path
from . import views

urlpatterns = [
    path('ask/', views.AskSAGEView.as_view(), name='ask_sage'),
]