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

      const {
        // Основная информация
        dealType,
        propertyType,
        region,
        address,
        googleMapsLink,
        latitude,
        longitude,
        propertyNumber,

        // Характеристики
        bedrooms,
        bathrooms,
        indoorArea,
        outdoorArea,
        plotSize,
        floors,
        floor,
        penthouseFloors,

        // Дополнительная информация
        constructionYear,
        constructionMonth,
        furnitureStatus,
        parkingSpaces,
        petsAllowed,
        petsCustom,

        // Собственность
        buildingOwnership,
        landOwnership,
        ownershipType,

        // Особенности
        propertyFeatures,
        renovationDates,
        outdoorFeatures,
        rentalFeatures,
        locationFeatures,
        views,

        // Описания
        propertyName,
        description,

        // Цены
        salePrice,
        minimumNights,
        seasonalPricing,

        // Календарь
        icsCalendarUrl,

        // Статус
        status = 'draft'
      } = req.body;

      // Создаем основную запись
      const [propertyResult]: any = await connection.query(
        `INSERT INTO properties (
          deal_type, property_type, region, address, google_maps_link,
          latitude, longitude, property_number, bedrooms, bathrooms,
          indoor_area, outdoor_area, plot_size, floors, floor, penthouse_floors,
          construction_year, construction_month, furniture_status, parking_spaces,
          pets_allowed, pets_custom, building_ownership, land_ownership,
          ownership_type, sale_price, minimum_nights, ics_calendar_url,
          status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dealType, propertyType, region, address, googleMapsLink,
          latitude, longitude, propertyNumber, bedrooms, bathrooms,
          indoorArea, outdoorArea, plotSize, floors, floor, penthouseFloors,
          constructionYear, constructionMonth, furnitureStatus, parkingSpaces,
          petsAllowed, petsCustom, buildingOwnership, landOwnership,
          ownershipType, salePrice, minimumNights, icsCalendarUrl,
          status, req.admin?.id
        ]
      );

      const propertyId = propertyResult.insertId;

      // Добавляем переводы
      if (propertyName && description) {
        const languages = ['ru', 'en', 'es', 'fr', 'th', 'zh'];
        
        for (const lang of languages) {
          if (propertyName[lang] || description[lang]) {
            await connection.query(
              `INSERT INTO property_translations (property_id, language_code, property_name, description)
               VALUES (?, ?, ?, ?)`,
              [propertyId, lang, propertyName[lang] || null, description[lang] || null]
            );
          }
        }
      }

      // Добавляем особенности
      const featureTypes = {
        propertyFeatures: 'property',
        outdoorFeatures: 'outdoor',
        rentalFeatures: 'rental',
        locationFeatures: 'location',
        views: 'view'
      };

      for (const [key, type] of Object.entries(featureTypes)) {
        const features = req.body[key];
        if (features && Array.isArray(features)) {
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

      // Добавляем сезонные цены
      if (seasonalPricing && Array.isArray(seasonalPricing)) {
        for (const period of seasonalPricing) {
          await connection.query(
            `INSERT INTO property_pricing (property_id, start_date, end_date, price_per_night)
             VALUES (?, ?, ?, ?)`,
            [propertyId, period.startDate, period.endDate, period.pricePerNight]
          );
        }
      }

      // Синхронизируем календарь если указан
      if (icsCalendarUrl) {
        try {
          await calendarService.syncCalendar(propertyId, icsCalendarUrl);
        } catch (error) {
          console.error('Calendar sync error:', error);
          // Не прерываем транзакцию из-за ошибки календаря
        }
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        data: {
          propertyId,
          message: 'Property created successfully'
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Create property error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create property'
      });
    } finally {
      connection.release();
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

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Проверяем что объект принадлежит админу
      const [property]: any = await db.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ?',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        // Удаляем загруженные файлы
        for (const file of files) {
          await fs.remove(file.path);
        }
        
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Получаем текущий максимальный sort_order
      const [maxOrder]: any = await db.query(
        'SELECT MAX(sort_order) as max_order FROM property_photos WHERE property_id = ?',
        [propertyId]
      );

      let sortOrder = (maxOrder[0]?.max_order || 0) + 1;

      // Сохраняем информацию о фотографиях
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

      // Проверяем что объект принадлежит админу
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

      // Удаляем старую планировку если есть
      if (property[0].floor_plan_url) {
        const oldPath = path.join(__dirname, '../../', property[0].floor_plan_url);
        await fs.remove(oldPath).catch(() => {});
      }

      // Сохраняем новую планировку
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
   * Проверка ICS календаря
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

      res.json({
        success: true,
        data: {
          valid: isValid
        }
      });
    } catch (error) {
      console.error('Validate calendar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate calendar'
      });
    }
  }

  /**
   * Получение списка объектов админа
   */
  async getAdminProperties(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT 
          p.*,
          GROUP_CONCAT(DISTINCT pp.photo_url) as photos,
          pt.property_name,
          pt.description
        FROM properties p
        LEFT JOIN property_photos pp ON p.id = pp.property_id AND pp.is_primary = TRUE
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        WHERE p.created_by = ?
      `;

      const params: any[] = [req.admin?.id];

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      query += ' GROUP BY p.id ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);

      const properties = await db.query(query, params);

      // Получаем общее количество
      let countQuery = 'SELECT COUNT(*) as total FROM properties WHERE created_by = ?';
      const countParams: any[] = [req.admin?.id];
      
      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }

      const [countResult]: any = await db.query(countQuery, countParams);

      res.json({
        success: true,
        data: {
          properties,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: countResult[0].total,
            totalPages: Math.ceil(countResult[0].total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get properties'
      });
    }
  }

  /**
   * Получение детальной информации об объекте
   */
  async getPropertyDetails(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;

      // Основная информация
      const [properties]: any = await db.query(
        'SELECT * FROM properties WHERE id = ? AND created_by = ?',
        [propertyId, req.admin?.id]
      );

      if (!properties || properties.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      const property = properties[0];

      // Переводы
      const translations = await db.query(
        'SELECT language_code, property_name, description FROM property_translations WHERE property_id = ?',
        [propertyId]
      );

      // Фотографии
      const photos = await db.query(
        'SELECT * FROM property_photos WHERE property_id = ? ORDER BY sort_order',
        [propertyId]
      );

      // Особенности
      const features = await db.query(
        'SELECT * FROM property_features WHERE property_id = ?',
        [propertyId]
      );

      // Цены
      const pricing = await db.query(
        'SELECT * FROM property_pricing WHERE property_id = ? ORDER BY start_date',
        [propertyId]
      );

      res.json({
        success: true,
        data: {
          property,
          translations,
          photos,
          features,
          pricing
        }
      });
    } catch (error) {
      console.error('Get property details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get property details'
      });
    }
  }

  /**
   * Обновление объекта
   */
  async updateProperty(req: AuthRequest, res: Response) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      const { propertyId } = req.params;
      const updateData = req.body;

      // Проверяем права доступа
      const [property]: any = await connection.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ?',
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
      const allowedFields = [
        'deal_type', 'property_type', 'region', 'address', 'google_maps_link',
        'latitude', 'longitude', 'property_number', 'bedrooms', 'bathrooms',
        'indoor_area', 'outdoor_area', 'plot_size', 'floors', 'floor', 'penthouse_floors',
        'construction_year', 'construction_month', 'furniture_status', 'parking_spaces',
        'pets_allowed', 'pets_custom', 'building_ownership', 'land_ownership',
        'ownership_type', 'sale_price', 'minimum_nights', 'ics_calendar_url', 'status'
      ];

      const updates: string[] = [];
      const values: any[] = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }

      if (updates.length > 0) {
        values.push(propertyId);
        await connection.query(
          `UPDATE properties SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Property updated successfully'
      });
    } catch (error) {
      await connection.rollback();
      console.error('Update property error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update property'
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Удаление объекта
   */
  async deleteProperty(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params;

      // Проверяем права доступа и получаем пути к файлам
      const [property]: any = await db.query(
        'SELECT floor_plan_url FROM properties WHERE id = ? AND created_by = ?',
        [propertyId, req.admin?.id]
      );

      if (!property || property.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        });
      }

      // Получаем все фотографии
      const photos: any = await db.query(
        'SELECT photo_url FROM property_photos WHERE property_id = ?',
        [propertyId]
      );

      // Удаляем запись из БД (каскадно удалятся связанные записи)
      await db.query('DELETE FROM properties WHERE id = ?', [propertyId]);

      // Удаляем файлы
      if (property[0].floor_plan_url) {
        const floorPlanPath = path.join(__dirname, '../../', property[0].floor_plan_url);
        await fs.remove(floorPlanPath).catch(() => {});
      }

      for (const photo of photos) {
        const photoPath = path.join(__dirname, '../../', photo.photo_url);
        await fs.remove(photoPath).catch(() => {});
      }

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
   * Удаление фотографии
   */
  async deletePhoto(req: AuthRequest, res: Response) {
    try {
      const { photoId } = req.params;

      // Получаем информацию о фото и проверяем права доступа
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

      // Удаляем запись из БД
      await db.query('DELETE FROM property_photos WHERE id = ?', [photoId]);

      // Удаляем файл
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
}

export default new PropertyController();