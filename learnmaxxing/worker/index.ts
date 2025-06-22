import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import type { D1Database } from "@cloudflare/workers-types"
import { createRepositories } from "../db";
import { GoogleGenAI } from "@google/genai";
import quizRouter from "./quiz";
import { cors } from 'hono/cors';
export type WorkerBindings = {
  DB: D1Database
  GEMINI_API_KEY: string;
}

const app = new Hono<{ Bindings: WorkerBindings }>()

// Enable CORS for development
app.use('/*', cors({
  origin: ['http://localhost:5173', 'http://localhost:4173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// Mount the quiz router
app.route("/api/quiz", quizRouter);

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
  const quizzes = await repos.quizzes.findAllWithQuestions();
  return c.json(quizzes);
})

// Groups endpoints
app.get('/api/groups', async (c) => {
  const repos = createRepositories(c.env.DB);
  const groups = await repos.groups.findAll();
  return c.json(groups);
})

app.get('/api/groups/:id', async (c) => {
  const repos = createRepositories(c.env.DB);
  const groupId = parseInt(c.req.param('id'));
  
  if (isNaN(groupId)) {
    return c.json({ error: "Invalid group ID" }, 400);
  }
  
  const group = await repos.groups.findById(groupId);
  if (!group) {
    return c.json({ error: "Group not found" }, 404);
  }
  
  return c.json(group);
})

app.get('/api/groups/:id/quizzes', async (c) => {
  const repos = createRepositories(c.env.DB);
  const groupId = parseInt(c.req.param('id'));
  
  if (isNaN(groupId)) {
    return c.json({ error: "Invalid group ID" }, 400);
  }
  
  const quizzes = await repos.groups.getQuizzes(groupId);
  return c.json(quizzes);
})

// Protected quiz management endpoints
app.post('/api/protected/quizzes', async (c) => {
  const repos = createRepositories(c.env.DB);
  const body = await c.req.json();
  
  try {
    const quiz = await repos.quizzes.create({
      title: body.title,
      description: body.description,
      group_id: body.group_id
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

app.post('/api/topics/failure-percentage', async (c) => {
  const data: Array<{ questionId: number; success: boolean; topicId: number }> = await c.req.json();
  const repos = createRepositories(c.env.DB);

  const stats: Record<number, { total: number; failed: number; badQuestions: number[] }> = {};
  for (const q of data) {
    if (!stats[q.topicId]) stats[q.topicId] = { total: 0, failed: 0, badQuestions: [] };
    stats[q.topicId].total += 1;
    if (!q.success) {
      stats[q.topicId].failed += 1;
      stats[q.topicId].badQuestions.push(q.questionId);
    }
  }

  const quizIds = Object.keys(stats).map(Number);

  // Fetch quiz titles for all quizIds (topicIds)
  const quizIdToTitle: Record<number, string> = {};
  await Promise.all(
    quizIds.map(async (quizId) => {
      const quiz = await repos.quizzes.findById(quizId);
      if (quiz) {
        quizIdToTitle[quizId] = quiz.title;
      }
    })
  );

  // Prepare Gemini AI
  const apiKey = c.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey });

  // For each topic, get feedback from Gemini and gather references for bad questions
  const result = await Promise.all(Object.entries(stats).map(async ([quizId, { total, failed, badQuestions }]) => {
    const title = quizIdToTitle[Number(quizId)] || `Unknown (${quizId})`;
    const failurePercentage = total > 0 ? (failed / total) * 100 : 0;

    let feedback = "";
    if (total > 0) {
      const prompt = `The topic "${title}" has a failure rate of ${failurePercentage.toFixed(1)}%. In one or two sentences, what is the most important thing you should focus on to improve? Answer as if speaking directly to the user. Be concise.`;
      try {
        const feedbackResponse = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        feedback = (feedbackResponse.text || "")
          .replace(/[\n\r]+/g, " ")
          .replace(/["']/g, "")
          .replace(/\*/g, "")
          .trim();
      } catch (err) {
        feedback = "Could not generate feedback.";
      }
    }

    // Gather references and paragraphs for bad questions
    const references: Array<{ questionId: number; referenceTitle: string; paragraph: string }> = [];
    for (const questionId of badQuestions) {
      // Get all reference-question links for this question
      const refQuestions = await repos.referenceQuestions.findByQuestionId(questionId);
      for (const rq of refQuestions) {
        // Get the reference title
        const ref = await repos.references.findById(rq.reference_id);
        references.push({
          questionId,
          referenceTitle: ref?.title || "Unknown",
          paragraph: rq.paragraph
        });
      }
    }

    return {
      topic: title,
      failurePercentage,
      feedback,
      references // array of { questionId, referenceTitle, paragraph }
    };
  }));

  return c.json(result);
});
// Catch-all handler for SPA routing - return 200 with a message to let frontend handle routing
app.get('*', async (c) => {
  const path = new URL(c.req.url).pathname;
  
  // Don't handle API routes
  if (path.startsWith('/api/')) {
    return c.notFound();
  }
  
  // For all other routes in a SPA, return success and let frontend handle routing
  // This prevents 404 errors on page refresh
  return c.text('SPA Route - Frontend will handle routing', 200, {
    'Content-Type': 'text/plain'
  });
});

// Add a not found handler for API routes only
app.notFound((c) => {
  const path = new URL(c.req.url).pathname;
  
  // If it's an API route, return proper 404
  if (path.startsWith('/api/')) {
    return c.json({ error: 'Not found' }, 404);
  }
  
  // For non-API routes, return success (SPA will handle)
  return c.text('SPA Route - Frontend will handle routing', 200, {
    'Content-Type': 'text/plain'
  });
});

// export type AppRouter = typeof app;
export default {
  fetch: app.fetch
}
/*
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

// Export the app as default handler
export default app;

// Export the router type for client usage
export type AppRouter = typeof app;
>>>>>>> ab41b2e (feat: Add drag-and-drop file upload modal with Tailwind CSS v4)
 */
