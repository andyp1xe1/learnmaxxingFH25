# Development Setup

This guide explains how to run the Learnmaxxing application with both frontend and backend connected.

## Prerequisites

1. Node.js (v18 or later)
2. Cloudflare account for Wrangler
3. Gemini API key from Google AI Studio

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

3. **Set up Cloudflare D1 database:**

   ```bash
   # Initialize database with schema
   npx wrangler d1 execute learnmaxxdb --file=db/schema.sql
   ```

4. **Configure Wrangler secrets:**
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   # Enter your Gemini API key when prompted
   ```

## Running the Application

### Option 1: Run both servers simultaneously (recommended)

```bash
npm run dev:all
```

This will start:

- Backend (Cloudflare Worker) on http://localhost:8787
- Frontend (Vite dev server) on http://localhost:5173

### Option 2: Run servers separately

**Terminal 1 - Backend:**

```bash
npm run dev:worker
```

**Terminal 2 - Frontend:**

```bash
npm run dev
```

## API Endpoints

The application exposes the following endpoints:

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Groups & Quizzes

- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get specific group
- `GET /api/groups/:id/quizzes` - Get quizzes for a group
- `GET /api/quizzes` - Get all quizzes
- `GET /api/protected/quizzes/:id/questions` - Get questions for a quiz (auth required)

### Quiz Generation

- `POST /api/quiz/generate-topics-and-quizzes` - Generate topics and questions from prompt
- `POST /api/quiz/analyze-content-and-suggest` - Analyze content and suggest topics
- `POST /api/quiz/generate-questions` - Generate questions from selections

### Assessment

- `POST /api/topics/failure-percentage` - Submit assessment data and get feedback

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Cloudflare Workers + Hono framework
- **Database**: Cloudflare D1 (SQLite)
- **AI**: Google Gemini API

## Development Flow

1. **Data Flow**: Frontend → API Service → Cloudflare Worker → D1 Database
2. **Authentication**: Basic Auth stored in localStorage
3. **API Proxy**: Vite proxies `/api/*` requests to localhost:8787 in development
4. **Types**: Shared TypeScript interfaces between frontend and backend

## Connected Components

The following components are now connected to the backend APIs:

### Authentication Flow

- **LogIn.tsx**: Uses `apiService.login()` for user authentication
- **SignUp.tsx**: Uses `apiService.register()` for user registration
- **AuthContext.tsx**: Manages authentication state across the application

### Data Management

- **GroupsPage.tsx**: Fetches groups and quizzes using `apiService.getGroups()` and `apiService.getGroupQuizzes()`
- **ExamMode.tsx**: Loads quiz questions using `apiService.getQuizQuestions()`
- **LearnMode.tsx**: Loads flashcard data using `apiService.getQuizQuestions()`
- **QuizGenerator.tsx**: Uses AI endpoints for generating quizzes from prompts

### API Service (`src/services/api.ts`)

- Centralized API client with automatic authentication
- Environment-aware base URL configuration
- Type-safe interfaces for all API responses
- Error handling and network request management

## Environment Configuration

- **Development**: API requests are proxied through Vite to localhost:8787
- **Production**: API requests go to the same domain as the frontend
- **Authentication**: Basic Auth with credentials stored in localStorage
- **Database**: Cloudflare D1 database with repository pattern

## Troubleshooting

- If the backend doesn't start, check your Gemini API key configuration
- If API calls fail, verify the proxy configuration in vite.config.ts
- If database queries fail, ensure the D1 database is properly initialized
- Check browser console and terminal logs for detailed error messages
- Ensure both servers are running when using the application
