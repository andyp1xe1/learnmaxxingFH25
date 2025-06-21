import type { D1Database } from "@cloudflare/workers-types";

export abstract class BaseRepository {
  protected db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Execute a SELECT query and return all results
   */
  protected async findMany<T>(query: string, params: any[] = []): Promise<T[]> {
    const stmt = this.db.prepare(query);
    const result = await stmt.bind(...params).all();
    return result.results as T[];
  }

  /**
   * Execute a SELECT query and return the first result
   */
  protected async findOne<T>(query: string, params: any[] = []): Promise<T | null> {
    const stmt = this.db.prepare(query);
    const result = await stmt.bind(...params).first();
    return result as T | null;
  }

  /**
   * Execute an INSERT query and return the inserted ID
   */
  protected async insert(query: string, params: any[] = []): Promise<number> {
    const stmt = this.db.prepare(query);
    const result = await stmt.bind(...params).run();
    
    if (!result.success) {
      throw new Error(`Insert failed: ${result.error}`);
    }
    
    return result.meta.last_row_id as number;
  }

  /**
   * Execute an UPDATE query and return the number of affected rows
   */
  protected async update(query: string, params: any[] = []): Promise<number> {
    const stmt = this.db.prepare(query);
    const result = await stmt.bind(...params).run();
    
    if (!result.success) {
      throw new Error(`Update failed: ${result.error}`);
    }
    
    return result.meta.changes;
  }

  /**
   * Execute a DELETE query and return the number of affected rows
   */
  protected async delete(query: string, params: any[] = []): Promise<number> {
    const stmt = this.db.prepare(query);
    const result = await stmt.bind(...params).run();
    
    if (!result.success) {
      throw new Error(`Delete failed: ${result.error}`);
    }
    
    return result.meta.changes;
  }

  /**
   * Execute multiple queries in a transaction
   */
  protected async transaction(queries: { query: string; params?: any[] }[]): Promise<void> {
    const statements = queries.map(({ query, params = [] }) => 
      this.db.prepare(query).bind(...params)
    );
    
    const result = await this.db.batch(statements);
    
    // Check if any statement failed
    for (const res of result) {
      if (!res.success) {
        throw new Error(`Transaction failed: ${res.error}`);
      }
    }
  }
}
