// backend/src/config/database.ts
import mysql from 'mysql2/promise';
import { config } from './config';

class Database {
  private pool: mysql.Pool;

  constructor() {
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
      keepAliveInitialDelay: 0
    });

    this.testConnection();
  }

  /**
   * Выполнение запроса
   */
  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Выполнение запроса с возвратом одной строки
   */
  async queryOne(sql: string, params?: any[]): Promise<any> {
    try {
      const [results] = await this.pool.execute(sql, params);
      const rows = results as any[];
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Database queryOne error:', error);
      throw error;
    }
  }

  /**
   * Получение пула соединений
   */
  getPool(): mysql.Pool {
    return this.pool;
  }

  /**
   * Получение соединения из пула
   */
  async getConnection(): Promise<mysql.PoolConnection> {
    try {
      return await this.pool.getConnection();
    } catch (error) {
      console.error('Error getting connection:', error);
      throw error;
    }
  }

  /**
   * Выполнение транзакции
   */
  async transaction(callback: (connection: mysql.PoolConnection) => Promise<any>): Promise<any> {
    const connection = await this.getConnection();
    
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

  /**
   * Проверка подключения к БД
   */
  async testConnection(): Promise<boolean> {
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Закрытие пула соединений
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database pool closed');
    } catch (error) {
      console.error('Error closing database pool:', error);
      throw error;
    }
  }
}

export default new Database();