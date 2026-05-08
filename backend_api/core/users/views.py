from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Badge, Recommendation, Session, Activity, Quiz
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer, QuizSerializer
from .serializers import (
    UserSerializer, UserRegistrationSerializer, 
    BadgeSerializer, RecommendationSerializer, 
    SessionSerializer, ActivitySerializer
)
import requests
import json
import PyPDF2
from io import BytesIO
import docx
from django.conf import settings

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

# --- QUIZ API ENDPOINTS ---

@api_view(['GET'])
def quiz_list(request):
    """Get all quizzes"""
    quizzes = Quiz.objects.all()
    serializer = QuizSerializer(quizzes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def quiz_detail(request, quiz_id):
    """Get a specific quiz"""
    try:
        quiz = Quiz.objects.get(id=quiz_id)
        serializer = QuizSerializer(quiz)
        return Response(serializer.data)
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def quiz_create(request):
    """Create a new quiz from file content (mock AI response for now)"""
    try:
        title = request.data.get('title', 'Generated Quiz')
        questions = request.data.get('questions', [])
        subject = request.data.get('subject', 'General')
        
        quiz = Quiz.objects.create(
            title=title,
            questions=questions,
            subject=subject,
            user=request.user
        )
        
        serializer = QuizSerializer(quiz)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def ai_chat(request):
    """Handle AI chat requests using Groq API"""
    try:
        message = request.data.get('message', '')
        if not message:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Call Groq API for chat
        groq_api_key = settings.GROQ_API_KEY
        if not groq_api_key:
            return Response({'error': 'Groq API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        headers = {
            'Authorization': f'Bearer {groq_api_key}',
            'Content-Type': 'application/json',
        }
        
        data = {
            'model': 'llama-3.3-70b-versatile',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a helpful AI assistant for a learning platform called SAGE. You help users with study plans, answer questions, suggest resources, and track their progress. Be friendly, encouraging, and concise.'
                },
                {
                    'role': 'user',
                    'content': message
                }
            ],
            'temperature': 0.7,
            'max_tokens': 500,
        }
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            return Response({'error': f'Groq API error: {response.text}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        
        return Response({
            'response': ai_response
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def quiz_generate(request):
    """Generate a quiz from uploaded file content using Groq AI"""
    try:
        # Get the uploaded file
        uploaded_file = request.FILES.get('file')
        if not uploaded_file:
            return Response({'error': 'No file uploaded'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract text from file
        file_content = ""
        file_type = uploaded_file.name.split('.')[-1].lower()
        
        if file_type == 'pdf':
            file_content = extract_text_from_pdf(uploaded_file)
        elif file_type == 'txt':
            file_content = uploaded_file.read().decode('utf-8')
        elif file_type == 'docx':
            file_content = extract_text_from_docx(uploaded_file)
        else:
            return Response({'error': 'Unsupported file format. Please upload PDF, TXT, or DOCX'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Truncate content if too long (Groq has token limits)
        max_length = 8000
        if len(file_content) > max_length:
            file_content = file_content[:max_length] + "..."
        
        # Call Groq API to generate quiz
        groq_api_key = settings.GROQ_API_KEY
        if not groq_api_key:
            return Response({'error': 'Groq API key not configured'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        prompt = f"""Generate a quiz from the following content. Return ONLY valid JSON with this exact structure:
        {{
          "title": "Quiz Title",
          "subject": "Subject Name",
          "questions": [
            {{
              "question": "Question text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswer": 0
            }}
          ]
        }}
        
        Content to generate quiz from:
        {file_content}
        """
        
        headers = {
            'Authorization': f'Bearer {groq_api_key}',
            'Content-Type': 'application/json',
        }
        
        data = {
            'model': 'llama-3.3-70b-versatile',
            'messages': [
                {
                    'role': 'system',
                    'content': 'You are a helpful quiz generator. Always return valid JSON with the exact structure specified.'
                },
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.7,
            'max_tokens': 2000,
        }
        
        response = requests.post(
            'https://api.groq.com/openai/v1/chat/completions',
            headers=headers,
            json=data
        )
        
        if response.status_code != 200:
            return Response({'error': f'Groq API error: {response.text}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        result = response.json()
        quiz_data = json.loads(result['choices'][0]['message']['content'])
        
        # Validate quiz data structure
        if 'questions' not in quiz_data or not isinstance(quiz_data['questions'], list):
            return Response({'error': 'Invalid quiz data from AI'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Create quiz in database
        quiz = Quiz.objects.create(
            title=quiz_data.get('title', 'Generated Quiz'),
            questions=quiz_data['questions'],
            subject=quiz_data.get('subject', 'General'),
            user=request.user
        )
        
        serializer = QuizSerializer(quiz)
        return Response({
            'message': 'Quiz generated successfully',
            'quiz': serializer.data
        }, status=status.HTTP_201_CREATED)
        
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON response from AI'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def extract_text_from_pdf(file_obj):
    """Extract text from PDF file"""
    pdf_reader = PyPDF2.PdfReader(BytesIO(file_obj.read()))
    text = ""
    for page in pdf_reader.pages:
        text += page.extract_text() + "\n"
    return text.strip()

def extract_text_from_docx(file_obj):
    """Extract text from DOCX file"""
    doc = docx.Document(BytesIO(file_obj.read()))
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text.strip()
