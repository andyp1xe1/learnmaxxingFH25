import { BaseRepository } from "./base-repository";
import type { Quiz, NewQuiz } from "./types";

export class QuizRepository extends BaseRepository {
  /**
   * Create a new quiz
   */
  async create(quizData: NewQuiz): Promise<Quiz> {
    const query = `
      INSERT INTO quiz (title, description)
      VALUES (?, ?)
    `;
    
    const id = await this.insert(query, [
      quizData.title,
      quizData.description || null
    ]);
    
    return this.findById(id) as Promise<Quiz>;
  }

  /**
   * Find quiz by ID
   */
  async findById(id: number): Promise<Quiz | null> {
    const query = "SELECT * FROM quiz WHERE id = ?";
    return this.findOne<Quiz>(query, [id]);
  }

  /**
   * Get all quizzes
   */
  async findAll(): Promise<Quiz[]> {
    const query = "SELECT * FROM quiz ORDER BY created_at DESC";
    return this.findMany<Quiz>(query);
  }

  /**
   * Search quizzes by title
   */
  async findByTitle(title: string): Promise<Quiz[]> {
    const query = "SELECT * FROM quiz WHERE title LIKE ? ORDER BY created_at DESC";
    return this.findMany<Quiz>(query, [`%${title}%`]);
  }

  /**
   * Update quiz
   */
  async updateById(id: number, updates: Partial<NewQuiz>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) {
      fields.push("title = ?");
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE quiz SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    
    const affected = await this.update(query, values);
    return affected > 0;
  }

  /**
   * Delete quiz by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const query = "DELETE FROM quiz WHERE id = ?";
    const affected = await this.delete(query, [id]);
    return affected > 0;
  }
}
