// backend/src/jobs/beds24Sync.job.ts
import cron from 'node-cron';
import beds24Service from '../services/beds24.service';

/**
 * Запуск cron-задачи для синхронизации цен каждые 5 минут
 */
export function startBeds24SyncJob() {
  // Каждые 5 минут: */5 * * * *
  cron.schedule('*/5 * * * *', async () => {
    console.log('\n⏰ Запуск автоматической синхронизации Beds24...');
    try {
      await beds24Service.syncAllProperties();
    } catch (error) {
      console.error('❌ Ошибка в cron-задаче Beds24:', error);
    }
  });

  console.log('✅ Cron-задача синхронизации Beds24 запущена (каждые 5 минут)');
}