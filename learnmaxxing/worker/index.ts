import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types"
import { createRepositories } from "../db";
import quizRouter from "./quiz";
export type WorkerBindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: WorkerBindings }>()
// Mount the quiz router
app.route("/api/quiz", quizRouter);

app.get('/api/', (c) => {
  return c.json({
    message: "Learnmaxxing API is running!"
  })
})

// Example endpoints using the repository layer
app.get('/api/users', async (c) => {
  const repos = createRepositories(c.env.DB);
  const users = await repos.users.findAll();
  return c.json(users);
})

app.post('/api/users', async (c) => {
  const repos = createRepositories(c.env.DB);
  const body = await c.req.json();
  
  try {
    const user = await repos.users.create({
      username: body.username,
      email: body.email,
      password_hash: body.password_hash
    });
    return c.json(user, 201);
  } catch (error) {
    return c.json({ error: "Failed to create user" }, 400);
  }
})

app.get('/api/quizzes', async (c) => {
  const repos = createRepositories(c.env.DB);
  const quizzes = await repos.quizzes.findAll();
  return c.json(quizzes);
})

app.post('/api/quizzes', async (c) => {
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

app.get('/api/quizzes/:id/questions', async (c) => {
  const repos = createRepositories(c.env.DB);
  const quizId = parseInt(c.req.param('id'));
  
  const questions = await repos.questions.findByQuizId(quizId);
  return c.json(questions);
})

export default {
  fetch: app.fetch
}