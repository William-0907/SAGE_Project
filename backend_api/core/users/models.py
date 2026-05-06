from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # AbstractUser already provides: username, email, password, first_name, last_name, date_joined
    
    # Role-Based Access Control (RBAC) - Required by SAGE FR-01
    is_student = models.BooleanField(default=True)
    is_educator = models.BooleanField(default=False)
    
    # Gamification Stats
    points = models.IntegerField(default=0)
    streak_count = models.IntegerField(default=0)
    total_achievements = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username

# --- Your Related Models (These look great!) ---

class Badge(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='badges')
    icon = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    earned_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.name}"

class Recommendation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recommendations')
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

class Session(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=255)
    description = models.TextField()
    participants = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"

class Activity(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    title = models.CharField(max_length=255)
    description = models.TextField()
    activity_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.title}"