from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Badge, Recommendation, Session, Activity, StudyGroup
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    BadgeSerializer, RecommendationSerializer, 
    SessionSerializer, ActivitySerializer
)

class CurrentUserProfileView(APIView):
    # This acts as the bouncer: No token = No access
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        # request.user is automatically populated by Django because of the token!
        user = request.user 
        
        # Pass the user object to our serializer
        serializer = UserProfileSerializer(user)
        
        # Return the clean JSON data
        return Response(serializer.data)

# --- 1. REGISTRATION ENDPOINT ---
class RegisterUserView(APIView):
    permission_classes = [AllowAny] # Anyone can access this to sign up

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User registered successfully!"}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- 2. DATA FETCHING ENDPOINTS (Using your Serializers) ---

@api_view(['GET'])
def user_detail(request, user_id):
    """Get user profile data"""
    try:
        user = User.objects.get(id=user_id)
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def user_recommendations(request, user_id):
    """Get user's AI recommendations"""
    recommendations = Recommendation.objects.filter(user_id=user_id)
    serializer = RecommendationSerializer(recommendations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def user_sessions(request, user_id):
    """Get user's group sessions"""
    sessions = Session.objects.filter(user_id=user_id)
    serializer = SessionSerializer(sessions, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def user_activities(request, user_id):
    """Get user's activity history"""
    activities = Activity.objects.filter(user_id=user_id)
    serializer = ActivitySerializer(activities, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def user_badges(request, user_id):
    """Get user's earned badges"""
    badges = Badge.objects.filter(user_id=user_id)
    serializer = BadgeSerializer(badges, many=True)
    return Response(serializer.data)

class CreateGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description', '')

        if not name:
            return Response({"error": "Group name is required"}, status=400)

        # Create the group
        group = StudyGroup.objects.create(
            name=name,
            description=description,
            created_by=request.user
        )
        
        # Add the creator to the members list automatically
        group.members.add(request.user)

        return Response({
            "message": "Group created successfully!",
            "group_id": group.id,
            "join_code": group.join_code
        })

class JoinGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        join_code = request.data.get('join_code')
        
        if not join_code:
            return Response({"error": "Join code is required"}, status=400)

        try:
            # Find the group by its secret code
            group = StudyGroup.objects.get(join_code=join_code.upper())
            
            # Add the user to the group
            group.members.add(request.user)
            
            return Response({
                "message": f"Successfully joined {group.name}!",
                "group_id": group.id,
                "name": group.name
            })
        except StudyGroup.DoesNotExist:
            return Response({"error": "Invalid join code. Group not found."}, status=404)

class MyGroupsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all groups this specific user is a member of
        groups = request.user.joined_groups.all().order_by('-created_at')
        
        data = [
            {
                "id": group.id,
                "name": group.name,
                "description": group.description,
                "members_count": group.members.count(),
                "join_code": group.join_code,
            } for group in groups
        ]
        return Response(data)



class AddXpTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount', 500) # Defaults to 500 XP
        user = request.user
        
        old_level = user.level
        user.add_xp(int(amount)) # This calls the logic we wrote in the model
        
        return Response({
            "message": f"Added {amount} XP!",
            "new_xp": user.current_xp,
            "new_level": user.level,
            "leveled_up": user.level > old_level
        })