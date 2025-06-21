import { BaseRepository } from "./base-repository";
import type { Question, NewQuestion } from "./types";

export class QuestionRepository extends BaseRepository {
  /**
   * Create a new question
   */
  async create(questionData: NewQuestion): Promise<Question> {
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
}
