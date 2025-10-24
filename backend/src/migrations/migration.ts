import db from '../config/database';
import fs from 'fs-extra';
import path from 'path';

class Migration {
  async run() {
    console.log('🔄 Starting database migration...');
    
    try {
      // Create tables
      await this.createTables();
      
      // Insert initial data
      await this.seedData();
      
      console.log('✅ Migration completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  private async createTables() {
    const sql = `
      -- Admins table
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('SUPER_ADMIN', 'ADMIN', 'MODERATOR') DEFAULT 'MODERATOR',
        is_active BOOLEAN DEFAULT TRUE,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Villa tags table
      CREATE TABLE IF NOT EXISTS villa_tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image VARCHAR(500),
        banner VARCHAR(500),
        type ENUM('FEATURE', 'EVENT', 'LOCATION') DEFAULT 'FEATURE',
        sort INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_type (type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Villas table
      CREATE TABLE IF NOT EXISTS villas (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        city VARCHAR(100) DEFAULT 'Phuket',
        location VARCHAR(500),
        ical_url VARCHAR(500),
        
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        currency VARCHAR(10) DEFAULT 'THB',
        
        bedrooms_num INT NOT NULL,
        bathrooms_num INT,
        adults_num INT NOT NULL,
        children_num INT DEFAULT 0,
        area DECIMAL(10, 2),
        
        cover VARCHAR(500),
        banner_images JSON,
        gallery_images JSON,
        price_image VARCHAR(500),
        blueprint_image VARCHAR(500),
        video_720_url VARCHAR(500),
        
        amenities JSON,
        features JSON,
        hardware JSON,
        selling_points JSON,
        
        detail_banner_title VARCHAR(500),
        detail_banner_desc TEXT,
        
        status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'ACTIVE',
        sort INT DEFAULT 0,
        view_count INT DEFAULT 0,
        
        update_time INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_city (city),
        INDEX idx_price (price),
        INDEX idx_bedrooms (bedrooms_num)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Villa tag relations
      CREATE TABLE IF NOT EXISTS villa_tag_relations (
        villa_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (villa_id, tag_id),
        FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES villa_tags(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Quick facts table
      CREATE TABLE IF NOT EXISTS quick_facts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        villa_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        sort INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE,
        INDEX idx_villa (villa_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Reviews table
      CREATE TABLE IF NOT EXISTS reviews (
        id INT PRIMARY KEY AUTO_INCREMENT,
        villa_id INT NOT NULL,
        author VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        comment TEXT,
        review_date DATE,
        sort INT DEFAULT 0,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE,
        INDEX idx_villa (villa_id),
        INDEX idx_visible (is_visible)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Price plans table
      CREATE TABLE IF NOT EXISTS price_plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        villa_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        original_price DECIMAL(10, 2),
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE,
        INDEX idx_villa (villa_id),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Reservations table (for calendar blocking)
      CREATE TABLE IF NOT EXISTS reservations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        villa_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        source VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE CASCADE,
        INDEX idx_villa (villa_id),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Bookings table
      CREATE TABLE IF NOT EXISTS bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        villa_id INT,
        
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(50),
        country VARCHAR(100),
        
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        flexibility_dates VARCHAR(255),
        
        adults_num INT NOT NULL,
        children_num INT DEFAULT 0,
        children_ages VARCHAR(255),
        bedrooms_required INT,
        
        budget_per_night VARCHAR(100),
        purpose_of_stay VARCHAR(255),
        comments TEXT,
        
        status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
        total_price DECIMAL(10, 2),
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (villa_id) REFERENCES villas(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_status (status),
        INDEX idx_dates (check_in, check_out)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Contacts table
      CREATE TABLE IF NOT EXISTS contacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) NOT NULL,
        country VARCHAR(100),
        travel_date_from DATE,
        travel_date_to DATE,
        message TEXT NOT NULL,
        status ENUM('NEW', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'NEW',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Club members table
      CREATE TABLE IF NOT EXISTS club_members (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        country VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Banners table
      CREATE TABLE IF NOT EXISTS banners (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(500) NOT NULL,
        link VARCHAR(500),
        position VARCHAR(50),
        sort INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_position (position),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Config table
      CREATE TABLE IF NOT EXISTS configs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        config_key VARCHAR(100) UNIQUE NOT NULL,
        config_value TEXT,
        config_type VARCHAR(50) DEFAULT 'text',
        config_category VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (config_key),
        INDEX idx_category (config_category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Trips table
      CREATE TABLE IF NOT EXISTS trips (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        cover VARCHAR(500),
        content TEXT,
        sort INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Testimonials table
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT PRIMARY KEY AUTO_INCREMENT,
        author VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        rating INT DEFAULT 5,
        testimonial_date DATE,
        sort INT DEFAULT 0,
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_visible (is_visible)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      -- Chips table (About us sections)
      CREATE TABLE IF NOT EXISTS chips (
        id INT PRIMARY KEY AUTO_INCREMENT,
        chip_type VARCHAR(100),
        title VARCHAR(255),
        image VARCHAR(500),
        description TEXT,
        sort INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (chip_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    const statements = sql.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await db.query(statement);
      }
    }
    
    console.log('✅ Tables created successfully');
  }

  private async seedData() {
    // Create default admin
    const bcrypt = require('bcrypt');
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 10);
    
    await db.query(`
      INSERT IGNORE INTO admins (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `, [
      process.env.ADMIN_EMAIL || 'admin@warmphuket.ru',
      adminPassword,
      'Administrator',
      'SUPER_ADMIN'
    ]);

    // Create default tags
    const tags = [
      { name: 'Beachfront', slug: 'beachfront', type: 'LOCATION' },
      { name: 'Sea View', slug: 'sea-view', type: 'LOCATION' },
      { name: 'Private Pool', slug: 'private-pool', type: 'FEATURE' },
      { name: 'Family Friendly', slug: 'family-friendly', type: 'FEATURE' },
      { name: 'Luxury', slug: 'luxury', type: 'FEATURE' },
      { name: 'Featured', slug: 'featured', type: 'FEATURE' },
      { name: 'Pet Friendly', slug: 'pet-friendly', type: 'FEATURE' },
      { name: 'Honeymoon', slug: 'honeymoon', type: 'EVENT' },
      { name: 'Wedding', slug: 'wedding', type: 'EVENT' },
    ];

    for (const tag of tags) {
      await db.query(`
        INSERT IGNORE INTO villa_tags (name, slug, type)
        VALUES (?, ?, ?)
      `, [tag.name, tag.slug, tag.type]);
    }

    // Create default configs
    const configs = [
      { key: 'site_name', value: 'WARM+', type: 'text', category: 'general' },
      { key: 'site_email', value: 'info@warmphuket.ru', type: 'text', category: 'contact' },
      { key: 'site_phone', value: '+66 123 456 789', type: 'text', category: 'contact' },
      { key: 'site_phone2', value: '+66 987 654 321', type: 'text', category: 'contact' },
      { key: 'site_address', value: 'Phuket, Thailand', type: 'text', category: 'contact' },
      { key: 'facebook_url', value: 'https://facebook.com/warmplus', type: 'text', category: 'social' },
      { key: 'instagram_url', value: 'https://instagram.com/warmplus', type: 'text', category: 'social' },
      { key: 'youtube_url', value: 'https://youtube.com/warmplus', type: 'text', category: 'social' },
      { key: 'logo_light', value: 'logo-light.svg', type: 'image', category: 'branding' },
      { key: 'logo_dark', value: 'logo-dark.svg', type: 'image', category: 'branding' },
    ];

    for (const config of configs) {
      await db.query(`
        INSERT IGNORE INTO configs (config_key, config_value, config_type, config_category)
        VALUES (?, ?, ?, ?)
      `, [config.key, config.value, config.type, config.category]);
    }

    console.log('✅ Seed data inserted successfully');
  }
}

// Run migration
const migration = new Migration();
migration.run();