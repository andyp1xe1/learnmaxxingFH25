import { BaseRepository } from "./base-repository";
import type { ReferenceQuestion, NewReferenceQuestion } from "./types";

export class ReferenceQuestionRepository extends BaseRepository {
  /**
   * Create a new reference-question relationship
   */
  async create(referenceQuestionData: NewReferenceQuestion): Promise<ReferenceQuestion> {
    const query = `
      INSERT INTO reference_question (question_id, reference_id, paragraph)
      VALUES (?, ?, ?)
    `;
    
    const id = await this.insert(query, [
      referenceQuestionData.question_id,
      referenceQuestionData.reference_id,
      referenceQuestionData.paragraph
    ]);
    
    return this.findById(id) as Promise<ReferenceQuestion>;
  }

  /**
   * Find reference-question by ID
   */
  async findById(id: number): Promise<ReferenceQuestion | null> {
    const query = "SELECT * FROM reference_question WHERE id = ?";
    return this.findOne<ReferenceQuestion>(query, [id]);
  }

  /**
   * Get all reference-questions for a question
   */
  async findByQuestionId(questionId: number): Promise<ReferenceQuestion[]> {
    const query = "SELECT * FROM reference_question WHERE question_id = ?";
    return this.findMany<ReferenceQuestion>(query, [questionId]);
  }

  /**
   * Get all reference-questions for a reference
   */
  async findByReferenceId(referenceId: number): Promise<ReferenceQuestion[]> {
    const query = "SELECT * FROM reference_question WHERE reference_id = ?";
    return this.findMany<ReferenceQuestion>(query, [referenceId]);
  }

  /**
   * Get all reference-questions
   */
  async findAll(): Promise<ReferenceQuestion[]> {
    const query = "SELECT * FROM reference_question";
    return this.findMany<ReferenceQuestion>(query);
  }

  /**
   * Update reference-question
   */
  async updateById(id: number, updates: Partial<NewReferenceQuestion>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.question_id !== undefined) {
      fields.push("question_id = ?");
      values.push(updates.question_id);
    }
    if (updates.reference_id !== undefined) {
      fields.push("reference_id = ?");
      values.push(updates.reference_id);
    }
    if (updates.paragraph !== undefined) {
      fields.push("paragraph = ?");
      values.push(updates.paragraph);
    }
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE reference_question SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    
    const affected = await this.update(query, values);
    return affected > 0;
  }

  /**
   * Delete reference-question by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const query = "DELETE FROM reference_question WHERE id = ?";
    const affected = await this.delete(query, [id]);
    return affected > 0;
  }

  /**
   * Delete all reference-questions for a question
   */
  async deleteByQuestionId(questionId: number): Promise<number> {
    const query = "DELETE FROM reference_question WHERE question_id = ?";
    return await this.delete(query, [questionId]);
  }

  /**
   * Delete all reference-questions for a reference
   */
  async deleteByReferenceId(referenceId: number): Promise<number> {
    const query = "DELETE FROM reference_question WHERE reference_id = ?";
    return await this.delete(query, [referenceId]);
  }

  /**
   * Get references with their paragraphs for a specific question
   */
  async getReferencesForQuestion(questionId: number): Promise<Array<{
    reference_id: number;
    paragraph: string;
    reference_title?: string;
  }>> {
    const query = `
      SELECT 
        rq.reference_id,
        rq.paragraph,
        r.title as reference_title
      FROM reference_question rq
      LEFT JOIN reference r ON rq.reference_id = r.id
      WHERE rq.question_id = ?
    `;
    
    return this.findMany(query, [questionId]);
  }

  /**
   * Get questions with their paragraphs for a specific reference
   */
  async getQuestionsForReference(referenceId: number): Promise<Array<{
    question_id: number;
    paragraph: string;
  }>> {
    const query = `
      SELECT 
        rq.question_id,
        rq.paragraph
      FROM reference_question rq
      WHERE rq.reference_id = ?
    `;
    
    return this.findMany(query, [referenceId]);
  }
}
