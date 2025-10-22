// backend/src/routes/maps.routes.ts
import { Router } from 'express';
import mapsController from '../controllers/maps.controller';

const router = Router();

router.post('/expand-url', mapsController.expandUrl);

export default router;