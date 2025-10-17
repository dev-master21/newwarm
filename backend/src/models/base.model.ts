import db from '../config/database';
import { PoolConnection } from 'mysql2/promise';

export interface QueryOptions {
  where?: Record<string, any>;
  orderBy?: string;
  limit?: number;
  offset?: number;
  fields?: string[];
  connection?: PoolConnection;
}

export class BaseModel {
  protected table: string;
  protected primaryKey: string = 'id';
  protected fillable: string[] = [];
  protected hidden: string[] = [];
  protected timestamps: boolean = true;

  constructor(table: string) {
    this.table = table;
  }

  protected buildWhereClause(where: Record<string, any>): { sql: string; params: any[] } {
    const conditions: string[] = [];
    const params: any[] = [];

    for (const [key, value] of Object.entries(where)) {
      if (value === null) {
        conditions.push(`${key} IS NULL`);
      } else if (Array.isArray(value)) {
        conditions.push(`${key} IN (${value.map(() => '?').join(', ')})`);
        params.push(...value);
      } else if (typeof value === 'object' && value !== null) {
        // Handle operators like { '>': 100, '<': 200 }
        for (const [operator, val] of Object.entries(value)) {
          conditions.push(`${key} ${operator} ?`);
          params.push(val);
        }
      } else {
        conditions.push(`${key} = ?`);
        params.push(value);
      }
    }

    return {
      sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
      params
    };
  }

  async findAll(options: QueryOptions = {}): Promise<any[]> {
    const fields = options.fields || ['*'];
    const { sql: whereClause, params } = options.where 
      ? this.buildWhereClause(options.where) 
      : { sql: '', params: [] };

    let query = `SELECT ${fields.join(', ')} FROM ${this.table} ${whereClause}`;
    
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    }
    
    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
      if (options.offset) {
        query += ` OFFSET ${options.offset}`;
      }
    }

    return await db.query(query, params);
  }

  async findOne(options: QueryOptions = {}): Promise<any | null> {
    const results = await this.findAll({ ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async findById(id: number | string, fields?: string[]): Promise<any | null> {
    return await this.findOne({
      where: { [this.primaryKey]: id },
      fields
    });
  }

  async create(data: Record<string, any>, connection?: PoolConnection): Promise<any> {
    const filteredData = this.filterFillable(data);
    
    if (this.timestamps) {
      filteredData.created_at = new Date();
      filteredData.updated_at = new Date();
    }

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const placeholders = fields.map(() => '?').join(', ');

    const query = `INSERT INTO ${this.table} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    const conn = connection || db.getPool();
    const [result]: any = await conn.execute(query, values);
    
    return await this.findById(result.insertId);
  }

  async update(id: number | string, data: Record<string, any>, connection?: PoolConnection): Promise<boolean> {
    const filteredData = this.filterFillable(data);
    
    if (this.timestamps) {
      filteredData.updated_at = new Date();
    }

    const fields = Object.keys(filteredData);
    const values = Object.values(filteredData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const query = `UPDATE ${this.table} SET ${setClause} WHERE ${this.primaryKey} = ?`;
    values.push(id);

    const conn = connection || db.getPool();
    const [result]: any = await conn.execute(query, values);
    
    return result.affectedRows > 0;
  }

  async delete(id: number | string, connection?: PoolConnection): Promise<boolean> {
    const query = `DELETE FROM ${this.table} WHERE ${this.primaryKey} = ?`;
    
    const conn = connection || db.getPool();
    const [result]: any = await conn.execute(query, [id]);
    
    return result.affectedRows > 0;
  }

  async count(where?: Record<string, any>): Promise<number> {
    const { sql: whereClause, params } = where 
      ? this.buildWhereClause(where) 
      : { sql: '', params: [] };

    const query = `SELECT COUNT(*) as total FROM ${this.table} ${whereClause}`;
    const [result]: any = await db.query(query, params);
    
    return result[0].total;
  }

  protected filterFillable(data: Record<string, any>): Record<string, any> {
    if (this.fillable.length === 0) {
      return data;
    }

    const filtered: Record<string, any> = {};
    for (const field of this.fillable) {
      if (field in data) {
        filtered[field] = data[field];
      }
    }
    return filtered;
  }

  protected hideFields(data: any): any {
    if (this.hidden.length === 0) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.hideFields(item));
    }

    const result = { ...data };
    for (const field of this.hidden) {
      delete result[field];
    }
    return result;
  }
}