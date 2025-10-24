import { BaseModel } from './base.model';
import db from '../config/database';

export class VillaModel extends BaseModel {
  constructor() {
    super('villas');
    this.fillable = [
      'name', 'slug', 'description', 'city', 'location', 'ical_url',
      'price', 'original_price', 'currency',
      'bedrooms_num', 'bathrooms_num', 'adults_num', 'children_num', 'area',
      'cover', 'banner_images', 'gallery_images', 'price_image', 'blueprint_image', 'video_720_url',
      'amenities', 'features', 'hardware', 'selling_points',
      'detail_banner_title', 'detail_banner_desc',
      'status', 'sort', 'view_count'
    ];
  }

  async findWithDetails(id: number | string): Promise<any> {
    const villa = await this.findById(id);
    if (!villa) return null;

    // Get tags
    const tags = await db.query(`
      SELECT t.* FROM villa_tags t
      JOIN villa_tag_relations vtr ON t.id = vtr.tag_id
      WHERE vtr.villa_id = ?
    `, [villa.id]);

    // Get quick facts
    const quickFacts = await db.query(`
      SELECT * FROM quick_facts
      WHERE villa_id = ?
      ORDER BY sort DESC
    `, [villa.id]);

    // Get reviews
    const reviews = await db.query(`
      SELECT * FROM reviews
      WHERE villa_id = ? AND is_visible = true
      ORDER BY sort DESC
    `, [villa.id]);

    // Get price plans
    const pricePlans = await db.query(`
      SELECT * FROM price_plans
      WHERE villa_id = ? AND end_date >= CURDATE()
      ORDER BY start_date ASC
    `, [villa.id]);

    // Get reservations
    const reservations = await db.query(`
      SELECT * FROM reservations
      WHERE villa_id = ? AND end_date >= CURDATE()
    `, [villa.id]);

    return {
      ...villa,
      tags,
      quickFacts,
      reviews,
      pricePlans,
      reservations
    };
  }

  async findBySlug(slug: string): Promise<any> {
    const villa = await this.findOne({ where: { slug } });
    if (!villa) return null;
    
    return await this.findWithDetails(villa.id);
  }

  async search(params: any): Promise<{ data: any[], total: number }> {
    let whereConditions = ['status = "ACTIVE"'];
    let queryParams: any[] = [];

    // Build search conditions
    if (params.city) {
      whereConditions.push('city = ?');
      queryParams.push(params.city);
    }

    if (params.bedrooms) {
      whereConditions.push('bedrooms_num = ?');
      queryParams.push(parseInt(params.bedrooms));
    }

    if (params.name) {
      whereConditions.push('name LIKE ?');
      queryParams.push(`%${params.name}%`);
    }

    if (params.minPrice) {
      whereConditions.push('price >= ?');
      queryParams.push(parseFloat(params.minPrice));
    }

    if (params.maxPrice) {
      whereConditions.push('price <= ?');
      queryParams.push(parseFloat(params.maxPrice));
    }

    // Check availability
    if (params.checkIn && params.checkOut) {
      const unavailableVillas = await db.query(`
        SELECT DISTINCT villa_id FROM reservations
        WHERE (
          (start_date <= ? AND end_date > ?) OR
          (start_date < ? AND end_date >= ?) OR
          (start_date >= ? AND end_date <= ?)
        )
      `, [
        params.checkIn, params.checkIn,
        params.checkOut, params.checkOut,
        params.checkIn, params.checkOut
      ]);

      if (unavailableVillas.length > 0) {
        const ids = unavailableVillas.map((v: any) => v.villa_id);
        whereConditions.push(`id NOT IN (${ids.map(() => '?').join(',')})`);
        queryParams.push(...ids);
      }
    }

    // Handle tags
    if (params.tags) {
      const tagSlugs = params.tags.split(',');
      const tagQuery = `
        SELECT DISTINCT villa_id FROM villa_tag_relations vtr
        JOIN villa_tags vt ON vtr.tag_id = vt.id
        WHERE vt.slug IN (${tagSlugs.map(() => '?').join(',')})
      `;
      const villaIdsWithTags = await db.query(tagQuery, tagSlugs);
      
      if (villaIdsWithTags.length > 0) {
        const ids = villaIdsWithTags.map((v: any) => v.villa_id);
        whereConditions.push(`id IN (${ids.map(() => '?').join(',')})`);
        queryParams.push(...ids);
      } else {
        return { data: [], total: 0 };
      }
    }

    const whereClause = whereConditions.join(' AND ');
    
    // Get total count
    const [countResult]: any = await db.query(
      `SELECT COUNT(*) as total FROM villas WHERE ${whereClause}`,
      queryParams
    );
    const total = countResult.total;

    // Get paginated results
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '12');
    const offset = (page - 1) * limit;

    // Determine sort order
    let orderBy = 'sort DESC, created_at DESC';
    if (params.sort === 'price_asc') orderBy = 'price ASC';
    else if (params.sort === 'price_desc') orderBy = 'price DESC';
    else if (params.sort === 'newest') orderBy = 'created_at DESC';

    const villas = await db.query(`
      SELECT * FROM villas
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    // Add tags to each villa
    for (const villa of villas) {
      villa.tags = await db.query(`
        SELECT t.* FROM villa_tags t
        JOIN villa_tag_relations vtr ON t.id = vtr.tag_id
        WHERE vtr.villa_id = ?
      `, [villa.id]);
    }

    return { data: villas, total };
  }

  async getFeatured(limit: number = 6): Promise<any[]> {
    const villas = await db.query(`
      SELECT v.* FROM villas v
      JOIN villa_tag_relations vtr ON v.id = vtr.villa_id
      JOIN villa_tags vt ON vtr.tag_id = vt.id
      WHERE v.status = 'ACTIVE' AND vt.slug = 'featured'
      ORDER BY v.sort DESC
      LIMIT ?
    `, [limit]);

    // Add tags and reviews to each villa
    for (const villa of villas) {
      villa.tags = await db.query(`
        SELECT t.* FROM villa_tags t
        JOIN villa_tag_relations vtr ON t.id = vtr.tag_id
        WHERE vtr.villa_id = ?
      `, [villa.id]);

      villa.reviews = await db.query(`
        SELECT * FROM reviews
        WHERE villa_id = ? AND is_visible = true
        ORDER BY sort DESC
        LIMIT 3
      `, [villa.id]);
    }

    return villas;
  }

  async incrementViewCount(id: number): Promise<void> {
    await db.query(
      'UPDATE villas SET view_count = view_count + 1 WHERE id = ?',
      [id]
    );
  }

  async updatePricing(id: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    const pricePlan = await db.queryOne(`
      SELECT * FROM price_plans
      WHERE villa_id = ? AND start_date <= ? AND end_date >= ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [id, today, today]);

    if (pricePlan) {
      await this.update(id, {
        original_price: pricePlan.original_price,
        price: pricePlan.price
      });
    }
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
}