# 🚀 Quick Start Guide

## Prerequisites
- Node.js v14+ and npm
- MongoDB (local or cloud - MongoDB Atlas)
- Git

## 5-Minute Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/AI-Powered-Interview-System.git
cd AI-Powered-Interview-System
```

### 2. Backend Setup (Terminal 1)
```bash
cd backend

# Copy environment template and update with your keys
cp .env.example .env

# Edit .env and add:
# - MONGO_URI (MongoDB connection string)
# - GOOGLE_API_KEY (from Google AI Studio)
# - JWT_SECRET (any random string)

nano .env  # or use your editor

# Install and run
npm install
npm start
# Server will start on http://localhost:5000
```

### 3. Frontend Setup (Terminal 2)
```bash
cd frontend

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
# App will open at http://localhost:3000
```

### 4. Access the Application
- **Home**: http://localhost:3000
- **Registration**: http://localhost:3000/register
- **Login**: http://localhost:3000/login

## Getting AI API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Create new API key
4. Copy and paste into `.env` as `GOOGLE_API_KEY`

### Alternative: Groq API
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for free
3. Create API key in API keys section
4. Set `GROQ_API_KEY` in `.env`

## MongoDB Setup

### Option 1: Local MongoDB
```bash
# macOS with Homebrew
brew install mongodb-community
brew services start mongodb-community

# Linux (Ubuntu)
sudo systemctl start mongod

# Windows
# Download from mongodb.com and install
# Service starts automatically
```

### Option 2: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster
4. Get connection string
5. Use as `MONGO_URI` in `.env`

Example: `mongodb+srv://username:password@cluster.mongodb.net/ai-interview`

## Testing the Application

### User Registration & Login
1. Click "Register" on home page
2. Enter name, email, password
3. Click "Register"
4. You'll be logged in automatically

### Interview Setup
1. Click "Start Interview" or navigate to `/interview-setup`
2. Step 1: Select role and experience level
3. Step 2: Grant camera/microphone permissions
4. Step 3: Configure interview details
5. Click "Start Interview"

### Interview Experience
1. Camera feed shows on left
2. Questions appear on right
3. Type or speak your answer
4. Submit each answer
5. Get instant feedback

### View Results
- After completing interview, view detailed report
- Check proctoring integrity score
- Review strengths and areas for improvement

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`
- Check connection string in .env

### API Key Not Found
```
Error: GOOGLE_API_KEY not defined
```
**Solution**: 
1. Ensure `.env` file exists in backend folder
2. Copy correct API key
3. Restart backend server

### Camera/Microphone Access Denied
**Solution**:
1. Check browser permissions for localhost
2. Use HTTPS in production
3. Try different browser
4. Check OS privacy settings

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: 
```bash
# Find process using port 5000
lsof -i :5000

# Kill process (macOS/Linux)
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

## Project Architecture

```
Frontend (React)
    ↓
React Router (navigation)
    ↓
API Layer (axios)
    ↓
Backend (Express.js)
    ↓
MongoDB (data storage)
    ↓
AI Services (Google/Groq)
```

## Available Scripts

### Frontend
```bash
npm start          # Start dev server
npm build          # Create production build
npm test           # Run tests
npm eject          # Eject from create-react-app
```

### Backend
```bash
npm start          # Start server
npm test           # Run tests
npm run lint       # Check code style
```

## Environment Variables Reference

### Backend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection | mongodb://localhost:27017/ai-interview |
| JWT_SECRET | Token secret | super_secret_key |
| GOOGLE_API_KEY | Google Gemini API | AIzaSy... |
| GROQ_API_KEY | Groq API key | gsk_... |
| NODE_ENV | Environment | development |

### Frontend (.env)
| Variable | Purpose | Example |
|----------|---------|---------|
| REACT_APP_API_URL | Backend URL | http://localhost:5000/api |
| REACT_APP_ENV | Environment | development |

## Next Steps

1. **Customize Questions**: Edit prompt templates in `backend/prompts/`
2. **Configure Scoring**: Modify weights in `backend/utils/scoring.js`
3. **Add More Roles**: Update role list in `backend/routes/interviewPrepRoutes.js`
4. **Deploy**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## Documentation

- [README.md](./README.md) - Full project documentation
- [Backend README](./backend/README.md) - Backend specific docs
- [Frontend README](./frontend/README.md) - Frontend specific docs

## Support & Issues

- Create issue on GitHub: https://github.com/your-repo/issues
- Email: support@aiinterview.com
- Discord: https://discord.gg/aiinterview

## Contributing

1. Fork repo
2. Create feature branch
3. Make changes
4. Submit pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

**Happy interviewing! 🚀**
