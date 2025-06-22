import { BaseRepository } from "./base-repository";
import type { Quality } from "../worker/sm2";

export interface UserQuestionPerformance {
  id: number;
  user_id: number;
  question_id: number;
  quality: Quality;
  review_date: string;
}

export interface NewUserQuestionPerformance {
  user_id: number;
  question_id: number;
  quality: Quality;
}

export class UserQuestionPerformanceRepository extends BaseRepository {
  /**
   * Create a new performance record
   */
  async create(performanceData: NewUserQuestionPerformance): Promise<UserQuestionPerformance> {
    const query = `
      INSERT INTO user_question_performance (user_id, question_id, quality)
      VALUES (?, ?, ?)
    `;
    
    const id = await this.insert(query, [
      performanceData.user_id,
      performanceData.question_id,
      performanceData.quality
    ]);
    
    return this.findById(id) as Promise<UserQuestionPerformance>;
  }

  /**
   * Find performance record by ID
   */
  async findById(id: number): Promise<UserQuestionPerformance | null> {
    return await this.findOne<UserQuestionPerformance>(
      "SELECT * FROM user_question_performance WHERE id = ?",
      [id]
    );
  }

  /**
   * Get all performance records for a user
   */
  async findByUserId(userId: number): Promise<UserQuestionPerformance[]> {
    return await this.findMany<UserQuestionPerformance>(
      "SELECT * FROM user_question_performance WHERE user_id = ? ORDER BY review_date DESC",
      [userId]
    );
  }

  /**
   * Get all performance records for a question
   */
  async findByQuestionId(questionId: number): Promise<UserQuestionPerformance[]> {
    return await this.findMany<UserQuestionPerformance>(
      "SELECT * FROM user_question_performance WHERE question_id = ? ORDER BY review_date DESC",
      [questionId]
    );
  }

  /**
   * Get performance records for a specific user and question
   */
  async findByUserAndQuestion(userId: number, questionId: number): Promise<UserQuestionPerformance[]> {
    return await this.findMany<UserQuestionPerformance>(
      "SELECT * FROM user_question_performance WHERE user_id = ? AND question_id = ? ORDER BY review_date DESC",
      [userId, questionId]
    );
  }

  /**
   * Get the latest performance record for a user and question
   */
  async findLatestByUserAndQuestion(userId: number, questionId: number): Promise<UserQuestionPerformance | null> {
    return await this.findOne<UserQuestionPerformance>(
      "SELECT * FROM user_question_performance WHERE user_id = ? AND question_id = ? ORDER BY review_date DESC LIMIT 1",
      [userId, questionId]
    );
  }

  /**
   * Get performance statistics for a user
   */
  async getUserStats(userId: number): Promise<{
    total_reviews: number;
    hard_count: number;
    ok_count: number;
    easy_count: number;
    success_rate: number;
  }> {
    const result = await this.findOne<{
      total_reviews: number;
      hard_count: number;
      ok_count: number;
      easy_count: number;
    }>(`
      SELECT 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN quality = 1 THEN 1 ELSE 0 END) as hard_count,
        SUM(CASE WHEN quality = 3 THEN 1 ELSE 0 END) as ok_count,
        SUM(CASE WHEN quality = 5 THEN 1 ELSE 0 END) as easy_count
      FROM user_question_performance 
      WHERE user_id = ?
    `, [userId]);

    if (!result) {
      return {
        total_reviews: 0,
        hard_count: 0,
        ok_count: 0,
        easy_count: 0,
        success_rate: 0
      };
    }

    const success_rate = result.total_reviews > 0 
      ? ((result.ok_count + result.easy_count) / result.total_reviews) * 100 
      : 0;

    return {
      ...result,
      success_rate: Math.round(success_rate * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Get performance statistics for a specific question
   */
  async getQuestionStats(questionId: number): Promise<{
    total_reviews: number;
    hard_count: number;
    ok_count: number;
    easy_count: number;
    success_rate: number;
  }> {
    const result = await this.findOne<{
      total_reviews: number;
      hard_count: number;
      ok_count: number;
      easy_count: number;
    }>(`
      SELECT 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN quality = 1 THEN 1 ELSE 0 END) as hard_count,
        SUM(CASE WHEN quality = 3 THEN 1 ELSE 0 END) as ok_count,
        SUM(CASE WHEN quality = 5 THEN 1 ELSE 0 END) as easy_count
      FROM user_question_performance 
      WHERE question_id = ?
    `, [questionId]);

    if (!result) {
      return {
        total_reviews: 0,
        hard_count: 0,
        ok_count: 0,
        easy_count: 0,
        success_rate: 0
      };
    }

    const success_rate = result.total_reviews > 0 
      ? ((result.ok_count + result.easy_count) / result.total_reviews) * 100 
      : 0;

    return {
      ...result,
      success_rate: Math.round(success_rate * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Delete performance records for a user
   */
  async deleteByUserId(userId: number): Promise<number> {
    const query = "DELETE FROM user_question_performance WHERE user_id = ?";
    return await this.delete(query, [userId]);
  }

  /**
   * Delete performance records for a question
   */
  async deleteByQuestionId(questionId: number): Promise<number> {
    const query = "DELETE FROM user_question_performance WHERE question_id = ?";
    return await this.delete(query, [questionId]);
  }

  /**
   * Get recent performance records (last N days)
   */
  async getRecentPerformance(userId: number, days: number = 7): Promise<UserQuestionPerformance[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return await this.findMany<UserQuestionPerformance>(
      "SELECT * FROM user_question_performance WHERE user_id = ? AND review_date >= ? ORDER BY review_date DESC",
      [userId, cutoffDate.toISOString()]
    );
  }

  /**
   * Get performance statistics for a specific module/quiz
   */
  async getModuleStats(userId: number, quizId: number): Promise<{
    total_reviews: number;
    hard_count: number;
    ok_count: number;
    easy_count: number;
    success_rate: number;
    questions_reviewed: number;
    total_questions: number;
  }> {
    const result = await this.findOne<{
      total_reviews: number;
      hard_count: number;
      ok_count: number;
      easy_count: number;
      questions_reviewed: number;
    }>(`
      SELECT 
        COUNT(*) as total_reviews,
        SUM(CASE WHEN quality = 1 THEN 1 ELSE 0 END) as hard_count,
        SUM(CASE WHEN quality = 3 THEN 1 ELSE 0 END) as ok_count,
        SUM(CASE WHEN quality = 5 THEN 1 ELSE 0 END) as easy_count,
        COUNT(DISTINCT uqp.question_id) as questions_reviewed
      FROM user_question_performance uqp
      JOIN question q ON uqp.question_id = q.id
      WHERE uqp.user_id = ? AND q.quiz_id = ?
    `, [userId, quizId]);

    // Get total questions in the quiz
    const totalQuestionsResult = await this.findOne<{ total_questions: number }>(
      "SELECT COUNT(*) as total_questions FROM question WHERE quiz_id = ?",
      [quizId]
    );

    const total_questions = totalQuestionsResult?.total_questions || 0;

    if (!result) {
      return {
        total_reviews: 0,
        hard_count: 0,
        ok_count: 0,
        easy_count: 0,
        success_rate: 0,
        questions_reviewed: 0,
        total_questions
      };
    }

    const success_rate = result.total_reviews > 0 
      ? ((result.ok_count + result.easy_count) / result.total_reviews) * 100 
      : 0;

    return {
      ...result,
      success_rate: Math.round(success_rate * 100) / 100, // Round to 2 decimal places
      total_questions
    };
  }
} 