# 📡 API Documentation

## Base URL
```
Development:  http://localhost:5000/api
Production:   https://api.yourdomain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

Token obtained from login/register endpoint, expires in 7 days.

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Create new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Error (400):**
```json
{
  "error": "User already exists with this email"
}
```

---

### Login User
**POST** `/auth/login`

Authenticate user with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### Get Current User
**GET** `/auth/me`

Get authenticated user's profile information.

**Headers:** ✅ Requires Authentication

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "interviewHistory": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized - Invalid token"
}
```

---

## Interview Preparation Endpoints

### Get Roles
**GET** `/interview-prep/roles`

Get available interview roles.

**Response (200):**
```json
{
  "roles": [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UX Designer",
    "DevOps Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer"
  ]
}
```

---

### Get Experience Levels
**GET** `/interview-prep/experience-levels`

Get available experience levels.

**Response (200):**
```json
{
  "levels": [
    "Fresher",
    "1-2 Years",
    "2-5 Years",
    "5+ Years"
  ]
}
```

---

### Get Difficulty Levels
**GET** `/interview-prep/difficulty-levels`

Get available difficulty levels.

**Response (200):**
```json
{
  "levels": [
    "Easy",
    "Medium",
    "Hard"
  ]
}
```

---

### Save Interview Preparation
**POST** `/interview-prep/prepare`

Save interview setup configuration.

**Headers:** ✅ Requires Authentication

**Request Body:**
```json
{
  "role": "Software Engineer",
  "experience": "2-5 Years",
  "company": "Google",
  "yearsOfExperience": 3,
  "technologies": ["React", "Node.js", "MongoDB"],
  "difficulty": "Medium",
  "numberOfQuestions": 5
}
```

**Response (201):**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "userId": "507f1f77bcf86cd799439011",
  "role": "Software Engineer",
  "experience": "2-5 Years",
  "company": "Google",
  "yearsOfExperience": 3,
  "technologies": ["React", "Node.js", "MongoDB"],
  "difficulty": "Medium",
  "numberOfQuestions": 5,
  "cameraAccess": false,
  "microphoneAccess": false,
  "systemRequirementsVerified": false,
  "createdAt": "2024-01-15T10:35:00Z"
}
```

---

### Verify System Access
**POST** `/interview-prep/verify-system`

Verify camera and microphone access permissions.

**Headers:** ✅ Requires Authentication

**Request Body:**
```json
{
  "prepId": "507f1f77bcf86cd799439014",
  "cameraAccess": true,
  "microphoneAccess": true
}
```

**Response (200):**
```json
{
  "message": "System requirements verified",
  "cameraAccess": true,
  "microphoneAccess": true,
  "ready": true
}
```

---

## Interview Execution Endpoints

### Start Interview (TO BE IMPLEMENTED)
**POST** `/interview/start`

Initialize interview session and get first question.

**Headers:** ✅ Requires Authentication

**Request Body:**
```json
{
  "prepId": "507f1f77bcf86cd799439014"
}
```

**Expected Response (201):**
```json
{
  "sessionId": "507f1f77bcf86cd799439015",
  "question": {
    "id": "q1",
    "text": "Explain the difference between REST and GraphQL APIs",
    "type": "open-ended",
    "timeLimit": 600,
    "difficulty": "Medium"
  },
  "questionNumber": 1,
  "totalQuestions": 5,
  "timeStarted": "2024-01-15T10:40:00Z"
}
```

---

### Submit Answer (TO BE IMPLEMENTED)
**POST** `/interview/answer`

Submit answer to current question and get next question.

**Headers:** ✅ Requires Authentication

**Request Body:**
```json
{
  "sessionId": "507f1f77bcf86cd799439015",
  "questionId": "q1",
  "answer": "REST uses HTTP methods for CRUD operations...",
  "timeSpent": 120,
  "proctoringData": {
    "violations": [
      {
        "type": "eye-lookaway",
        "timestamp": "2024-01-15T10:41:30Z",
        "duration": 2
      }
    ],
    "screenShare": false,
    "multipleUsers": false
  }
}
```

**Expected Response (200):**
```json
{
  "question": {
    "id": "q2",
    "text": "How would you optimize a slow database query?",
    "type": "open-ended",
    "timeLimit": 600,
    "difficulty": "Medium"
  },
  "previousScore": {
    "technical": 8.5,
    "communication": 7.5,
    "problemSolving": 8,
    "behavioural": 8,
    "overall": 8.0
  },
  "questionNumber": 2,
  "totalQuestions": 5
}
```

---

### End Interview (TO BE IMPLEMENTED)
**POST** `/interview/end`

Finalize interview session and generate initial report.

**Headers:** ✅ Requires Authentication

**Request Body:**
```json
{
  "sessionId": "507f1f77bcf86cd799439015",
  "proctoringFinal": {
    "integrityScore": 85,
    "violations": [
      {
        "type": "eye-lookaway",
        "count": 3,
        "severity": "warning"
      }
    ]
  }
}
```

**Expected Response (200):**
```json
{
  "sessionId": "507f1f77bcf86cd799439015",
  "status": "completed",
  "results": {
    "overallScore": 78.5,
    "technical": 8.2,
    "communication": 7.5,
    "problemSolving": 7.8,
    "behavioural": 7.9,
    "integrityScore": 85,
    "grade": "B",
    "passStatus": "passed"
  },
  "completedAt": "2024-01-15T10:55:00Z"
}
```

---

## Scorecard Endpoints

### Get Interview Report (TO BE IMPLEMENTED)
**GET** `/scorecard/:sessionId`

Get detailed interview results and report.

**Headers:** ✅ Requires Authentication

**URL Parameters:**
- `sessionId` (string, required) - Session ID from completed interview

**Response (200):**
```json
{
  "session": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439011",
    "role": "Software Engineer",
    "experience": "2-5 Years",
    "difficulty": "Medium"
  },
  "scores": {
    "overall": 78.5,
    "technical": 8.2,
    "communication": 7.5,
    "problemSolving": 7.8,
    "behavioural": 7.9,
    "integrityScore": 85,
    "grade": "B"
  },
  "answers": [
    {
      "questionId": "q1",
      "question": "Explain the difference between REST and GraphQL APIs",
      "answer": "REST uses HTTP methods...",
      "scores": {
        "technical": 8.0,
        "communication": 8.0,
        "problemSolving": 8.5,
        "behavioural": 8.0
      },
      "feedback": "Well explained, provided good examples"
    }
  ],
  "proctoring": {
    "integrityScore": 85,
    "violations": [
      {
        "type": "eye-lookaway",
        "count": 3,
        "severity": "warning",
        "message": "Eyes looked away from screen"
      }
    ]
  },
  "feedback": {
    "strengths": [
      "Strong technical knowledge",
      "Clear communication",
      "Good problem-solving approach"
    ],
    "improvements": [
      "Focus on screen during interview",
      "Provide more specific examples"
    ],
    "recommendations": [
      "Review design patterns",
      "Practice system design problems"
    ]
  }
}
```

**Error (404):**
```json
{
  "error": "Interview session not found"
}
```

---

### Download Report (TO BE IMPLEMENTED)
**GET** `/scorecard/:sessionId/download`

Download interview report as PDF.

**Headers:** ✅ Requires Authentication

**Response:** Binary PDF file

---

## Dashboard Endpoints

### Get User Dashboard Data (TO BE IMPLEMENTED)
**GET** `/dashboard`

Get user's interview history and statistics.

**Headers:** ✅ Requires Authentication

**Response (200):**
```json
{
  "stats": {
    "totalInterviews": 5,
    "averageScore": 76.4,
    "passRate": 80,
    "bestScore": 85,
    "improvementTrend": "up"
  },
  "recentInterviews": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "role": "Software Engineer",
      "score": 78.5,
      "status": "passed",
      "completedAt": "2024-01-15T10:55:00Z"
    }
  ]
}
```

---

## Admin Endpoints

### Get User Analytics (TO BE IMPLEMENTED)
**GET** `/admin/analytics`

Get system-wide analytics and user statistics.

**Headers:** ✅ Requires Authentication (Admin Only)

**Response (200):**
```json
{
  "totalUsers": 1250,
  "totalInterviews": 3450,
  "averageScore": 72.3,
  "passRate": 65,
  "topRoles": [
    {
      "role": "Software Engineer",
      "count": 1200,
      "averageScore": 74.5
    }
  ]
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message",
  "status": 400,
  "details": "Additional details if available"
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

API has rate limiting to prevent abuse:

- **Default**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Interview endpoints**: 1 request per second per user

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234800
```

---

## WebSocket Events (Future Enhancement)

Real-time proctoring and user collaboration:

### Connect
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

### Events
```javascript
// Interview started
socket.on('interview:started', (data) => {
  console.log('Interview started:', data);
});

// Proctoring violation detected
socket.on('proctoring:violation', (violation) => {
  console.log('Violation:', violation);
});

// Answer scored
socket.on('answer:scored', (scores) => {
  console.log('Scores:', scores);
});
```

---

## Integration Examples

### JavaScript/Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Register
const registerUser = async (data) => {
  try {
    const response = await api.post('/auth/register', data);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response.data);
  }
};

// Get roleß
const getRoles = async () => {
  try {
    const response = await api.get('/interview-prep/roles');
    return response.data.roles;
  } catch (error) {
    console.error('Failed to fetch roles:', error);
  }
};
```

### cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# Get roles
curl http://localhost:5000/api/interview-prep/roles

# Authenticated endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/auth/me
```

### Python
```python
import requests

api_url = 'http://localhost:5000/api'

# Register
response = requests.post(f'{api_url}/auth/register', json={
    'firstName': 'John',
    'lastName': 'Doe',
    'email': 'john@example.com',
    'password': 'securePassword123'
})
token = response.json()['token']

# Get roles with token
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(f'{api_url}/interview-prep/roles', headers=headers)
print(response.json())
```

---

## Testing API Endpoints

### Using Postman
1. Create new collection "AI Interview System"
2. Set variable: `{{base_url}}` = `http://localhost:5000/api`
3. Create requests with authentication header
4. Use Tests tab for assertions

### Using Thunder Client (VS Code)
1. Install Thunder Client extension
2. Create environment with `api_url` and `token`
3. Create requests and save to collection
4. Run tests

---

## API Changelog

### v1.0.0 (Current)
- ✅ Authentication endpoints
- ✅ Interview preparation endpoints
- ⏳ Interview execution endpoints (TODO)
- ⏳ scorecard endpoints (TODO)
- ⏳ Dashboard endpoints (TODO)

### v1.1.0 (Planned)
- WebSocket support for real-time updates
- Batch endpoint for multiple interviews
- Export results in CSV/PDF format
- Administrative endpoints for game management

---

**API is ready for comprehensive integration!** 🚀

For more details, check [ARCHITECTURE.md](./ARCHITECTURE.md)
