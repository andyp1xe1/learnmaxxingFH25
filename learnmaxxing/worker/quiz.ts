import { Hono } from "hono";
import { GoogleGenAI, Type } from "@google/genai";
import { Env } from "./types";

// Define the quiz question structure
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

const quizRouter = new Hono<{ Bindings: Env }>();

quizRouter.post("/generate", async (c) => {
  try {
    // Get the content from request body
    const { content } = await c.req.json();
    
    if (!content || typeof content !== "string") {
      return c.json({ error: "A content string is required" }, 400);
    }

    // Get API key from environment variable
    const apiKey = c.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "API key not configured" }, 500);    }    // Initialize the Gemini AI client
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Generate quiz questions
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 multiple-choice quiz questions based on the following content. 
        Each question should have 3 options (A, B, C) with exactly one correct answer.
        Please include references to where in the source content the answer can be found.
        Content: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
              },
              answerOptions: {
                type: Type.OBJECT,
                properties: {
                  A: { type: Type.STRING },
                  B: { type: Type.STRING },
                  C: { type: Type.STRING },
                },
                propertyOrdering: ["A", "B", "C"],
              },
              correctAnswer: {
                type: Type.STRING,
              },
              sourceReference: {
                type: Type.STRING,
              },
            },
            propertyOrdering: ["question", "answerOptions", "correctAnswer", "sourceReference"],
          },
        },
      },
    });    // Parse the generated content
    const responseText = response.text;
    if (!responseText) {
      return c.json({ error: "No response from AI" }, 500);
    }
    
    const quizQuestions = JSON.parse(responseText) as QuizQuestion[];

    return c.json(quizQuestions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error generating quiz:", errorMessage);
    return c.json({ error: "Failed to generate quiz questions", details: errorMessage }, 500);
  }
});

export default quizRouter;