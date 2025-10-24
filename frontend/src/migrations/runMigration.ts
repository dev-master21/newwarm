// backend/src/migrations/runMigration.ts
import fs from 'fs';
import path from 'path';
import db from '../config/database';
import { logger } from '../utils/logger';

const runMigration = async () => {
  try {
    logger.info('Starting database migration...');

    // Читаем SQL файл
    const migrationPath = path.join(__dirname, 'admin_panel_migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Разделяем на отдельные запросы
    const queries = sql
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0);

    logger.info(`Found ${queries.length} queries to execute`);

    // Выполняем каждый запрос
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      try {
        await db.query(query);
        logger.info(`Query ${i + 1}/${queries.length} executed successfully`);
      } catch (error) {
        logger.error(`Error executing query ${i + 1}:`, error);
        throw error;
      }
    }

    logger.info('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();