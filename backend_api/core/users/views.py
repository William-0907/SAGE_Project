import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from .models import User, Badge, Recommendation, Session, Activity


@csrf_exempt
@require_http_methods(["GET"])
def user_detail(request, user_id):
    """Get user profile data"""
    try:
        user = User.objects.get(id=user_id)
        return JsonResponse({
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'streak_count': user.streak_count,
            'total_achievements': user.total_achievements,
        })
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


@csrf_exempt
@require_http_methods(["GET"])
def user_recommendations(request, user_id):
    """Get user's AI recommendations"""
    try:
        user = User.objects.get(id=user_id)
        recommendations = Recommendation.objects.filter(user=user).values('id', 'title', 'description', 'created_at')
        return JsonResponse(list(recommendations), safe=False)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


@csrf_exempt
@require_http_methods(["GET"])
def user_sessions(request, user_id):
    """Get user's group sessions"""
    try:
        user = User.objects.get(id=user_id)
        sessions = Session.objects.filter(user=user).values('id', 'title', 'description', 'participants', 'created_at')
        return JsonResponse(list(sessions), safe=False)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


@csrf_exempt
@require_http_methods(["GET"])
def user_activities(request, user_id):
    """Get user's activity history"""
    try:
        user = User.objects.get(id=user_id)
        activities = Activity.objects.filter(user=user).values('id', 'title', 'description', 'activity_type', 'created_at')
        return JsonResponse(list(activities), safe=False)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


@csrf_exempt
@require_http_methods(["GET"])
def user_badges(request, user_id):
    """Get user's earned badges"""
    try:
        user = User.objects.get(id=user_id)
        badges = Badge.objects.filter(user=user).values('id', 'icon', 'name', 'earned_at')
        return JsonResponse(list(badges), safe=False)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
