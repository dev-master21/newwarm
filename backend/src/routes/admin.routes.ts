// backend/src/routes/admin.routes.ts
import { Router } from 'express';
import propertyController from '../controllers/property.controller';
import bookingController from '../controllers/booking.controller';
import vrPanoramaController from '../controllers/vrPanorama.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { uploadPropertyPhotos, uploadFloorPlan, uploadVRPanorama } from '../config/multer.config';

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

// Photos management
router.post(
  '/properties/:propertyId/photos',
  uploadPropertyPhotos.array('photos', 50),
  propertyController.uploadPhotos
);

router.put('/properties/:propertyId/photos/order', propertyController.updatePhotosOrder);
router.patch('/photos/:photoId/category', propertyController.updatePhotoCategory);
router.patch('/photos/:photoId/primary', propertyController.setPrimaryPhoto);
router.delete('/photos/:photoId', propertyController.deletePhoto);

// Calendar
router.post('/calendar/validate', propertyController.validateCalendar);

// ==================== VR PANORAMA ROUTES ====================

// Get all VR panoramas for a property
router.get('/properties/:propertyId/vr-panoramas', vrPanoramaController.getPropertyPanoramas);

// Create new VR panorama with 6 images
router.post(
  '/properties/:propertyId/vr-panoramas',
  uploadVRPanorama.fields([
    { name: 'front', maxCount: 1 },
    { name: 'back', maxCount: 1 },
    { name: 'left', maxCount: 1 },
    { name: 'right', maxCount: 1 },
    { name: 'top', maxCount: 1 },
    { name: 'bottom', maxCount: 1 }
  ]),
  vrPanoramaController.createPanorama
);

// Update panoramas order
router.put('/properties/:propertyId/vr-panoramas/order', vrPanoramaController.updatePanoramasOrder);

// Delete VR panorama
router.delete('/vr-panoramas/:panoramaId', vrPanoramaController.deletePanorama);

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