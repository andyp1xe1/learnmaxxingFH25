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
      console.log(`💾 Saving content ${i + 1}/${contents.length} (${content.length} chars) to database...`);
      
      const encodedContent = new TextEncoder().encode(content);
      console.log(`🔧 Encoded content: ${content.length} chars → ${encodedContent.length} bytes`);
      
      const ref = await repos.references.create({
        title: `Content ${i + 1}`,
        content: encodedContent
      });
      console.log(`✅ Saved with reference ID: ${ref.id}`);
      
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

quizRouter.post("/generate-questions", async (c) => {
  try {
    console.log("🚀 Starting question generation process...");
    const repos = createRepositories(c.env.DB);
    const { selections } = await c.req.json();
    
    console.log(`📝 Received ${selections?.length || 0} selections:`, selections);
    
    // Validate request format
    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return c.json({ error: "Selections array is required and must not be empty" }, 400);
    }
      // Validate each selection has required fields
    for (const selection of selections) {
      if (!selection.groupId || !selection.topicId || !selection.contentId) {
        return c.json({ error: "Each selection must have groupId, topicId, and contentId" }, 400);
      }
    }

    const apiKey = c.env.GEMINI_API_KEY;
    if (!apiKey) {
      return c.json({ error: "API key not configured" }, 500);
    }
    const ai = new GoogleGenAI({ apiKey });
    console.log("✅ AI initialized successfully");

    const processedGroups: Array<{
      groupId: number,
      groupName: string,
      topics: Array<{
        topicId: number,
        topicName: string,
        questions: Array<{
          questionId: number,
          question: string,
          answerOptions: { A: string, B: string, C: string },
          correctAnswer: string,
          explanation: string
        }>
      }>
    }> = [];

    // Group selections by groupId for organized processing
    const groupedSelections = new Map<number, Array<any>>();
    for (const selection of selections) {
      if (!groupedSelections.has(selection.groupId)) {
        groupedSelections.set(selection.groupId, []);
      }
      groupedSelections.get(selection.groupId)!.push(selection);
    }
    
    console.log(`🗂️ Grouped selections into ${groupedSelections.size} groups`);

    // Process each group
    for (const [groupId, groupSelections] of groupedSelections) {
      console.log(`\n📂 Processing group ${groupId} with ${groupSelections.length} topics...`);
      
      // Get group information
      const group = await repos.groups.findById(groupId);
      if (!group) {
        console.warn(`❌ Group with ID ${groupId} not found, skipping`);
        continue;
      }
      console.log(`✅ Found group: "${group.name}"`);

      const processedTopics: Array<{
        topicId: number,
        topicName: string,
        questions: Array<{
          questionId: number,
          question: string,
          answerOptions: { A: string, B: string, C: string },
          correctAnswer: string,
          explanation: string
        }>
      }> = [];

      // Process each topic in the group
      for (const selection of groupSelections) {
        console.log(`\n  📚 Processing topic ${selection.topicId} with content ${selection.contentId}...`);
        
        // Get topic information
        const topic = await repos.quizzes.findById(selection.topicId);
        if (!topic) {
          console.warn(`  ❌ Topic with ID ${selection.topicId} not found, skipping`);
          continue;
        }
        console.log(`  ✅ Found topic: "${topic.title}"`);        // Get content from database
        console.log(`  🔍 Fetching content with ID ${selection.contentId}...`);
        const reference = await repos.references.findById(selection.contentId);
        if (!reference) {
          console.warn(`  ❌ No valid content found for topic ${selection.topicId}, skipping`);
          continue;
        }
        console.log(`  ✅ Found content: "${reference.title || 'Untitled'}"`);        // Decode content properly - handle different data types from D1
        console.log(`  🔄 Decoding content...`);
        console.log(`  🔍 Content type check:`, typeof reference.content, (reference.content as any)?.constructor?.name);
          // Check different size properties based on type
        let rawSize = 'unknown';
        if (reference.content instanceof Uint8Array) {
          rawSize = `${reference.content.length} bytes`;
        } else if (reference.content instanceof ArrayBuffer) {
          rawSize = `${reference.content.byteLength} bytes`;
        } else if (typeof reference.content === 'string') {
          rawSize = `${(reference.content as string).length} chars`;
        }
        console.log(`  📏 Raw content size:`, rawSize);
        
        let contentText: string;
        try {
          // D1 returns BLOB as Uint8Array
          if (reference.content instanceof Uint8Array) {
            console.log(`  🔧 Decoding as Uint8Array (${reference.content.length} bytes)`);
            contentText = new TextDecoder('utf-8').decode(reference.content);
          } else if (reference.content instanceof ArrayBuffer) {
            console.log(`  🔧 Decoding as ArrayBuffer (${reference.content.byteLength} bytes)`);
            contentText = new TextDecoder('utf-8').decode(new Uint8Array(reference.content));
          } else if (typeof reference.content === 'string') {
            console.log(`  🔧 Content is already a string (${(reference.content as string).length} chars)`);
            contentText = reference.content as string;
          } else {
            // Last resort - convert to string
            console.warn(`  ⚠️ Unexpected content type for reference ${selection.contentId}:`, typeof reference.content);
            console.warn(`  ⚠️ Constructor:`, (reference.content as any)?.constructor?.name);
            console.warn(`  ⚠️ Raw content sample:`, String(reference.content).substring(0, 100));
            contentText = String(reference.content);
          }
        } catch (error) {
          console.error(`  ❌ Error decoding content for reference ${selection.contentId}:`, error);
          contentText = `[Error decoding content for reference ${selection.contentId}]`;
        }
        
        console.log(`  ✅ Content decoded successfully (${contentText.length} characters)`);
        
        // Check for suspicious patterns that might indicate encoding issues
        const nullCount = (contentText.match(/\0/g) || []).length;
        const repeatedChars = contentText.length - new Set(contentText).size;
        console.log(`  🔍 Quality check: ${nullCount} null chars, ${repeatedChars} repeated chars`);
        
        console.log(`  📄 First 200 chars:`, contentText.substring(0, 200));
        console.log(`  📄 Last 200 chars:`, contentText.substring(contentText.length - 200));

        // Prepare content for AI
        const contentForAI = `[Content ID ${selection.contentId}]: ${contentText}`;

        // Generate quiz questions using AI
        console.log(`  🤖 Generating questions using AI...`);
        const questionsResponse = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: `
            Generate multiple-choice quiz questions for the topic "${topic.title}" in the group "${group.name}".
            
            Base the questions on the following content:
            ${contentForAI}
            
            Requirements:
            1. Generate 5-10 questions based on the provided content
            2. Each question should have exactly 3 options (A, B, C)
            3. Only one option should be correct
            4. Include a brief explanation for the correct answer
            5. Questions should be factual and directly based on the provided content
            6. Avoid questions that can't be answered from the given content
            
            Return as JSON array with this structure:
            [
              {
                "question": "string",
                "answerOptions": {
                  "A": "string",
                  "B": "string", 
                  "C": "string"
                },
                "correctAnswer": "A|B|C",
                "explanation": "string"
              }
            ]
          `,
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
                  explanation: { type: Type.STRING },
                },
                propertyOrdering: ["question", "answerOptions", "correctAnswer", "explanation"],
              },
            },
          },
        });

        const questionsText = questionsResponse.text;
        if (!questionsText) {
          console.warn(`  ❌ No questions generated for topic ${topic.title}, skipping`);
          continue;
        }

        const generatedQuestions = JSON.parse(questionsText);
        console.log(`  ✅ AI generated ${generatedQuestions.length} questions`);
        
        const savedQuestions: Array<{
          questionId: number,
          question: string,
          answerOptions: { A: string, B: string, C: string },
          correctAnswer: string,
          explanation: string
        }> = [];

        // Save each question to database
        console.log(`  💾 Saving questions to database...`);
        for (let i = 0; i < generatedQuestions.length; i++) {
          const q = generatedQuestions[i];
          console.log(`    💾 Saving question ${i + 1}/${generatedQuestions.length}...`);
          
          const savedQuestion = await repos.questions.create({
            quiz_id: topic.id,
            question_json: {
              question: q.question,
              answerOptions: q.answerOptions,
              correctAnswer: q.correctAnswer,
            },
            explanation: q.explanation || "",
          });          // Link question to content reference
          await repos.referenceQuestions.create({
            question_id: savedQuestion.id,
            reference_id: selection.contentId,
            paragraph: contentText.substring(0, 500) || "",
          });

          savedQuestions.push({
            questionId: savedQuestion.id,
            question: q.question,
            answerOptions: q.answerOptions,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ""
          });
        }
        console.log(`  ✅ Saved ${savedQuestions.length} questions for topic "${topic.title}"`);

        if (savedQuestions.length > 0) {
          processedTopics.push({
            topicId: topic.id,
            topicName: topic.title,
            questions: savedQuestions
          });
        }
      }

      if (processedTopics.length > 0) {
        console.log(`✅ Completed group "${group.name}" with ${processedTopics.length} topics`);
        processedGroups.push({
          groupId: group.id,
          groupName: group.name,
          topics: processedTopics
        });
      }
    }    const totalQuestions = processedGroups.reduce((total, group) => 
      total + group.topics.reduce((topicTotal, topic) => 
        topicTotal + topic.questions.length, 0), 0);
        
    console.log(`\n🎉 Question generation completed!`);
    console.log(`📊 Summary: ${processedGroups.length} groups, ${totalQuestions} total questions`);    // Collect all questions from all groups/topics into a flat array
    const allQuestions: any[] = [];

    for (const group of processedGroups) {
      for (const topic of group.topics) {
        for (const question of topic.questions) {
          // Fetch the full question record from database to match the format of findByQuizId
          const fullQuestion = await repos.questions.findById(question.questionId);
          if (fullQuestion) {
            allQuestions.push(fullQuestion);
          }
        }
      }
    }

    // Shuffle and select 10 random questions
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffledQuestions.slice(0, 10);

    console.log(`🎲 Selected ${selectedQuestions.length} random questions from ${totalQuestions} total questions`);

    // Return in the same format as /api/protected/quizzes/:id/questions
    return c.json(selectedQuestions);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error generating questions:", errorMessage);
    return c.json({ error: "Failed to generate questions", details: errorMessage }, 500);
  }
});

export default quizRouter;