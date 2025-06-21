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

// Environment variable for the API key should be set in your Cloudflare dashboard
quizRouter.post("/generate", async (c) => {
    try {
        // Get the content from request body
        const { content } = await c.req.json();

        if (!content || typeof content !== "string") {
            return c.json({ error: "A content string is required" }, 400);
        }

        // Get API key from environment
        const apiKey = c.env.GEMINI_API_KEY;
        if (!apiKey) {
            return c.json({ error: "API key not configured" }, 500);
        }        // Initialize the Gemini AI client
        const ai = new GoogleGenAI({ apiKey });

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
                                    C: { type: Type.STRING }
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
        });

        // Parse the generated content
        const responseText = response.text;
        if (!responseText) {
            return c.json({ error: "No response from AI" }, 500);
        }
        
        let quizQuestions: QuizQuestion[];        try {
            quizQuestions = JSON.parse(responseText) as QuizQuestion[];
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            return c.json({ error: "Failed to parse AI response", rawResponse: responseText }, 500);
        }

        return c.json(quizQuestions);
    } catch (error) {
        console.error("Error generating quiz:", error);
        return c.json({ error: "Failed to generate quiz questions" }, 500);
    }
});

export default quizRouter;