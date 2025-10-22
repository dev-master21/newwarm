// backend/src/controllers/property.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import db from '../config/database';
import calendarService from '../services/calendar.service';
import fs from 'fs-extra';
import path from 'path';

class PropertyController {
  /**
   * Создание нового объекта недвижимости
   */
  async createProperty(req: AuthRequest, res: Response) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      console.log('📥 Получены данные для создания объекта');

      const {
        dealType,
        propertyType,
        region,
        address,
        googleMapsLink,
        latitude,
        longitude,
        propertyNumber,
        bedrooms,
        bathrooms,
        indoorArea,
        outdoorArea,
        plotSize,
        floors,
        floor,
        penthouseFloors,
        constructionYear,
        constructionMonth,
        furnitureStatus,
        parkingSpaces,
        petsAllowed,
        petsCustom,
        buildingOwnership,
        landOwnership,
        ownershipType,
        propertyFeatures,
        renovationDates,
        outdoorFeatures,
        rentalFeatures,
        locationFeatures,
        views,
        propertyName,
        description,
        salePrice,
        seasonalPricing,
        icsCalendarUrl,
        status = 'draft'
      } = req.body;

      console.log('✅ Данные извлечены из request.body');

      const [propertyResult]: any = await connection.query(
        `INSERT INTO properties (
          deal_type, property_type, region, address, google_maps_link,
          latitude, longitude, property_number, bedrooms, bathrooms,
          indoor_area, outdoor_area, plot_size, floors, floor, penthouse_floors,
          construction_year, construction_month, furniture_status, parking_spaces,
          pets_allowed, pets_custom, building_ownership, land_ownership,
          ownership_type, sale_price, ics_calendar_url,
          status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dealType, propertyType, region, address, googleMapsLink,
          latitude, longitude, propertyNumber, bedrooms, bathrooms,
          indoorArea, outdoorArea, plotSize, floors, floor, penthouseFloors,
          constructionYear, constructionMonth, furnitureStatus, parkingSpaces,
          petsAllowed, petsCustom, buildingOwnership, landOwnership,
          ownershipType, salePrice, icsCalendarUrl,
          status, req.admin?.id
        ]
      );

      const propertyId = propertyResult.insertId;
      console.log(`✅ Объект создан с ID: ${propertyId}`);

      if (propertyName || description) {
        console.log('🔄 Добавление переводов...');
        const languages = ['ru', 'en', 'es', 'fr', 'th', 'zh'];
        let translationsAdded = 0;
        
        for (const lang of languages) {
          if (propertyName?.[lang] || description?.[lang]) {
            await connection.query(
              `INSERT INTO property_translations (property_id, language_code, property_name, description)
               VALUES (?, ?, ?, ?)`,
              [propertyId, lang, propertyName?.[lang] || null, description?.[lang] || null]
            );
            translationsAdded++;
          }
        }
        console.log(`✅ Добавлено ${translationsAdded} переводов`);
      }

      console.log('🔄 Добавление особенностей...');
      const featureTypes = {
        propertyFeatures: 'property',
        outdoorFeatures: 'outdoor',
        rentalFeatures: 'rental',
        locationFeatures: 'location',
        views: 'view'
      };

      let totalFeatures = 0;
      for (const [key, type] of Object.entries(featureTypes)) {
        const features = req.body[key];
        if (features && Array.isArray(features) && features.length > 0) {
          console.log(`  - Добавление ${features.length} особенностей типа "${type}"`);
          for (const feature of features) {
            const renovationDate = renovationDates?.[feature] || null;
            await connection.query(
              `INSERT INTO property_features (property_id, feature_type, feature_value, renovation_date)
               VALUES (?, ?, ?, ?)`,
              [propertyId, type, feature, renovationDate]
            );
            totalFeatures++;
          }
        }
      }
      console.log(`✅ Добавлено ${totalFeatures} особенностей`);

      // Сохраняем seasonal pricing с новыми полями
      if (seasonalPricing && Array.isArray(seasonalPricing) && seasonalPricing.length > 0) {
        console.log(`🔄 Добавление ${seasonalPricing.length} сезонных периодов цен...`);
        for (const period of seasonalPricing) {
          await connection.query(
            `INSERT INTO property_pricing 
             (property_id, season_type, start_date_recurring, end_date_recurring, price_per_night, minimum_nights, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              propertyId,
              period.seasonType || 'mid',
              period.startDate || null,
              period.endDate || null,
              period.pricePerNight ? parseFloat(period.pricePerNight) : null,
              period.minimumNights ? parseInt(period.minimumNights) : 1
            ]
          );
        }
        console.log(`✅ Сезонные цены добавлены`);
      }

      await connection.commit();
      console.log('✅ Транзакция успешно завершена');

      if (icsCalendarUrl) {
        console.log('🔄 Синхронизация календаря (асинхронно)...');
        calendarService.syncCalendar(propertyId, icsCalendarUrl)
          .then(() => {
            console.log('✅ Календарь синхронизирован');
          })
          .catch((error) => {
            console.error('⚠️ Ошибка синхронизации календаря:', error);
          });
      }

      res.status(201).json({
        success: true,
        data: {
          propertyId,
          message: 'Property created successfully'
        }
      });
    } catch (error: any) {
      await connection.rollback();
      console.error('❌ Ошибка создания объекта:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create property',
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          code: error.code,
          sqlMessage: error.sqlMessage
        } : undefined
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Получение списка объектов админа
   */
  async getAdminProperties(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const status = req.query.status as string;
      const search = req.query.search as string;
      
      const offset = (page - 1) * limit;

      let query = `
        SELECT 
          p.*,
          pt.property_name,
          (SELECT MIN(price_per_night) FROM property_pricing WHERE property_id = p.id) as minimum_rent_price
        FROM properties p
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        WHERE p.created_by = ? AND p.deleted_at IS NULL
      `;

      const params: any[] = [req.admin?.id];

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      if (search) {
        query += ' AND (pt.property_name LIKE ? OR p.property_number LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
      }

      query += ` ORDER BY p.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

      const properties: any = await db.query(query, params);

      // Получаем фотографии для каждого объекта
      for (const property of properties) {
        const photos: any = await db.query(
          'SELECT photo_url FROM property_photos WHERE property_id = ? ORDER BY sort_order',
          [property.id]
        );
        property.photos = photos.map((p: any) => p.photo_url);
        property.photos_count = photos.length;
        property.primary_photo = photos.length > 0 ? photos[0].photo_url : null;
      }

      // Count query
      let countQuery = `
        SELECT COUNT(DISTINCT p.id) as total 
        FROM properties p
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        WHERE p.created_by = ? AND p.deleted_at IS NULL
      `;
      const countParams: any[] = [req.admin?.id];
      
      if (status) {
        countQuery += ' AND p.status = ?';
        countParams.push(status);
      }

      if (search) {
        countQuery += ' AND (pt.property_name LIKE ? OR p.property_number LIKE ?)';
        const searchPattern = `%${search}%`;
        countParams.push(searchPattern, searchPattern);
      }

      const countResult: any = await db.query(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      res.json({
        success: true,
        data: {
          properties,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get admin properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch properties'
      });
    }
  }

  /**
   * Получение объекта по ID
   */
  async getPropertyById(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;

      const [properties]: any = await db.query(
        `SELECT p.* FROM properties p
         WHERE p.id = ? AND p.deleted_at IS NULL`,
        [propertyId]
      );

      if (!properties || properties.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const property = properties[0];

      // Получаем переводы
      const translations: any = await db.query(
        'SELECT language_code, property_name, description FROM property_translations WHERE property_id = ?',
        [propertyId]
      );

      const translationsObj: any = {};
      for (const trans of translations) {
        translationsObj[trans.language_code] = {
          propertyName: trans.property_name,
          description: trans.description
        };
      }
      property.translations = translationsObj;

      // Получаем особенности
      const features: any = await db.query(
        'SELECT feature_type, feature_value, renovation_date FROM property_features WHERE property_id = ?',
        [propertyId]
      );

      property.propertyFeatures = [];
      property.outdoorFeatures = [];
      property.rentalFeatures = [];
      property.locationFeatures = [];
      property.views = [];
      property.renovationDates = {};

      for (const feature of features) {
        const value = feature.feature_value;
        switch (feature.feature_type) {
          case 'property':
            property.propertyFeatures.push(value);
            break;
          case 'outdoor':
            property.outdoorFeatures.push(value);
            break;
          case 'rental':
            property.rentalFeatures.push(value);
            break;
          case 'location':
            property.locationFeatures.push(value);
            break;
          case 'view':
            property.views.push(value);
            break;
        }
        if (feature.renovation_date) {
          property.renovationDates[value] = feature.renovation_date;
        }
      }

      // Получаем фотографии
      const photos: any = await db.query(
        'SELECT id, photo_url, category, sort_order FROM property_photos WHERE property_id = ? ORDER BY sort_order',
        [propertyId]
      );
      property.photos = photos;

      // Получаем seasonal pricing с новыми полями
      const pricing: any = await db.query(
        `SELECT 
          season_type as seasonType,
          start_date_recurring as startDate,
          end_date_recurring as endDate,
          price_per_night as pricePerNight,
          minimum_nights as minimumNights
         FROM property_pricing 
         WHERE property_id = ?
         ORDER BY id ASC`,
        [propertyId]
      );
      property.seasonalPricing = pricing;

      res.json({
        success: true,
        data: { property }
      });
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property'
      });
    }
  }

  /**
   * Обновление объекта недвижимости
   */
  async updateProperty(req: AuthRequest, res: Response) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const { propertyId } = req.params;
      console.log(`📥 Обновление объекта #${propertyId}`);

      const {
        dealType,
        propertyType,
        region,
        address,
        googleMapsLink,
        latitude,
        longitude,
        propertyNumber,
        bedrooms,
        bathrooms,
        indoorArea,
        outdoorArea,
        plotSize,
        floors,
        floor,
        penthouseFloors,
        constructionYear,
        constructionMonth,
        furnitureStatus,
        parkingSpaces,
        petsAllowed,
        petsCustom,
        buildingOwnership,
        landOwnership,
        ownershipType,
        propertyFeatures,
        renovationDates,
        outdoorFeatures,
        rentalFeatures,
        locationFeatures,
        views,
        propertyName,
        description,
        salePrice,
        seasonalPricing,
        icsCalendarUrl,
        status
      } = req.body;

      // Проверяем права доступа
      const [property]: any = await connection.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ? AND deleted_at IS NULL',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Обновляем основную информацию
      await connection.query(
        `UPDATE properties SET
          deal_type = ?, property_type = ?, region = ?, address = ?, google_maps_link = ?,
          latitude = ?, longitude = ?, property_number = ?, bedrooms = ?, bathrooms = ?,
          indoor_area = ?, outdoor_area = ?, plot_size = ?, floors = ?, floor = ?, penthouse_floors = ?,
          construction_year = ?, construction_month = ?, furniture_status = ?, parking_spaces = ?,
          pets_allowed = ?, pets_custom = ?, building_ownership = ?, land_ownership = ?,
          ownership_type = ?, sale_price = ?, ics_calendar_url = ?, status = ?
         WHERE id = ?`,
        [
          dealType, propertyType, region, address, googleMapsLink,
          latitude, longitude, propertyNumber, bedrooms, bathrooms,
          indoorArea, outdoorArea, plotSize, floors, floor, penthouseFloors,
          constructionYear, constructionMonth, furnitureStatus, parkingSpaces,
          petsAllowed, petsCustom, buildingOwnership, landOwnership,
          ownershipType, salePrice, icsCalendarUrl, status,
          propertyId
        ]
      );

      console.log('✅ Основная информация обновлена');

      // Обновляем переводы
      if (propertyName || description) {
        await connection.query('DELETE FROM property_translations WHERE property_id = ?', [propertyId]);
        
        const languages = ['ru', 'en', 'es', 'fr', 'th', 'zh'];
        for (const lang of languages) {
          if (propertyName?.[lang] || description?.[lang]) {
            await connection.query(
              `INSERT INTO property_translations (property_id, language_code, property_name, description)
               VALUES (?, ?, ?, ?)`,
              [propertyId, lang, propertyName?.[lang] || null, description?.[lang] || null]
            );
          }
        }
        console.log('✅ Переводы обновлены');
      }

      // Обновляем особенности
      await connection.query('DELETE FROM property_features WHERE property_id = ?', [propertyId]);
      
      const featureTypes = {
        propertyFeatures: 'property',
        outdoorFeatures: 'outdoor',
        rentalFeatures: 'rental',
        locationFeatures: 'location',
        views: 'view'
      };

      for (const [key, type] of Object.entries(featureTypes)) {
        const features = req.body[key];
        if (features && Array.isArray(features) && features.length > 0) {
          for (const feature of features) {
            const renovationDate = renovationDates?.[feature] || null;
            await connection.query(
              `INSERT INTO property_features (property_id, feature_type, feature_value, renovation_date)
               VALUES (?, ?, ?, ?)`,
              [propertyId, type, feature, renovationDate]
            );
          }
        }
      }
      console.log('✅ Особенности обновлены');

      // Обновляем seasonal pricing
      await connection.query('DELETE FROM property_pricing WHERE property_id = ?', [propertyId]);
      
      if (seasonalPricing && Array.isArray(seasonalPricing) && seasonalPricing.length > 0) {
        for (const period of seasonalPricing) {
          await connection.query(
            `INSERT INTO property_pricing 
             (property_id, season_type, start_date_recurring, end_date_recurring, price_per_night, minimum_nights, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              propertyId,
              period.seasonType || 'mid',
              period.startDate || null,
              period.endDate || null,
              period.pricePerNight ? parseFloat(period.pricePerNight) : null,
              period.minimumNights ? parseInt(period.minimumNights) : 1
            ]
          );
        }
        console.log('✅ Сезонные цены обновлены');
      }

      await connection.commit();
      console.log('✅ Объект успешно обновлен');

      // Синхронизация календаря (асинхронно)
      if (icsCalendarUrl) {
        calendarService.syncCalendar(parseInt(propertyId), icsCalendarUrl)
          .catch((error) => {
            console.error('⚠️ Ошибка синхронизации календаря:', error);
          });
      }

      res.json({
        success: true,
        message: 'Property updated successfully'
      });
    } catch (error: any) {
      await connection.rollback();
      console.error('❌ Ошибка обновления объекта:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update property'
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Удаление объекта (мягкое удаление)
   */
  async deleteProperty(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;

      console.log(`🗑️ Удаление объекта #${propertyId}`);

      const [property]: any = await db.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ? AND deleted_at IS NULL',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      await db.query(
        'UPDATE properties SET deleted_at = NOW() WHERE id = ?',
        [propertyId]
      );

      console.log(`✅ Объект #${propertyId} удален`);

      res.json({
        success: true,
        message: 'Property deleted successfully'
      });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete property'
      });
    }
  }

  /**
   * Изменение видимости объекта
   */
  async togglePropertyVisibility(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;
      const { status } = req.body;

      console.log(`👁️ Изменение видимости объекта #${propertyId} на ${status}`);

      if (!['published', 'hidden'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const [property]: any = await db.query(
        'SELECT id, status FROM properties WHERE id = ? AND created_by = ? AND deleted_at IS NULL',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      await db.query(
        'UPDATE properties SET status = ? WHERE id = ?',
        [status, propertyId]
      );

      console.log(`✅ Статус объекта #${propertyId} изменен на ${status}`);

      res.json({
        success: true,
        message: 'Property visibility updated successfully',
        data: {
          status
        }
      });
    } catch (error) {
      console.error('Toggle visibility error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle visibility'
      });
    }
  }

  /**
   * Загрузка фотографий для объекта
   */
  async uploadPhotos(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;
      const { category } = req.body;
      const files = req.files as Express.Multer.File[];

      console.log(`📸 Загрузка фотографий для объекта #${propertyId}`);

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const [property]: any = await db.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ?',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        for (const file of files) {
          await fs.remove(file.path);
        }
        
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const [maxOrder]: any = await db.query(
        'SELECT MAX(sort_order) as max_order FROM property_photos WHERE property_id = ?',
        [propertyId]
      );

      let sortOrder = (maxOrder[0]?.max_order || 0) + 1;

      const photoUrls = [];
      for (const file of files) {
        const photoUrl = `/uploads/properties/photos/${file.filename}`;
        
        await db.query(
          `INSERT INTO property_photos (property_id, photo_url, category, sort_order)
           VALUES (?, ?, ?, ?)`,
          [propertyId, photoUrl, category || null, sortOrder++]
        );

        photoUrls.push({
          url: photoUrl,
          category: category || null
        });
      }

      res.json({
        success: true,
        data: {
          photos: photoUrls
        }
      });
    } catch (error) {
      console.error('Upload photos error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload photos'
      });
    }
  }

  /**
   * Загрузка планировки
   */
  async uploadFloorPlan(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const [property]: any = await db.query(
        'SELECT floor_plan_url FROM properties WHERE id = ? AND created_by = ?',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        await fs.remove(file.path);
        
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      if (property[0].floor_plan_url) {
        const oldPath = path.join(__dirname, '../../', property[0].floor_plan_url);
        await fs.remove(oldPath).catch(() => {});
      }

      const floorPlanUrl = `/uploads/properties/floor-plans/${file.filename}`;
      
      await db.query(
        'UPDATE properties SET floor_plan_url = ? WHERE id = ?',
        [floorPlanUrl, propertyId]
      );

      res.json({
        success: true,
        data: {
          floorPlanUrl
        }
      });
    } catch (error) {
      console.error('Upload floor plan error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload floor plan'
      });
    }
  }

  /**
   * Удаление фотографии
   */
  async deletePhoto(req: AuthRequest, res: Response) {
    try {
      const { photoId } = req.params;

      const [photos]: any = await db.query(
        `SELECT pp.*, p.created_by 
         FROM property_photos pp
         JOIN properties p ON pp.property_id = p.id
         WHERE pp.id = ?`,
        [photoId]
      );

      if (!photos || photos.length === 0 || photos[0].created_by !== req.admin?.id) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      const photo = photos[0];

      await db.query('DELETE FROM property_photos WHERE id = ?', [photoId]);

      const photoPath = path.join(__dirname, '../../', photo.photo_url);
      await fs.remove(photoPath).catch(() => {});

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      console.error('Delete photo error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete photo'
      });
    }
  }

  /**
   * Получение seasonal pricing для объекта
   */
  async getSeasonalPricing(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;

      const [property]: any = await db.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ? AND deleted_at IS NULL',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const pricing: any = await db.query(
        `SELECT 
          id,
          season_type as seasonType,
          start_date_recurring as startDate,
          end_date_recurring as endDate,
          price_per_night as pricePerNight,
          minimum_nights as minimumNights
         FROM property_pricing 
         WHERE property_id = ?
         ORDER BY id ASC`,
        [propertyId]
      );

      res.json({
        success: true,
        data: { seasonalPricing: pricing }
      });
    } catch (error) {
      console.error('Get seasonal pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get seasonal pricing'
      });
    }
  }

  /**
   * Сохранение seasonal pricing для объекта
   */
  async saveSeasonalPricing(req: AuthRequest, res: Response) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const { propertyId } = req.params;
      const { seasonalPricing } = req.body;

      const [property]: any = await connection.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ? AND deleted_at IS NULL',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Удаляем старые записи
      await connection.query(
        'DELETE FROM property_pricing WHERE property_id = ?',
        [propertyId]
      );

      // Добавляем новые записи
      if (seasonalPricing && Array.isArray(seasonalPricing) && seasonalPricing.length > 0) {
        for (const season of seasonalPricing) {
          await connection.query(
            `INSERT INTO property_pricing 
             (property_id, season_type, start_date_recurring, end_date_recurring, price_per_night, minimum_nights, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [
              propertyId,
              season.seasonType || 'mid',
              season.startDate || null,
              season.endDate || null,
              season.pricePerNight ? parseFloat(season.pricePerNight) : null,
              season.minimumNights ? parseInt(season.minimumNights) : 1
            ]
          );
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Seasonal pricing saved successfully'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Save seasonal pricing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save seasonal pricing'
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Проверка календаря
   */
  async validateCalendar(req: AuthRequest, res: Response) {
    try {
      const { icsUrl } = req.body;

      if (!icsUrl) {
        return res.status(400).json({
          success: false,
          message: 'ICS URL is required'
        });
      }

      const isValid = await calendarService.validateIcsUrl(icsUrl);

      if (isValid) {
        res.json({
          success: true,
          message: 'Calendar is valid'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Invalid calendar URL'
        });
      }
    } catch (error) {
      console.error('Validate calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate calendar'
      });
    }
  }
}

export default new PropertyController();