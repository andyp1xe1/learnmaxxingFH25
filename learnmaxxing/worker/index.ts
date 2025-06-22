import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import type { D1Database } from "@cloudflare/workers-types"
import { createRepositories } from "../db";
import { GoogleGenAI } from "@google/genai";
import quizRouter from "./quiz";
import spacedRepetitionRouter from "./spaced-repetition";

export type WorkerBindings = {
  DB: D1Database
  GEMINI_API_KEY: string;
}

const app = new Hono<{ Bindings: WorkerBindings }>()

// Mount the quiz router
app.route("/api/quiz", quizRouter);

// Mount the spaced repetition router
app.route("/api/spaced-repetition", spacedRepetitionRouter);

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

export default {
  fetch: app.fetch
}
