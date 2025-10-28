// backend/src/services/beds24.service.ts
import axios from 'axios';
import db from '../config/database';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

interface Beds24DateData {
  i: number; // inventory (0 = занято, 1 = доступно)
  p1: string; // price
  m: string; // minimum nights
}

interface Beds24RoomDatesResponse {
  [date: string]: Beds24DateData;
}

interface Property {
  name: string;
  propId: string;
  roomTypes: Array<{
    name: string;
    roomId: string;
  }>;
}

interface PricePeriod {
  startDate: string;
  endDate: string;
  price: number;
  minimumNights: number;
  seasonType: 'low' | 'mid' | 'peak' | 'prime' | 'holiday';
}

class Beds24Service {
  private readonly API_KEY = 'warmphuketapi202520252025';
  private readonly BASE_URL = 'https://api.beds24.com/json';

  /**
   * Получение всех properties из Beds24
   */
  async getAllProperties(): Promise<Property[]> {
    try {
      const response = await axios.post(`${this.BASE_URL}/getProperties`, {
        authentication: {
          apiKey: this.API_KEY
        }
      });

      return response.data.getProperties || [];
    } catch (error) {
      console.error('❌ Ошибка получения properties из Beds24:', error);
      throw new Error('Failed to fetch properties from Beds24');
    }
  }

  /**
   * Получение roomId для указанного propId
   */
  async getRoomIdForProperty(propId: string): Promise<string | null> {
    try {
      const properties = await this.getAllProperties();
      const property = properties.find(p => p.propId === propId);

      if (property && property.roomTypes && property.roomTypes.length > 0) {
        return property.roomTypes[0].roomId;
      }

      return null;
    } catch (error) {
      console.error(`❌ Ошибка получения roomId для propId ${propId}:`, error);
      return null;
    }
  }

  /**
   * Получение цен на год вперед для указанного room
   */
  async getRoomDates(roomId: number, propId: string): Promise<Beds24RoomDatesResponse> {
    try {
      const today = dayjs();
      const fromDate = today.format('YYYYMMDD');
      const toDate = today.add(1, 'year').format('YYYYMMDD');

      // PropKey = 12345678900 + PropID
      const propKey = `12345678900${propId}`;

      console.log(`📅 Запрос цен для roomId ${roomId} с ${fromDate} по ${toDate}`);

      const response = await axios.post(`${this.BASE_URL}/getRoomDates`, {
        authentication: {
          apiKey: this.API_KEY,
          propKey: propKey
        },
        roomId: roomId,
        from: fromDate,
        to: toDate
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Ошибка получения цен из Beds24:', error.response?.data || error.message);
      throw new Error('Failed to fetch room dates from Beds24');
    }
  }

  /**
   * Определение базового сезона по дате
   */
  private getBaseSeason(date: dayjs.Dayjs): 'low' | 'mid' | 'peak' {
    const month = date.month() + 1; // dayjs months are 0-indexed
    const day = date.date();

    // peak season: 22 декабря - 21 февраля
    if (
      (month === 12 && day >= 22) ||
      month === 1 ||
      (month === 2 && day <= 21)
    ) {
      return 'peak';
    }

    // mid season: 7 октября - 22 декабря
    if (
      (month === 10 && day >= 7) ||
      month === 11 ||
      (month === 12 && day < 22)
    ) {
      return 'mid';
    }

    // mid season: 21 февраля - 6 мая
    if (
      (month === 2 && day > 21) ||
      month === 3 ||
      month === 4 ||
      (month === 5 && day <= 6)
    ) {
      return 'mid';
    }

    // low season: 6 мая - 7 октября
    return 'low';
  }

/**
 * Парсинг цен из JSON и группировка в периоды
 */
private parsePricePeriods(roomDates: Beds24RoomDatesResponse): PricePeriod[] {
  const dates = Object.keys(roomDates).sort();
  if (dates.length === 0) return [];

  const periods: PricePeriod[] = [];
  let currentPeriod: PricePeriod | null = null;

  // Группируем последовательные даты с одинаковой ценой и minimum nights
  for (const dateStr of dates) {
    // КРИТИЧНО: Пропускаем служебные поля (error, errorCode и т.д.)
    // Валидная дата должна быть в формате YYYYMMDD (8 цифр)
    if (!/^\d{8}$/.test(dateStr)) {
      console.log(`⚠️ Пропуск невалидного ключа: ${dateStr}`);
      continue;
    }

    const data = roomDates[dateStr];
    
    // ИСПРАВЛЕНИЕ: Если цена не указана (undefined), используем 0
    const price = data.p1 ? parseFloat(data.p1) : 0;
    
    // Если поле "m" отсутствует, используем значение по умолчанию 2
    const minimumNights = data.m ? parseInt(data.m) : 2;

    // Проверяем только на NaN, но разрешаем цену 0
    if (isNaN(price)) {
      console.log(`⚠️ Пропуск даты ${dateStr} с некорректной ценой: ${data.p1}`);
      continue;
    }

    // Проверяем minimum nights на NaN
    if (isNaN(minimumNights)) {
      console.log(`⚠️ Пропуск даты ${dateStr} с некорректным minimum nights: ${data.m}`);
      continue;
    }

    // Проверяем валидность даты
    const date = dayjs(dateStr, 'YYYYMMDD');
    if (!date.isValid()) {
      console.log(`⚠️ Пропуск невалидной даты: ${dateStr}`);
      continue;
    }

    // Логируем периоды с нулевой ценой
    if (price === 0) {
      console.log(`ℹ️ Дата ${dateStr}: цена не указана, используется 0`);
    }

    if (!currentPeriod) {
      // Начало первого периода
      currentPeriod = {
        startDate: dateStr,
        endDate: dateStr,
        price,
        minimumNights,
        seasonType: 'mid' // временно, определим позже
      };
    } else if (
      currentPeriod.price === price &&
      currentPeriod.minimumNights === minimumNights
    ) {
      // Продолжение текущего периода
      currentPeriod.endDate = dateStr;
    } else {
      // Конец текущего периода, начало нового
      periods.push({ ...currentPeriod });
      currentPeriod = {
        startDate: dateStr,
        endDate: dateStr,
        price,
        minimumNights,
        seasonType: 'mid'
      };
    }
  }

  // Добавляем последний период
  if (currentPeriod) {
    periods.push(currentPeriod);
  }

  console.log(`📊 Создано ${periods.length} периодов до определения типов сезонов`);

  // Определяем тип сезона для каждого периода
  return this.assignSeasonTypes(periods);
}

    /**
     * Определение типа сезона для периодов
     */
    private assignSeasonTypes(periods: PricePeriod[]): PricePeriod[] {
      if (periods.length === 0) return [];

      // Вычисляем средние цены для базовых сезонов (исключая периоды с ценой 0)
      const seasonPrices: { [key: string]: number[] } = {
        low: [],
        mid: [],
        peak: []
      };

      for (const period of periods) {
        // Пропускаем периоды с нулевой ценой при расчете средних
        if (period.price === 0) continue;

        const startDate = dayjs(period.startDate, 'YYYYMMDD');
        const baseSeason = this.getBaseSeason(startDate);
        seasonPrices[baseSeason].push(period.price);
      }

      // Вычисляем средние, заменяя NaN на 0
      const avgPrices = {
        low: seasonPrices.low.length > 0 
          ? seasonPrices.low.reduce((a, b) => a + b, 0) / seasonPrices.low.length 
          : 0,
        mid: seasonPrices.mid.length > 0 
          ? seasonPrices.mid.reduce((a, b) => a + b, 0) / seasonPrices.mid.length 
          : 0,
        peak: seasonPrices.peak.length > 0 
          ? seasonPrices.peak.reduce((a, b) => a + b, 0) / seasonPrices.peak.length 
          : 0
      };

      console.log('📊 Средние цены по сезонам:', avgPrices);
      console.log('📊 Количество периодов по сезонам:', {
        low: seasonPrices.low.length,
        mid: seasonPrices.mid.length,
        peak: seasonPrices.peak.length
      });

      // Если нет данных для какого-то сезона, используем общую среднюю цену
      const allPrices = [...seasonPrices.low, ...seasonPrices.mid, ...seasonPrices.peak];
      const overallAvg = allPrices.length > 0 
        ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length 
        : 0;

      // Заполняем отсутствующие средние значения
      if (avgPrices.low === 0) avgPrices.low = overallAvg;
      if (avgPrices.mid === 0) avgPrices.mid = overallAvg;
      if (avgPrices.peak === 0) avgPrices.peak = overallAvg;

      console.log('📊 Средние цены после коррекции:', avgPrices);

      // Определяем тип сезона для каждого периода
      return periods.map(period => {
        // Для периодов с нулевой ценой используем базовый сезон
        if (period.price === 0) {
          const startDate = dayjs(period.startDate, 'YYYYMMDD');
          const baseSeason = this.getBaseSeason(startDate);
          return { ...period, seasonType: baseSeason };
        }

        const startDate = dayjs(period.startDate, 'YYYYMMDD');
        const baseSeason = this.getBaseSeason(startDate);
        const basePrice = avgPrices[baseSeason];

        // Если базовая цена сезона не определена, используем базовый сезон
        if (basePrice === 0 || isNaN(basePrice)) {
          return { ...period, seasonType: baseSeason };
        }

        const priceDiff = ((period.price - basePrice) / basePrice) * 100;

        // Логика определения типа:
        if (baseSeason === 'peak') {
          // В peak сезоне все периоды остаются peak
          return { ...period, seasonType: 'peak' };
        } else if (baseSeason === 'mid') {
          // В mid сезоне проверяем, не является ли это prime или holiday
          if (priceDiff > 50) {
            // Если цена сильно выше mid, но мы не в peak - это prime
            return { ...period, seasonType: 'prime' };
          } else if (priceDiff > 15) {
            // Небольшое повышение - holiday
            return { ...period, seasonType: 'holiday' };
          } else if (priceDiff < -15) {
            // Снижение цены - тоже holiday (акция)
            return { ...period, seasonType: 'holiday' };
          }
          return { ...period, seasonType: 'mid' };
        } else {
          // В low сезоне
          if (priceDiff > 15) {
            // Повышение цены в low сезоне - holiday
            return { ...period, seasonType: 'holiday' };
          }
          return { ...period, seasonType: 'low' };
        }
      });
    }


    /**
     * Синхронизация цен для конкретного объекта
     */
    async syncPropertyPrices(propertyId: number): Promise<boolean> {
      const connection = await db.getConnection();

      try {
        await connection.beginTransaction();

        console.log(`\n🔄 Начало синхронизации цен для объекта #${propertyId}`);

        // ИСПРАВЛЕНИЕ: connection.query возвращает [rows, fields]
        const [rows]: any = await connection.query(
          'SELECT id, beds24_prop_id, beds24_room_id FROM properties WHERE id = ?',
          [propertyId]
        );

        if (!rows || rows.length === 0) {
          console.log(`❌ Объект #${propertyId} не найден в базе данных`);
          return false;
        }

        // Теперь берем первую строку из rows
        const property = rows[0];

        let propId = property.beds24_prop_id;
        let roomId = property.beds24_room_id;

        console.log(`📝 Данные объекта #${propertyId}:`, {
          beds24_prop_id: propId,
          beds24_room_id: roomId
        });

        // Проверяем propId
        if (!propId || propId === '' || propId === 0 || propId === '0') {
          console.log(`⚠️ Для объекта #${propertyId} не указан beds24_prop_id (значение: ${propId}), пропускаем`);
          return false;
        }

        // Если roomId не задан - получаем его из API
        if (!roomId) {
          console.log(`🔍 Получение roomId для propId ${propId}...`);
          const fetchedRoomId = await this.getRoomIdForProperty(propId.toString());
        
          if (!fetchedRoomId) {
            console.log(`❌ Не удалось получить roomId для propId ${propId}`);
            return false;
          }

          roomId = parseInt(fetchedRoomId);

          // Сохраняем roomId в базу
          await connection.query(
            'UPDATE properties SET beds24_room_id = ? WHERE id = ?',
            [roomId, propertyId]
          );

          console.log(`✅ RoomId ${roomId} сохранен для объекта #${propertyId}`);
        }

        // Получаем цены из Beds24
        console.log(`📥 Получение цен из Beds24 для roomId ${roomId}...`);
        const roomDates = await this.getRoomDates(roomId, propId.toString());

        if (!roomDates || Object.keys(roomDates).length === 0) {
          console.log(`⚠️ Нет данных о ценах для объекта #${propertyId}`);
          return false;
        }

        // Парсим цены в периоды
        const periods = this.parsePricePeriods(roomDates);
        console.log(`📋 Найдено ${periods.length} ценовых периодов`);

        // Удаляем старые цены
        await connection.query(
          'DELETE FROM property_pricing WHERE property_id = ?',
          [propertyId]
        );

        // Сохраняем новые периоды
        for (const period of periods) {
          const startDate = dayjs(period.startDate, 'YYYYMMDD');
          const endDate = dayjs(period.endDate, 'YYYYMMDD');
        
          // КРИТИЧНО: Проверяем валидность дат
          if (!startDate.isValid() || !endDate.isValid()) {
            console.log(
              `⚠️ Пропуск периода с невалидными датами: ` +
              `start=${period.startDate}, end=${period.endDate}`
            );
            continue;
          }
      
          // Форматируем даты в DD-MM (день-месяц, БЕЗ года)
          const startDateFormatted = startDate.format('DD-MM');
          const endDateFormatted = endDate.format('DD-MM');
      
          // Дополнительная проверка после форматирования
          if (startDateFormatted === 'Invalid Date' || endDateFormatted === 'Invalid Date') {
            console.log(
              `⚠️ Пропуск периода: не удалось отформатировать даты ` +
              `(${period.startDate} - ${period.endDate})`
            );
            continue;
          }
      
          // source_price_per_night = оригинальная цена из Beds24
          // price_per_night = цена с наценкой 30%
          const sourcePricePerNight = period.price;
          const pricePerNight = period.price * 1.3;
          const minimumNights = period.minimumNights;
      
          // КРИТИЧНО: Проверяем все значения на NaN, но разрешаем 0 для цен
          if (isNaN(sourcePricePerNight) || isNaN(pricePerNight) || isNaN(minimumNights) ||
              minimumNights <= 0) {
            console.log(
              `⚠️ Пропуск периода с некорректными данными: ` +
              `${startDateFormatted} - ${endDateFormatted}, ` +
              `цена: ${sourcePricePerNight}, мин. ночей: ${minimumNights}`
            );
            continue;
          }
      
          await connection.query(
            `INSERT INTO property_pricing 
             (property_id, season_type, start_date_recurring, end_date_recurring, 
              source_price_per_night, price_per_night, minimum_nights, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              propertyId,
              period.seasonType,
              startDateFormatted,
              endDateFormatted,
              sourcePricePerNight,
              pricePerNight,
              minimumNights
            ]
          );
      
          // Специальная пометка для периодов с нулевой ценой
          const priceDisplay = sourcePricePerNight === 0 
            ? '0.00 THB (цена не указана)' 
            : `${sourcePricePerNight.toFixed(2)} THB (${pricePerNight.toFixed(2)} THB с наценкой)`;
      
          console.log(
            `  ✓ ${period.seasonType.padEnd(7)} | ${startDateFormatted} - ${endDateFormatted} | ` +
            `${priceDisplay} | мин. ${minimumNights} ночей`
          );
        }

        await connection.commit();
        console.log(`✅ Синхронизация завершена для объекта #${propertyId}\n`);

        return true;
      } catch (error) {
        await connection.rollback();
        console.error(`❌ Ошибка синхронизации объекта #${propertyId}:`, error);
        return false;
      } finally {
        connection.release();
      }
    }

    /**
     * Синхронизация всех объектов с beds24_prop_id
     */
    async syncAllProperties(): Promise<{ success: number; failed: number }> {
      try {
        console.log('\n🚀 ============================================');
        console.log('   НАЧАЛО МАССОВОЙ СИНХРОНИЗАЦИИ ЦЕН BEDS24');
        console.log('============================================\n');

        // Получаем все объекты с заполненным beds24_prop_id
        const properties: any = await db.query(
          `SELECT id, beds24_prop_id FROM properties 
           WHERE beds24_prop_id IS NOT NULL 
           AND beds24_prop_id != '' 
           AND beds24_prop_id != 0 
           AND deleted_at IS NULL`
        );

        if (!properties || properties.length === 0) {
          console.log('⚠️ Нет объектов с beds24_prop_id для синхронизации');
          return { success: 0, failed: 0 };
        }

        console.log(`📊 Найдено объектов для синхронизации: ${properties.length}`);
        console.log('📋 Список объектов:', properties.map((p: any) => {
          // ИСПРАВЛЕНИЕ: читаем поля в snake_case
          const id = p.id;
          const propId = p.beds24_prop_id || p['beds24_prop_id'];
          return `ID: ${id}, PropID: ${propId}`;
        }).join('\n'));

        let successCount = 0;
        let failedCount = 0;

        for (const property of properties) {
          const success = await this.syncPropertyPrices(property.id);
          if (success) {
            successCount++;
          } else {
            failedCount++;
          }
        }

        console.log('\n✅ ============================================');
        console.log(`   СИНХРОНИЗАЦИЯ ЗАВЕРШЕНА`);
        console.log(`   Успешно: ${successCount} | Ошибки: ${failedCount}`);
        console.log('============================================\n');

        return { success: successCount, failed: failedCount };
      } catch (error) {
        console.error('❌ Критическая ошибка массовой синхронизации:', error);
        return { success: 0, failed: 0 };
      }
    }
}

export default new Beds24Service();