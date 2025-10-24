import { Router } from 'express';
import contactController from '../controllers/contact.controller';

const router = Router();

router.post('/', contactController.submitContact);
router.post('/join-club', contactController.joinClub);

export default router;