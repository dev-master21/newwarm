// backend/src/routes/booking.routes.ts
import { Router } from 'express';
import bookingController from '../controllers/booking.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

// Validation rules for creating a booking
const bookingValidation = [
  body('property_id').isInt().withMessage('Valid property ID is required'),
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('check_in').isISO8601().withMessage('Valid check-in date required'),
  body('check_out').isISO8601().withMessage('Valid check-out date required'),
  body('adults_num').isInt({ min: 1 }).withMessage('At least 1 adult required'),
  body('children_num').optional().isInt({ min: 0 }),
  body('total_price').optional().isFloat({ min: 0 }),
  body('notes').optional().trim()
];

// Public routes
router.post('/', bookingValidation, validateRequest, bookingController.createBooking);
router.get('/availability', bookingController.checkAvailability);
router.get('/:id', bookingController.getBooking);

export default router;