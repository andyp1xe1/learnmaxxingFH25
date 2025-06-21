import { Hono } from "hono";
import { GoogleGenAI, Type } from "@google/genai";
import type { D1Database } from "@cloudflare/workers-types"
import { createRepositories } from "../db";

export type WorkerBindings = {
  DB: D1Database
  GEMINI_API_KEY: string;
}

interface QuizQuestion {
  question: string;
  answerOptions: {
    A: string;
    B: string;
    C: string;
  };
  correctAnswer: string;
  sourceReference: string;
}

const quizRouter = new Hono<{ Bindings: WorkerBindings }>();

quizRouter.post("/generate-topics-and-quizzes", async (c) => {
  try {
    const repos = createRepositories(c.env.DB);
    const { prompt } = await c.req.json();
    if (!prompt || typeof prompt !== "string") {
      return c.json({ error: "A prompt string is required" }, 400);
    }

    const apiKey = "AIzaSyCcConKJNslbmdbip9VqwCWQnXhPmQHdRc";
    // c.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "API key not configured" }, 500);
    }
    const ai = new GoogleGenAI({ apiKey });

    // 1. Generate quiz topics (names)
    const topicsResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 5 quiz topics based on the following prompt. Return as a JSON array of strings. Prompt: ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const topicsText = topicsResponse.text;
    
    if (!topicsText) {
      return c.json({ error: "No topics generated" }, 500);
    }
    const topics: string[] = JSON.parse(topicsText);
    
    const quizzes: any[] = [];

    for (const topic of topics) {
      // 2. Check if quiz exists in DB (implement findQuizByName)
      const existingQuiz = await repos.quizzes.findByTitle(topic);
      console.log("Checking for existing quiz:", topic, existingQuiz);
      if (existingQuiz) {
        continue; // Quiz already exists, skip
      }

      // 3. Generate quiz questions for this topic
      const quizResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate multiple-choice quiz questions for the topic "${topic}". Each question should have 3 options (A, B, C) with exactly one correct answer. Include a source reference for each answer. Return as JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answerOptions: {
                  type: Type.OBJECT,
                  properties: {
                    A: { type: Type.STRING },
                    B: { type: Type.STRING },
                    C: { type: Type.STRING },
                  },
                  propertyOrdering: ["A", "B", "C"],
                },
                correctAnswer: { type: Type.STRING },
                sourceReference: { type: Type.STRING },
              },
              propertyOrdering: ["question", "answerOptions", "correctAnswer", "sourceReference"],
            },
          },
        },
      });

      const quizQuestions: QuizQuestion[] = JSON.parse(quizResponse.text || "[]");

      // 4. Save new quiz to DB (implement saveQuiz)
      const quiz = await repos.quizzes.create({
        title: topic,
        description: `Quiz on the topic: ${topic}`})
      
      const referenceMap = new Map<string, number>();
      for (const q of quizQuestions) {
        if (!referenceMap.has(q.sourceReference)) {
          // Save reference and store its id
          const ref = await repos.references.create({
            quiz_id: quiz.id,
            title: q.sourceReference.substring(0, 100), // Optional: use first 100 chars as title
            content: new TextEncoder().encode(q.sourceReference), // Store as ArrayBuffer
          });
          referenceMap.set(q.sourceReference, ref.id);
        }
      }

      // 6. Save questions and reference_question links
      for (const q of quizQuestions) {
        const question = await repos.questions.create({
          quiz_id: quiz.id,
          question_json: {
            question: q.question,
            answerOptions: q.answerOptions,
            correctAnswer: q.correctAnswer,
          },
          explanation: "", // Optional: add explanation if available
        });

        // Link question to reference
        const referenceId = referenceMap.get(q.sourceReference);
        if (referenceId) {
          await repos.referenceQuestions.create({
            question_id: question.id,
            reference_id: referenceId,
            paragraph: q.sourceReference, // Or extract a paragraph if needed
          });
        }
      }


      quizzes.push({
        title: quiz.title,
        description: quiz.description,
        questions: quizQuestions
      })
    }

    return c.json({ created: quizzes.length, quizzes });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating topics/quizzes:", errorMessage);
    return c.json({ error: "Failed to generate topics/quizzes", details: errorMessage }, 500);
  }
});

export default quizRouter;