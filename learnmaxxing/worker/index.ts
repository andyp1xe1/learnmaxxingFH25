import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { basicAuth } from "hono/basic-auth";
import type { D1Database } from "@cloudflare/workers-types"
import { createRepositories } from "../db";

// Define environment variables
export type WorkerBindings = {
  DB: D1Database
  // Add your environment variables here
  // Example: R2_BUCKET: R2Bucket;
}

// Define upload result types
interface UploadSuccess {
  filename: string;
  success: true;
  size: number;
  type: string;
}

interface UploadError {
  filename: string;
  success: false;
  error: string;
}

type UploadResult = UploadSuccess | UploadError;

// Create Hono app
const app = new Hono<{ Bindings: WorkerBindings }>();

// Add CORS middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'], // Add your frontend URLs
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', message: 'Worker is running' });
});

app.get('/api/', (c) => {
  return c.json({
    message: "Learnmaxxing API is running!"
  })
})

// Register endpoint - public
app.post('/api/register', async (c) => {
  const repos = createRepositories(c.env.DB);
  const body = await c.req.json();
  
  if (!body.username || !body.password) {
    return c.json({ error: "Username and password are required" }, 400);
  }

  try {
    // Check if user already exists
    const existingUser = await repos.users.findByUsername(body.username);
    if (existingUser) {
      return c.json({ error: "Username already exists" }, 409);
    }

    const user = await repos.users.create({
      username: body.username,
      password: body.password
    });
    
    // Don't return password in response
    const { password, ...userResponse } = user;
    return c.json({ 
      message: "User created successfully", 
      user: userResponse 
    }, 201);
  } catch (error) {
    return c.json({ error: "Failed to create user" }, 500);
  }
})

// Login endpoint - public (just validates credentials)
app.post('/api/login', async (c) => {
  const repos = createRepositories(c.env.DB);
  const body = await c.req.json();
  
  if (!body.username || !body.password) {
    return c.json({ error: "Username and password are required" }, 400);
  }

  try {
    const user = await repos.users.findByUsername(body.username);
    if (!user || user.password !== body.password) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    // Don't return password in response
    const { password, ...userResponse } = user;
    return c.json({ 
      message: "Login successful", 
      user: userResponse 
    });
  } catch (error) {
    return c.json({ error: "Login failed" }, 500);
  }
})

// Basic auth middleware for protected routes
const authMiddleware = basicAuth({
  verifyUser: async (username, password, c) => {
    const repos = createRepositories(c.env.DB);
    try {
      const user = await repos.users.findByUsername(username);
      return user !== null && user.password === password;
    } catch (error) {
      return false;
    }
  },
  realm: "Learnmaxxing Protected Area"
})

// Protected routes - require basic auth
app.use('/api/protected/*', authMiddleware)

// Protected user endpoints
app.get('/api/protected/users', async (c) => {
  const repos = createRepositories(c.env.DB);
  const users = await repos.users.findAll();
  // Remove passwords from response
  const safeUsers = users.map(({ password, ...user }) => user);
  return c.json(safeUsers);
})

app.get('/api/protected/profile', async (c) => {
  const repos = createRepositories(c.env.DB);
  // Get username from basic auth header
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: "No authorization header" }, 401);
  }
  
  const credentials = authHeader.replace('Basic ', '');
  const decoded = atob(credentials);
  const [username] = decoded.split(':');
  
  const user = await repos.users.findByUsername(username);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }
  
  const { password, ...userResponse } = user;
  return c.json(userResponse);
})

// Public quiz endpoints (no auth required)
app.get('/api/quizzes', async (c) => {
  const repos = createRepositories(c.env.DB);
  const quizzes = await repos.quizzes.findAll();
  return c.json(quizzes);
})

// Protected quiz management endpoints
app.post('/api/protected/quizzes', async (c) => {
  const repos = createRepositories(c.env.DB);
  const body = await c.req.json();
  
  try {
    const quiz = await repos.quizzes.create({
      title: body.title,
      description: body.description
    });
    return c.json(quiz, 201);
  } catch (error) {
    return c.json({ error: "Failed to create quiz" }, 400);
  }
})

app.get('/api/protected/quizzes/:id/questions', async (c) => {
  const repos = createRepositories(c.env.DB);
  const quizId = parseInt(c.req.param('id'));
  
  const questions = await repos.questions.findByQuizId(quizId);
  return c.json(questions);
})

// File upload endpoint
app.post('/api/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const files = formData.getAll('file') as File[];
    
    if (!files || files.length === 0) {
      return c.json({ error: 'No files provided' }, 400);
    }

    const uploadResults: UploadResult[] = [];

    for (const file of files) {
      // Validate file type
      const validTypes = ['text/plain', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: 'Invalid file type. Only PDF and TXT files are allowed.'
        });
        continue;
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: 'File too large. Maximum size is 10MB.'
        });
        continue;
      }

      try {
        // Here you would typically:
        // 1. Upload to R2 bucket
        // 2. Store metadata in D1 database
        // 3. Process the file content
        
        // Placeholder implementation
        const fileContent = await file.text();
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        uploadResults.push({
          filename: file.name,
          success: true,
          size: file.size,
          type: file.type,
          // Add any additional metadata you want to return
        });
        
      } catch (error) {
        uploadResults.push({
          filename: file.name,
          success: false,
          error: 'Failed to process file'
        });
      }
    }

    const successCount = uploadResults.filter(r => r.success).length;
    const failureCount = uploadResults.filter(r => !r.success).length;

    return c.json({
      message: `Upload completed. ${successCount} successful, ${failureCount} failed.`,
      results: uploadResults
    });

  } catch (error) {
    console.error('Upload error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get uploaded files endpoint
app.get('/api/files', async (c) => {
  try {
    // Placeholder implementation
    // In a real app, you would fetch from your database
    const files = [
      {
        id: '1',
        filename: 'example.pdf',
        size: 1024000,
        type: 'application/pdf',
        uploadedAt: new Date().toISOString(),
        status: 'processed'
      }
    ];

    return c.json({ files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete file endpoint
app.delete('/api/files/:id', async (c) => {
  try {
    const fileId = c.req.param('id');
    
    // Placeholder implementation
    // In a real app, you would delete from your database and storage
    
    return c.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default {
  fetch: app.fetch
}

// Export the router type for client usage
export type AppRouter = typeof app;
