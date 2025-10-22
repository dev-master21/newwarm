// backend/src/migrations/seed.ts
import bcrypt from 'bcrypt';
import db from '../config/database';
import { logger } from '../utils/logger';

const seedAdmins = async () => {
  try {
    logger.info('Starting admin seed...');

    // Проверяем, есть ли уже админы
    const [existingAdmins]: any = await db.query(
      'SELECT COUNT(*) as count FROM admins'
    );

    if (existingAdmins[0].count > 0) {
      logger.info('Admins already exist, skipping seed');
      return;
    }

    // Создаем хеш пароля
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Добавляем тестового админа
    await db.query(
      `INSERT INTO admins (username, email, password, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@warmplus.com', hashedPassword, 'Admin', 'User', 'super_admin']
    );

    logger.info('Admin seed completed successfully');
    logger.info('Test admin credentials:');
    logger.info('  Username: admin');
    logger.info('  Password: admin123');
    
  } catch (error) {
    logger.error('Admin seed error:', error);
    throw error;
  }
};

const runSeed = async () => {
  try {
    await seedAdmins();
    logger.info('All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
};

runSeed();