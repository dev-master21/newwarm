// backend/createAdmin.js
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdmin() {
  let connection;
  
  try {
    // Подключаемся к БД используя данные из .env
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'warm',
      password: process.env.DB_PASSWORD || 'oN3jI1fK7z',
      database: process.env.DB_NAME || 'warm'
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // Проверяем существует ли таблица admins
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'admins'"
    );

    if (tables.length === 0) {
      console.log('❌ Table "admins" does not exist. Creating...');
      
      // Создаём таблицу admins
      await connection.query(`
        CREATE TABLE admins (
          id INT PRIMARY KEY AUTO_INCREMENT,
          username VARCHAR(100) UNIQUE NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          role ENUM('super_admin', 'admin', 'manager') DEFAULT 'admin',
          is_active BOOLEAN DEFAULT TRUE,
          last_login DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_username (username),
          INDEX idx_email (email),
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('✅ Table "admins" created');
    }

    // Проверяем, существует ли уже админ
    const [existing] = await connection.query(
      'SELECT COUNT(*) as count FROM admins WHERE email = ?',
      [process.env.ADMIN_EMAIL || 'admin@warmphuket.ru']
    );

    if (existing[0].count > 0) {
      console.log('\n⚠️  Admin already exists!');
      console.log('Do you want to update the password? (Run with --force to update)');
      
      if (process.argv.includes('--force')) {
        // Хешируем пароль из .env
        const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await connection.query(
          'UPDATE admins SET password = ? WHERE email = ?',
          [hashedPassword, process.env.ADMIN_EMAIL || 'admin@warmphuket.ru']
        );
        
        console.log('✅ Password updated!');
      }
    } else {
      // Хешируем пароль из .env
      const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      console.log('Creating admin with password hash...');

      // Создаём админа
      await connection.query(
        `INSERT INTO admins (username, email, password, first_name, last_name, role, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          'admin',
          process.env.ADMIN_EMAIL || 'admin@warmphuket.ru',
          hashedPassword,
          'Admin',
          'User',
          'super_admin',
          true
        ]
      );

      console.log('\n================================');
      console.log('✅ Admin created successfully!');
      console.log('================================');
      console.log('Email:', process.env.ADMIN_EMAIL || 'admin@warmphuket.ru');
      console.log('Username: admin');
      console.log('Password:', password);
      console.log('================================\n');
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) {
      await connection.end();
    }
    process.exit(1);
  }
}

createAdmin();