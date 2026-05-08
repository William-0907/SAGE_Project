import requests
from django.conf import settings
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import json
import re

class AskSAGEView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        user_prompt = request.data.get('prompt')
        
        if not user_prompt:
            return Response({"error": "Please provide a prompt."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the Groq API key from settings
        GROQ_API_KEY = settings.GROQ_API_KEY
        
        if not GROQ_API_KEY:
            print("[ERROR] GROQ_API_KEY is not set!")
            return Response({"error": "API Key is missing or not loading from .env"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        print(f"[DEBUG] Using Groq API Key: {GROQ_API_KEY[:10]}...")
        print(f"[DEBUG] User prompt: {user_prompt}")

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        # The payload structure for Groq (OpenAI-compatible)
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system", 
                    "content": "You are SAGE, a Smart Assistant for Group-Based Education. You help students learn by providing clear, concise, and engaging educational explanations."
                },
                {
                    "role": "user", 
                    "content": user_prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 1024
        }

        try:
            print("[DEBUG] Sending request to Groq API...")
            # Send the request to Groq
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions", 
                headers=headers, 
                json=payload,
                timeout=30
            )
            
            print(f"[DEBUG] Response status: {response.status_code}")
            print(f"[DEBUG] Response headers: {response.headers}")
            
            response.raise_for_status() 
            
            data = response.json()
            print(f"[DEBUG] Response data: {json.dumps(data, indent=2)}")
            ai_text = data['choices'][0]['message']['content']
            
            return Response({"sage_response": ai_text}, status=status.HTTP_200_OK)
            
        except requests.exceptions.Timeout:
            print("[ERROR] Request timed out")
            return Response({"error": "Groq API request timed out"}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] HTTP Error: {e}")
            print(f"[ERROR] Response text: {e.response.text}")
            
            error_text = e.response.text
            if "Insufficient Balance" in error_text or "insufficient" in error_text.lower():
                return Response({
                    "error": "Groq API: Insufficient balance. Please check your Groq account."
                }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            return Response({"error": f"API Error: {error_text}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Request Exception: {str(e)}")
            return Response({"error": f"Failed to connect to AI: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            print(f"[ERROR] Unexpected error: {str(e)}")
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '')
        filename = request.data.get('filename', 'document')
        file_type = request.data.get('file_type', 'txt')
        
        if not content or len(content.strip()) == 0:
            return Response({"error": "Please provide content to generate a quiz."}, status=status.HTTP_400_BAD_REQUEST)

        GROQ_API_KEY = settings.GROQ_API_KEY
        
        if not GROQ_API_KEY:
            print("[ERROR] GROQ_API_KEY is not set!")
            return Response({"error": "API Key is missing or not loading from .env"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        print(f"[DEBUG] Generating quiz from file: {filename}")
        print(f"[DEBUG] File type: {file_type}")
        print(f"[DEBUG] Content length: {len(content)}")
        print(f"[DEBUG] Content preview: {content[:200]}")

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        # Extract subject from filename
        subject = filename.split('.')[0].replace('-', ' ').replace('_', ' ').title()
        
        # Prompt to generate quiz
        system_prompt = """You are a quiz generation assistant. Generate a quiz with 5 well-formed questions based on the provided content. 
Return ONLY a valid JSON object (no markdown, no code blocks, just raw JSON) with this exact structure:
{
  "title": "Quiz Title",
  "subject": "Subject Name",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0
    }
  ]
}

Make sure:
- questions is an array
- Each question has exactly 4 options
- correctAnswer is a number (0-3) indicating the index of the correct option
- The JSON is valid and parseable"""
        
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"Subject: {subject}\n\nContent:\n{content}"
                }
            ],
            "temperature": 0.5,
            "max_tokens": 2048
        }

        try:
            print("[DEBUG] Sending quiz generation request to Groq...")
            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )

            print(f"[DEBUG] Quiz generation response status: {response.status_code}")
            
            response.raise_for_status()
            
            data = response.json()
            ai_text = data['choices'][0]['message']['content']
            print(f"[DEBUG] Raw AI response length: {len(ai_text)}")
            print(f"[DEBUG] Raw AI response preview: {ai_text[:300]}")

            # Extract JSON from response
            try:
                # Remove markdown code blocks if present
                if '```json' in ai_text:
                    ai_text = ai_text.split('```json')[1].split('```')[0]
                elif '```' in ai_text:
                    ai_text = ai_text.split('```')[1].split('```')[0]
                
                # Try to find JSON in the response
                json_match = re.search(r'\{[\s\S]*\}', ai_text)
                if json_match:
                    quiz_data = json.loads(json_match.group())
                else:
                    quiz_data = json.loads(ai_text)
                
                print(f"[DEBUG] Successfully parsed quiz: {quiz_data.get('title', 'Unknown')}")
                
            except (json.JSONDecodeError, AttributeError) as e:
                print(f"[ERROR] Failed to parse JSON from AI response: {e}")
                print(f"[ERROR] Response was: {ai_text}")
                
                # Create a meaningful fallback quiz based on subject
                quiz_data = {
                    "title": f"Quiz: {subject}",
                    "subject": subject,
                    "questions": [
                        {
                            "question": f"What is a key concept in {subject}?",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correctAnswer": 0
                        },
                        {
                            "question": f"Which of the following relates to {subject}?",
                            "options": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"],
                            "correctAnswer": 1
                        },
                        {
                            "question": f"How would you describe {subject}?",
                            "options": ["Response A", "Response B", "Response C", "Response D"],
                            "correctAnswer": 2
                        },
                        {
                            "question": f"What is the significance of {subject}?",
                            "options": ["Significance 1", "Significance 2", "Significance 3", "Significance 4"],
                            "correctAnswer": 0
                        },
                        {
                            "question": f"Which statement about {subject} is true?",
                            "options": ["Statement A", "Statement B", "Statement C", "Statement D"],
                            "correctAnswer": 3
                        }
                    ]
                }
                print(f"[WARNING] Using fallback quiz for subject: {subject}")

            return Response({"quiz": quiz_data}, status=status.HTTP_200_OK)

        except requests.exceptions.Timeout:
            print("[ERROR] Quiz generation request timed out")
            return Response({"error": "Quiz generation request timed out"}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except requests.exceptions.HTTPError as e:
            print(f"[ERROR] HTTP Error: {e}")
            print(f"[ERROR] Response text: {e.response.text}")
            return Response({"error": f"API Error: {e.response.text}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Request Exception: {str(e)}")
            return Response({"error": f"Failed to connect to AI: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            print(f"[ERROR] Unexpected error: {str(e)}")
            return Response({"error": f"Unexpected error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)