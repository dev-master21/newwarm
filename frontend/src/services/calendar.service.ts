// backend/src/services/calendar.service.ts
import axios from 'axios';
import * as ical from 'ical';
import db from '../config/database';

interface CalendarEvent {
  start: Date;
  end: Date;
  summary?: string;
}

class CalendarService {
  /**
   * Проверяет доступность ICS календаря
   */
  async validateIcsUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'WARM+ Calendar Sync'
        }
      });

      if (response.status !== 200) {
        return false;
      }

      // Проверяем что это действительно ICS файл
      const contentType = response.headers['content-type'];
      if (!contentType?.includes('calendar') && !url.endsWith('.ics')) {
        return false;
      }

      // Пытаемся распарсить
      const data = ical.parseICS(response.data);
      return Object.keys(data).length > 0;
    } catch (error) {
      console.error('ICS validation error:', error);
      return false;
    }
  }

  /**
   * Синхронизирует календарь с ICS файлом
   */
  async syncCalendar(propertyId: number, icsUrl: string): Promise<void> {
    try {
      const response = await axios.get(icsUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'WARM+ Calendar Sync'
        }
      });

      const data = ical.parseICS(response.data);
      const events: CalendarEvent[] = [];

      // Парсим события
      for (const key in data) {
        const event = data[key];
        if (event.type === 'VEVENT' && event.start && event.end) {
          events.push({
            start: new Date(event.start),
            end: new Date(event.end),
            summary: event.summary || 'Booked'
          });
        }
      }

      // Удаляем старые записи
      await db.query(
        'DELETE FROM property_calendar WHERE property_id = ?',
        [propertyId]
      );

      // Добавляем новые занятые даты
      for (const event of events) {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        // Добавляем все дни в диапазоне
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          await db.query(
            `INSERT INTO property_calendar (property_id, blocked_date, reason)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE reason = ?`,
            [propertyId, dateStr, event.summary, event.summary]
          );
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Обновляем время последней синхронизации
      await db.query(
        'UPDATE properties SET last_calendar_sync = NOW() WHERE id = ?',
        [propertyId]
      );

      console.log(`Calendar synced for property ${propertyId}: ${events.length} events`);
    } catch (error) {
      console.error('Calendar sync error:', error);
      throw new Error('Failed to sync calendar');
    }
  }

  /**
   * Получает занятые даты для объекта
   */
  async getBlockedDates(propertyId: number): Promise<string[]> {
    try {
      const results: any = await db.query(
        'SELECT blocked_date FROM property_calendar WHERE property_id = ? ORDER BY blocked_date',
        [propertyId]
      );

      return results.map((row: any) => row.blocked_date);
    } catch (error) {
      console.error('Error getting blocked dates:', error);
      return [];
    }
  }
}

export default new CalendarService();