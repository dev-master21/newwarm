// frontend/src/services/property.service.ts
import api from './api'

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
  }
}