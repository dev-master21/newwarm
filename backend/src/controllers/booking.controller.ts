// backend/src/controllers/booking.controller.ts
import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Request } from 'express';
import db from '../config/database';
import ExcelJS from 'exceljs';
import { Parser } from 'json2csv';

class BookingController {
  /**
   * Создание нового бронирования
   */
  async createBooking(req: Request, res: Response) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        property_id,
        first_name,
        last_name,
        email,
        phone,
        check_in,
        check_out,
        adults_num,
        children_num = 0,
        total_price,
        notes
      } = req.body;

      // Проверка доступности (проверяем обе таблицы)
      const calendarBlocks: any = await connection.query(
        `SELECT id FROM property_calendar 
         WHERE property_id = ? 
         AND blocked_date BETWEEN ? AND ?`,
        [property_id, check_in, check_out]
      );

      const existingBookings: any = await connection.query(
        `SELECT id FROM property_bookings 
         WHERE property_id = ? 
         AND ((check_in_date BETWEEN ? AND ?) 
         OR (check_out_date BETWEEN ? AND ?) 
         OR (check_in_date <= ? AND check_out_date >= ?))`,
        [property_id, check_in, check_out, check_in, check_out, check_in, check_out]
      );

      if (calendarBlocks.length > 0 || existingBookings.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: 'Property is not available for selected dates'
        });
      }

      // Создание бронирования
      const result: any = await connection.query(
        `INSERT INTO property_bookings (
          property_id, guest_name, guest_email, guest_phone,
          check_in_date, check_out_date, adults_num, children_num,
          total_price, notes, booking_source, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property_id,
          `${first_name} ${last_name}`,
          email,
          phone,
          check_in,
          check_out,
          adults_num,
          children_num,
          total_price,
          notes,
          'website',
          'confirmed'
        ]
      );

      const bookingId = result.insertId;

      // Блокируем даты в календаре
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
      
      for (let date = new Date(checkInDate); date <= checkOutDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        await connection.query(
          `INSERT INTO property_calendar (property_id, blocked_date, reason) 
           VALUES (?, ?, ?)`,
          [property_id, dateStr, `Booking ${bookingId}`]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          booking_id: bookingId
        }
      });
    } catch (error) {
      await connection.rollback();
      console.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking'
      });
    } finally {
      connection.release();
    }
  }

  /**
   * Проверка доступности объекта
   */
  async checkAvailability(req: Request, res: Response) {
    try {
      const { property_id, check_in, check_out } = req.query;

      // Проверяем календарь
      const calendarBlocks: any = await db.query(
        `SELECT id FROM property_calendar 
         WHERE property_id = ? 
         AND blocked_date BETWEEN ? AND ?`,
        [property_id, check_in, check_out]
      );

      // Проверяем бронирования
      const bookings: any = await db.query(
        `SELECT id FROM property_bookings 
         WHERE property_id = ? 
         AND status != 'cancelled'
         AND ((check_in_date BETWEEN ? AND ?) 
         OR (check_out_date BETWEEN ? AND ?) 
         OR (check_in_date <= ? AND check_out_date >= ?))`,
        [property_id, check_in, check_out, check_in, check_out, check_in, check_out]
      );

      res.json({
        success: true,
        data: {
          available: calendarBlocks.length === 0 && bookings.length === 0
        }
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check availability'
      });
    }
  }

  /**
   * Получение информации о бронировании
   */
  async getBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const bookings: any = await db.query(
        `SELECT 
          pb.*,
          p.property_number,
          pt.property_name,
          pp.photo_url as primary_photo
        FROM property_bookings pb
        JOIN properties p ON pb.property_id = p.id
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        LEFT JOIN (
          SELECT property_id, photo_url
          FROM property_photos
          WHERE sort_order = (
            SELECT MIN(sort_order)
            FROM property_photos pp2
            WHERE pp2.property_id = property_photos.property_id
          )
        ) pp ON p.id = pp.property_id
        WHERE pb.id = ?`,
        [id]
      );

      if (bookings.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: { booking: bookings[0] }
      });
    } catch (error) {
      console.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking'
      });
    }
  }

  /**
   * Получение всех бронирований админа
   */
  async getAdminBookings(req: AuthRequest, res: Response) {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      let query = `
        SELECT 
          pb.*,
          p.property_number,
          pt.property_name,
          pp.photo_url as primary_photo
        FROM property_bookings pb
        JOIN properties p ON pb.property_id = p.id
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        LEFT JOIN (
          SELECT property_id, photo_url
          FROM property_photos
          WHERE sort_order = (
            SELECT MIN(sort_order)
            FROM property_photos pp2
            WHERE pp2.property_id = property_photos.property_id
          )
        ) pp ON p.id = pp.property_id
        WHERE p.created_by = ? AND p.deleted_at IS NULL
      `;

      const params: any[] = [req.admin?.id];

      if (startDate && endDate) {
        query += ` AND (
          (pb.check_in_date BETWEEN ? AND ?) OR
          (pb.check_out_date BETWEEN ? AND ?) OR
          (pb.check_in_date <= ? AND pb.check_out_date >= ?)
        )`;
        params.push(startDate, endDate, startDate, endDate, startDate, endDate);
      }

      query += ` ORDER BY pb.check_in_date DESC`;

      const bookings = await db.query(query, params);

      res.json({
        success: true,
        data: { bookings }
      });
    } catch (error) {
      console.error('Get bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bookings'
      });
    }
  }

  /**
   * Получение доступности объектов на определенный период
   */
  async getPropertiesAvailability(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      const properties: any = await db.query(
        `SELECT 
          p.id,
          p.property_number,
          p.property_type,
          p.bedrooms,
          p.bathrooms,
          pt.property_name,
          pp.photo_url as primary_photo
        FROM properties p
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        LEFT JOIN (
          SELECT property_id, photo_url
          FROM property_photos
          WHERE sort_order = (
            SELECT MIN(sort_order)
            FROM property_photos pp2
            WHERE pp2.property_id = property_photos.property_id
          )
        ) pp ON p.id = pp.property_id
        WHERE p.created_by = ? AND p.deleted_at IS NULL AND p.status = 'published'
        ORDER BY p.created_at DESC`,
        [req.admin?.id]
      );

      for (const property of properties) {
        // Проверяем бронирования
        const bookings: any = await db.query(
          `SELECT check_in_date, check_out_date, booking_source, status
           FROM property_bookings
           WHERE property_id = ? AND status != 'cancelled' AND (
             (check_in_date BETWEEN ? AND ?) OR
             (check_out_date BETWEEN ? AND ?) OR
             (check_in_date <= ? AND check_out_date >= ?)
           )
           ORDER BY check_in_date`,
          [property.id, startDate, endDate, startDate, endDate, startDate, endDate]
        );

        // Проверяем блокировки в календаре
        const calendarBlocks: any = await db.query(
          `SELECT blocked_date, reason
           FROM property_calendar
           WHERE property_id = ?
           AND blocked_date BETWEEN ? AND ?
           ORDER BY blocked_date`,
          [property.id, startDate, endDate]
        );

        // Объединяем данные
        const allBlockedDates = [...bookings];

        // Преобразуем блокировки календаря в формат похожий на бронирования
        calendarBlocks.forEach((block: any) => {
          allBlockedDates.push({
            check_in_date: block.blocked_date,
            check_out_date: block.blocked_date,
            booking_source: 'calendar',
            reason: block.reason
          });
        });

        property.is_available = bookings.length === 0 && calendarBlocks.length === 0;
        property.bookings = allBlockedDates;
      }

      res.json({
        success: true,
        data: { properties }
      });
    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get availability'
      });
    }
  }

  /**
   * Получение занятых дат для календаря (комбинируем обе таблицы)
   */
  async getBookedDates(req: AuthRequest, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;

      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

      // 1. Получаем данные из property_calendar (блокировки)
      const calendarBlocks: any = await db.query(
        `SELECT 
          pc.blocked_date,
          p.id as property_id,
          p.property_number,
          pt.property_name,
          pc.reason
        FROM property_calendar pc
        JOIN properties p ON pc.property_id = p.id
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        WHERE p.created_by = ? AND p.deleted_at IS NULL 
        AND pc.blocked_date BETWEEN ? AND ?`,
        [req.admin?.id, startDate, endDate]
      );

      // 2. Получаем бронирования из property_bookings
      const bookings: any = await db.query(
        `SELECT 
          pb.check_in_date,
          pb.check_out_date,
          p.id as property_id,
          p.property_number,
          pt.property_name
        FROM property_bookings pb
        JOIN properties p ON pb.property_id = p.id
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        WHERE p.created_by = ? AND p.deleted_at IS NULL 
        AND pb.status != 'cancelled'
        AND (
          (pb.check_in_date BETWEEN ? AND ?) OR
          (pb.check_out_date BETWEEN ? AND ?) OR
          (pb.check_in_date <= ? AND pb.check_out_date >= ?)
        )`,
        [req.admin?.id, startDate, endDate, startDate, endDate, startDate, endDate]
      );

      const bookedDates: any = {};

      // 3. Добавляем даты из property_calendar (блокировки)
      calendarBlocks.forEach((block: any) => {
        const dateStr = new Date(block.blocked_date).toISOString().split('T')[0];

        if (!bookedDates[dateStr]) {
          bookedDates[dateStr] = [];
        }

        // Проверяем, не добавлен ли уже этот объект на эту дату
        const alreadyAdded = bookedDates[dateStr].some(
          (item: any) => item.property_id === block.property_id
        );

        if (!alreadyAdded) {
          bookedDates[dateStr].push({
            property_id: block.property_id,
            property_number: block.property_number,
            property_name: block.property_name,
            source: 'calendar', // Помечаем источник
            reason: block.reason
          });
        }
      });

      // 4. Добавляем даты из property_bookings
      bookings.forEach((booking: any) => {
        const start = new Date(booking.check_in_date);
        const end = new Date(booking.check_out_date);

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          const dateStr = date.toISOString().split('T')[0];

          if (!bookedDates[dateStr]) {
            bookedDates[dateStr] = [];
          }

          // Проверяем, не добавлен ли уже этот объект на эту дату
          const alreadyAdded = bookedDates[dateStr].some(
            (item: any) => item.property_id === booking.property_id
          );

          if (!alreadyAdded) {
            bookedDates[dateStr].push({
              property_id: booking.property_id,
              property_number: booking.property_number,
              property_name: booking.property_name,
              source: 'booking' // Помечаем источник
            });
          }
        }
      });

      res.json({
        success: true,
        data: { bookedDates }
      });
    } catch (error) {
      console.error('Get booked dates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booked dates'
      });
    }
  }

  /**
   * Получение статистики за месяц
   */
  async getMonthlyStats(req: AuthRequest, res: Response) {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    
      // 1. Считаем бронирования из property_bookings
      const bookingsCount: any = await db.query(
        `SELECT COUNT(*) as total
         FROM property_bookings pb
         JOIN properties p ON pb.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pb.status != 'cancelled'
         AND pb.check_in_date BETWEEN ? AND ?`,
        [req.admin?.id, startDate, endDate]
      );
    
      // 2. Считаем уникальные блокировки из property_calendar
      const calendarBlocksCount: any = await db.query(
        `SELECT COUNT(DISTINCT CONCAT(pc.property_id, '-', pc.blocked_date)) as total
         FROM property_calendar pc
         JOIN properties p ON pc.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pc.blocked_date BETWEEN ? AND ?`,
        [req.admin?.id, startDate, endDate]
      );
    
      // 3. Общее количество "бронирований"
      const totalBookings = (bookingsCount[0]?.total || 0) + (calendarBlocksCount[0]?.total || 0);
    
      // 4. Выручка
      const revenueData: any = await db.query(
        `SELECT SUM(pb.total_price) as total_revenue, AVG(pb.total_price) as avg_booking_value
         FROM property_bookings pb
         JOIN properties p ON pb.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pb.status != 'cancelled'
         AND pb.check_in_date BETWEEN ? AND ?`,
        [req.admin?.id, startDate, endDate]
      );
    
      // 5. Уникальные гости
      const guestsCount: any = await db.query(
        `SELECT COUNT(DISTINCT pb.guest_email) as unique_guests
         FROM property_bookings pb
         JOIN properties p ON pb.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pb.status != 'cancelled'
         AND pb.check_in_date BETWEEN ? AND ?
         AND pb.guest_email IS NOT NULL`,
        [req.admin?.id, startDate, endDate]
      );
    
      // 6. Средняя длительность пребывания
      const avgStay: any = await db.query(
        `SELECT AVG(DATEDIFF(pb.check_out_date, pb.check_in_date)) as avg_duration
         FROM property_bookings pb
         JOIN properties p ON pb.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pb.status != 'cancelled'
         AND pb.check_in_date BETWEEN ? AND ?`,
        [req.admin?.id, startDate, endDate]
      );
    
      // 7. Расчет занятости
      const daysInMonth = new Date(year, month, 0).getDate();
      const totalProperties: any = await db.query(
        `SELECT COUNT(*) as total FROM properties WHERE created_by = ? AND deleted_at IS NULL`,
        [req.admin?.id]
      );
      
      const totalPossibleNights = daysInMonth * (totalProperties[0]?.total || 0);
      
      const bookedNightsFromBookings: any = await db.query(
        `SELECT SUM(DATEDIFF(
           LEAST(pb.check_out_date, ?),
           GREATEST(pb.check_in_date, ?)
         ) + 1) as booked_nights
         FROM property_bookings pb
         JOIN properties p ON pb.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pb.status != 'cancelled'
         AND pb.check_in_date <= ? AND pb.check_out_date >= ?`,
        [endDate, startDate, req.admin?.id, endDate, startDate]
      );
    
      const bookedNightsFromCalendar: any = await db.query(
        `SELECT COUNT(DISTINCT pc.blocked_date) as blocked_days
         FROM property_calendar pc
         JOIN properties p ON pc.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pc.blocked_date BETWEEN ? AND ?`,
        [req.admin?.id, startDate, endDate]
      );
    
      const totalBookedNights = (bookedNightsFromBookings[0]?.booked_nights || 0) + 
                                 (bookedNightsFromCalendar[0]?.blocked_days || 0);
    
      const occupancyRate = totalPossibleNights > 0 
        ? (totalBookedNights / totalPossibleNights) * 100 
        : 0;
    
      // 8. Количество забронированных объектов
      const allBookedProperties: any = await db.query(
        `SELECT COUNT(DISTINCT property_id) as total_booked
         FROM (
           SELECT pb.property_id FROM property_bookings pb
           JOIN properties p ON pb.property_id = p.id
           WHERE p.created_by = ? AND p.deleted_at IS NULL
           AND pb.status != 'cancelled'
           AND pb.check_in_date BETWEEN ? AND ?
           UNION
           SELECT pc.property_id FROM property_calendar pc
           JOIN properties p ON pc.property_id = p.id
           WHERE p.created_by = ? AND p.deleted_at IS NULL
           AND pc.blocked_date BETWEEN ? AND ?
         ) as combined`,
        [req.admin?.id, startDate, endDate, req.admin?.id, startDate, endDate]
      );
    
      // 9. Топ объектов (ИСПРАВЛЕНО - добавлены поля в GROUP BY)
      const topProperties: any = await db.query(
        `SELECT 
           property_id,
           MAX(property_number) as property_number,
           MAX(property_name) as property_name,
           SUM(bookings_count) as total_bookings,
           SUM(total_revenue) as total_revenue
         FROM (
           SELECT 
             p.id as property_id,
             p.property_number,
             pt.property_name,
             COUNT(pb.id) as bookings_count,
             SUM(pb.total_price) as total_revenue
           FROM property_bookings pb
           JOIN properties p ON pb.property_id = p.id
           LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
           WHERE p.created_by = ? AND p.deleted_at IS NULL
           AND pb.status != 'cancelled'
           AND pb.check_in_date BETWEEN ? AND ?
           GROUP BY p.id, p.property_number, pt.property_name
           UNION ALL
           SELECT 
             p.id as property_id,
             p.property_number,
             pt.property_name,
             COUNT(DISTINCT pc.blocked_date) as bookings_count,
             0 as total_revenue
           FROM property_calendar pc
           JOIN properties p ON pc.property_id = p.id
           LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
           WHERE p.created_by = ? AND p.deleted_at IS NULL
           AND pc.blocked_date BETWEEN ? AND ?
           GROUP BY p.id, p.property_number, pt.property_name
         ) as combined
         GROUP BY property_id
         ORDER BY total_bookings DESC, total_revenue DESC
         LIMIT 10`,
        [req.admin?.id, startDate, endDate, req.admin?.id, startDate, endDate]
      );
    
      // 10. Источники бронирований
      const bookingSources: any = await db.query(
        `SELECT 
           source,
           COUNT(*) as count,
           CASE WHEN ? > 0 THEN (COUNT(*) * 100.0 / ?) ELSE 0 END as percentage
         FROM (
           SELECT pb.booking_source as source
           FROM property_bookings pb
           JOIN properties p ON pb.property_id = p.id
           WHERE p.created_by = ? AND p.deleted_at IS NULL
           AND pb.status != 'cancelled'
           AND pb.check_in_date BETWEEN ? AND ?
           UNION ALL
           SELECT 'calendar' as source
           FROM property_calendar pc
           JOIN properties p ON pc.property_id = p.id
           WHERE p.created_by = ? AND p.deleted_at IS NULL
           AND pc.blocked_date BETWEEN ? AND ?
         ) as combined_sources
         GROUP BY source
         ORDER BY count DESC`,
        [totalBookings, totalBookings, req.admin?.id, startDate, endDate, req.admin?.id, startDate, endDate]
      );
    
      // 11. Тренды по сравнению с прошлым месяцем
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevStartDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
      const prevEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-31`;
    
      const prevBookingsCount: any = await db.query(
        `SELECT COUNT(*) as total
         FROM property_bookings pb
         JOIN properties p ON pb.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pb.status != 'cancelled'
         AND pb.check_in_date BETWEEN ? AND ?`,
        [req.admin?.id, prevStartDate, prevEndDate]
      );
    
      const prevCalendarBlocksCount: any = await db.query(
        `SELECT COUNT(DISTINCT CONCAT(pc.property_id, '-', pc.blocked_date)) as total
         FROM property_calendar pc
         JOIN properties p ON pc.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pc.blocked_date BETWEEN ? AND ?`,
        [req.admin?.id, prevStartDate, prevEndDate]
      );
    
      const prevTotalBookings = (prevBookingsCount[0]?.total || 0) + (prevCalendarBlocksCount[0]?.total || 0);
    
      const prevRevenueData: any = await db.query(
        `SELECT SUM(pb.total_price) as total_revenue
         FROM property_bookings pb
         JOIN properties p ON pb.property_id = p.id
         WHERE p.created_by = ? AND p.deleted_at IS NULL
         AND pb.status != 'cancelled'
         AND pb.check_in_date BETWEEN ? AND ?`,
        [req.admin?.id, prevStartDate, prevEndDate]
      );
    
      const bookingsTrend = prevTotalBookings > 0 
        ? Math.round(((totalBookings - prevTotalBookings) / prevTotalBookings) * 100) 
        : 0;
    
      const currentRevenue = revenueData[0]?.total_revenue || 0;
      const prevRevenue = prevRevenueData[0]?.total_revenue || 0;
      const revenueTrend = prevRevenue > 0 
        ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) 
        : 0;
    
      const stats = {
        total_bookings: totalBookings,
        occupancy_rate: Math.round(occupancyRate * 100) / 100,
        total_revenue: currentRevenue,
        unique_guests: guestsCount[0]?.unique_guests || 0,
        avg_booking_value: revenueData[0]?.avg_booking_value || 0,
        avg_stay_duration: avgStay[0]?.avg_duration || 0,
        booked_properties: allBookedProperties[0]?.total_booked || 0,
        booked_nights: totalBookedNights,
        available_nights: totalPossibleNights - totalBookedNights,
        top_properties: topProperties,
        booking_sources: bookingSources,
        trend: {
          bookings: bookingsTrend,
          revenue: revenueTrend,
          occupancy: 0,
          guests: 0
        }
      };
    
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get monthly stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get monthly stats'
      });
    }
  }

  /**
   * Экспорт бронирований
   */
  async exportBookings(req: AuthRequest, res: Response) {
    try {
      const format = req.query.format as string || 'xlsx';
      const year = req.query.year ? parseInt(req.query.year as string) : null;
      const month = req.query.month ? parseInt(req.query.month as string) : null;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;

      let query = `
        SELECT 
          pb.*,
          p.property_number,
          pt.property_name,
          p.property_type,
          p.region
        FROM property_bookings pb
        JOIN properties p ON pb.property_id = p.id
        LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language_code = 'ru'
        WHERE p.created_by = ? AND p.deleted_at IS NULL
      `;

      const params: any[] = [req.admin?.id];

      if (year && month) {
        const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
        const monthEnd = `${year}-${String(month).padStart(2, '0')}-31`;
        query += ' AND pb.check_in_date BETWEEN ? AND ?';
        params.push(monthStart, monthEnd);
      } else if (startDate && endDate) {
        query += ' AND pb.check_in_date BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      query += ' ORDER BY pb.check_in_date DESC';

      const bookings: any = await db.query(query, params);

      if (format === 'xlsx') {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bookings');

        worksheet.columns = [
          { header: 'ID', key: 'id', width: 10 },
          { header: 'Property Number', key: 'property_number', width: 15 },
          { header: 'Property Name', key: 'property_name', width: 30 },
          { header: 'Type', key: 'property_type', width: 15 },
          { header: 'Region', key: 'region', width: 15 },
          { header: 'Check-in Date', key: 'check_in_date', width: 15 },
          { header: 'Check-out Date', key: 'check_out_date', width: 15 },
          { header: 'Nights', key: 'nights', width: 10 },
          { header: 'Guest Name', key: 'guest_name', width: 20 },
          { header: 'Guest Email', key: 'guest_email', width: 25 },
          { header: 'Guest Phone', key: 'guest_phone', width: 20 },
          { header: 'Source', key: 'booking_source', width: 15 },
          { header: 'Price per Night', key: 'price_per_night', width: 15 },
          { header: 'Total Price', key: 'total_price', width: 15 },
          { header: 'Adults', key: 'adults_num', width: 10 },
          { header: 'Children', key: 'children_num', width: 10 },
          { header: 'Status', key: 'status', width: 12 },
          { header: 'Notes', key: 'notes', width: 30 }
        ];

        worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };

        bookings.forEach((booking: any) => {
          const checkIn = new Date(booking.check_in_date);
          const checkOut = new Date(booking.check_out_date);
          const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

          worksheet.addRow({
            id: booking.id,
            property_number: booking.property_number,
            property_name: booking.property_name,
            property_type: booking.property_type,
            region: booking.region,
            check_in_date: checkIn.toLocaleDateString('en-US'),
            check_out_date: checkOut.toLocaleDateString('en-US'),
            nights: nights,
            guest_name: booking.guest_name || '',
            guest_email: booking.guest_email || '',
            guest_phone: booking.guest_phone || '',
            booking_source: booking.booking_source || 'Manual',
            price_per_night: booking.price_per_night || 0,
            total_price: booking.total_price || 0,
            adults_num: booking.adults_num || 0,
            children_num: booking.children_num || 0,
            status: booking.status || 'confirmed',
            notes: booking.notes || ''
          });
        });

        worksheet.columns.forEach(column => {
          if (column.eachCell) {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, (cell) => {
              const columnLength = cell.value ? cell.value.toString().length : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
          }
        });

        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=bookings_${new Date().toISOString().split('T')[0]}.xlsx`);
        res.send(buffer);

      } else {
        const fields = [
          { label: 'ID', value: 'id' },
          { label: 'Property Number', value: 'property_number' },
          { label: 'Property Name', value: 'property_name' },
          { label: 'Type', value: 'property_type' },
          { label: 'Region', value: 'region' },
          { label: 'Check-in Date', value: 'check_in_date' },
          { label: 'Check-out Date', value: 'check_out_date' },
          { label: 'Guest Name', value: 'guest_name' },
          { label: 'Guest Email', value: 'guest_email' },
          { label: 'Guest Phone', value: 'guest_phone' },
          { label: 'Source', value: 'booking_source' },
          { label: 'Price per Night', value: 'price_per_night' },
          { label: 'Total Price', value: 'total_price' },
          { label: 'Adults', value: 'adults_num' },
          { label: 'Children', value: 'children_num' },
          { label: 'Status', value: 'status' },
          { label: 'Notes', value: 'notes' }
        ];

        const parser = new Parser({ fields });
        const csv = parser.parse(bookings);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename=bookings_${new Date().toISOString().split('T')[0]}.csv`);
        res.send('\uFEFF' + csv);
      }

    } catch (error) {
      console.error('Export bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export bookings'
      });
    }
  }
}

export default new BookingController();