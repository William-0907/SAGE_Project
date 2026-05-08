# import requests
# from django.conf import settings # <-- 1. Import Django's settings
# from rest_framework import status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated

# class AskSAGEView(APIView):
#     permission_classes = [IsAuthenticated] 

#     def post(self, request):
#         user_prompt = request.data.get('prompt')
        
#         if not user_prompt:
#             return Response({"error": "Please provide a prompt."}, status=status.HTTP_400_BAD_REQUEST)

#         # <-- 2. Pull the secure key from settings.py!
#         DEEPSEEK_API_KEY = settings.DEEPSEEK_API_KEY 
        
#         if not DEEPSEEK_API_KEY:
#              return Response({"error": "API Key is missing or not loading from .env"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         headers = {
#             "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
#             "Content-Type": "application/json"
#         }

#         # The payload structure required by DeepSeek
#         payload = {
#             "model": "deepseek-chat", 
#             "messages": [
#                 {
#                     "role": "system", 
#                     "content": "You are SAGE, a Smart Assistant for Group-Based Education. You help students learn by providing clear, concise, and engaging educational explanations."
#                 },
#                 {
#                     "role": "user", 
#                     "content": user_prompt
#                 }
#             ]
#         }

#         try:
#             # Send the request to DeepSeek
#             response = requests.post(
#                 "https://api.deepseek.com/chat/completions", 
#                 headers=headers, 
#                 json=payload
#             )
#             response.raise_for_status() 
            
#             data = response.json()
#             ai_text = data['choices'][0]['message']['content']
            
#             return Response({"sage_response": ai_text}, status=status.HTTP_200_OK)
            
#         except requests.exceptions.RequestException as e:
#             return Response({"error": f"Failed to connect to AI: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


# from rest_framework import status
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated
# import time

# class AskSAGEView(APIView):
#     permission_classes = [IsAuthenticated] 

#     def post(self, request):
#         user_prompt = request.data.get('prompt')
        
#         if not user_prompt:
#             return Response({"error": "Please provide a prompt."}, status=status.HTTP_400_BAD_REQUEST)

#         # --- MOCK AI RESPONSE (Remove this when API is funded) ---
        
#         # Simulate network delay so the frontend loading spinner works
#         time.sleep(2) 
        
#         mock_response = (
#             f"You asked SAGE about: '{user_prompt}'.\n\n"
#             f"This is a placeholder response because the DeepSeek API is currently unfunded (Error 402). "
#             f"However, your Django backend is perfectly connected and ready to go!"
#         )
        
#         return Response({"sage_response": mock_response}, status=status.HTTP_200_OK)
        
#         # ---------------------------------------------------------

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

        # 3. AI Logic (Mock)
        ai_reply = "I've saved this in our chat! How else can I help?"
        
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