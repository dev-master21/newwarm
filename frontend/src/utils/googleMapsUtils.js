// frontend/src/utils/googleMapsUtils.js

/**
 * Извлекает координаты из ссылки Google Maps через бэкенд
 */
export const extractCoordinatesFromGoogleMapsLink = async (url) => {
  try {
    console.log('Extracting coordinates from:', url);

    // Проверяем формат ссылки
    if (!url.includes('maps.app.goo.gl') && !url.includes('google.com/maps')) {
      throw new Error('Invalid Google Maps URL format');
    }

    // Отправляем запрос на бэкенд для обработки
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/maps/expand-url`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      }
    );

    const data = await response.json();

    if (response.ok && data.success && data.data.coordinates) {
      console.log('Coordinates received:', data.data.coordinates);
      return data.data.coordinates;
    }

    // Если бэкенд не смог получить координаты
    throw new Error(data.message || 'Could not extract coordinates');
  } catch (error) {
    console.error('Error extracting coordinates:', error);
    throw error;
  }
};

/**
 * Валидация координат
 */
export const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Форматирование координат для отображения
 */
export const formatCoordinates = (lat, lng) => {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

/**
 * Ручной ввод координат
 */
export const parseManualCoordinates = (input) => {
  // Удаляем лишние пробелы
  const clean = input.trim();
  
  // Формат: lat, lng или lat,lng
  const commaMatch = clean.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  if (commaMatch) {
    const lat = parseFloat(commaMatch[1]);
    const lng = parseFloat(commaMatch[2]);
    if (validateCoordinates(lat, lng)) {
      return { lat, lng };
    }
  }

  // Формат: lat lng (пробел)
  const spaceMatch = clean.match(/^(-?\d+\.?\d*)\s+(-?\d+\.?\d*)$/);
  if (spaceMatch) {
    const lat = parseFloat(spaceMatch[1]);
    const lng = parseFloat(spaceMatch[2]);
    if (validateCoordinates(lat, lng)) {
      return { lat, lng };
    }
  }

  // Формат с @ (как в Google Maps URL)
  const atMatch = clean.match(/@?(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
  if (atMatch) {
    const lat = parseFloat(atMatch[1]);
    const lng = parseFloat(atMatch[2]);
    if (validateCoordinates(lat, lng)) {
      return { lat, lng };
    }
  }

  throw new Error('Invalid coordinate format');
};