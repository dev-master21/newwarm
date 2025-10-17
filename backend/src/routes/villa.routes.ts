import { Router } from 'express';
import villaController from '../controllers/villa.controller';

const router = Router();

router.get('/', villaController.getVillas);
router.get('/featured', villaController.getFeaturedVillas);
router.get('/search', villaController.searchVillas);
router.get('/tags', villaController.getTags);
router.get('/testimonials', villaController.getTestimonials);
router.get('/:slug', villaController.getVilla);
router.get('/:id/availability', villaController.getAvailability);

export default router;