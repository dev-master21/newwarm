// frontend/src/api/propertyApi.js
import axios from './axios'

class PropertyApi {
  /**
   * Создание нового объекта недвижимости
   */
  async createProperty(propertyData) {
    const response = await axios.post('/admin/properties', propertyData)
    return response.data
  }

  /**
   * Получение списка объектов
   */
  async getProperties(params = {}) {
    const response = await axios.get('/admin/properties', { params })
    return response.data
  }

  /**
   * Получение деталей объекта
   */
  async getPropertyDetails(propertyId) {
    const response = await axios.get(`/admin/properties/${propertyId}`)
    return response.data
  }

  /**
   * Обновление объекта
   */
  async updateProperty(propertyId, propertyData) {
    const response = await axios.put(`/admin/properties/${propertyId}`, propertyData)
    return response.data
  }

  /**
   * Мягкое удаление объекта
   */
  async deleteProperty(propertyId) {
    const response = await axios.delete(`/admin/properties/${propertyId}`)
    return response.data
  }

  /**
   * Изменение видимости объекта
   */
  async toggleVisibility(propertyId, status) {
    const response = await axios.patch(`/admin/properties/${propertyId}/visibility`, { status })
    return response.data
  }

  /**
   * Загрузка фотографий
   */
  async uploadPhotos(propertyId, files, category = '') {
    const formData = new FormData()
    
    files.forEach(file => {
      formData.append('photos', file)
    })
    
    if (category) {
      formData.append('category', category)
    }

    const response = await axios.post(
      `/admin/properties/${propertyId}/photos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    return response.data
  }

  /**
   * Загрузка планировки
   */
  async uploadFloorPlan(propertyId, file) {
    const formData = new FormData()
    formData.append('floorPlan', file)

    const response = await axios.post(
      `/admin/properties/${propertyId}/floor-plan`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    
    return response.data
  }

  /**
   * Удаление фотографии
   */
  async deletePhoto(photoId) {
    const response = await axios.delete(`/admin/photos/${photoId}`)
    return response.data
  }

  /**
   * Проверка календаря
   */
  async validateCalendar(icsUrl) {
    const response = await axios.post('/admin/calendar/validate', {
      icsUrl
    })
    return response.data
  }
}

export default new PropertyApi()