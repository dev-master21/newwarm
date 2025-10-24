// frontend/src/services/map.service.js
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

class MapService {
  async getPropertiesForMap() {
    try {
      const response = await axios.get(`${API_URL}/properties/map`)
      return response.data
    } catch (error) {
      console.error('Error fetching properties for map:', error)
      throw error
    }
  }
}

export const mapService = new MapService()