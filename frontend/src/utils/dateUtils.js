// Константа часового пояса
export const TIMEZONE = 'Asia/Bangkok'

/**
 * Получить текущую дату в таиландском часовом поясе (только дата, без времени)
 * @returns {Date}
 */
export const getTodayInBangkok = () => {
  const now = new Date()
  const bangkokDateStr = now.toLocaleDateString('en-CA', { 
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  return new Date(bangkokDateStr + 'T00:00:00')
}

/**
 * Преобразовать любую дату в формат YYYY-MM-DD в таиландском часовом поясе
 * @param {Date|string} date 
 * @returns {string} YYYY-MM-DD
 */
export const toDateStrBangkok = (date) => {
  if (!date) return null
  
  // Если уже строка в формате YYYY-MM-DD, возвращаем как есть
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date
  }
  
  // Если строка с временем, парсим
  if (typeof date === 'string') {
    date = new Date(date)
  }
  
  // Преобразуем в формат YYYY-MM-DD в таиландском часовом поясе
  return date.toLocaleDateString('en-CA', { 
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Конвертировать Date объект в YYYY-MM-DD БЕЗ изменения timezone
 * (для использования с DatePicker - берет локальные значения даты)
 * @param {Date} date 
 * @returns {string} YYYY-MM-DD
 */
export const dateToLocalDateStr = (date) => {
  if (!date || !(date instanceof Date)) return null
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

/**
 * Создать объект Date из строки YYYY-MM-DD в таиландском часовом поясе
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {Date}
 */
export const createDateFromStrBangkok = (dateStr) => {
  if (!dateStr) return null
  
  // Убираем время если есть
  const cleanDateStr = dateStr.split('T')[0]
  
  // Создаем дату в полночь по таиландскому времени
  const [year, month, day] = cleanDateStr.split('-').map(Number)
  
  // Создаем строку ISO с временем 00:00:00 в Bangkok
  const bangkokDate = new Date(
    Date.UTC(year, month - 1, day) - (7 * 60 * 60 * 1000) // UTC+7 = Bangkok
  )
  
  return bangkokDate
}

/**
 * Получить дни месяца для календаря в таиландском часовом поясе
 * @param {Date} currentMonth 
 * @returns {Array}
 */
export const getDaysInMonthBangkok = (currentMonth) => {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  
  // Создаем первый и последний день месяца в Bangkok
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  
  // Начало недели (понедельник = 1, воскресенье = 0)
  let firstDayOfWeek = firstDay.getDay()
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1

  const days = []
  
  // Пустые ячейки в начале
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(null)
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      day,
      date,
      dateStr: toDateStrBangkok(date)
    })
  }

  return days
}

/**
 * Сравнить две даты (только дата, без времени)
 * @param {string} date1 - YYYY-MM-DD
 * @param {string} date2 - YYYY-MM-DD
 * @returns {number} -1 если date1 < date2, 0 если равны, 1 если date1 > date2
 */
export const compareDates = (date1, date2) => {
  if (!date1 || !date2) return 0
  
  const d1 = toDateStrBangkok(date1)
  const d2 = toDateStrBangkok(date2)
  
  if (d1 < d2) return -1
  if (d1 > d2) return 1
  return 0
}

/**
 * Проверить, является ли дата прошедшей (в Bangkok)
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {boolean}
 */
export const isPastDateBangkok = (dateStr) => {
  if (!dateStr) return false
  
  const today = toDateStrBangkok(getTodayInBangkok())
  return dateStr < today
}

/**
 * Форматировать дату для отображения
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} locale - локаль (ru-RU, en-US, etc)
 * @returns {string}
 */
export const formatDateForDisplay = (dateStr, locale = 'ru-RU') => {
  if (!dateStr) return ''
  
  const date = createDateFromStrBangkok(dateStr)
  return date.toLocaleDateString(locale, {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

/**
 * Вычислить количество ночей между датами
 * @param {string} checkIn - YYYY-MM-DD
 * @param {string} checkOut - YYYY-MM-DD
 * @returns {number}
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0
  
  const start = createDateFromStrBangkok(checkIn)
  const end = createDateFromStrBangkok(checkOut)
  
  const diffTime = end - start
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}