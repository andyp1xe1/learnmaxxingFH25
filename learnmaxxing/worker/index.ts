import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import quizRouter from "./quiz";
import { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Mount the quiz router
app.route("/api/quiz", quizRouter);

// Your existing API endpoint
app.get("/api/", (c) => {
  return c.json({ name: "LearnMaxxing AI" });
});

// Static assets
app.get("*", serveStatic({ root: "./", manifest: {} }));

export default app;
