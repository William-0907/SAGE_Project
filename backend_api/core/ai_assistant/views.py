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


from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import time

class AskSAGEView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        user_prompt = request.data.get('prompt')
        
        if not user_prompt:
            return Response({"error": "Please provide a prompt."}, status=status.HTTP_400_BAD_REQUEST)

        # --- MOCK AI RESPONSE (Remove this when API is funded) ---
        
        # Simulate network delay so the frontend loading spinner works
        time.sleep(2) 
        
        mock_response = (
            f"You asked SAGE about: '{user_prompt}'.\n\n"
            f"This is a placeholder response because the DeepSeek API is currently unfunded (Error 402). "
            f"However, your Django backend is perfectly connected and ready to go!"
        )
        
        return Response({"sage_response": mock_response}, status=status.HTTP_200_OK)
        
        # ---------------------------------------------------------