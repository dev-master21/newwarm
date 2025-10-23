// backend/src/routes/thumbnail.routes.ts
import { Router } from 'express'
import { thumbnailController } from '../controllers/thumbnail.controller'
import { authenticateAdmin } from '../middlewares/auth.middleware';

const router = Router()

// Все роуты требуют аутентификации и прав администратора
router.use(authenticateAdmin)

// POST /api/thumbnails/full-sync - Полная синхронизация
router.post('/full-sync', thumbnailController.fullSync.bind(thumbnailController))

// POST /api/thumbnails/quick-sync - Быстрая синхронизация
router.post('/quick-sync', thumbnailController.quickSync.bind(thumbnailController))

// POST /api/thumbnails/generate - Генерация для конкретного файла
router.post('/generate', thumbnailController.generateForFile.bind(thumbnailController))

// POST /api/thumbnails/cleanup - Очистка неиспользуемых thumbnails
router.post('/cleanup', thumbnailController.cleanup.bind(thumbnailController))

export default router