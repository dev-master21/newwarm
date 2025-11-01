// frontend/src/services/property.service.ts
import api from './api'
import i18n from '../i18n'

export const propertyService = {
  /**
   * Получение детальной информации об объекте
   */
  async getPropertyDetails(propertyId: string | number, lang: string = 'ru') {
    return await api.get(`/properties/${propertyId}`, { params: { lang } })
  },

  /**
   * Расчет стоимости проживания
   */
  async calculatePrice(propertyId: string | number, checkIn: string, checkOut: string) {
    return await api.post(`/properties/${propertyId}/calculate-price`, {
      checkIn,
      checkOut
    })
  },

  /**
   * Поиск альтернативных объектов
   */
  async findAlternatives(propertyId: string | number, params: any = {}) {
    return await api.get(`/properties/${propertyId}/alternatives`, { params })
  },

  /**
   * Получение цены на завтра
   */
  async getTomorrowPrice(propertyId: string | number) {
    return await api.get(`/properties/${propertyId}/tomorrow-price`)
  },

  /**
   * Получение всех опубликованных объектов
   */
  async getPublishedProperties(params: any = {}) {
    return await api.get('/properties', { params })
  },
  
  /**
   * Поиск свободных периодов
   */
  async findAvailableSlots(propertyId: string | number, params: any) {
    return await api.post(`/properties/${propertyId}/find-available-slots`, params)
  },

  /**
   * Проверка доступности периода
   */
  async checkPeriodAvailability(propertyId: string | number, params: any) {
    return await api.post(`/properties/${propertyId}/check-period`, params)
  },

  /**
   * Поиск альтернативных объектов (новый метод)
   */
  async findAlternativeProperties(propertyId: string | number, params: any) {
    return await api.post(`/properties/${propertyId}/find-alternative-properties`, params)
  },

  /**
   * Получение объекта по ID (публичный)
   */
  async getPropertyById(propertyId: string | number) {
    return await api.get(`/properties/${propertyId}`)
  },

  /**
   * Подсчет доступных объектов
   */
  async countAvailableProperties(params: any = {}) {
    return await api.get('/properties/count-available', { params })
  },

  /**
   * Получение вилл для страницы Villas
   */
  async getVillasForPage(params: any = {}) {
    return await api.get('/properties/villas', { params })
  },

  /**
   * Получение объектов из одного комплекса
   */
  async getComplexProperties(complexName: string, language: string = 'ru', excludeId: string | number | null = null) {
    try {
      const params: any = {
        language: language
      }
      
      if (excludeId) {
        params.excludeId = excludeId
      }
      
      const response = await api.get(`/properties/complex/${encodeURIComponent(complexName)}`, { params })
      console.log('🔍 Response от axios:', response)
      console.log('🔍 Response.data:', response.data)
      return response.data  // ← Убедись что тут response.data
    } catch (error) {
      console.error('Error fetching complex properties:', error)
      throw error
    }
  }
}