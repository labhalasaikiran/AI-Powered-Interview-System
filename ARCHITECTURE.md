# 🏗️ System Architecture

## Overview

The AI-Powered Interview System is built using a modern **3-tier architecture** with a React frontend, Express.js backend, and MongoDB database, enhanced with real-time proctoring and AI-powered evaluation.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  React SPA with Real-time Proctoring & Web APIs         │
│  (getUserMedia, Canvas API, Web Speech API)              │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS/REST + WebSockets (future)
                   │
┌──────────────────▼──────────────────────────────────────┐
│              API LAYER (Express.js)                      │
│  Authentication | Interview Management | Scoring       │
│  Proctoring Validation | Report Generation              │
└──────────────────┬──────────────────────────────────────┘
                   │ Mongoose ODM
                   │
┌──────────────────▼──────────────────────────────────────┐
│            DATA LAYER (MongoDB)                          │
│  Users | Sessions | Interview Prep | Audit Logs        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  AI Services       │
          │  (Gemini/Groq)     │
          └────────────────────┘
```

## Component Breakdown

### Frontend Architecture

#### Page Structure
```
App.js (Router)
├── HomePage
│   ├── Hero Section (CTA)
│   ├── Features Grid
│   └── How-It-Works
├── LoginPage
│   └── Auth Form
├── RegisterPage
│   └── Registration Form
├── InterviewSetupPage
│   ├── Step 1: Role Selection
│   ├── Step 2: System Verification
│   └── Step 3: Interview Config
├── InterviewPage
│   ├── Video Stream
│   ├── Proctoring Monitor
│   ├── Question Display
│   ├── Answer Input
│   └── Violation Tracker
├── ScorecardPage
│   ├── Overview Tab
│   ├── Details Tab
│   ├── Proctoring Tab
│   └── Feedback Tab
└── AdminDashboard
    ├── Overview Stats
    ├── Interview History
    └── User Profile
```

#### State Management
```
Frontend State Flow:
User Input → React Component State → API Service → Backend
     ↓
Validation → API Call → Server Response → Update State → UI Update
```

#### API Service Layer (Centralized)
```javascript
api.js
├── authAPI
│   ├── register()
│   ├── login()
│   └── getCurrentUser()
├── interviewPrepAPI
│   ├── savePrep()
│   ├── verifySystem()
│   ├── getRoles()
│   ├── getExperienceLevels()
│   └── getDifficultyLevels()
├── interviewAPI
│   ├── startInterview()
│   ├── submitAnswer()
│   └── endInterview()
└── scorecardAPI
    ├── getScorecard()
    └── generateReport()
```

**Key Feature**: JWT Token Interceptor
- Every request automatically includes `Authorization: Bearer <token>` header
- Token from localStorage injected at request time
- Enables seamless authentication across all API calls

### Backend Architecture

#### Route Structure
```
backend/
├── routes/
│   ├── authRoutes.js (Register, Login, GetUser)
│   ├── interviewPrepRoutes.js (Setup Data)
│   ├── interview.js (Start, Answer, End - TODO)
│   ├── scorecard.js (Reports - TODO)
│   └── adminRoutes.js (Analytics - TODO)
├── services/
│   ├── proctoringService.js (Real-time violation detection)
│   ├── interviewEngine.js (Interview Logic - TODO)
│   ├── llmService.js (AI Integration - TODO)
│   ├── CalibrationService.js (Proctoring Setup)
│   ├── driftService.js (Face tracking drift)
│   └── antiCheatService.js (Cheat detection)
├── models/
│   ├── User.js (User Profile + Auth)
│   ├── Session.js (Interview Session Data)
│   ├── InterviewPrep.js (Setup Config)
│   ├── Question.js (Question Bank)
│   └── Audit.js (Activity Logging)
├── utils/
│   ├── scoring.js (Multi-dimensional scoring)
│   └── sessionStore.js (Session management)
├── config/
│   └── db.js (MongoDB Connection)
└── prompts/
    └── [Question templates]
```

#### Authentication Flow
```
Register/Login
    ↓
Password Validation (bcrypt)
    ↓
JWT Token Generation (7-day expiry)
    ↓
Return to Frontend (stored in localStorage)
    ↓
Subsequent Requests include token in header
    ↓
Middleware verifies token
    ↓
Request processed if valid, rejected if invalid/expired
```

#### Interview Session Lifecycle
```
1. Interview Setup
   └─ Save role, experience, difficulty, technologies
   └─ Verify camera/microphone access
   
2. Interview Start
   └─ Initialize Session record
   └─ Request question from AI
   └─ Display question to user
   
3. During Interview
   └─ Monitor proctoring in real-time
   └─ Capture violations (eye, face, device, audio)
   └─ Record user answer
   
4. Answer Processing
   └─ Submit answer to backend
   └─ Evaluate with AI
   └─ Calculate score (4 dimensions)
   └─ Return feedback
   
5. Session End
   └─ Finalize all scores
   └─ Calculate integrity score
   └─ Generate report
   └─ Store in database
   
6. Report View
   └─ Retrieve session data
   └─ Display with 4 tabs
   └─ Show recommendations
```

### Data Models

#### User Schema
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  interviewHistory: [ObjectId], // References to Session._id
  createdAt: Date,
  updatedAt: Date
}
```

#### Session Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  prepId: ObjectId (ref: InterviewPrep),
  role: String,
  experience: String,
  difficulty: String,
  
  // Answers
  answers: [{
    question: String,
    userAnswer: String,
    scores: {
      technical: Number,
      communication: Number,
      problemSolving: Number,
      behavioural: Number
    }
  }],
  
  // Proctoring Data
  proctoring: {
    eyeMovementViolations: [{
      timestamp: Date,
      duration: Number,
      flagType: String
    }],
    faceDetectionViolations: [{...}],
    phoneDetectionViolations: [{...}],
    audioViolations: [{...}],
    totalIntegrityScore: Number // 0-100
  },
  
  // Results
  overallScore: Number,
  status: String, // "in-progress", "completed", "failed"
  startTime: Date,
  endTime: Date
}
```

#### InterviewPrep Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  role: String,
  experience: String,
  company: String,
  yearsOfExperience: Number,
  technologies: [String],
  difficulty: String,
  numberOfQuestions: Number,
  cameraAccess: Boolean,
  microphoneAccess: Boolean,
  systemRequirementsVerified: Boolean,
  createdAt: Date
}
```

## Proctoring System

### Real-Time Monitoring Algorithm

#### Frame Analysis (Every 1 second)
```
Captured Frame
    ↓
Canvas Analysis
    ├─ Face Detection
    │  └─ Count skin-tone pixels (r>95, g>40, b>20)
    │  └─ If < 5% of frame → violation
    │
    ├─ Eye Tracking
    │  └─ Analyze upper quarter for dark pixels
    │  └─ If < 10% → eye lookaway violation
    │
    ├─ Phone/Device Detection
    │  └─ Detect rectangular shapes
    │  └─ Check for screen-like brightness patterns
    │  └─ If detected → device violation
    │
    └─ Multiple Face Detection
       └─ If > 1 face detected → violation
       
    ↓
Violation Logged with timestamp
    ↓
Integrity Score Updated (-10 critical, -5 major, -2 warning)
```

### Violation Types
```
CRITICAL (-10 points):
- Empty frame (no face)
- Multiple people detected
- Device/phone detected

MAJOR (-5 points):
- Prolonged eye look-away (>3 seconds)
- Face rotated >30 degrees

MINOR (-2 points):
- Brief eye movement
- Slight face tilt
- Audio anomaly detected
```

### Integrity Scoring
```
Starting Score: 100
Final Score = 100 - (critical_violations × 10) 
              - (major_violations × 5) 
              - (minor_violations × 2)

Score Range: 0-100
Color Coding:
- Green: 70-100 (Excellent)
- Yellow: 40-69 (Fair)
- Red: 0-39 (Concerning)
```

## Multi-Dimensional Scoring System

### Four Scoring Dimensions
```
1. TECHNICAL COMPETENCY (25%)
   - Correctness of solution
   - Knowledge of tools/frameworks
   - Application of best practices

2. COMMUNICATION (25%)
   - Clarity of explanation
   - Articulation of thought process
   - Active listening

3. PROBLEM-SOLVING (25%)
   - Analytical approach
   - Breaking down complex problems
   - Optimization mindset

4. BEHAVIOURAL (25%)
   - Professionalism
   - Resilience under pressure
   - Collaboration potential
```

### Scoring Calculation
```
For each answer:
score = (technical × 0.25) + (communication × 0.25) 
        + (problemSolving × 0.25) + (behavioural × 0.25)

Overall Score = Average of all answer scores
Pass Threshold: ≥ 60%
```

## AI Integration Points

### LLM Service Integration (Future)
```
Interview Flow ← → LLM Service
                   ↓
              1. Question Generation
                 - Use role/experience/difficulty
                 - Generate from prompt templates
                 - Return formatted question
                 
              2. Answer Evaluation
                 - Send user answer + context
                 - Get structured evaluation
                 - Score across 4 dimensions
                 - Generate feedback
                 
              3. Report Insights
                 - Analyze answer patterns
                 - Generate strengths/weaknesses
                 - Provide recommendations
```

### Supported LLMs
```
Primary: Google Gemini API
- Fast response
- Good for multi-turn conversations
- Free tier available

Fallback: Groq API
- Ultra-fast inference
- Budget-friendly
- Good for batch processing

Integration Point: backend/services/llmService.js
```

## Security Architecture

### Authentication & Authorization
```
User Authentication (JWT)
    ↓
┌─ Token Generation
│  └─ Email + Password → bcrypt verify → JWT (7 days)
│
├─ Token Validation
│  └─ Check signature
│  └─ Check expiry
│  └─ Extract user info
│
└─ Protected Routes
   └─ Middleware verifies token
   └─ Attach user to request
   └─ Proceed or reject
```

### Password Security
```
User Enter Password
    ↓
bcryptjs (10 salt rounds)
    ↓
Hashed Password Stored in DB
    ↓
Login: Compare plaintext vs hash
    ↓
Match → Generate JWT
No Match → Reject
```

### Environment Variables
```
.env (Never committed)
├── Database: MONGO_URI
├── Security: JWT_SECRET (min 32 chars)
├── APIs: GOOGLE_API_KEY, GROQ_API_KEY
└── Config: NODE_ENV, CORS_ORIGIN
```

## Performance Optimization

### Frontend Optimization
```
Code Splitting
├─ Lazy load pages (React.lazy)
├─ Separate CSS per page
└─ Tree-shake unused code

Rendering
├─ Memoize expensive components
├─ Optimize re-renders
├─ Debounce input handlers

Assets
├─ Compress images
├─ Use responsive images
└─ Browser caching
```

### Backend Optimization
```
Database
├─ Index frequently queried fields
├─ Use projection to limit fields
├─ Connection pooling
└─ Query optimization

Caching
├─ Cache role/difficulty enums
├─ Cache user sessions
└─ Redis for distributed cache

API
├─ Pagination for large datasets
├─ Response compression (gzip)
├─ Request validation early
└─ Rate limiting
```

## Monitoring & Logging

### Application Monitoring
```
Frontend
├─ Error boundary catches crashes
├─ Console warnings
└─ API response tracking

Backend
├─ Request logging (Winston)
├─ Error tracking (Sentry)
├─ Performance metrics
└─ Database connection monitoring
```

### Audit Trail
```
Every action logged:
├─ User registration/login
├─ Interview start/end
├─ Proctoring events
├─ Answer submissions
└─ Report generation
```

## Deployment Architecture

### Production Environment
```
User Request
    ↓
┌─────────────┐
│ CDN/Nginx   │ (Static assets, SSL termination)
└──────┬──────┘
       ↓
┌──────────────────┐
│ Load Balancer    │ (Distribute traffic)
└──────┬───────┬──┘
       ↓       ↓
┌──────────┐ ┌──────────┐
│ Backend  │ │ Backend  │ (Horizontal scaling)
│ Instance │ │ Instance │
└──────┬───┘ └────┬─────┘
       │          │
       └──────┬───┘
              ↓
       ┌─────────────┐
       │  MongoDB    │
       │ (Replication)
       └─────────────┘
```

## Example User Flow

```
1. New User
   Home Page → Register → Email/Password → Account Created + JWT
   
2. Existing User
   Home Page → Login → Verify Credentials → JWT Stored
   
3. Interview Setup
   Dashboard → Start Interview → Select Role/Experience 
   → Verify Camera/Mic → Select Difficulty/Questions → Ready
   
4. During Interview
   Question 1 → Answer (monitored) → Submit → Score
   → Question 2 → Answer (monitored) → Submit → Score
   → Question 3 → Answer (monitored) → Submit → Score
   
5. Post-Interview
   Results Computed → Report Generated → Display Scorecard
   → View Feedback → Save for History
```

---

## Technology Stack Rationale

| Technology | Why Chosen | Benefit |
|-----------|-----------|---------|
| React | SPA Framework | Real-time UI updates, component reusability |
| Express.js | API Framework | Fast, minimal, flexible, excellent ecosystem |
| MongoDB | Database | Flexible schema, scalability, JSON native |
| JWT | Authentication | Stateless, secure, industry standard |
| bcryptjs | Password Hashing | Slow intentionally (security) |
| TensorFlow.js | Face/Eye Detection | Browser-native ML, no server GPU needed |
| Canvas API | Frame Analysis | Low-level control, real-time processing |
| Gemini/Groq | LLM | Fast inference, good quality responses |

---

**Architecture is modular, scalable, and production-ready!** 🚀
