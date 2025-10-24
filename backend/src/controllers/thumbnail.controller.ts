// backend/src/controllers/thumbnail.controller.ts
import { Request, Response } from 'express'
import { thumbnailService } from '../services/thumbnail.service'

export class ThumbnailController {
  /**
   * Полная синхронизация - все файлы
   */
  async fullSync(req: Request, res: Response) {
    try {
      console.log('🚀 Manual full sync triggered by admin')
      const stats = await thumbnailService.fullSync()
      
      res.json({
        success: true,
        message: 'Full thumbnail synchronization completed',
        stats
      })
    } catch (error) {
      console.error('❌ Error in full sync:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to complete full sync',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Быстрая синхронизация - только из БД
   */
  async quickSync(req: Request, res: Response) {
    try {
      console.log('⚡ Manual quick sync triggered by admin')
      const stats = await thumbnailService.quickSync()
      
      res.json({
        success: true,
        message: 'Quick thumbnail synchronization completed',
        stats
      })
    } catch (error) {
      console.error('❌ Error in quick sync:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to complete quick sync',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Генерация для конкретного файла
   */
  async generateForFile(req: Request, res: Response) {
    try {
      const { photoUrl } = req.body

      if (!photoUrl) {
        return res.status(400).json({
          success: false,
          message: 'Photo URL is required'
        })
      }

      const generated = await thumbnailService.generateForFile(photoUrl)
      
      res.json({
        success: true,
        generated,
        message: generated 
          ? 'Thumbnail generated successfully' 
          : 'Thumbnail already exists or failed to generate'
      })
    } catch (error) {
      console.error('❌ Error generating thumbnail:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to generate thumbnail',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  /**
   * Очистка неиспользуемых thumbnails
   */
  async cleanup(req: Request, res: Response) {
    try {
      console.log('🧹 Manual cleanup triggered by admin')
      const deletedCount = await thumbnailService.cleanupUnusedThumbnails()
      
      res.json({
        success: true,
        message: `Cleanup completed. Deleted ${deletedCount} unused thumbnails.`,
        deletedCount
      })
    } catch (error) {
      console.error('❌ Error in cleanup:', error)
      res.status(500).json({
        success: false,
        message: 'Failed to complete cleanup',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

export const thumbnailController = new ThumbnailController()