from rest_framework import serializers
from .models import User, Badge, Recommendation, Session, Activity

# --- Your Related Serializers (Unchanged, these are great!) ---

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'icon', 'name', 'earned_at']

class RecommendationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recommendation
        fields = ['id', 'title', 'description', 'created_at']

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = ['id', 'title', 'description', 'participants', 'created_at']

class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'title', 'description', 'activity_type', 'created_at']

# --- Updated User Serializers ---

# Use this when you want to send profile data to the mobile app
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Swapped 'name' for 'username', added RBAC roles and gamification points
        fields = ['id', 'username', 'email', 'is_student', 'is_educator', 'points', 'streak_count', 'total_achievements']

# Use this ONLY when a brand new user is signing up
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) # Hides the password from the API response

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'is_student', 'is_educator']

    def create(self, validated_data):
        # Using create_user() ensures the password gets encrypted/hashed in the database
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_student=validated_data.get('is_student', True),
            is_educator=validated_data.get('is_educator', False)
        )
        return user