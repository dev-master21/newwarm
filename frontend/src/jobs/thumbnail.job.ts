// backend/src/jobs/thumbnail.job.ts
import cron from 'node-cron'
import { thumbnailService } from '../services/thumbnail.service'

/**
 * Запуск задачи генерации thumbnails каждые 30 минут
 */
export function startThumbnailJob() {
  console.log('📅 Starting thumbnail generation cron job (every 30 minutes)')

  // Запуск каждые 30 минут
  cron.schedule('*/30 * * * *', async () => {
    console.log('\n⏰ Scheduled thumbnail generation started')
    try {
      await thumbnailService.quickSync()
    } catch (error) {
      console.error('❌ Error in scheduled thumbnail generation:', error)
    }
  })

  // Запуск полной синхронизации каждые 6 часов
  cron.schedule('0 */6 * * *', async () => {
    console.log('\n⏰ Scheduled FULL thumbnail sync started')
    try {
      await thumbnailService.fullSync()
    } catch (error) {
      console.error('❌ Error in scheduled full sync:', error)
    }
  })

  console.log('✅ Thumbnail cron jobs started successfully')
}