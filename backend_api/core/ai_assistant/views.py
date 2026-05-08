import json
import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatSession, ChatMessage, Quiz, QuizQuestion

class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Grab all the new folder-based sessions
        sessions = ChatSession.objects.filter(user=request.user)
        data = [{"id": s.id, "title": s.title, "updated_at": s.updated_at} for s in sessions]

        # 2. 🌟 THE LEGACY TRICK: Check if they have old "loose" messages
        has_legacy_messages = ChatMessage.objects.filter(user=request.user, session__isnull=True).exists()
        
        if has_legacy_messages:
            # Create a virtual session with ID "0" so it shows up in the mobile sidebar
            data.append({"id": 0, "title": "Old Chat History", "updated_at": None})

        return Response(data)

    def post(self, request):
        session = ChatSession.objects.create(user=request.user, title="New Conversation")
        return Response({"id": session.id, "title": session.title})

class AskSAGEView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message')
        attachment_text = request.data.get('attachment_text', '')
        session_id = request.data.get('session_id')
        
        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # 1. Figure out where to save this message
        session = None
        if session_id and session_id != 0:
            session = ChatSession.objects.get(id=session_id, user=request.user)
        elif session_id == 0:
            pass 
        else:
            # 🌟 Brand new chat from the mobile app, creates a new folder automatically
            session = ChatSession.objects.create(user=request.user, title=user_message[:30] + "...")

        # 2. Save User Message
        ChatMessage.objects.create(user=request.user, session=session, text=user_message, is_ai=False)

        # 3. 🌟 REAL AI LOGIC: Call Groq!
        GROQ_API_KEY = getattr(settings, 'GROQ_API_KEY', None)
        
        if not GROQ_API_KEY:
            return Response({"error": "Groq API key not configured on server."}, status=500)

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        # Combine message with extracted context if available for the AI's perspective
        ai_prompt = f"[File Content]:\n{attachment_text}\n\nUser Question: {user_message}" if attachment_text else user_message

        # Groq uses the exact same payload format as DeepSeek and OpenAI
        payload = {
            # 🌟 Using Llama 3.3 70B for high-quality reasoning and educational support
            "model": "llama-3.3-70b-versatile", 
            "messages": [
                {
                    "role": "system", 
                    "content": "You are SAGE, a Smart Assistant for Group-Based Education. You help students learn by providing clear, concise, and engaging educational explanations."
                },
                {
                    "role": "user", 
                    "content": ai_prompt
                }
            ]
        }

        try:
            # Send the request to Groq
            api_response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=10 # Groq is exceptionally fast
            )
            api_response.raise_for_status() 
            
            data = api_response.json()
            ai_reply = data['choices'][0]['message']['content']
            
        except Exception as e:
            print(f"Groq API Error: {e}")
            ai_reply = "I'm sorry, my AI brain is temporarily offline. Please check the server logs!"

        # 4. Save AI Response
        ChatMessage.objects.create(user=request.user, session=session, text=ai_reply, is_ai=True)

        # 🌟 CRITICAL FIX: It must return the session_id so the mobile app can save it!
        return Response({
            "reply": ai_reply, 
            "session_id": session.id if session else 0, 
            "session_title": session.title if session else "Old Chat History"
        })

class SessionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        # 🌟 If mobile asks for ID 0, give them all their old loose messages!
        if session_id == 0:
            messages = ChatMessage.objects.filter(user=request.user, session__isnull=True)
        else:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
                messages = ChatMessage.objects.filter(session=session)
            except ChatSession.DoesNotExist:
                return Response({"error": "Session not found"}, status=404)

        data = [{
            "id": msg.id,
            "text": msg.text,
            "type": "ai" if msg.is_ai else "user",
            "time": msg.created_at.strftime("%I:%M %p")
        } for msg in messages]
        
        return Response(data)

class GenerateQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content = request.data.get('content')
        difficulty = request.data.get('difficulty', 'Medium')
        count = request.data.get('count', 10)
        q_type = request.data.get('type', 'Multiple Choice')
        instructions = request.data.get('instructions', '')

        if not content:
            return Response({"error": "No content provided to generate quiz."}, status=400)

        GROQ_API_KEY = getattr(settings, 'GROQ_API_KEY', None)
        if not GROQ_API_KEY:
            return Response({"error": "Groq API key not configured."}, status=500)

        system_prompt = (
            "You are an expert educator. Create a quiz based on the provided content. "
            "You MUST return ONLY valid JSON. Do not include any introductory text or markdown code blocks. "
            "The JSON structure must be: "
            "{"
            "  \"title\": \"Quiz Title\","
            "  \"questions\": ["
            "    {"
            "      \"id\": 1,"
            "      \"question\": \"The question text\","
            "      \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],"
            "      \"correct_answer\": \"The exact string of the correct option\","
            "      \"explanation\": \"Brief explanation why\""
            "    }"
            "  ]"
            "}"
        )

        user_prompt = (
            f"Generate a {difficulty} level quiz with {count} {q_type} questions. "
            f"Additional Instructions: {instructions}\n\n"
            f"Content to base the quiz on:\n{content}"
        )

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "response_format": {"type": "json_object"}, # 🌟 Force JSON output
            "temperature": 0.7
        }

        try:
            api_response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            api_response.raise_for_status()
            data = api_response.json()
            
            # Parse the string content from the AI into a real JSON object
            quiz_json = json.loads(data['choices'][0]['message']['content'])

            # 🌟 SAVE TO DATABASE
            quiz = Quiz.objects.create(
                user=request.user,
                title=quiz_json.get('title', 'Generated Quiz')
            )
            for q in quiz_json.get('questions', []):
                QuizQuestion.objects.create(
                    quiz=quiz,
                    question_text=q.get('question'),
                    options=q.get('options'),
                    correct_answer=q.get('correct_answer'),
                    explanation=q.get('explanation')
                )

            return Response(quiz_json)

        except json.JSONDecodeError:
            return Response({"error": "AI returned invalid JSON formatting."}, status=500)
        except Exception as e:
            print(f"Quiz Gen Error: {e}")
            return Response({"error": str(e)}, status=500)