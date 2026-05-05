from django.urls import path
from . import views

urlpatterns = [
    path('user/<int:user_id>/', views.user_detail, name='user_detail'),
    path('user/<int:user_id>/recommendations/', views.user_recommendations, name='user_recommendations'),
    path('user/<int:user_id>/sessions/', views.user_sessions, name='user_sessions'),
    path('user/<int:user_id>/activities/', views.user_activities, name='user_activities'),
    path('user/<int:user_id>/badges/', views.user_badges, name='user_badges'),
]
