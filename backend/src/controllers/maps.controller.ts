// backend/src/controllers/maps.controller.ts
import { Request, Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Вынесем функции валидации наружу класса
function validateCoordinates(lat: number, lng: number): boolean {
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
}

function extractCoordinatesFromHTML(html: string): { lat: number; lng: number } | null {
  // Ищем JSON с координатами в скриптах
  const jsonPatterns = [
    /"lat":(-?\d+\.\d+).*?"lng":(-?\d+\.\d+)/,
    /"latitude":(-?\d+\.\d+).*?"longitude":(-?\d+\.\d+)/,
    /center:\s*\{?\s*lat:\s*(-?\d+\.\d+),?\s*lng:\s*(-?\d+\.\d+)/,
  ];

  for (const pattern of jsonPatterns) {
    const match = html.match(pattern);
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      
      if (validateCoordinates(lat, lng)) {
        return { lat, lng };
      }
    }
  }

  return null;
}

class MapsController {
  /**
   * Разворачивает короткую ссылку Google Maps и извлекает координаты
   */
  async expandUrl(req: Request, res: Response) {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({
          success: false,
          message: 'URL is required'
        });
      }

      console.log('Processing URL:', url);

      // Делаем GET запрос с перенаправлениями
      const response = await axios.get(url, {
        maxRedirects: 10,
        timeout: 10000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      });

      const finalUrl = response.request.res.responseUrl || response.config.url || url;
      console.log('Final URL:', finalUrl);

      // Паттерны для поиска координат - ОБНОВЛЕННЫЕ
      const patterns = [
        // Формат: /search/7.997880,+98.325618 или /search/7.997880, 98.325618
        /\/search\/(-?\d+\.\d+)[,+\s]+(-?\d+\.\d+)/,
        // Формат: @lat,lng
        /@(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
        // Формат: q=lat,lng
        /q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
        // Формат: !3dlat!4dlng
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
        // Формат: ll=lat,lng
        /ll=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
        // Формат: center=lat,lng
        /center=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
        // Формат: destination=lat,lng
        /destination=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
        // Формат: query=lat,lng
        /query=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
      ];

      // Ищем координаты в финальном URL
      for (const pattern of patterns) {
        const match = finalUrl.match(pattern);
        if (match) {
          const lat = parseFloat(match[1]);
          const lng = parseFloat(match[2]);
          
          if (validateCoordinates(lat, lng)) {
            console.log('Found coordinates in URL:', lat, lng);
            return res.json({
              success: true,
              data: {
                coordinates: { lat, lng },
                expandedUrl: finalUrl
              }
            });
          }
        }
      }

      // Если в URL не нашлось - парсим HTML и ищем в og:url
      console.log('Coordinates not found in URL, trying HTML parsing...');
      
      const $ = cheerio.load(response.data);
      
      // Ищем og:url meta тег
      const ogUrl = $('meta[property="og:url"]').attr('content') || 
                    $('meta[name="og:url"]').attr('content');

      if (ogUrl) {
        console.log('og:url:', ogUrl);
        
        // Ищем координаты в og:url
        for (const pattern of patterns) {
          const match = ogUrl.match(pattern);
          if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            
            if (validateCoordinates(lat, lng)) {
              console.log('Found coordinates in og:url:', lat, lng);
              return res.json({
                success: true,
                data: {
                  coordinates: { lat, lng },
                  expandedUrl: ogUrl
                }
              });
            }
          }
        }
      }

      // Пробуем найти координаты прямо в HTML
      const htmlCoords = extractCoordinatesFromHTML(response.data);
      if (htmlCoords) {
        console.log('Found coordinates in HTML:', htmlCoords);
        return res.json({
          success: true,
          data: {
            coordinates: htmlCoords,
            expandedUrl: finalUrl
          }
        });
      }

      console.log('Coordinates not found');
      return res.status(400).json({
        success: false,
        message: 'Could not extract coordinates from URL',
        data: {
          finalUrl,
          suggestion: 'Please enter coordinates manually'
        }
      });
    } catch (error) {
      console.error('Error expanding URL:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      res.status(500).json({
        success: false,
        message: 'Failed to expand URL',
        error: errorMessage
      });
    }
  }
}

export default new MapsController();