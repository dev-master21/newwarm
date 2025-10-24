import { Request, Response } from 'express';
import db from '../config/database';
import { EmailService } from '../services/email.service';

const emailService = new EmailService();

export class ContactController {
  // Submit contact form
  async submitContact(req: Request, res: Response) {
    try {
      const { email, country, travel_date_from, travel_date_to, message } = req.body;

      // Validate required fields
      if (!email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Email and message are required'
        });
      }

      // Insert contact
      const [result]: any = await db.query(`
        INSERT INTO contacts (
          email, country, travel_date_from, travel_date_to, message,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'NEW', NOW(), NOW())
      `, [
        email,
        country || null,
        travel_date_from || null,
        travel_date_to || null,
        message
      ]);

      // Send notification email to admin
      await emailService.sendAdminNotification({
        id: result.insertId,
        email,
        country,
        travel_date_from,
        travel_date_to,
        message
      }, 'contact');

      res.json({
        success: true,
        message: 'Contact form submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting contact:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting contact form'
      });
    }
  }

  // Join club
  async joinClub(req: Request, res: Response) {
    try {
      const { email, first_name, last_name, country } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Check if already exists
      const [existing] = await db.query(
        'SELECT id FROM club_members WHERE email = ?',
        [email]
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // Insert new member
      await db.query(`
        INSERT INTO club_members (
          email, first_name, last_name, country,
          is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, true, NOW(), NOW())
      `, [
        email,
        first_name || null,
        last_name || null,
        country || null
      ]);

      res.json({
        success: true,
        message: 'Successfully joined the club'
      });
    } catch (error) {
      console.error('Error joining club:', error);
      res.status(500).json({
        success: false,
        message: 'Error joining club'
      });
    }
  }
}

export default new ContactController();