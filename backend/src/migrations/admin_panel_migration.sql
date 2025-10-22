-- backend/src/migrations/admin_panel_migration.sql

-- Таблица для объектов недвижимости
CREATE TABLE IF NOT EXISTS properties (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deal_type ENUM('rent', 'sale', 'both') NOT NULL,
  property_type ENUM('house', 'villa', 'condo', 'apartment', 'penthouse') NOT NULL,
  
  -- Адрес и местоположение
  region VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  google_maps_link TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  property_number VARCHAR(50) NOT NULL,
  
  -- Характеристики
  bedrooms VARCHAR(20) NOT NULL,
  bathrooms INT NOT NULL,
  indoor_area DECIMAL(10, 2),
  outdoor_area DECIMAL(10, 2),
  plot_size DECIMAL(10, 2),
  floors INT,
  floor VARCHAR(20),
  penthouse_floors INT,
  
  -- Дополнительная информация
  construction_year INT,
  construction_month VARCHAR(2),
  furniture_status ENUM('fully', 'unfurnished', 'partially', 'negotiable'),
  parking_spaces INT,
  pets_allowed VARCHAR(50),
  pets_custom TEXT,
  
  -- Право собственности
  building_ownership VARCHAR(50),
  land_ownership VARCHAR(50),
  ownership_type VARCHAR(50),
  
  -- Цены
  sale_price DECIMAL(15, 2),
  minimum_nights INT,
  
  -- Календарь
  ics_calendar_url TEXT,
  last_calendar_sync DATETIME,
  
  -- Планировка
  floor_plan_url TEXT,
  
  -- Статус
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  views_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by INT,
  
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_deal_type (deal_type),
  INDEX idx_property_type (property_type),
  INDEX idx_region (region),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица переводов
CREATE TABLE IF NOT EXISTS property_translations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  language_code VARCHAR(5) NOT NULL,
  property_name VARCHAR(255),
  description TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE KEY unique_property_language (property_id, language_code),
  INDEX idx_language (language_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица фотографий
CREATE TABLE IF NOT EXISTS property_photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  photo_url TEXT NOT NULL,
  category VARCHAR(100),
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_property (property_id),
  INDEX idx_sort (property_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица особенностей
CREATE TABLE IF NOT EXISTS property_features (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  feature_type ENUM('property', 'outdoor', 'rental', 'location', 'view') NOT NULL,
  feature_value VARCHAR(100) NOT NULL,
  renovation_date VARCHAR(20),
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_property (property_id),
  INDEX idx_type (feature_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица сезонных цен
CREATE TABLE IF NOT EXISTS property_pricing (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_property (property_id),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица календаря (занятые даты)
CREATE TABLE IF NOT EXISTS property_calendar (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  blocked_date DATE NOT NULL,
  reason VARCHAR(100),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  UNIQUE KEY unique_property_date (property_id, blocked_date),
  INDEX idx_property (property_id),
  INDEX idx_date (blocked_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица для хранения категорий фото (если пользователь добавляет свои)
CREATE TABLE IF NOT EXISTS photo_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  property_id INT NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  
  FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  INDEX idx_property (property_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;