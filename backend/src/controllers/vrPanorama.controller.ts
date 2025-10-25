// backend/src/controllers/vrPanorama.controller.ts
import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import db from '../config/database'
import fs from 'fs-extra'
import path from 'path'

class VRPanoramaController {
  /**
   * Получение всех VR панорам для объекта
   */
  async getPropertyPanoramas(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params

      console.log(`🔍 Получение VR панорам для объекта #${propertyId}`)

      const panoramas: any = await db.query(
        `SELECT 
          id,
          property_id,
          location_type,
          location_number,
          front_image,
          back_image,
          left_image,
          right_image,
          top_image,
          bottom_image,
          sort_order,
          created_at
         FROM property_vr_panoramas
         WHERE property_id = ?
         ORDER BY sort_order ASC`,
        [propertyId]
      )

      res.json({
        success: true,
        data: { panoramas }
      })
    } catch (error) {
      console.error('❌ Error fetching VR panoramas:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to fetch VR panoramas'
      })
    }
  }

  /**
   * Создание новой VR панорамы
   */
  async createPanorama(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params
      const { locationType, locationNumber } = req.body

      console.log(`📥 Создание VR панорамы для объекта #${propertyId}`)

      // Проверяем, что объект принадлежит текущему админу
      const property: any = await db.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ?',
        [propertyId, req.admin?.id]
      )

      if (!property || property.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        })
      }

      // Получаем загруженные файлы
      const files = req.files as { [fieldname: string]: Express.Multer.File[] }

      if (!files || Object.keys(files).length !== 6) {
        return res.status(400).json({
          success: false,
          message: 'All 6 images are required (front, back, left, right, top, bottom)'
        })
      }

      // Получаем следующий sort_order
      const sortOrderResult: any = await db.query(
        'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM property_vr_panoramas WHERE property_id = ?',
        [propertyId]
      )
      const sortOrder = sortOrderResult[0].next_order

      // Сохраняем панораму в БД
      const [result]: any = await db.query(
        `INSERT INTO property_vr_panoramas 
         (property_id, location_type, location_number, front_image, back_image, left_image, right_image, top_image, bottom_image, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          propertyId,
          locationType,
          locationNumber || null,
          files.front[0].path.replace(/\\/g, '/'),
          files.back[0].path.replace(/\\/g, '/'),
          files.left[0].path.replace(/\\/g, '/'),
          files.right[0].path.replace(/\\/g, '/'),
          files.top[0].path.replace(/\\/g, '/'),
          files.bottom[0].path.replace(/\\/g, '/'),
          sortOrder
        ]
      )

      console.log(`✅ VR панорама создана с ID: ${result.insertId}`)

      res.status(201).json({
        success: true,
        data: { panoramaId: result.insertId }
      })
    } catch (error) {
      console.error('❌ Error creating VR panorama:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to create VR panorama'
      })
    }
  }

  /**
   * Удаление VR панорамы
   */
  async deletePanorama(req: AuthRequest, res: Response) {
    try {
      const { panoramaId } = req.params

      console.log(`🗑️ Удаление VR панорамы #${panoramaId}`)

      // Получаем данные панорамы
      const panorama: any = await db.query(
        `SELECT vr.*, p.created_by 
         FROM property_vr_panoramas vr
         JOIN properties p ON vr.property_id = p.id
         WHERE vr.id = ?`,
        [panoramaId]
      )

      if (!panorama || panorama.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'VR panorama not found'
        })
      }

      // Проверяем права доступа
      if (panorama[0].created_by !== req.admin?.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        })
      }

      // Удаляем файлы
      const images = [
        panorama[0].front_image,
        panorama[0].back_image,
        panorama[0].left_image,
        panorama[0].right_image,
        panorama[0].top_image,
        panorama[0].bottom_image
      ]

      for (const imagePath of images) {
        try {
          if (imagePath && fs.existsSync(imagePath)) {
            await fs.unlink(imagePath)
            console.log(`🗑️ Удалён файл: ${imagePath}`)
          }
        } catch (error) {
          console.error(`⚠️ Ошибка удаления файла ${imagePath}:`, error)
        }
      }

      // Удаляем запись из БД
      await db.query('DELETE FROM property_vr_panoramas WHERE id = ?', [panoramaId])

      console.log(`✅ VR панорама #${panoramaId} удалена`)

      res.json({
        success: true,
        message: 'VR panorama deleted successfully'
      })
    } catch (error) {
      console.error('❌ Error deleting VR panorama:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to delete VR panorama'
      })
    }
  }

  /**
   * Обновление порядка панорам
   */
  async updatePanoramasOrder(req: AuthRequest, res: Response) {
    try {
      const { propertyId } = req.params
      const { panoramaIds } = req.body // Массив ID в нужном порядке

      console.log(`🔄 Обновление порядка VR панорам для объекта #${propertyId}`)

      // Проверяем права доступа
      const property: any = await db.query(
        'SELECT id FROM properties WHERE id = ? AND created_by = ?',
        [propertyId, req.admin?.id]
      )

      if (!property || property.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Property not found'
        })
      }

      // Обновляем порядок
      for (let i = 0; i < panoramaIds.length; i++) {
        await db.query(
          'UPDATE property_vr_panoramas SET sort_order = ? WHERE id = ? AND property_id = ?',
          [i + 1, panoramaIds[i], propertyId]
        )
      }

      console.log(`✅ Порядок VR панорам обновлён`)

      res.json({
        success: true,
        message: 'Panoramas order updated successfully'
      })
    } catch (error) {
      console.error('❌ Error updating panoramas order:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to update panoramas order'
      })
    }
  }
}

export default new VRPanoramaController()