import mysql from 'mysql2/promise';
import { config } from './config';

class Database {
  private static instance: Database;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      namedPlaceholders: true,
      multipleStatements: true,
      timezone: '+00:00',
      dateStrings: false,
      typeCast: function (field: any, next: any) {
        if (field.type === 'TINY' && field.length === 1) {
          return field.string() === '1';
        }
        if (field.type === 'JSON') {
          return JSON.parse(field.string());
        }
        return next();
      }
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }

  public async query<T = any>(sql: string, params?: any): Promise<T> {
    const [results] = await this.pool.execute(sql, params);
    return results as T;
  }

  public async queryOne<T = any>(sql: string, params?: any): Promise<T | null> {
    const results = await this.query<T[]>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  public async transaction<T = any>(
    callback: (connection: mysql.PoolConnection) => Promise<T>
  ): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      await this.pool.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

export const db = Database.getInstance();
export default db;