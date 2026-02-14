# 🤖 AI-Powered Interview System

A comprehensive AI-driven interview platform with advanced proctoring features, intelligent question generation, and detailed candidate assessment.

## 🎯 Features

### Core Features
- ✅ **User Authentication**: Secure signup and login with JWT tokens
- ✅ **Interview Setup**: Role selection, experience level, and difficulty customization
- ✅ **AI Interview Engine**: Intelligent question generation and answer evaluation
- ✅ **Proctoring System**: Real-time monitoring with multiple security checks
- ✅ **Detailed Reports**: Comprehensive performance analysis and feedback
- ✅ **User-Friendly Interface**: Beautiful, responsive design

### Advanced Proctoring
- 👁️ **Eye Movement Tracking**: Detects if candidates are looking away from the screen
- 📹 **Face Detection**: Ensures face is visible and only one person in frame
- 📱 **Device Detection**: Prevents use of phones and unauthorized gadgets
- 🎤 **Audio Monitoring**: Detects background noise and interruptions
- 📊 **Integrity Scoring**: Real-time calculation of proctoring compliance

### Assessment Features
- 🧠 **AI-Powered Evaluation**: Uses advanced LLM models (Google Gemini, Groq)
- 📊 **Multi-Dimensional Scoring**: Technical Knowledge, Problem Solving, Communication, Behavioral Skills
- 📈 **Performance Analytics**: Detailed breakdown of strengths and weaknesses
- 💬 **Voice Recognition**: Speech-to-text conversion for voice answers
- 🎬 **Video Recording**: Optional video capture for review

## 🏗️ Project Structure

```
AI-Powered-Interview-System/
├── backend/
│   ├── config/          # Database configuration
│   ├── models/          # Data models (User, Session, InterviewPrep)
│   ├── routes/          # API routes
│   ├── services/        # Business logic (LLM, Proctoring, AI Engine)
│   ├── utils/           # Utility functions
│   ├── prompts/         # AI prompt templates
│   └── server.js        # Express server
│
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── pages/       # React components
│   │   ├── api.js       # API service
│   │   └── App.js       # Main app with routing
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js v14+
- MongoDB
- Google Gemini API key or Groq API key
- Modern browser with camera/microphone

### Installation

#### Backend Setup
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your_secret_key
GOOGLE_API_KEY=your_google_api_key
EOF

npm start
```

#### Frontend Setup
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF

npm start
```

## 📱 Application Flow

1. **Home Page** - Landing page with feature overview
2. **Authentication** - User registration/login
3. **Interview Setup** - Select role, experience, difficulty (3 steps)
4. **Interview** - Answer AI-generated questions with proctoring
5. **Report** - Detailed performance analysis and feedback

## 🔐 Proctoring Checks

- ✓ Eye movement tracking
- ✓ Face detection (one person, face visible)
- ✓ Phone/gadget detection
- ✓ Audio monitoring
- ✓ Real-time integrity scoring

## 📊 Scoring System

**Dimensions:**
- Technical Knowledge (35%)
- Problem Solving (25%)
- Communication (20%)
- Behavioral Skills (15%)
- Proctoring Integrity (5%)

## 🛠️ Tech Stack

**Frontend:**
- React 19
- React Router
- Axios
- TensorFlow.js (for ML models)
- CSS3

**Backend:**
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Google Gemini AI / Groq API
- PDFKit (for reports)

## 📄 API Endpoints

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Interview Setup:
POST   /api/interview-prep/prepare
POST   /api/interview-prep/verify-system
GET    /api/interview-prep/roles

Interview:
POST   /api/interview/start
POST   /api/interview/answer
POST   /api/interview/end

Scorecard:
GET    /api/scorecard/:sessionId
```

## 🔄 Environment Variables

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ai-interview
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_gemini_key
GROQ_API_KEY=your_groq_key
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## 📈 Performance Metrics

- ✓ Real-time scoring
- ✓ Instant feedback
- ✓ 99% uptime SLA
- ✓ Sub-second response time
- ✓ Multi-language support (coming soon)

## 🚀 Deployment

### Backend (Heroku)
```bash
heroku login
heroku create your-app
git push heroku main
```

### Frontend (Vercel)
```bash
npm install -g vercel
vercel
```

## 📚 Documentation

Detailed documentation for each component:
- `/backend/README.md` - Backend setup and API docs
- `/frontend/README.md` - Frontend setup and components

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open PR

## 📞 Support

For issues or support, please create an issue or contact support@aiinterview.com

## 🗺️ Roadmap

- Mobile app (React Native)
- Video interview recording
- Advanced analytics dashboard
- Interview scheduling system
- ATS integration
- Multi-language support

---

**Made with ❤️ for intelligent recruiting**
