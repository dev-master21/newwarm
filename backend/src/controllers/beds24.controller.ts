// backend/src/controllers/beds24.controller.ts
import { Request, Response } from 'express';
import beds24Service from '../services/beds24.service';

class Beds24Controller {
  /**
   * Ручная синхронизация всех объектов
   */
  async syncAllProperties(req: Request, res: Response) {
    try {
      console.log('🔄 Запущена ручная синхронизация всех объектов с Beds24');

      const result = await beds24Service.syncAllProperties();

      res.json({
        success: true,
        message: 'Price synchronization completed',
        data: result
      });
    } catch (error) {
      console.error('❌ Ошибка синхронизации:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to synchronize prices'
      });
    }
  }

  /**
   * Синхронизация конкретного объекта
   */
  async syncProperty(req: Request, res: Response) {
    try {
      const { propertyId } = req.params;

      console.log(`🔄 Запущена ручная синхронизация объекта #${propertyId}`);

      const success = await beds24Service.syncPropertyPrices(parseInt(propertyId));

      if (success) {
        res.json({
          success: true,
          message: 'Property prices synchronized successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to synchronize property prices'
        });
      }
    } catch (error) {
      console.error('❌ Ошибка синхронизации объекта:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to synchronize property prices'
      });
    }
  }
}

export default new Beds24Controller();