from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # --- Authentication Routes ---
    path('register/', views.RegisterUserView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # This is your login!
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('me/', views.CurrentUserProfileView.as_view(), name='current_user_profile'),

    # --- User Data Routes ---
    path('<int:user_id>/', views.user_detail, name='user_detail'),
    path('<int:user_id>/recommendations/', views.user_recommendations, name='user_recommendations'),
    path('<int:user_id>/sessions/', views.user_sessions, name='user_sessions'),
    path('<int:user_id>/activities/', views.user_activities, name='user_activities'),
    path('<int:user_id>/badges/', views.user_badges, name='user_badges'),


    path('test-xp/', views.AddXpTestView.as_view(), name='add_xp_test'),
    
]