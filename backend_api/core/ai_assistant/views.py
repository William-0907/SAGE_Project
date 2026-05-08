import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatSession, ChatMessage

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
            # 🌟 FIX: Updated from the deprecated llama3-8b-8192 to the active 3.1 model
            "model": "llama-3.1-8b-instant", 
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