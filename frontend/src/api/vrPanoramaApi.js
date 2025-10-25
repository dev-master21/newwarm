// frontend/src/api/vrPanoramaApi.js
import axios from './axios'

class VRPanoramaApi {
  async getPropertyPanoramas(propertyId) {
    const response = await axios.get(`/admin/properties/${propertyId}/vr-panoramas`)
    return response.data
  }

  async createPanorama(propertyId, formData) {
    const response = await axios.post(
      `/admin/properties/${propertyId}/vr-panoramas`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  async deletePanorama(panoramaId) {
    const response = await axios.delete(`/admin/vr-panoramas/${panoramaId}`)
    return response.data
  }

  async updatePanoramasOrder(propertyId, panoramaIds) {
    const response = await axios.put(
      `/admin/properties/${propertyId}/vr-panoramas/order`,
      { panoramaIds }
    )
    return response.data
  }
}

export default new VRPanoramaApi()