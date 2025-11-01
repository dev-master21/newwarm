// backend/src/services/imageProcessor.service.ts
import sharp from 'sharp';
import path from 'path';
import fs from 'fs-extra';

interface ProcessedImage {
  originalPath: string;
  thumbnailPath: string;
  originalSize: number;
  compressedSize: number;
  thumbnailSize: number;
}

class ImageProcessorService {
  private readonly THUMBNAIL_WIDTH = 400;
  private readonly THUMBNAIL_QUALITY = 80;
  private readonly ORIGINAL_QUALITY = 90; // Качество для сжатия оригинала

  /**
   * Обработка одного изображения: сжатие оригинала + создание thumbnail
   */
  async processImage(filePath: string): Promise<ProcessedImage> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const nameWithoutExt = filePath.slice(0, -ext.length);
      const thumbnailPath = `${nameWithoutExt}_thumb${ext}`;

      // Получаем информацию об оригинальном файле
      const originalStats = await fs.stat(filePath);
      const originalSize = originalStats.size;

      console.log(`🔄 Processing image: ${path.basename(filePath)} (${(originalSize / 1024 / 1024).toFixed(2)} MB)`);

      // Загружаем изображение для обработки
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // 1. Сжимаем оригинал без потери качества (если больше 2MB)
      if (originalSize > 2 * 1024 * 1024) {
        await this.compressOriginal(filePath, metadata);
      }

      // 2. Создаем thumbnail
      await this.createThumbnail(filePath, thumbnailPath, metadata);

      // Получаем новые размеры файлов
      const compressedStats = await fs.stat(filePath);
      const thumbnailStats = await fs.stat(thumbnailPath);

      const result: ProcessedImage = {
        originalPath: filePath,
        thumbnailPath,
        originalSize,
        compressedSize: compressedStats.size,
        thumbnailSize: thumbnailStats.size
      };

      const savedSpace = originalSize - compressedStats.size;
      console.log(`✅ Image processed: ${path.basename(filePath)}`);
      console.log(`   Original: ${(originalSize / 1024 / 1024).toFixed(2)} MB → ${(compressedStats.size / 1024 / 1024).toFixed(2)} MB (saved ${(savedSpace / 1024 / 1024).toFixed(2)} MB)`);
      console.log(`   Thumbnail: ${(thumbnailStats.size / 1024).toFixed(2)} KB`);

      return result;
    } catch (error) {
      console.error(`❌ Error processing image ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Сжатие оригинального изображения
   */
  private async compressOriginal(filePath: string, metadata: sharp.Metadata): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();
    const tempPath = filePath + '.tmp';

    try {
      let pipeline = sharp(filePath);

      // Ограничиваем максимальный размер (например, 3000px по длинной стороне)
      const maxDimension = 3000;
      if (metadata.width && metadata.height) {
        if (metadata.width > maxDimension || metadata.height > maxDimension) {
          pipeline = pipeline.resize(maxDimension, maxDimension, {
            fit: 'inside',
            withoutEnlargement: true
          });
        }
      }

      // Применяем сжатие в зависимости от формата
      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({
          quality: this.ORIGINAL_QUALITY,
          progressive: true,
          mozjpeg: true // Используем mozjpeg для лучшего сжатия
        });
      } else if (ext === '.png') {
        pipeline = pipeline.png({
          quality: this.ORIGINAL_QUALITY,
          compressionLevel: 9,
          adaptiveFiltering: true
        });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({
          quality: this.ORIGINAL_QUALITY,
          effort: 6
        });
      }

      // Сохраняем во временный файл
      await pipeline.toFile(tempPath);

      // Проверяем, что сжатый файл меньше оригинала
      const originalStats = await fs.stat(filePath);
      const compressedStats = await fs.stat(tempPath);

      if (compressedStats.size < originalStats.size) {
        // Заменяем оригинал сжатой версией
        await fs.move(tempPath, filePath, { overwrite: true });
      } else {
        // Если сжатие не уменьшило размер, удаляем временный файл
        await fs.remove(tempPath);
      }
    } catch (error) {
      // Удаляем временный файл в случае ошибки
      await fs.remove(tempPath).catch(() => {});
      throw error;
    }
  }

  /**
   * Создание thumbnail
   */
  private async createThumbnail(
    sourcePath: string,
    thumbnailPath: string,
    metadata: sharp.Metadata
  ): Promise<void> {
    const ext = path.extname(sourcePath).toLowerCase();

    let pipeline = sharp(sourcePath)
      .resize(this.THUMBNAIL_WIDTH, null, {
        fit: 'inside',
        withoutEnlargement: true
      });

    // Применяем формат в зависимости от расширения
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({
        quality: this.THUMBNAIL_QUALITY,
        progressive: true
      });
    } else if (ext === '.png') {
      pipeline = pipeline.png({
        quality: this.THUMBNAIL_QUALITY,
        compressionLevel: 9
      });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({
        quality: this.THUMBNAIL_QUALITY
      });
    }

    await pipeline.toFile(thumbnailPath);
  }

  /**
   * Параллельная обработка нескольких изображений
   */
  async processMultipleImages(filePaths: string[]): Promise<ProcessedImage[]> {
    console.log(`\n🚀 Starting batch processing of ${filePaths.length} images...`);
    const startTime = Date.now();

    // Обрабатываем изображения параллельно (максимум 5 одновременно)
    const BATCH_SIZE = 5;
    const results: ProcessedImage[] = [];

    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      const batch = filePaths.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(filePath => this.processImage(filePath))
      );
      results.push(...batchResults);

      console.log(`📊 Progress: ${Math.min(i + BATCH_SIZE, filePaths.length)}/${filePaths.length} images processed`);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
    const totalCompressedSize = results.reduce((sum, r) => sum + r.compressedSize, 0);
    const totalSaved = totalOriginalSize - totalCompressedSize;

    console.log(`\n✅ Batch processing completed in ${duration}s`);
    console.log(`   Total original size: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total compressed size: ${(totalCompressedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB (${((totalSaved / totalOriginalSize) * 100).toFixed(1)}%)`);

    return results;
  }
}

export const imageProcessorService = new ImageProcessorService();