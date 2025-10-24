// frontend/src/store/propertyFormStore.js
import { create } from 'zustand'

export const usePropertyFormStore = create((set, get) => ({
  currentStep: 1,
  totalSteps: 10,
  formData: {
    // Step 1
    dealType: '',
    
    // Step 2
    propertyType: '',
    
    // Step 3
    region: '',
    address: '',
    googleMapsLink: '',
    coordinates: null,
    propertyNumber: '',
    
    // Step 4
    bedrooms: '',
    bathrooms: '',
    indoorArea: '',
    outdoorArea: '',
    plotSize: '',
    floors: '',
    floor: '',
    penthouseFloors: '',
    
    // Step 5
    constructionYear: '',
    constructionMonth: '',
    furnitureStatus: '',
    parkingSpaces: '',
    petsAllowed: '',
    petsCustom: '',
    
    // Step 6
    buildingOwnership: '',
    landOwnership: '',
    ownershipType: '',
    
    // Step 7
    propertyFeatures: [],
    outdoorFeatures: [],
    rentalFeatures: [],
    locationFeatures: [],
    views: [],
    renovationDates: {},
    
    // Step 8
    propertyName: {
      ru: '',
      en: '',
      th: '',
      zh: ''
    },
    description: {
      ru: '',
      en: '',
      th: '',
      zh: ''
    },
    photos: [],
    uploadMethod: 'withCategories',
    categories: [],
    photosByCategory: {
      bedroom: [],
      bathroom: [],
      kitchen: [],
      livingRoom: [],
      exterior: [],
      pool: [],
      garden: [],
      other: []
    },
    floorPlan: null,
    
    // Step 9
    salePrice: '',
    minimumNights: '',
    seasonalPricing: [],
    
    // Step 10
    icsCalendarUrl: ''
  },
  
  formErrors: {},

  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),

  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps)
  })),

  previousStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 1)
  })),

  setStep: (step) => set({ currentStep: step }),

  validateStep: (step) => {
    const state = get()
    const { formData } = state
    let errors = {}

    switch (step) {
      case 1:
        if (!formData.dealType) errors.dealType = 'required'
        break

      case 2:
        if (!formData.propertyType) errors.propertyType = 'required'
        break

      case 3:
        if (!formData.region) errors.region = 'required'
        if (!formData.address) errors.address = 'required'
        if (!formData.coordinates) errors.coordinates = 'required'
        break

      case 4:
        if (!formData.bedrooms) errors.bedrooms = 'required'
        if (!formData.bathrooms) errors.bathrooms = 'required'
        if (!formData.indoorArea) errors.indoorArea = 'required'
        
        // Conditional validations based on property type
        if (formData.propertyType === 'house' || formData.propertyType === 'villa') {
          if (!formData.floors) errors.floors = 'required'
        }
        if (formData.propertyType === 'condo' || formData.propertyType === 'apartment') {
          if (!formData.floor) errors.floor = 'required'
        }
        if (formData.propertyType === 'penthouse') {
          if (!formData.floor) errors.floor = 'required'
          if (!formData.penthouseFloors) errors.penthouseFloors = 'required'
        }
        break

      case 5:
        // if (!formData.constructionYear) errors.constructionYear = 'required'
        // if (!formData.constructionMonth) errors.constructionMonth = 'required'
        if (!formData.furnitureStatus) errors.furnitureStatus = 'required'
        if (!formData.petsAllowed) errors.petsAllowed = 'required'
        break

      case 6:
        // Only validate for sale properties
        if (formData.dealType === 'sale' || formData.dealType === 'both') {
          // For house/villa: check buildingOwnership and landOwnership
          if (formData.propertyType === 'house' || formData.propertyType === 'villa') {
            if (!formData.buildingOwnership) errors.buildingOwnership = 'required'
            if (!formData.landOwnership) errors.landOwnership = 'required'
          } else {
            // For condo/apartment/penthouse: check ownershipType
            if (!formData.ownershipType) errors.ownershipType = 'required'
          }
        }
        break

      case 7:
        // No required fields for step 7
        break

      case 8:
        // ИСПРАВЛЕНО: Проверка что заполнено название хотя бы на одном языке
        const hasName = formData.propertyName && 
          Object.values(formData.propertyName).some(name => name && name.trim() !== '')
        
        // ИСПРАВЛЕНО: Проверка что заполнено описание хотя бы на одном языке
        const hasDescription = formData.description && 
          Object.values(formData.description).some(desc => desc && desc.trim() !== '')
        
        if (!hasName) {
          errors.propertyName = 'required'
        }
        if (!hasDescription) {
          errors.description = 'required'
        }
        
        // ИСПРАВЛЕНО: Проверка общего количества фотографий из formData.photos
        // Теперь считаем все фотографии независимо от категории
        const totalPhotos = (formData.photos || []).length
        
        if (totalPhotos < 5) {
          errors.photos = 'minimum5photos'
        }
        break

      case 9:
        if (formData.dealType === 'sale' || formData.dealType === 'both') {
          if (!formData.salePrice) errors.salePrice = 'required'
        }
        if (formData.dealType === 'rent' || formData.dealType === 'both') {
          if (!formData.minimumNights) errors.minimumNights = 'required'
        }
        break

      case 10:
        if (formData.dealType === 'rent' || formData.dealType === 'both') {
          if (!formData.icsCalendarUrl) errors.icsCalendarUrl = 'required'
        }
        break

      default:
        break
    }

    set({ formErrors: errors })
    return Object.keys(errors).length === 0
  },

  resetForm: () => set({
    currentStep: 1,
    formData: {
      dealType: '',
      propertyType: '',
      region: '',
      address: '',
      googleMapsLink: '',
      coordinates: null,
      propertyNumber: '',
      bedrooms: '',
      bathrooms: '',
      indoorArea: '',
      outdoorArea: '',
      plotSize: '',
      floors: '',
      floor: '',
      penthouseFloors: '',
      constructionYear: '',
      constructionMonth: '',
      furnitureStatus: '',
      parkingSpaces: '',
      petsAllowed: '',
      petsCustom: '',
      buildingOwnership: '',
      landOwnership: '',
      ownershipType: '',
      propertyFeatures: [],
      outdoorFeatures: [],
      rentalFeatures: [],
      locationFeatures: [],
      views: [],
      renovationDates: {},
      propertyName: { ru: '', en: '', th: '', zh: '' },
      description: { ru: '', en: '', th: '', zh: '' },
      photos: [],
      uploadMethod: 'withCategories',
      categories: [],
      photosByCategory: {
        bedroom: [],
        bathroom: [],
        kitchen: [],
        livingRoom: [],
        exterior: [],
        pool: [],
        garden: [],
        other: []
      },
      floorPlan: null,
      salePrice: '',
      minimumNights: '',
      seasonalPricing: [],
      icsCalendarUrl: ''
    },
    formErrors: {}
  })
}))