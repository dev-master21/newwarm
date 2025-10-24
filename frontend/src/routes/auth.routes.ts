import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
const jwt = require('jsonwebtoken'); // Используем require вместо import
import db from '../config/database';
import { validateRequest } from '../middlewares/validation.middleware';
import { config } from '../config/config';

const router = Router();

router.post('/admin/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const results: any = await db.query(
        'SELECT * FROM admins WHERE email = ? AND is_active = true',
        [email]
      );
      
      const admin = results[0];

      if (!admin || !await bcrypt.compare(password, admin.password)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Используем callback стиль для избежания проблем с типами
      const token = jwt.sign(
        { 
          id: admin.id, 
          email: admin.email,
          role: admin.role 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      // Update last login
      await db.query(
        'UPDATE admins SET last_login = NOW() WHERE id = ?',
        [admin.id]
      );

      res.json({
        success: true,
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }
);

export default router;