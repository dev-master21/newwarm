// frontend/src/api/bookingApi.js
import api from './axios'

const bookingApi = {
  /**
   * Создание нового бронирования (публичное)
   */
  createBooking: async (data) => {
    const response = await api.post('/bookings', data)
    return response.data
  },

  /**
   * Проверка доступности объекта
   */
  checkAvailability: async (propertyId, checkIn, checkOut) => {
    const response = await api.get('/bookings/availability', {
      params: {
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut
      }
    })
    return response.data
  },

  /**
   * Получение информации о бронировании
   */
  getBooking: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`)
    return response.data
  },

  /**
   * Получение всех бронирований админа
   */
  getBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params })
    return response.data
  },

  /**
   * Получение доступности объектов на период
   */
  getPropertiesAvailability: async (startDate, endDate) => {
    const response = await api.get('/admin/bookings/availability', {
      params: { 
        startDate, 
        endDate 
      }
    })
    return response.data
  },

  /**
   * Получение занятых дат для календаря
   */
  getBookedDates: async (year, month) => {
    const response = await api.get('/admin/bookings/booked-dates', {
      params: { 
        year, 
        month 
      }
    })
    return response.data
  },

  /**
   * Получение статистики за месяц
   */
  getMonthlyStats: async (year, month) => {
    const response = await api.get('/admin/bookings/stats/monthly', {
      params: { 
        year, 
        month 
      }
    })
    return response.data
  },

  /**
   * Экспорт бронирований
   */
  exportBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings/export', {
      params,
      responseType: 'blob'
    })
    return response.data
  }
}

export default bookingApi