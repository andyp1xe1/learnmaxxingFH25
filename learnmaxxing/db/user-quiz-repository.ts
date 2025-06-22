import { BaseRepository } from "./base-repository";
import type { UserQuiz, NewUserQuiz } from "./types";

export class UserQuizRepository extends BaseRepository {
  /**
   * Create a new user-quiz relationship
   */
  async create(userQuizData: NewUserQuiz): Promise<UserQuiz> {
    const query = `
      INSERT INTO user_quiz (user_id, quiz_id, started_at, completed_at, percentage_completed)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const id = await this.insert(query, [
      userQuizData.user_id,
      userQuizData.quiz_id,
      userQuizData.started_at || null,
      userQuizData.completed_at || null,
      userQuizData.percentage_completed || 0.0
    ]);
    
    return this.findById(id) as Promise<UserQuiz>;
  }

  /**
   * Find user-quiz by ID
   */
  async findById(id: number): Promise<UserQuiz | null> {
    const query = "SELECT * FROM user_quiz WHERE id = ?";
    return this.findOne<UserQuiz>(query, [id]);
  }

  /**
   * Find user-quiz by user and quiz ID
   */
  async findByUserAndQuiz(userId: number, quizId: number): Promise<UserQuiz | null> {
    const query = "SELECT * FROM user_quiz WHERE user_id = ? AND quiz_id = ?";
    return this.findOne<UserQuiz>(query, [userId, quizId]);
  }

  /**
   * Get all quizzes for a user
   */
  async findByUserId(userId: number): Promise<UserQuiz[]> {
    const query = "SELECT * FROM user_quiz WHERE user_id = ? ORDER BY started_at DESC";
    return this.findMany<UserQuiz>(query, [userId]);
  }

  /**
   * Get all users for a quiz
   */
  async findByQuizId(quizId: number): Promise<UserQuiz[]> {
    const query = "SELECT * FROM user_quiz WHERE quiz_id = ? ORDER BY started_at DESC";
    return this.findMany<UserQuiz>(query, [quizId]);
  }

  /**
   * Start a quiz for a user
   */
  async startQuiz(userId: number, quizId: number): Promise<UserQuiz> {
    const existing = await this.findByUserAndQuiz(userId, quizId);
    
    if (existing) {
      // Update started_at if not already started
      if (!existing.started_at) {
        await this.update(
          "UPDATE user_quiz SET started_at = CURRENT_TIMESTAMP WHERE id = ?",
          [existing.id]
        );
        return this.findById(existing.id) as Promise<UserQuiz>;
      }
      return existing;
    }
    
    // Create new user-quiz relationship
    return this.create({
      user_id: userId,
      quiz_id: quizId,
      started_at: new Date().toISOString(),
      percentage_completed: 0.0
    });
  }

  /**
   * Complete a quiz for a user
   */
  async completeQuiz(userId: number, quizId: number): Promise<boolean> {
    const query = `
      UPDATE user_quiz 
      SET completed_at = CURRENT_TIMESTAMP, percentage_completed = 100.0
      WHERE user_id = ? AND quiz_id = ? AND completed_at IS NULL
    `;
    
    const affected = await this.update(query, [userId, quizId]);
    return affected > 0;
  }

  /**
   * Update percentage completed for a user and quiz
   */
  async updatePercentage(userId: number, quizId: number, percentage: number): Promise<boolean> {
    // Ensure percentage is between 0 and 100
    const clampedPercentage = Math.max(0, Math.min(100, percentage));
    
    const existing = await this.findByUserAndQuiz(userId, quizId);
    
    if (!existing) {
      // Create new user-quiz relationship if it doesn't exist
      await this.create({
        user_id: userId,
        quiz_id: quizId,
        percentage_completed: clampedPercentage
      });
      return true;
    }
    
    const query = `
      UPDATE user_quiz 
      SET percentage_completed = ?
      WHERE user_id = ? AND quiz_id = ?
    `;
    
    const affected = await this.update(query, [clampedPercentage, userId, quizId]);
    return affected > 0;
  }

  /**
   * Get percentage completed for a user and quiz
   */
  async getPercentage(userId: number, quizId: number): Promise<number> {
    const userQuiz = await this.findByUserAndQuiz(userId, quizId);
    return userQuiz?.percentage_completed || 0.0;
  }

  /**
   * Get completed quizzes for a user
   */
  async findCompletedByUserId(userId: number): Promise<UserQuiz[]> {
    const query = `
      SELECT * FROM user_quiz 
      WHERE user_id = ? AND completed_at IS NOT NULL 
      ORDER BY completed_at DESC
    `;
    return this.findMany<UserQuiz>(query, [userId]);
  }

  /**
   * Get in-progress quizzes for a user
   */
  async findInProgressByUserId(userId: number): Promise<UserQuiz[]> {
    const query = `
      SELECT * FROM user_quiz 
      WHERE user_id = ? AND started_at IS NOT NULL AND completed_at IS NULL 
      ORDER BY started_at DESC
    `;
    return this.findMany<UserQuiz>(query, [userId]);
  }

  /**
   * Delete user-quiz relationship
   */
  async deleteById(id: number): Promise<boolean> {
    const query = "DELETE FROM user_quiz WHERE id = ?";
    const affected = await this.delete(query, [id]);
    return affected > 0;
  }
}
