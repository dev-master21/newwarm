// backend/src/routes/admin.routes.ts
import { Router } from 'express';
import propertyController from '../controllers/property.controller';
import { authenticateAdmin } from '../middlewares/auth.middleware';
import { uploadPropertyPhotos, uploadFloorPlan } from '../config/multer.config';

const router = Router();

// Все роуты требуют аутентификации
router.use(authenticateAdmin);

// Управление объектами
router.get('/properties', propertyController.getAdminProperties);
router.get('/properties/:propertyId', propertyController.getPropertyDetails);
router.post('/properties', propertyController.createProperty);
router.put('/properties/:propertyId', propertyController.updateProperty);
router.delete('/properties/:propertyId', propertyController.deleteProperty);

// Загрузка файлов
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

// Календарь
router.post('/calendar/validate', propertyController.validateCalendar);

export default router;