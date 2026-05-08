from django.urls import path
from . import views

urlpatterns = [
    path('ask/', views.AskSAGEView.as_view(), name='ask_sage'),
    path('sessions/', views.SessionListView.as_view(), name='session_list'),
    path('sessions/<int:session_id>/history/', views.SessionHistoryView.as_view(), name='session_history'),
]