# SAGE Project - Complete Setup Guide for Team

## 📋 Project Overview

**SAGE** = **Smart Assistant for Group-Based Education**

A full-stack mobile learning platform with:
- **Backend**: Django REST API with user profiles, AI recommendations, group sessions, activity tracking
- **Frontend**: React Native/Expo mobile app with dashboard, gamification, and AI-powered features
- **DevOps**: ngrok tunneling for multi-device testing

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Python 3.12+
- Node.js & npm
- ngrok (optional, for testing on multiple devices)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend_api/core

# Install dependencies (already set up)
pip install django

# Run migrations (already done, skip if database exists)
python manage.py makemigrations
python manage.py migrate

# Seed sample data (already done, skip if data exists)
python manage.py seed_data

# Start Django server
python manage.py runserver localhost:8000
```

The backend will be available at: `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to mobile app
cd mobile_app

# Install dependencies (already set up)
npm install

# Start Expo development server
npx expo start
```

Then choose:
- Press `w` to open web version
- Press `a` to open Android emulator
- Press `i` to open iOS simulator
- Scan QR code with Expo Go app on physical device

### 3. Public Testing (Multiple Devices)

```bash
# In a new terminal, start ngrok tunnel
ngrok http 8000
```

This creates a public URL like: `https://slouchy-photo-delivery.ngrok-free.dev`

Update API configuration in [mobile_app/config/api.ts](mobile_app/config/api.ts):
```typescript
export const API_BASE_URL = API_CONFIG.TUNNEL;  // Use ngrok URL
```

Now any device can access your app using the ngrok URL!

---

## 📁 Project Structure

```
Development/SAGE_Project/
├── backend_api/
│   └── core/
│       ├── manage.py
│       ├── core/
│       │   ├── settings.py (Django config)
│       │   ├── urls.py (API routes)
│       │   └── wsgi.py
│       ├── users/
│       │   ├── models.py (User, Badge, Recommendation, Session, Activity)
│       │   ├── views.py (API endpoints)
│       │   ├── serializers.py
│       │   ├── urls.py
│       │   └── admin.py
│       └── db.sqlite3 (Database)
│
└── mobile_app/
    ├── app/
    │   ├── (tabs)/ (Tab navigation)
    │   └── _layout.tsx
    ├── components/
    │   ├── Dashboard.tsx (Main dashboard with API calls)
    │   └── LoginScreen.tsx
    ├── config/
    │   └── api.ts (API configuration - EDIT THIS TO SWITCH ENDPOINTS)
    ├── package.json
    └── tsconfig.json
```

---

## 🔌 API Endpoints

All endpoints return JSON and are accessible at: `{API_BASE_URL}/user/{user_id}/`

### User Profile
```
GET /api/user/1/
Response: {
  "id": 1,
  "name": "Jomar Melendrez",
  "email": "jomar@example.com",
  "streak_count": 7,
  "total_achievements": 5
}
```

### Badges
```
GET /api/user/1/badges/
Response: [{
  "id": 1,
  "icon": "🏅",
  "name": "First Steps",
  "earned_at": "2026-05-05T06:33:18.920Z"
}, ...]
```

### AI Recommendations
```
GET /api/user/1/recommendations/
Response: [{
  "id": 1,
  "title": "Join Study Group Alpha",
  "description": "A new study group is forming for your core classes",
  "created_at": "2026-05-05T06:33:18.920Z"
}, ...]
```

### Group Sessions
```
GET /api/user/1/sessions/
Response: [{
  "id": 1,
  "title": "Math Study Session",
  "description": "Collaborative problem-solving session",
  "participants": 4,
  "created_at": "2026-05-05T06:33:18.920Z"
}, ...]
```

### Activity History
```
GET /api/user/1/activities/
Response: [{
  "id": 1,
  "title": "Completed Quiz 5",
  "description": "Scored 95% on calculus quiz",
  "activity_type": "quiz",
  "created_at": "2026-05-05T06:33:18.920Z"
}, ...]
```

---

## 🎯 Configuration

### Switch Between Testing Environments

Edit **mobile_app/config/api.ts**:

```typescript
export const API_CONFIG = {
  LOCAL: 'http://192.168.1.14:8000/api',      // Same WiFi network
  TUNNEL: 'https://slouchy-photo-delivery.ngrok-free.dev/api',  // Public ngrok URL
  LOCALHOST: 'http://localhost:8000/api',     // Web only
};

// Change this to switch environments:
export const API_BASE_URL = API_CONFIG.TUNNEL;  // ← Edit this line
```

### Getting a New ngrok URL

```bash
ngrok http 8000
```

Copy the forwarding URL and update:
1. `api.ts` with the new ngrok URL
2. Share with team for testing

### Django Settings

Key settings are in **backend_api/core/core/settings.py**:
- `DEBUG = True` (Development only)
- `ALLOWED_HOSTS = ['*']` (Allows all domains - change for production)
- `INSTALLED_APPS` includes `'users'` app

---

## 🧪 Testing Checklist

- [ ] Django server running (`http://localhost:8000`)
- [ ] Expo running (`npx expo start`)
- [ ] Mobile app loads Dashboard screen
- [ ] User name displays: "Jomar Melendrez"
- [ ] Streak shows: 7
- [ ] Achievements shows: 5
- [ ] Badges section shows 2 badges (🏅🏆)
- [ ] Recommendations section shows content
- [ ] Sessions section shows content
- [ ] Activities section shows content

### Test Single Device
```bash
# Terminal 1: Backend
cd backend_api/core && python manage.py runserver localhost:8000

# Terminal 2: Frontend
cd mobile_app && npx expo start
# Press 'w' for web or 'a' for Android
```

### Test Multiple Devices
```bash
# Terminal 1: Backend
cd backend_api/core && python manage.py runserver localhost:8000

# Terminal 2: ngrok tunnel
ngrok http 8000

# Terminal 3: Frontend
cd mobile_app && npx expo start
# Share ngrok URL with team
```

---

## 🔧 Database Management

### View Database Admin Panel
1. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```
2. Go to `http://localhost:8000/admin`
3. Login with superuser credentials
4. Manage users, badges, recommendations, sessions, activities

### Reset Database
```bash
# Delete db.sqlite3 file
rm db.sqlite3

# Recreate database
python manage.py migrate

# Reseed sample data
python manage.py seed_data
```

### Add More Test Users
Edit **users/management/commands/seed_data.py** and add more user data, then run:
```bash
python manage.py seed_data
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch user" on mobile app
**Solution**: 
1. Check Django server is running
2. Check ngrok is tunneling (if using TUNNEL config)
3. Verify correct API URL in `config/api.ts`
4. Check `ALLOWED_HOSTS` in Django settings

### Issue: ngrok connection refused
**Solution**:
1. Restart Django server
2. Get new ngrok URL: `ngrok http 8000`
3. Update `config/api.ts` with new URL

### Issue: CORS or 404 errors
**Solution**:
1. Verify `ALLOWED_HOSTS = ['*']` in settings
2. Check API endpoints exist in `users/urls.py`
3. Ensure database has data: `python manage.py seed_data`

### Issue: Port 8000 already in use
**Solution**:
```bash
# Use different port
python manage.py runserver localhost:8001
# Then update API config to use :8001
```

---

## 📱 Mobile App Features

**Dashboard Screen** displays:
- Welcome greeting with user name
- Quick stats (Streak, Achievements, Progress)
- AI Recommendations section
- Group Sessions section
- Recent Activities section
- Earned Badges section

All data fetches from Django API automatically on load.

---

## 🚀 Next Steps for Team

1. **Clone/Pull** the latest code
2. **Install dependencies** (backend & frontend)
3. **Run Django server**: `python manage.py runserver localhost:8000`
4. **Run Expo**: `npx expo start`
5. **Update API config** to use ngrok for multi-device testing
6. **Test on multiple devices** with the ngrok URL

---

## 📞 Support

- Django Docs: https://docs.djangoproject.com
- Expo Docs: https://docs.expo.dev
- ngrok Docs: https://ngrok.com/docs
- React Native: https://reactnative.dev

**Questions?** Check the logs in your terminal for detailed error messages!
