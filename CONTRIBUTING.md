# 🤝 Contributing to AI-Powered Interview System

Thank you for your interest in contributing to this project! We welcome contributions from everyone.

## Code of Conduct

All contributors must adhere to our Code of Conduct:
- Be respectful and inclusive
- Provide constructive feedback
- Report inappropriate behavior to maintainers
- Focus on the code, not the person

## Getting Started

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/your-username/AI-Powered-Interview-System.git
cd AI-Powered-Interview-System

# Add upstream
git remote add upstream https://github.com/original-repo/AI-Powered-Interview-System.git
```

### 2. Create Feature Branch
```bash
# Update from upstream
git fetch upstream
git checkout -b feature/your-feature-name

# Naming conventions:
# feature/ - new features
# fix/ - bug fixes
# docs/ - documentation
# refactor/ - code refactoring
# perf/ - performance improvements
# test/ - test additions
```

### 3. Development Environment
```bash
# Follow QUICKSTART.md for setup
cd backend
npm install
npm start

# In another terminal
cd frontend
npm install
npm start
```

## Coding Standards

### JavaScript/React Style Guide

#### Naming Conventions
```javascript
// Constants - UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:5000/api';

// Functions & variables - camelCase
const getUserData = () => {};
const isValidEmail = true;

// React Components - PascalCase
const InterviewPage = () => {};
const ScoreCard = () => {};

// Classes - PascalCase
class UserService {}
```

#### Code Style
```javascript
// Use arrow functions
const handleSubmit = () => {};

// Use destructuring
const { userId, userName } = user;

// Use const by default, let if necessary
const immutable = true;
let mutable = false;

// Use template literals
const message = `Hello, ${name}!`;

// Prefer async/await over .then()
const data = await fetchData();
```

#### Comments
```javascript
// Use single-line comments for obvious code
// Only add comments for WHY, not WHAT

// Example - BAD (what is obvious)
// Check if email is valid
const isValid = email.includes('@');

// Example - GOOD (why we're doing this)
// Convert email to lowercase to ensure case-insensitive comparison
const normalizedEmail = email.toLowerCase();
```

#### Error Handling
```javascript
// Always handle errors
try {
  const response = await api.post('/interview/start', data);
  return response.data;
} catch (error) {
  console.error('Failed to start interview:', error);
  throw new Error('Interview start failed');
}

// Use specific error types
if (error.response?.status === 401) {
  // Handle authentication error
} else if (error.response?.status === 404) {
  // Handle not found error
} else {
  // Handle other errors
}
```

### File Organization

```
src/
├── pages/          # Page components
├── components/     # Reusable components
├── services/       # API & business logic
├── utils/          # Utility functions
├── styles/         # CSS/SCSS files
├── constants/      # Constants
└── hooks/          # Custom React hooks
```

### Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../styles/Component.css';

// 2. Constants
const INITIAL_STATE = { /* ... */ };
const ERROR_MESSAGES = { /* ... */ };

// 3. Component Definition
const MyComponent = ({ prop1, prop2 }) => {
  // 3a. Hooks
  const navigate = useNavigate();
  const [state, setState] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);

  // 3b. Effects
  useEffect(() => {
    // Initialize
  }, []);

  // 3c. Event Handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handler logic
  };

  // 3d. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

// 4. Export
export default MyComponent;
```

## Commit Guidelines

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Example Commits
```bash
# Feature
git commit -m "feat(interview): add eye-tracking calibration"

# Bug fix
git commit -m "fix(auth): prevent expired token from being used"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Style
git commit -m "style(scorecard): improve card layout alignment"

# Test
git commit -m "test(proctoring): add violation detection tests"
```

### Commit Message Rules
- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period (.) at the end
- Reference issues with "Fixes #123" in body
- Keep subject line under 50 characters
- Explain WHAT and WHY, not HOW

## Testing

### Unit Tests
```bash
# Run tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Example Test
```javascript
// services/api.test.js
import api from '../api';

describe('API Service', () => {
  it('should authenticate user with valid credentials', async () => {
    const response = await api.auth.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(response).toHaveProperty('token');
    expect(response.user).toHaveProperty('id');
  });

  it('should throw error with invalid credentials', async () => {
    expect(async () => {
      await api.auth.login({
        email: 'test@example.com',
        password: 'wrong'
      });
    }).rejects.toThrow();
  });
});
```

## Pull Request Process

### Before Submitting
- [ ] Code follows style guide
- [ ] Self-review your code
- [ ] Comments added for complex logic
- [ ] Tests written and passing
- [ ] No console.logs or debug code
- [ ] Updated documentation
- [ ] No merge conflicts

### PR Description Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #123

## Testing Done
- [ ] Unit tests added
- [ ] Manual testing completed
- [ ] Tested on multiple browsers (if UI change)

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented complex areas
- [ ] Tests are passing
```

### PR Review Process
1. At least 2 maintainers must review
2. All CI checks must pass
3. No merge conflicts
4. Documentation updated if needed
5. Then merge to main

## Issue Reporting

### Bug Report Template
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS]
- Browser: [e.g., Chrome]
- Node version: [e.g., 18.0.0]
- Repo version: [commit hash]

## Screenshots
[Add if applicable]
```

### Feature Request Template
```markdown
## Feature Description
Clear description of desired feature

## Use Case
Why this feature is needed

## Potential Implementation
How it could be implemented

## Related Issues
Link to related issues
```

## Development Tools

### Recommended Extensions (VS Code)
```json
{
  "recommendations": [
    "ES7+/React/Redux/React-Native snippets",
    "Prettier - Code formatter",
    "ESLint",
    "Thunder Client or REST Client",
    "MongoDB for VS Code",
    "GitLens"
  ]
}
```

### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: ['react-app'],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'no-var': 'error'
  }
};
```

### Prettier Configuration
```javascript
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## Documentation

### Updating Documentation
- Update README.md for user-facing changes
- Update QUICKSTART.md for setup changes
- Add JSDoc comments for functions
- Update API documentation for endpoint changes

### JSDoc Example
```javascript
/**
 * Evaluates interview answers using AI
 * @param {Object} answers - User answers
 * @param {string} role - Interview role
 * @returns {Promise<Object>} Evaluation results
 * @throws {Error} If evaluation fails
 */
async function evaluateAnswers(answers, role) {
  // Implementation
}
```

## Performance Guidelines

### Frontend
- Keep components under 300 lines
- Use React.memo for expensive renders
- Lazy load images and components
- Minimize re-renders with proper dependencies
- Use const for functions, not arrow in class methods

### Backend
- Use connection pooling for database
- Implement caching for frequent queries
- Use indexes for database queries
- Validate input before processing
- Use pagination for large datasets

## Security Guidelines

### What NOT to commit
- `.env` files (use `.env.example`)
- API keys or secrets
- Passwords or credentials
- node_modules/ or dist/
- Private keys or certificates

### Security Best Practices
- Always validate user input
- Use prepared statements for queries
- Never log sensitive data
- Use HTTPS in production
- Implement rate limiting
- Sanitize output to prevent XSS

## Getting Help

- **Questions?** Open a Discussion
- **Found a bug?** Create an Issue
- **Have a suggestion?** Feature Request
- **Need clarification?** Ask in PR comments

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Monthly highlights

## License

By contributing, you agree that your contributions will be licensed under the same license as this project.

---

**Thank you for contributing! 🙌**

Questions? Join our community!
