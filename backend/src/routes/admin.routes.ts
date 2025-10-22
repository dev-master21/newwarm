// backend/src/routes/admin.routes.ts
import { Router } from 'express';
import propertyController from '../controllers/property.controller';
import bookingController from '../controllers/booking.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { uploadPropertyPhotos, uploadFloorPlan } from '../config/multer.config';

const router = Router();

// Apply authentication middleware to all admin routes
router.use(authenticateAdmin);

// ==================== PROPERTY ROUTES ====================

// Property management
router.get('/properties', propertyController.getAdminProperties);
router.get('/properties/:propertyId', propertyController.getPropertyById);
router.post('/properties', propertyController.createProperty);
router.put('/properties/:propertyId', propertyController.updateProperty);
router.delete('/properties/:propertyId', propertyController.deleteProperty);
router.patch('/properties/:propertyId/visibility', propertyController.togglePropertyVisibility);

// Seasonal Pricing
router.get('/properties/:propertyId/pricing', propertyController.getSeasonalPricing);
router.put('/properties/:propertyId/pricing', propertyController.saveSeasonalPricing);

// File uploads
router.post(
  '/properties/:propertyId/photos',
  uploadPropertyPhotos.array('photos', 50),
  propertyController.uploadPhotos
);

router.post(
  '/properties/:propertyId/floor-plan',
  uploadFloorPlan.single('floorPlan'),
  propertyController.uploadFloorPlan
);

router.delete('/photos/:photoId', propertyController.deletePhoto);

// Calendar
router.post('/calendar/validate', propertyController.validateCalendar);

// ==================== BOOKING ROUTES ====================

// Get all bookings for admin
router.get('/bookings', bookingController.getAdminBookings);

// Get properties availability for a period
router.get('/bookings/availability', bookingController.getPropertiesAvailability);

// Get booked dates for calendar view
router.get('/bookings/booked-dates', bookingController.getBookedDates);

// Get monthly statistics
router.get('/bookings/stats/monthly', bookingController.getMonthlyStats);

// Export bookings
router.get('/bookings/export', bookingController.exportBookings);

export default router;