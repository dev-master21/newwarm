// backend/src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/database';
import { config } from '../config/config';

interface AdminPayload {
  id: number;
  username: string;
  email: string;
  role: string;
}

class AuthController {
  /**
   * Авторизация админа
   */
  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Валидация
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
      }

      // Поиск админа
      const admins: any = await db.query(
        'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
        [username]
      );

      if (!admins || admins.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const admin = admins[0];

      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Обновляем время последнего входа
      await db.query(
        'UPDATE admins SET last_login = NOW() WHERE id = ?',
        [admin.id]
      );

      // Генерируем JWT токен - РЕШЕНИЕ С TYPE ASSERTION
      const payload: AdminPayload = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      };

      const token = jwt.sign(
        payload,
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
      );

      // Отправляем ответ
      res.json({
        success: true,
        data: {
          token,
          admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email,
            firstName: admin.first_name,
            lastName: admin.last_name,
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

  /**
   * Проверка токена
   */
  async verifyToken(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, config.jwt.secret) as AdminPayload;

        // Получаем актуальные данные админа
        const admins: any = await db.query(
          'SELECT id, username, email, first_name, last_name, role FROM admins WHERE id = ? AND is_active = TRUE',
          [decoded.id]
        );

        if (!admins || admins.length === 0) {
          return res.status(401).json({
            success: false,
            message: 'Invalid token'
          });
        }

        const admin = admins[0];

        res.json({
          success: true,
          data: {
            admin: {
              id: admin.id,
              username: admin.username,
              email: admin.email,
              firstName: admin.first_name,
              lastName: admin.last_name,
              role: admin.role
            }
          }
        });
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  }

  /**
   * Смена пароля
   */
  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminId = (req as any).admin?.id;

      if (!adminId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      // Валидация
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      // Получаем текущего админа
      const admins: any = await db.query(
        'SELECT * FROM admins WHERE id = ?',
        [adminId]
      );

      if (!admins || admins.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      const admin = admins[0];

      // Проверяем текущий пароль
      const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Хешируем новый пароль
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Обновляем пароль
      await db.query(
        'UPDATE admins SET password = ? WHERE id = ?',
        [hashedPassword, adminId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
}

export default new AuthController();