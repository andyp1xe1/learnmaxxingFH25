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

    const apiKey = c.env.GEMINI_API_KEY;
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
    }    const topics: string[] = JSON.parse(topicsText);
      // Create or find a group for these quizzes based on the prompt
    let group = await repos.groups.findByName(prompt.substring(0, 100)); // Use first 100 chars of prompt as group name
    if (!group) {
      group = await repos.groups.create({
        name: prompt.substring(0, 100)
      });
    }
    
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

      const quizQuestions: QuizQuestion[] = JSON.parse(quizResponse.text || "[]");      // 4. Save new quiz to DB with group reference
      const quiz = await repos.quizzes.create({
        title: topic,
        description: `Quiz on the topic: ${topic}`,
        group_id: group.id
      })
        const referenceMap = new Map<string, number>();
      for (const q of quizQuestions) {
        if (!referenceMap.has(q.sourceReference)) {
          // Save reference and store its id
          const ref = await repos.references.create({
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

quizRouter.post("/analyze-content-and-suggest", async (c) => {
  try {
    const repos = createRepositories(c.env.DB);
    const { contents } = await c.req.json();
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return c.json({ error: "Contents array is required and must not be empty" }, 400);
    }

    const apiKey = c.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "API key not configured" }, 500);
    }
    const ai = new GoogleGenAI({ apiKey });    // 1. Save all contents to database first and get their IDs
    const savedContents: Array<{id: number, content: string}> = [];
    for (let i = 0; i < contents.length; i++) {
      const content = contents[i];
      const ref = await repos.references.create({
        title: `Content ${i + 1}`,
        content: new TextEncoder().encode(content)
      });
      savedContents.push({
        id: ref.id,
        content: content
      });
    }

    // 2. Get all existing groups and their quizzes from database
    const existingGroups = await repos.groups.findAll();
    const existingGroupsData: Array<{groupId: number, groupName: string, topics: Array<{id: number, title: string}>}> = [];
    
    for (const group of existingGroups) {
      const quizzes = await repos.groups.getQuizzes(group.id);
      existingGroupsData.push({
        groupId: group.id,
        groupName: group.name,
        topics: quizzes.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title
        }))
      });
    }

    // 3. Prepare context for AI about existing content
    const existingContext = existingGroupsData.length > 0 
      ? `Existing groups and topics in database:\n${JSON.stringify(existingGroupsData, null, 2)}`
      : "No existing groups or topics in database.";

    // 4. Prepare contents with database IDs
    const contentWithIds = savedContents.map(({id, content}) => 
      `[Content ID ${id}]: ${content}`
    ).join('\n\n');

    // 5. Ask AI to analyze content and suggest topics/groups
    const suggestionResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        Analyze the following contents and organize quiz topics into groups. 
        
        ${existingContext}
        
        Contents to analyze:
        ${contentWithIds}
        
        Based on these contents, organize topics that can use the provided content:
        1. PRIORITIZE reusing existing groups and topics where they fit
        2. For existing topics, you can enhance them with new content
        3. Only create new topics when existing ones don't fit the content
        4. Only create new groups when content doesn't fit in any existing group
        5. Use the content database IDs (not array indices) to reference content
        6. Only include topics that have content to work with (contentIds not empty)
        
        Return as JSON with this structure:
        {
          "groups": [
            {
              "groupId": number (use existing groupId, or -1 for new group),
              "groupName": "string",
              "topics": [
                {
                  "topicId": number (use existing topic id, or -1 for new topic),
                  "topicName": "string",
                  "isNew": boolean,
                  "contentIds": [number array of database reference IDs]
                }
              ]
            }
          ]
        }
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            groups: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  groupId: { type: Type.NUMBER },
                  groupName: { type: Type.STRING },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        topicId: { type: Type.NUMBER },
                        topicName: { type: Type.STRING },
                        isNew: { type: Type.BOOLEAN },
                        contentIds: {
                          type: Type.ARRAY,
                          items: { type: Type.NUMBER }
                        }
                      },
                      propertyOrdering: ["topicId", "topicName", "isNew", "contentIds"]
                    }
                  }
                },
                propertyOrdering: ["groupId", "groupName", "topics"]
              }
            }
          }
        }
      }
    });

    const suggestionText = suggestionResponse.text;
    if (!suggestionText) {
      return c.json({ error: "No suggestions generated" }, 500);
    }    const suggestions = JSON.parse(suggestionText);

    // Process the suggestions and create missing groups/topics
    const processedGroups: Array<{
      groupId: number,
      groupName: string,
      topics: Array<{
        topicId: number,
        topicName: string,
        isNew: boolean,
        contentIds: number[]
      }>
    }> = [];
    
    for (const suggestedGroup of suggestions.groups) {
      let group;
      
      // Handle group creation/retrieval
      if (suggestedGroup.groupId === -1) {
        // Create new group
        group = await repos.groups.create({
          name: suggestedGroup.groupName
        });
      } else {
        // Use existing group
        group = await repos.groups.findById(suggestedGroup.groupId);
        if (!group) {
          // Fallback: create group if it doesn't exist
          group = await repos.groups.create({
            name: suggestedGroup.groupName
          });
        }
      }

      const processedTopics: Array<{
        topicId: number,
        topicName: string,
        isNew: boolean,
        contentIds: number[]
      }> = [];
      
      for (const suggestedTopic of suggestedGroup.topics) {
        // Filter out topics with empty contentIds
        if (!suggestedTopic.contentIds || suggestedTopic.contentIds.length === 0) {
          continue;
        }
        
        let topic;
        
        // Handle topic creation/retrieval
        if (suggestedTopic.topicId === -1) {
          // Create new topic
          topic = await repos.quizzes.create({
            title: suggestedTopic.topicName,
            description: `Quiz on the topic: ${suggestedTopic.topicName}`,
            group_id: group.id
          });
        } else {
          // Use existing topic
          topic = await repos.quizzes.findById(suggestedTopic.topicId);
          if (!topic) {
            // Fallback: create topic if it doesn't exist
            topic = await repos.quizzes.create({
              title: suggestedTopic.topicName,
              description: `Quiz on the topic: ${suggestedTopic.topicName}`,
              group_id: group.id
            });
          }
        }

        processedTopics.push({
          topicId: topic.id,
          topicName: topic.title,
          isNew: suggestedTopic.isNew,
          contentIds: suggestedTopic.contentIds
        });
      }

      // Only add group if it has topics with content
      if (processedTopics.length > 0) {
        processedGroups.push({
          groupId: group.id,
          groupName: group.name,
          topics: processedTopics
        });
      }
    }

    return c.json({
      groups: processedGroups,
      savedContentIds: savedContents.map(c => c.id)
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error analyzing content:", errorMessage);
    return c.json({ error: "Failed to analyze content", details: errorMessage }, 500);
  }
});

export default quizRouter;