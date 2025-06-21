import { BaseRepository } from "./base-repository";
import type { Reference, NewReference } from "./types";

export class ReferenceRepository extends BaseRepository {
  /**
   * Create a new reference
   */
  async create(referenceData: NewReference): Promise<Reference> {
    const query = `
      INSERT INTO reference (quiz_id, title, content)
      VALUES (?, ?, ?)
    `;
    
    const id = await this.insert(query, [
      referenceData.quiz_id,
      referenceData.title || null,
      referenceData.content
    ]);
    
    return this.findById(id) as Promise<Reference>;
  }

  /**
   * Find reference by ID
   */
  async findById(id: number): Promise<Reference | null> {
    const query = "SELECT * FROM reference WHERE id = ?";
    return this.findOne<Reference>(query, [id]);
  }

  /**
   * Get all references for a quiz
   */
  async findByQuizId(quizId: number): Promise<Reference[]> {
    const query = "SELECT * FROM reference WHERE quiz_id = ? ORDER BY created_at ASC";
    return this.findMany<Reference>(query, [quizId]);
  }

  /**
   * Get all references
   */
  async findAll(): Promise<Reference[]> {
    const query = "SELECT * FROM reference ORDER BY created_at DESC";
    return this.findMany<Reference>(query);
  }

  /**
   * Search references by title
   */
  async findByTitle(title: string): Promise<Reference[]> {
    const query = "SELECT * FROM reference WHERE title LIKE ? ORDER BY created_at DESC";
    return this.findMany<Reference>(query, [`%${title}%`]);
  }

  /**
   * Update reference
   */
  async updateById(id: number, updates: Partial<NewReference>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.quiz_id !== undefined) {
      fields.push("quiz_id = ?");
      values.push(updates.quiz_id);
    }
    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }
    if (updates.content !== undefined) {
      fields.push("content = ?");
      values.push(updates.content);
    }
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE reference SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    
    const affected = await this.update(query, values);
    return affected > 0;
  }

  /**
   * Delete reference by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const query = "DELETE FROM reference WHERE id = ?";
    const affected = await this.delete(query, [id]);
    return affected > 0;
  }

  /**
   * Delete all references for a quiz
   */
  async deleteByQuizId(quizId: number): Promise<number> {
    const query = "DELETE FROM reference WHERE quiz_id = ?";
    return await this.delete(query, [quizId]);
  }

  /**
   * Count references for a quiz
   */
  async countByQuizId(quizId: number): Promise<number> {
    const result = await this.findOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM reference WHERE quiz_id = ?",
      [quizId]
    );
    return result?.count || 0;
  }
}
