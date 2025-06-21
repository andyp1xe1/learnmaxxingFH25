import { BaseRepository } from "./base-repository";
import type { Group, NewGroup } from "./types";

export class GroupRepository extends BaseRepository {
  /**
   * Create a new group
   */  async create(groupData: NewGroup): Promise<Group> {
    const query = `
      INSERT INTO topic_group (name)
      VALUES (?)
    `;
    
    const id = await this.insert(query, [
      groupData.name
    ]);
    
    return this.findById(id) as Promise<Group>;
  }

  /**
   * Find group by ID
   */  async findById(id: number): Promise<Group | null> {
    const query = "SELECT * FROM topic_group WHERE id = ?";
    return this.findOne<Group>(query, [id]);
  }

  /**
   * Find group by name
   */
  async findByName(name: string): Promise<Group | null> {
    const query = "SELECT * FROM topic_group WHERE name = ? LIMIT 1";
    const results = await this.findMany<Group>(query, [name]);
    return results[0] || null;
  }

  /**
   * Get all groups
   */
  async findAll(): Promise<Group[]> {
    const query = "SELECT * FROM topic_group ORDER BY created_at DESC";
    return this.findMany<Group>(query);
  }

  /**
   * Update group
   */
  async updateById(id: number, updates: Partial<NewGroup>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
      if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    
    if (fields.length === 0) return false;
      const query = `UPDATE topic_group SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    
    const affected = await this.update(query, values);
    return affected > 0;
  }

  /**
   * Delete group by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const query = "DELETE FROM topic_group WHERE id = ?";
    const affected = await this.delete(query, [id]);
    return affected > 0;
  }

  /**
   * Get all quizzes for a group
   */
  async getQuizzes(groupId: number): Promise<any[]> {
    const query = "SELECT * FROM quiz WHERE group_id = ? ORDER BY created_at DESC";
    return this.findMany(query, [groupId]);
  }
}