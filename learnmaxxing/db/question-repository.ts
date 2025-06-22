import { BaseRepository } from "./base-repository";
import type { Question, NewQuestion } from "./types";
import type { SM2Question, SM2Result, Quality } from "../worker/sm2";

export class QuestionRepository extends BaseRepository {
  /**
   * Create a new question
   */
  async create(questionData: NewQuestion): Promise<Question> {
    console.log("Entered repo create method with data:", questionData);
    const query = `
      INSERT INTO question (quiz_id, question_json, explanation)
      VALUES (?, ?, ?)
    `;
    
    const id = await this.insert(query, [
      questionData.quiz_id,
      JSON.stringify(questionData.question_json),
      questionData.explanation || null
    ]);
    
    return this.findById(id) as Promise<Question>;
  }

  /**
   * Find question by ID
   */
  async findById(id: number): Promise<Question | null> {
    const question = await this.findOne<any>("SELECT * FROM question WHERE id = ?", [id]);
    
    if (!question) return null;
    
    // Parse the JSON field
    return {
      ...question,
      question_json: JSON.parse(question.question_json)
    } as Question;
  }

  /**
   * Get all questions for a quiz
   */
  async findByQuizId(quizId: number): Promise<Question[]> {
    const questions = await this.findMany<any>(
      "SELECT * FROM question WHERE quiz_id = ? ORDER BY created_at ASC",
      [quizId]
    );
    
    // Parse the JSON fields
    return questions.map(q => ({
      ...q,
      question_json: JSON.parse(q.question_json)
    })) as Question[];
  }

  /**
   * Get all questions
   */
  async findAll(): Promise<Question[]> {
    const questions = await this.findMany<any>("SELECT * FROM question ORDER BY created_at DESC");
    
    // Parse the JSON fields
    return questions.map(q => ({
      ...q,
      question_json: JSON.parse(q.question_json)
    })) as Question[];
  }

  /**
   * Update question
   */
  async updateById(id: number, updates: Partial<NewQuestion>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.quiz_id !== undefined) {
      fields.push("quiz_id = ?");
      values.push(updates.quiz_id);
    }
    if (updates.question_json !== undefined) {
      fields.push("question_json = ?");
      values.push(JSON.stringify(updates.question_json));
    }
    if (updates.explanation !== undefined) {
      fields.push("explanation = ?");
      values.push(updates.explanation);
    }
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE question SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    
    const affected = await this.update(query, values);
    return affected > 0;
  }

  /**
   * Delete question by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const query = "DELETE FROM question WHERE id = ?";
    const affected = await this.delete(query, [id]);
    return affected > 0;
  }

  /**
   * Delete all questions for a quiz
   */
  async deleteByQuizId(quizId: number): Promise<number> {
    const query = "DELETE FROM question WHERE quiz_id = ?";
    return await this.delete(query, [quizId]);
  }

  /**
   * Count questions for a quiz
   */
  async countByQuizId(quizId: number): Promise<number> {
    const result = await this.findOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM question WHERE quiz_id = ?",
      [quizId]
    );
    return result?.count || 0;
  }

  // SM2 Spaced Repetition Methods

  /**
   * Get question with SM2 data
   */
  async findByIdWithSM2(id: number): Promise<SM2Question | null> {
    const question = await this.findOne<any>(
      "SELECT id, ef, interval, repetition_count, next_review_date FROM question WHERE id = ?",
      [id]
    );
    
    if (!question) return null;
    
    return {
      id: question.id,
      ef: question.ef || 2.5,
      interval: question.interval || 0,
      repetition_count: question.repetition_count || 0,
      next_review_date: question.next_review_date
    };
  }

  /**
   * Update question SM2 parameters
   */
  async updateSM2Params(result: SM2Result): Promise<boolean> {
    const query = `
      UPDATE question 
      SET ef = ?, interval = ?, repetition_count = ?, next_review_date = ?
      WHERE id = ?
    `;
    
    const affected = await this.update(query, [
      result.ef,
      result.interval,
      result.repetition_count,
      result.next_review_date,
      result.question_id
    ]);
    
    return affected > 0;
  }

  /**
   * Get questions due for review for a specific user
   */
  async getQuestionsDueForReview(userId: number): Promise<SM2Question[]> {
    const now = new Date().toISOString();
    
    const questions = await this.findMany<any>(`
      SELECT DISTINCT q.id, q.ef, q.interval, q.repetition_count, q.next_review_date
      FROM question q
      LEFT JOIN user_question_performance uqp ON q.id = uqp.question_id AND uqp.user_id = ?
      WHERE q.next_review_date IS NULL OR q.next_review_date <= ?
      ORDER BY q.next_review_date ASC NULLS FIRST
    `, [userId, now]);
    
    return questions.map(q => ({
      id: q.id,
      ef: q.ef || 2.5,
      interval: q.interval || 0,
      repetition_count: q.repetition_count || 0,
      next_review_date: q.next_review_date
    }));
  }

  /**
   * Get overdue questions for a specific user
   */
  async getOverdueQuestions(userId: number): Promise<SM2Question[]> {
    const now = new Date().toISOString();
    
    const questions = await this.findMany<any>(`
      SELECT DISTINCT q.id, q.ef, q.interval, q.repetition_count, q.next_review_date
      FROM question q
      LEFT JOIN user_question_performance uqp ON q.id = uqp.question_id AND uqp.user_id = ?
      WHERE q.next_review_date IS NOT NULL AND q.next_review_date < ?
      ORDER BY q.next_review_date ASC
    `, [userId, now]);
    
    return questions.map(q => ({
      id: q.id,
      ef: q.ef || 2.5,
      interval: q.interval || 0,
      repetition_count: q.repetition_count || 0,
      next_review_date: q.next_review_date
    }));
  }

  /**
   * Get questions due today for a specific user
   */
  async getQuestionsDueToday(userId: number): Promise<SM2Question[]> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    const questions = await this.findMany<any>(`
      SELECT DISTINCT q.id, q.ef, q.interval, q.repetition_count, q.next_review_date
      FROM question q
      LEFT JOIN user_question_performance uqp ON q.id = uqp.question_id AND uqp.user_id = ?
      WHERE q.next_review_date IS NULL 
         OR (q.next_review_date >= ? AND q.next_review_date < ?)
      ORDER BY q.next_review_date ASC NULLS FIRST
    `, [userId, todayStart, tomorrowStart]);
    
    return questions.map(q => ({
      id: q.id,
      ef: q.ef || 2.5,
      interval: q.interval || 0,
      repetition_count: q.repetition_count || 0,
      next_review_date: q.next_review_date
    }));
  }

  /**
   * Get questions due for review for a specific user and quiz
   */
  async getQuestionsDueForReviewByQuiz(userId: number, quizId: number): Promise<SM2Question[]> {
    const now = new Date().toISOString();
    
    const questions = await this.findMany<any>(`
      SELECT DISTINCT q.id, q.ef, q.interval, q.repetition_count, q.next_review_date
      FROM question q
      LEFT JOIN user_question_performance uqp ON q.id = uqp.question_id AND uqp.user_id = ?
      WHERE q.quiz_id = ? AND (q.next_review_date IS NULL OR q.next_review_date <= ?)
      ORDER BY q.next_review_date ASC NULLS FIRST
    `, [userId, quizId, now]);
    
    return questions.map(q => ({
      id: q.id,
      ef: q.ef || 2.5,
      interval: q.interval || 0,
      repetition_count: q.repetition_count || 0,
      next_review_date: q.next_review_date
    }));
  }

  /**
   * Get overdue questions for a specific user and quiz
   */
  async getOverdueQuestionsByQuiz(userId: number, quizId: number): Promise<SM2Question[]> {
    const now = new Date().toISOString();
    
    const questions = await this.findMany<any>(`
      SELECT DISTINCT q.id, q.ef, q.interval, q.repetition_count, q.next_review_date
      FROM question q
      LEFT JOIN user_question_performance uqp ON q.id = uqp.question_id AND uqp.user_id = ?
      WHERE q.quiz_id = ? AND q.next_review_date IS NOT NULL AND q.next_review_date < ?
      ORDER BY q.next_review_date ASC
    `, [userId, quizId, now]);
    
    return questions.map(q => ({
      id: q.id,
      ef: q.ef || 2.5,
      interval: q.interval || 0,
      repetition_count: q.repetition_count || 0,
      next_review_date: q.next_review_date
    }));
  }

  /**
   * Get questions due today for a specific user and quiz
   */
  async getQuestionsDueTodayByQuiz(userId: number, quizId: number): Promise<SM2Question[]> {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
    
    const questions = await this.findMany<any>(`
      SELECT DISTINCT q.id, q.ef, q.interval, q.repetition_count, q.next_review_date
      FROM question q
      LEFT JOIN user_question_performance uqp ON q.id = uqp.question_id AND uqp.user_id = ?
      WHERE q.quiz_id = ? AND (q.next_review_date IS NULL 
         OR (q.next_review_date >= ? AND q.next_review_date < ?))
      ORDER BY q.next_review_date ASC NULLS FIRST
    `, [userId, quizId, todayStart, tomorrowStart]);
    
    return questions.map(q => ({
      id: q.id,
      ef: q.ef || 2.5,
      interval: q.interval || 0,
      repetition_count: q.repetition_count || 0,
      next_review_date: q.next_review_date
    }));
  }
}
