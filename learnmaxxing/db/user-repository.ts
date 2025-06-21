import { BaseRepository } from "./base-repository";
import type { User, NewUser } from "./types";

export class UserRepository extends BaseRepository {
  /**
   * Create a new user
   */
  async create(userData: NewUser): Promise<User> {
    const query = `
      INSERT INTO user (username, password)
      VALUES (?, ?)
    `;
    
    const id = await this.insert(query, [
      userData.username,
      userData.password || null
    ]);
    
    return this.findById(id) as Promise<User>;
  }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    const query = "SELECT * FROM user WHERE id = ?";
    return this.findOne<User>(query, [id]);
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const query = "SELECT * FROM user WHERE username = ?";
    return this.findOne<User>(query, [username]);
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    const query = "SELECT * FROM user ORDER BY created_at DESC";
    return this.findMany<User>(query);
  }

  /**
   * Update user
   */
  async updateById(id: number, updates: Partial<NewUser>): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.username !== undefined) {
      fields.push("username = ?");
      values.push(updates.username);
    }
    if (updates.password !== undefined) {
      fields.push("password = ?");
      values.push(updates.password);
    }
    
    if (fields.length === 0) return false;
    
    const query = `UPDATE user SET ${fields.join(", ")} WHERE id = ?`;
    values.push(id);
    
    const affected = await this.update(query, values);
    return affected > 0;
  }

  /**
   * Delete user by ID
   */
  async deleteById(id: number): Promise<boolean> {
    const query = "DELETE FROM user WHERE id = ?";
    const affected = await this.delete(query, [id]);
    return affected > 0;
  }
}
