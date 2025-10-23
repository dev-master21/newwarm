// backend/src/services/thumbnail.service.ts
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import db from '../config/database' // Изменено: default import

interface ThumbnailStats {
  processed: number
  skipped: number
  errors: number
  duration: number
}

class ThumbnailService {
  private readonly THUMBNAIL_WIDTH = 400 // Ширина миниатюры
  private readonly THUMBNAIL_QUALITY = 80 // Качество сжатия
  private readonly PHOTO_DIRS = [
    'uploads/properties/photos',
    'uploads/properties/floor-plans'
  ]

  /**
   * Генерация thumbnail для одного изображения
   */
  async generateThumbnail(imagePath: string): Promise<boolean> {
    try {
      const ext = path.extname(imagePath)
      const nameWithoutExt = imagePath.slice(0, -ext.length)
      const thumbnailPath = `${nameWithoutExt}_thumb${ext}`

      // Проверяем, существует ли уже thumbnail
      try {
        await fs.access(thumbnailPath)
        console.log(`⏭️  Thumbnail already exists: ${thumbnailPath}`)
        return false // Уже существует, пропускаем
      } catch {
        // Thumbnail не существует, продолжаем генерацию
      }

      // Проверяем, существует ли исходное изображение
      try {
        await fs.access(imagePath)
      } catch {
        console.error(`❌ Source image not found: ${imagePath}`)
        return false
      }

      // Генерируем thumbnail
      await sharp(imagePath)
        .resize(this.THUMBNAIL_WIDTH, null, {
          fit: 'inside', // Сохраняем соотношение сторон
          withoutEnlargement: true // Не увеличиваем маленькие изображения
        })
        .jpeg({ quality: this.THUMBNAIL_QUALITY, progressive: true })
        .png({ quality: this.THUMBNAIL_QUALITY, compressionLevel: 9 })
        .webp({ quality: this.THUMBNAIL_QUALITY })
        .toFile(thumbnailPath)

      console.log(`✅ Thumbnail generated: ${thumbnailPath}`)
      return true
    } catch (error) {
      console.error(`❌ Error generating thumbnail for ${imagePath}:`, error)
      return false
    }
  }

  /**
   * Получение всех фотографий из базы данных
   */
  async getAllPhotosFromDatabase(): Promise<string[]> {
    try {
      const query = `
        SELECT DISTINCT photo_url 
        FROM property_photos 
        WHERE photo_url IS NOT NULL AND photo_url != ''
      `
      const photos: any[] = await db.query(query)
      return photos.map(p => p.photo_url)
    } catch (error) {
      console.error('❌ Error fetching photos from database:', error)
      return []
    }
  }

  /**
   * Получение всех файлов из директории
   */
  async getAllFilesFromDirectory(dir: string): Promise<string[]> {
    try {
      const fullPath = path.join(process.cwd(), dir)
      
      // Проверяем существование директории
      try {
        await fs.access(fullPath)
      } catch {
        console.log(`⚠️  Directory not found: ${fullPath}`)
        return []
      }

      const files = await fs.readdir(fullPath)
      
      // Фильтруем только изображения (исключаем thumbnails)
      const imageFiles = files.filter(file => {
        const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file)
        const isNotThumbnail = !file.includes('_thumb')
        return isImage && isNotThumbnail
      })

      return imageFiles.map(file => path.join(dir, file))
    } catch (error) {
      console.error(`❌ Error reading directory ${dir}:`, error)
      return []
    }
  }

  /**
   * Генерация thumbnails для фотографий из базы данных
   */
  async generateThumbnailsFromDatabase(): Promise<ThumbnailStats> {
    const startTime = Date.now()
    const stats: ThumbnailStats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      duration: 0
    }

    console.log('\n🔄 Starting thumbnail generation from database...')

    try {
      const photoUrls = await this.getAllPhotosFromDatabase()
      console.log(`📊 Found ${photoUrls.length} photos in database`)

      for (const photoUrl of photoUrls) {
        // Преобразуем URL в путь файла
        const filePath = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl

        try {
          const generated = await this.generateThumbnail(filePath)
          if (generated) {
            stats.processed++
          } else {
            stats.skipped++
          }
        } catch (error) {
          stats.errors++
          console.error(`❌ Error processing ${filePath}:`, error)
        }
      }
    } catch (error) {
      console.error('❌ Error in generateThumbnailsFromDatabase:', error)
    }

    stats.duration = Date.now() - startTime
    this.logStats(stats)
    return stats
  }

  /**
   * Генерация thumbnails для всех файлов в директориях
   */
  async generateThumbnailsFromDirectories(): Promise<ThumbnailStats> {
    const startTime = Date.now()
    const stats: ThumbnailStats = {
      processed: 0,
      skipped: 0,
      errors: 0,
      duration: 0
    }

    console.log('\n🔄 Starting thumbnail generation from directories...')

    for (const dir of this.PHOTO_DIRS) {
      console.log(`\n📁 Processing directory: ${dir}`)
      
      const files = await this.getAllFilesFromDirectory(dir)
      console.log(`📊 Found ${files.length} images in ${dir}`)

      for (const file of files) {
        try {
          const generated = await this.generateThumbnail(file)
          if (generated) {
            stats.processed++
          } else {
            stats.skipped++
          }
        } catch (error) {
          stats.errors++
          console.error(`❌ Error processing ${file}:`, error)
        }
      }
    }

    stats.duration = Date.now() - startTime
    this.logStats(stats)
    return stats
  }

  /**
   * Полная синхронизация - проверка всех файлов
   */
  async fullSync(): Promise<ThumbnailStats> {
    console.log('\n🚀 Starting FULL thumbnail synchronization...')
    return await this.generateThumbnailsFromDirectories()
  }

  /**
   * Быстрая синхронизация - только из базы данных
   */
  async quickSync(): Promise<ThumbnailStats> {
    console.log('\n⚡ Starting QUICK thumbnail synchronization...')
    return await this.generateThumbnailsFromDatabase()
  }

  /**
   * Генерация thumbnail для конкретного файла
   */
  async generateForFile(photoUrl: string): Promise<boolean> {
    const filePath = photoUrl.startsWith('/') ? photoUrl.slice(1) : photoUrl
    return await this.generateThumbnail(filePath)
  }

  /**
   * Логирование статистики
   */
  private logStats(stats: ThumbnailStats): void {
    console.log('\n📊 Thumbnail Generation Statistics:')
    console.log(`   ✅ Processed: ${stats.processed}`)
    console.log(`   ⏭️  Skipped: ${stats.skipped}`)
    console.log(`   ❌ Errors: ${stats.errors}`)
    console.log(`   ⏱️  Duration: ${(stats.duration / 1000).toFixed(2)}s`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }

  /**
   * Очистка неиспользуемых thumbnails
   */
  async cleanupUnusedThumbnails(): Promise<number> {
    let deletedCount = 0
    console.log('\n🧹 Starting cleanup of unused thumbnails...')

    try {
      // Получаем все photo_url из базы данных
      const photoUrls = await this.getAllPhotosFromDatabase()
      const validFiles = new Set(photoUrls.map(url => {
        const filePath = url.startsWith('/') ? url.slice(1) : url
        return path.basename(filePath)
      }))

      // Проверяем каждую директорию
      for (const dir of this.PHOTO_DIRS) {
        const fullPath = path.join(process.cwd(), dir)
        
        try {
          const files = await fs.readdir(fullPath)
          
          // Находим все thumbnails
          const thumbnails = files.filter(file => file.includes('_thumb'))
          
          for (const thumbnail of thumbnails) {
            // Получаем оригинальное имя файла
            const originalName = thumbnail.replace('_thumb', '')
            
            // Если оригинал не в базе данных - удаляем thumbnail
            if (!validFiles.has(originalName)) {
              const thumbnailPath = path.join(fullPath, thumbnail)
              await fs.unlink(thumbnailPath)
              console.log(`🗑️  Deleted unused thumbnail: ${thumbnail}`)
              deletedCount++
            }
          }
        } catch (error) {
          console.error(`❌ Error cleaning directory ${dir}:`, error)
        }
      }

      console.log(`\n✅ Cleanup complete. Deleted ${deletedCount} unused thumbnails.`)
    } catch (error) {
      console.error('❌ Error in cleanup:', error)
    }

    return deletedCount
  }
}

export const thumbnailService = new ThumbnailService()