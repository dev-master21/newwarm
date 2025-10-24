import nodemailer from 'nodemailer';
import { config } from '../config/config';

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
  }

  async sendBookingConfirmation(booking: any) {
    const mailOptions = {
      from: config.email.from,
      to: booking.email,
      subject: 'Booking Confirmation - WARM+',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
            .details { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Booking Confirmation</h1>
            <p>Dear ${booking.first_name} ${booking.last_name},</p>
            <p>Thank you for your booking request. We have received your inquiry and will get back to you within 24 hours.</p>
            
            <div class="details">
              <h2>Booking Details:</h2>
              <ul>
                <li><strong>Check-in:</strong> ${new Date(booking.check_in).toLocaleDateString()}</li>
                <li><strong>Check-out:</strong> ${new Date(booking.check_out).toLocaleDateString()}</li>
                <li><strong>Guests:</strong> ${booking.adults_num} adults, ${booking.children_num || 0} children</li>
                ${booking.villa_name ? `<li><strong>Villa:</strong> ${booking.villa_name}</li>` : ''}
              </ul>
            </div>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <div class="footer">
              <p>Best regards,<br><strong>WARM+ Team</strong></p>
              <p>📧 info@warmphuket.ru | 📱 +66 123 456 789</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendAdminNotification(data: any, type: string) {
    let subject = '';
    let html = '';

    if (type === 'booking') {
      subject = 'New Booking Request';
      html = `
        <h2>New Booking Request</h2>
        <h3>Customer Information:</h3>
        <ul>
          <li>Name: ${data.first_name} ${data.last_name}</li>
          <li>Email: ${data.email}</li>
          <li>Phone: ${data.phone_number || 'Not provided'}</li>
          <li>Country: ${data.country || 'Not provided'}</li>
        </ul>
        <h3>Booking Details:</h3>
        <ul>
          <li>Check-in: ${new Date(data.check_in).toLocaleDateString()}</li>
          <li>Check-out: ${new Date(data.check_out).toLocaleDateString()}</li>
          <li>Adults: ${data.adults_num}</li>
          <li>Children: ${data.children_num || 0}</li>
          ${data.villa_name ? `<li>Villa: ${data.villa_name}</li>` : ''}
        </ul>
        ${data.comments ? `<p><strong>Comments:</strong> ${data.comments}</p>` : ''}
      `;
    } else if (type === 'contact') {
      subject = 'New Contact Form Submission';
      html = `
        <h2>New Contact Form Submission</h2>
        <ul>
          <li>Email: ${data.email}</li>
          <li>Country: ${data.country || 'Not provided'}</li>
        </ul>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `;
    }

    const mailOptions = {
      from: config.email.from,
      to: process.env.ADMIN_EMAIL || 'admin@warmphuket.ru',
      subject,
      html
    };

    await this.transporter.sendMail(mailOptions);
  }
}