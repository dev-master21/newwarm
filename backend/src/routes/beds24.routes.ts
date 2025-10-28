// backend/src/routes/beds24.routes.ts
import { Router } from 'express';
import beds24Controller from '../controllers/beds24.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Применяем middleware аутентификации ко всем routes
router.use(authenticateAdmin);

// Синхронизация всех объектов
router.post('/sync-all', beds24Controller.syncAllProperties);

// Синхронизация конкретного объекта
router.post('/sync/:propertyId', beds24Controller.syncProperty);

export default router;