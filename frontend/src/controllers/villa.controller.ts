import { Request, Response } from 'express';
import { VillaModel } from '../models/villa.model';
import db from '../config/database';

const villaModel = new VillaModel();

export class VillaController {
  // Get all villas with filters
  async getVillas(req: Request, res: Response) {
    try {
      const { data: villas, total } = await villaModel.search(req.query);
      
      const page = parseInt(req.query.page as string || '1');
      const limit = parseInt(req.query.limit as string || '12');

      res.json({
        success: true,
        data: villas,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching villas:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching villas'
      });
    }
  }

  // Get single villa
  async getVilla(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      
      // Try to find by slug first, then by ID
      let villa = await villaModel.findBySlug(slug);
      
      if (!villa && !isNaN(Number(slug))) {
        villa = await villaModel.findWithDetails(parseInt(slug));
      }

      if (!villa || villa.status !== 'ACTIVE') {
        return res.status(404).json({
          success: false,
          message: 'Villa not found'
        });
      }

      // Increment view count
      await villaModel.incrementViewCount(villa.id);

      res.json({
        success: true,
        data: villa
      });
    } catch (error) {
      console.error('Error fetching villa:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching villa'
      });
    }
  }

  // Get featured villas
  async getFeaturedVillas(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string || '6');
      const villas = await villaModel.getFeatured(limit);

      res.json({
        success: true,
        data: villas
      });
    } catch (error) {
      console.error('Error fetching featured villas:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured villas'
      });
    }
  }

  // Search villas (autocomplete)
  async searchVillas(req: Request, res: Response) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query required'
        });
      }

      const villas = await db.query(`
        SELECT id, name, slug, city, cover, price, bedrooms_num
        FROM villas
        WHERE status = 'ACTIVE' AND (
          name LIKE ? OR
          description LIKE ? OR
          city LIKE ?
        )
        LIMIT 10
      `, [`%${q}%`, `%${q}%`, `%${q}%`]);

      res.json({
        success: true,
        data: villas
      });
    } catch (error) {
      console.error('Error searching villas:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching villas'
      });
    }
  }

  // Get villa availability calendar
  async getAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { start_date, end_date } = req.query;

      const reservations = await db.query(`
        SELECT start_date, end_date, source
        FROM reservations
        WHERE villa_id = ? AND end_date >= ? AND start_date <= ?
        ORDER BY start_date
      `, [id, start_date || new Date(), end_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)]);

      res.json({
        success: true,
        data: reservations
      });
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching availability'
      });
    }
  }

  // Get villa tags
  async getTags(req: Request, res: Response) {
    try {
      const tags = await db.query(`
        SELECT * FROM villa_tags
        ORDER BY type, sort DESC
      `);

      res.json({
        success: true,
        data: tags
      });
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching tags'
      });
    }
  }

  // Get testimonials
  async getTestimonials(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string || '6');
      
      const testimonials = await db.query(`
        SELECT * FROM testimonials
        WHERE is_visible = true
        ORDER BY sort DESC, created_at DESC
        LIMIT ?
      `, [limit]);

      res.json({
        success: true,
        data: testimonials
      });
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching testimonials'
      });
    }
  }
}

export default new VillaController();