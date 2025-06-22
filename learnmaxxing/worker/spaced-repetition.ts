import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";
import { createRepositories } from "../db";
import { calculateSM2, difficultyToQuality, type Quality } from "./sm2";

export type SpacedRepetitionBindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: SpacedRepetitionBindings }>();

/**
 * Update question performance and calculate next review date
 * POST /api/spaced-repetition/update
 */
app.post('/update', async (c) => {
  const repos = createRepositories(c.env.DB);
  const body = await c.req.json();
  
  // Validate request body
  if (!body.user_id || !body.question_id || !body.difficulty) {
    return c.json({ 
      error: "Missing required fields: user_id, question_id, difficulty" 
    }, 400);
  }

  const { user_id, question_id, difficulty } = body;

  try {
    // Get current question SM2 data
    const question = await repos.questions.findByIdWithSM2(question_id);
    if (!question) {
      return c.json({ error: "Question not found" }, 404);
    }

    // Convert difficulty to quality
    const quality = difficultyToQuality(difficulty);

    // Calculate new SM2 parameters
    const sm2Result = calculateSM2(question, quality);

    // Update question SM2 parameters
    const updateSuccess = await repos.questions.updateSM2Params(sm2Result);
    if (!updateSuccess) {
      return c.json({ error: "Failed to update question parameters" }, 500);
    }

    // Record performance
    const performance = await repos.userQuestionPerformance.create({
      user_id,
      question_id,
      quality
    });

    return c.json({
      message: "Performance updated successfully",
      data: {
        question_id,
        new_interval: sm2Result.interval,
        next_review_date: sm2Result.next_review_date,
        performance_id: performance.id
      }
    });

  } catch (error) {
    console.error('Error updating performance:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Get questions due for review
 * GET /api/spaced-repetition/next-reviews?user_id=123
 */
app.get('/next-reviews', async (c) => {
  const repos = createRepositories(c.env.DB);
  const userId = parseInt(c.req.query('user_id') || '0');
  
  if (!userId || userId <= 0) {
    return c.json({ error: "Valid user_id is required" }, 400);
  }

  try {
    const dueQuestions = await repos.questions.getQuestionsDueForReview(userId);
    
    return c.json({
      data: {
        due_questions: dueQuestions,
        count: dueQuestions.length
      }
    });

  } catch (error) {
    console.error('Error getting due questions:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Get overdue questions
 * GET /api/spaced-repetition/overdue?user_id=123
 */
app.get('/overdue', async (c) => {
  const repos = createRepositories(c.env.DB);
  const userId = parseInt(c.req.query('user_id') || '0');
  
  if (!userId || userId <= 0) {
    return c.json({ error: "Valid user_id is required" }, 400);
  }

  try {
    const overdueQuestions = await repos.questions.getOverdueQuestions(userId);
    
    return c.json({
      data: {
        overdue_questions: overdueQuestions,
        count: overdueQuestions.length
      }
    });

  } catch (error) {
    console.error('Error getting overdue questions:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Get questions due today
 * GET /api/spaced-repetition/due-today?user_id=123
 */
app.get('/due-today', async (c) => {
  const repos = createRepositories(c.env.DB);
  const userId = parseInt(c.req.query('user_id') || '0');
  
  if (!userId || userId <= 0) {
    return c.json({ error: "Valid user_id is required" }, 400);
  }

  try {
    const todayQuestions = await repos.questions.getQuestionsDueToday(userId);
    
    return c.json({
      data: {
        today_questions: todayQuestions,
        count: todayQuestions.length
      }
    });

  } catch (error) {
    console.error('Error getting today\'s questions:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Get user statistics
 * GET /api/spaced-repetition/stats?user_id=123
 */
app.get('/stats', async (c) => {
  const repos = createRepositories(c.env.DB);
  const userId = parseInt(c.req.query('user_id') || '0');
  
  if (!userId || userId <= 0) {
    return c.json({ error: "Valid user_id is required" }, 400);
  }

  try {
    const userStats = await repos.userQuestionPerformance.getUserStats(userId);
    const dueQuestions = await repos.questions.getQuestionsDueForReview(userId);
    const overdueQuestions = await repos.questions.getOverdueQuestions(userId);
    
    return c.json({
      data: {
        user_stats: userStats,
        due_count: dueQuestions.length,
        overdue_count: overdueQuestions.length,
        total_due: dueQuestions.length + overdueQuestions.length
      }
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Get question statistics
 * GET /api/spaced-repetition/question-stats?question_id=123
 */
app.get('/question-stats', async (c) => {
  const repos = createRepositories(c.env.DB);
  const questionId = parseInt(c.req.query('question_id') || '0');
  
  if (!questionId || questionId <= 0) {
    return c.json({ error: "Valid question_id is required" }, 400);
  }

  try {
    const questionStats = await repos.userQuestionPerformance.getQuestionStats(questionId);
    const question = await repos.questions.findByIdWithSM2(questionId);
    
    return c.json({
      data: {
        question_stats: questionStats,
        sm2_data: question
      }
    });

  } catch (error) {
    console.error('Error getting question stats:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

/**
 * Batch update multiple question performances
 * POST /api/spaced-repetition/batch-update
 */
app.post('/batch-update', async (c) => {
  const repos = createRepositories(c.env.DB);
  const body = await c.req.json();
  
  if (!body.user_id || !body.performances || !Array.isArray(body.performances)) {
    return c.json({ 
      error: "Missing required fields: user_id, performances (array)" 
    }, 400);
  }

  const { user_id, performances } = body;

  try {
    const results: Array<{
      question_id: number;
      success: boolean;
      error?: string;
      new_interval?: number;
      next_review_date?: string;
    }> = [];
    
    for (const performance of performances) {
      if (!performance.question_id || !performance.difficulty) {
        results.push({
          question_id: performance.question_id,
          success: false,
          error: "Missing question_id or difficulty"
        });
        continue;
      }

      try {
        // Get current question SM2 data
        const question = await repos.questions.findByIdWithSM2(performance.question_id);
        if (!question) {
          results.push({
            question_id: performance.question_id,
            success: false,
            error: "Question not found"
          });
          continue;
        }

        // Convert difficulty to quality
        const quality = difficultyToQuality(performance.difficulty);

        // Calculate new SM2 parameters
        const sm2Result = calculateSM2(question, quality);

        // Update question SM2 parameters
        const updateSuccess = await repos.questions.updateSM2Params(sm2Result);
        if (!updateSuccess) {
          results.push({
            question_id: performance.question_id,
            success: false,
            error: "Failed to update question parameters"
          });
          continue;
        }

        // Record performance
        await repos.userQuestionPerformance.create({
          user_id,
          question_id: performance.question_id,
          quality
        });

        results.push({
          question_id: performance.question_id,
          success: true,
          new_interval: sm2Result.interval,
          next_review_date: sm2Result.next_review_date
        });

      } catch (error) {
        results.push({
          question_id: performance.question_id,
          success: false,
          error: "Processing error"
        });
      }
    }

    return c.json({
      message: "Batch update completed",
      data: {
        results,
        total: performances.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Error in batch update:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app; 