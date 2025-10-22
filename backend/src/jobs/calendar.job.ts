// backend/src/jobs/calendar.job.ts
import cron from 'node-cron';
import db from '../config/database';
import calendarService from '../services/calendar.service';
import { logger } from '../utils/logger';

class CalendarJob {
  /**
   * Запуск периодической синхронизации календарей
   */
  start() {
    // Синхронизация каждые 4 часа
    cron.schedule('0 */4 * * *', async () => {
      logger.info('Starting calendar synchronization job');
      await this.syncAllCalendars();
    });

    // Синхронизация при старте сервера (через 1 минуту)
    setTimeout(() => {
      this.syncAllCalendars();
    }, 60000);

    logger.info('Calendar sync job scheduled (every 4 hours)');
  }

  /**
   * Синхронизация всех календарей
   */
  async syncAllCalendars() {
    try {
      // Получаем все объекты с календарями
      const properties: any = await db.query(
        `SELECT id, ics_calendar_url, last_calendar_sync 
         FROM properties 
         WHERE ics_calendar_url IS NOT NULL 
         AND ics_calendar_url != ''
         AND status = 'published'`
      );

      logger.info(`Found ${properties.length} properties with calendars to sync`);

      let successCount = 0;
      let errorCount = 0;

      for (const property of properties) {
        try {
          await calendarService.syncCalendar(property.id, property.ics_calendar_url);
          successCount++;
          logger.info(`Calendar synced successfully for property ${property.id}`);
        } catch (error) {
          errorCount++;
          logger.error(`Failed to sync calendar for property ${property.id}:`, error);
        }

        // Небольшая задержка между синхронизациями
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      logger.info(`Calendar sync completed: ${successCount} success, ${errorCount} errors`);
    } catch (error) {
      logger.error('Calendar sync job error:', error);
    }
  }

  /**
   * Синхронизация календаря конкретного объекта
   */
  async syncPropertyCalendar(propertyId: number) {
    try {
      const [properties]: any = await db.query(
        'SELECT ics_calendar_url FROM properties WHERE id = ? AND ics_calendar_url IS NOT NULL',
        [propertyId]
      );

      if (properties.length === 0) {
        throw new Error('Property not found or has no calendar URL');
      }

      await calendarService.syncCalendar(propertyId, properties[0].ics_calendar_url);
      logger.info(`Calendar synced for property ${propertyId}`);
    } catch (error) {
      logger.error(`Failed to sync calendar for property ${propertyId}:`, error);
      throw error;
    }
  }
}

export default new CalendarJob();