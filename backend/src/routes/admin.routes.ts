import { Router } from 'express';

const router = Router();

// Здесь будут админские роуты
router.get('/dashboard', async (req, res) => {
  res.json({
    success: true,
    data: {
      message: 'Admin dashboard'
    }
  });
});

export default router;