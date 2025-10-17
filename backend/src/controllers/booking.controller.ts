import { Request, Response } from 'express';
import db from '../config/database';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export class BookingController {
  // Create booking
  async createBooking(req: Request, res: Response) {
    try {
      const bookingData = req.body;

      // Validate required fields
      const requiredFields = ['first_name', 'last_name', 'email', 'check_in', 'check_out', 'adults_num'];
      for (const field of requiredFields) {
        if (!bookingData[field]) {
          return res.status(400).json({
            success: false,
            message: `${field} is required`
          });
        }
      }

      // Check villa availability if villa_id provided
      if (bookingData.villa_id) {
        const conflicts = await db.query(`
          SELECT * FROM reservations
          WHERE villa_id = ? AND (
            (start_date <= ? AND end_date > ?) OR
            (start_date < ? AND end_date >= ?) OR
            (start_date >= ? AND end_date <= ?)
          )
        `, [
          bookingData.villa_id,
          bookingData.check_in, bookingData.check_in,
          bookingData.check_out, bookingData.check_out,
          bookingData.check_in, bookingData.check_out
        ]);

        if (conflicts.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Villa is not available for selected dates'
          });
        }
      }

      // Insert booking
      const [result]: any = await db.query(`
        INSERT INTO bookings (
          villa_id, first_name, last_name, email, phone_number, country,
          check_in, check_out, flexibility_dates,
          adults_num, children_num, children_ages, bedrooms_required,
          budget_per_night, purpose_of_stay, comments,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        bookingData.villa_id || null,
        bookingData.first_name,
        bookingData.last_name,
        bookingData.email,
        bookingData.phone_number || null,
        bookingData.country || null,
        bookingData.check_in,
        bookingData.check_out,
        bookingData.flexibility_dates || null,
        bookingData.adults_num,
        bookingData.children_num || 0,
        bookingData.children_ages || null,
        bookingData.bedrooms_required || null,
        bookingData.budget_per_night || null,
        bookingData.purpose_of_stay || null,
        bookingData.comments || null,
        'PENDING'
      ]);

      const bookingId = result.insertId;

      // Get booking with villa details for email
      const [booking] = await db.query(`
        SELECT b.*, v.name as villa_name
        FROM bookings b
        LEFT JOIN villas v ON b.villa_id = v.id
        WHERE b.id = ?
      `, [bookingId]);

      // Send confirmation emails
      await emailService.sendBookingConfirmation(booking);
      await emailService.sendAdminNotification(booking, 'booking');

      res.status(201).json({
        success: true,
        message: 'Booking request submitted successfully',
        data: { bookingId }
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating booking'
      });
    }
  }

  // Check availability and calculate price
  async checkAvailability(req: Request, res: Response) {
    try {
      const { villa_id, check_in, check_out } = req.query;

      if (!villa_id || !check_in || !check_out) {
        return res.status(400).json({
          success: false,
          message: 'villa_id, check_in and check_out are required'
        });
      }

      // Check for conflicting reservations
      const conflicts = await db.query(`
        SELECT * FROM reservations
        WHERE villa_id = ? AND (
          (start_date <= ? AND end_date > ?) OR
          (start_date < ? AND end_date >= ?)
        )
      `, [
        villa_id,
        check_in, check_in,
        check_out, check_out
      ]);

      const isAvailable = conflicts.length === 0;

      // Calculate price
      let totalPrice = 0;
      let pricePerNight = 0;

      if (isAvailable) {
        const [villa] = await db.query(`
          SELECT price FROM villas WHERE id = ?
        `, [villa_id]);

        if (villa) {
          const checkInDate = new Date(check_in as string);
          const checkOutDate = new Date(check_out as string);
          const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Get price plans for the period
          const pricePlans = await db.query(`
            SELECT * FROM price_plans
            WHERE villa_id = ? AND start_date <= ? AND end_date >= ?
            ORDER BY start_date
          `, [villa_id, check_out, check_in]);

          // Calculate price for each night
          for (let i = 0; i < nights; i++) {
            const currentDate = new Date(checkInDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            const applicablePlan = pricePlans.find((plan: any) => 
              dateStr >= plan.start_date && dateStr <= plan.end_date
            );

            const nightPrice = applicablePlan ? applicablePlan.price : villa.price;
            totalPrice += nightPrice;
          }

          pricePerNight = totalPrice / nights;
        }
      }

      res.json({
        success: true,
        data: {
          available: isAvailable,
          totalPrice,
          pricePerNight
        }
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking availability'
      });
    }
  }

  // Get booking by ID
  async getBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [booking] = await db.query(`
        SELECT b.*, v.name as villa_name, v.cover as villa_cover
        FROM bookings b
        LEFT JOIN villas v ON b.villa_id = v.id
        WHERE b.id = ?
      `, [id]);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching booking'
      });
    }
  }
}

export default new BookingController();