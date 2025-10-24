import api from './api'

export const villaService = {
  // Get all villas with filters
  async getVillas(params = {}) {
    return await api.get('/villas', { params })
  },

  // Get single villa
  async getVilla(idOrSlug) {
    return await api.get(`/villas/${idOrSlug}`)
  },

  // Get featured villas
  async getFeaturedVillas() {
    return await api.get('/villas/featured')
  },

  // Search villas
  async searchVillas(query) {
    return await api.get('/villas/search', { params: { q: query } })
  },

  // Get availability
  async getAvailability(villaId, checkIn, checkOut) {
    return await api.get('/bookings/availability', {
      params: { villa_id: villaId, check_in: checkIn, check_out: checkOut }
    })
  },

  // Get tags
  async getTags() {
    return await api.get('/villas/tags')
  },

  // Get testimonials
  async getTestimonials() {
    return await api.get('/villas/testimonials')
  }
}

export const bookingService = {
  // Create booking
  async createBooking(data) {
    return await api.post('/bookings', data)
  },

  // Check availability
  async checkAvailability(villaId, checkIn, checkOut) {
    return await api.get('/bookings/availability', {
      params: { villa_id: villaId, check_in: checkIn, check_out: checkOut }
    })
  }
}

export const contactService = {
  // Submit contact form
  async submitContact(data) {
    return await api.post('/contact', data)
  },

  // Join club
  async joinClub(email) {
    return await api.post('/contact/join-club', { email })
  }
}

export const configService = {
  // Get site config
  async getConfig() {
    return await api.get('/config')
  }
}