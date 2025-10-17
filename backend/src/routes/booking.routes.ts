import { Router } from 'express';
import bookingController from '../controllers/booking.controller';
import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware';

const router = Router();

const bookingValidation = [
  body('first_name').notEmpty().withMessage('First name is required'),
  body('last_name').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('check_in').isISO8601().withMessage('Valid check-in date required'),
  body('check_out').isISO8601().withMessage('Valid check-out date required'),
  body('adults_num').isInt({ min: 1 }).withMessage('Number of adults required'),
];

router.post('/', bookingValidation, validateRequest, bookingController.createBooking);
router.get('/availability', bookingController.checkAvailability);
router.get('/:id', bookingController.getBooking);

export default router;