# 📦 Deployment Guide

## Production Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups configured
- [ ] SSL certificates obtained
- [ ] API rate limiting configured
- [ ] Error logging enabled
- [ ] Performance monitoring setup
- [ ] Security headers configured
- [ ] CORS properly configured

## Deployment Platforms

### Option 1: Heroku (Easiest)

#### Backend Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create ai-interview-backend

# Set environment variables
heroku config:set MONGO_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret
heroku config:set GOOGLE_API_KEY=your_key

# Deploy
git push heroku main
```

#### Frontend Deployment
```bash
# Create app
heroku create ai-interview-frontend

# Build and deploy
npm run build
heroku deploy:git

# Or use buildpack
heroku buildpacks:add mars/create-react-app
git push heroku main
```

### Option 2: AWS (Scalable)

#### Backend (EC2 + RDS)
```bash
# Launch EC2 instance (Ubuntu)
# Install Node.js and Git
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone repo-url
cd backend
npm install
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start server.js --name "ai-interview"
pm2 startup
pm2 save
```

#### Frontend (S3 + CloudFront)
```bash
# Build
npm run build

# Upload to S3
aws s3 sync build/ s3://ai-interview-bucket/

# Create CloudFront distribution pointing to S3
```

### Option 3: DigitalOcean (Affordable)

```bash
# Create Droplet (Ubuntu 20.04)
# SSH into droplet

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Create docker-compose.yml
# Deploy containers
docker-compose up -d
```

### Option 4: Vercel + Railway (Modern Stack)

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Connect to GitHub for auto-deployment
```

#### Backend (Railway)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

## Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file: .env
    depends_on:
      - mongodb
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: .env.production
  
  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Environment Setup for Production

### Backend .env.production
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai-interview-prod
JWT_SECRET=your_production_secret_key_min_32_chars
JWT_EXPIRY=7d
GOOGLE_API_KEY=your_production_google_key
GROQ_API_KEY=your_production_groq_key
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=info
```

### Frontend .env.production
```
REACT_APP_API_URL=https://api.yourdomain.com/api
REACT_APP_ENV=production
REACT_APP_VERSION=1.0.0
```

## Database Migration

### Backup production data
```bash
# Local to file
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/ai-interview" --out ./backup

# File to Atlas
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/ai-interview-new" ./backup/ai-interview
```

## Security Configuration

### SSL/HTTPS Setup (Let's Encrypt)
```bash
# Using Certbot
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# Configure in Express
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/fullchain.pem')
};

https.createServer(options, app).listen(443);
```

### Security Headers (Helmet.js)
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Monitoring & Logging

### Setup Application Monitoring
```javascript
// Error tracking with Sentry
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "your_sentry_dsn",
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### Log Aggregation (Winston)
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Performance Optimization

### Frontend Optimization
```bash
# Build analysis
npm run build -- --analyze

# Enable gzip compression
npm install compression-webpack-plugin --save-dev
```

### Backend Optimization
```bash
# Add caching layer (Redis)
npm install redis

# Enable HTTP caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

## Maintenance & Updates

### Database Maintenance
```bash
# Regular backups
0 2 * * * /backup-script.sh

# Index optimization
db.collection.reIndex()

# Clean old sessions
db.sessions.deleteMany({ createdAt: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })
```

### Dependency Updates
```bash
# Check for security vulnerabilities
npm audit

# Update dependencies safely
npm update
npm audit fix

# Test after updates
npm test
```

## Rollback & Recovery

### In case of deployment failure
```bash
# Rollback to previous version
git revert <commit-hash>
git push

# Or use Docker
docker pull myregistry/app:previous-tag
docker run -d myregistry/app:previous-tag

# Restore from database backup
mongorestore --uri="mongodb+srv://..." ./backup/ai-interview
```

## Load Testing

```bash
# Install ab (Apache Bench)
brew install httpd

# Test concurrent requests
ab -n 1000 -c 50 https://yourdomain.com/api/health

# Or use locust
pip install locust
locust -f locustfile.py
```

## Production Checklist

- [ ] SSL certificate installed
- [ ] Database backups automated
- [ ] Monitoring and alerting configured
- [ ] Error tracking enabled (Sentry)
- [ ] Rate limiting configured
- [ ] CORS properly restricted
- [ ] API authentication verified
- [ ] Environment variables secured
- [ ] Secrets not in version control
- [ ] Load balancing configured (for high traffic)
- [ ] CDN setup for static assets
- [ ] Database replication/clustering enabled
- [ ] Health check endpoints created
- [ ] Graceful shutdown implemented
- [ ] Documentation updated

---

**Ready for production!** 🚀
