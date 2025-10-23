// backend/src/routes/property.routes.ts
import { Router } from 'express';
import propertyController from '../controllers/property.controller';

const router = Router();

// Публичный endpoint для карты (без аутентификации)
router.get('/map', propertyController.getPropertiesForMap.bind(propertyController));

// НОВЫЕ ПУБЛИЧНЫЕ ENDPOINTS для страницы объекта
router.get('/:propertyId', propertyController.getPublicPropertyDetails.bind(propertyController));
router.post('/:propertyId/calculate-price', propertyController.calculatePrice.bind(propertyController));
router.get('/:propertyId/alternatives', propertyController.findAlternatives.bind(propertyController));
router.get('/:propertyId/tomorrow-price', propertyController.getTomorrowPrice.bind(propertyController));

export default router;