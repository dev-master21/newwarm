// backend/src/routes/property.routes.ts
import { Router } from 'express';
import propertyController from '../controllers/property.controller';

const router = Router();

// Публичный endpoint для карты (без аутентификации)
router.get('/map', propertyController.getPropertiesForMap.bind(propertyController));

export default router;