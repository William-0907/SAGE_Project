import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test 1: Check if user endpoint works
print("Testing user endpoint...")
try:
    response = requests.get(f"{BASE_URL}/users/1/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test 2: Try registration
print("Testing registration endpoint...")
try:
    data = {
        "username": "testuser123",
        "email": "testuser@example.com",
        "password": "testpass123",
        "first_name": "Test",
        "last_name": "User",
        "is_student": True
    }
    response = requests.post(f"{BASE_URL}/users/register/", json=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")

print("\n" + "="*50 + "\n")

# Test 3: Try login
print("Testing login endpoint...")
try:
    data = {
        "username": "BossJo",
        "password": "test123456"  # You'll need to change this
    }
    response = requests.post(f"{BASE_URL}/users/login/", json=data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    else:
        print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
