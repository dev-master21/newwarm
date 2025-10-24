// backend/src/routes/index.ts
import { Router } from 'express';
import villaRoutes from './villa.routes';
import bookingRoutes from './booking.routes';
import authRoutes from './auth.routes';
import contactRoutes from './contact.routes';
import configRoutes from './config.routes';
import adminRoutes from './admin.routes';
import mapsRoutes from './maps.routes';
import propertyRoutes from './property.routes';
import thumbnailRoutes from './thumbnail.routes'; // Добавлено

const router = Router();

// Public routes
router.use('/villas', villaRoutes);
router.use('/bookings', bookingRoutes);
router.use('/auth', authRoutes);
router.use('/maps', mapsRoutes);
router.use('/contact', contactRoutes);
router.use('/config', configRoutes);
router.use('/properties', propertyRoutes);

// Admin routes
router.use('/admin', adminRoutes);
router.use('/thumbnails', thumbnailRoutes); // Добавлено

export default router;