// frontend/src/components/Property/ComplexProperties.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiHome, HiArrowRight, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { IoBedOutline, IoExpand } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { propertyService } from '../../services/property.service'
import toast from 'react-hot-toast'

const ComplexProperties = ({ complexName, currentPropertyId, totalCount }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    loadComplexProperties()
  }, [complexName, currentPropertyId, i18n.language])

  const loadComplexProperties = async () => {
    try {
      setLoading(true)
      
      const response = await propertyService.getComplexProperties(
        complexName,
        i18n.language,
        currentPropertyId
      )

      let propertiesData = []
      
      if (Array.isArray(response)) {
        propertiesData = response
      } else if (response.success && response.data?.properties) {
        propertiesData = response.data.properties
      } else if (response.data?.properties) {
        propertiesData = response.data.properties
      }
      
      setProperties(propertiesData)
    } catch (error) {
      console.error('❌ Ошибка загрузки объектов комплекса:', error)
      toast.error(t('property.complex.loadError') || 'Ошибка загрузки объектов комплекса')
    } finally {
      setLoading(false)
    }
  }

  const getThumbnailUrl = (photoUrl) => {
    if (!photoUrl) return '/placeholder-villa.jpg'
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
    if (photoUrl.startsWith('http')) return photoUrl
    
    const lastDot = photoUrl.lastIndexOf('.')
    if (lastDot > 0) {
      const thumbPath = photoUrl.substring(0, lastDot) + '_thumb' + photoUrl.substring(lastDot)
      return `${baseUrl}${thumbPath}`
    }
    return `${baseUrl}${photoUrl}`
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? properties.length - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === properties.length - 1 ? 0 : prev + 1))
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    )
  }

  if (properties.length === 0) {
    return null
  }

  return (
    <>
      {/* ДЕСКТОПНАЯ ВЕРСИЯ - Карусель */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <HiHome className="w-7 h-7 text-[#ba2e2d]" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('property.complex.title') || 'Объекты в комплексе'}
            </h3>
            <span className="bg-[#ba2e2d] text-white px-3 py-1 rounded-full text-sm font-bold">
              {properties.length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('property.complex.subtitle', { name: complexName }) || `Другие объекты в комплексе ${complexName}`}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Slides */}
          <div className="overflow-hidden rounded-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <PropertyCard 
                  property={properties[currentSlide]} 
                  getThumbnailUrl={getThumbnailUrl}
                  navigate={navigate}
                  t={t}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          {properties.length > 1 && (
            <>
              <button
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-700 
                         rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 
                         dark:hover:bg-gray-600 transition-all z-10"
              >
                <HiChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              
              <button
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-gray-700 
                         rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 
                         dark:hover:bg-gray-600 transition-all z-10"
              >
                <HiChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>

              {/* Indicators */}
              <div className="flex justify-center space-x-2 mt-4">
                {properties.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'w-8 bg-[#ba2e2d]' 
                        : 'w-2 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* МОБИЛЬНАЯ ВЕРСИЯ - Сетка */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <HiHome className="w-7 h-7 text-[#ba2e2d]" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('property.complex.title') || 'Объекты в комплексе'}
            </h3>
            <span className="bg-[#ba2e2d] text-white px-3 py-1 rounded-full text-sm font-bold">
              {properties.length}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('property.complex.subtitle', { name: complexName }) || `Другие объекты в комплексе ${complexName}`}
          </p>
        </div>

        <div className="space-y-4">
          {properties.map((property) => (
            <PropertyCard 
              key={property.id}
              property={property} 
              getThumbnailUrl={getThumbnailUrl}
              navigate={navigate}
              t={t}
            />
          ))}
        </div>
      </motion.div>
    </>
  )
}

// Property Card Component
const PropertyCard = ({ property, getThumbnailUrl, navigate, t }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => navigate(`/properties/${property.id}`)}
      className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden cursor-pointer 
               hover:shadow-xl transition-all border border-gray-200 dark:border-gray-600"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-600">
        {property.photos && property.photos.length > 0 ? (
          <img
            src={getThumbnailUrl(property.photos[0])}
            alt={property.property_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const originalUrl = `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${property.photos[0]}`
              if (e.target.src !== originalUrl) {
                e.target.src = originalUrl
              } else {
                e.target.src = '/placeholder-villa.jpg'
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <HiHome className="w-16 h-16 text-gray-400" />
          </div>
        )}

        {/* Property Number Badge */}
        {property.property_number && (
          <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                       px-3 py-1 rounded-lg font-bold text-sm shadow-lg">
            #{property.property_number}
          </div>
        )}

        {/* Price Badge */}
        {property.min_price && (
          <div className="absolute top-2 right-2 bg-[#ba2e2d] text-white px-3 py-1 
                       rounded-lg font-bold text-sm shadow-lg">
            от ฿{Math.round(property.min_price).toLocaleString()}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">
          {property.property_name}
        </h4>

        <div className="flex items-center space-x-4 text-sm mb-4">
          {property.bedrooms && (
            <div className="flex items-center space-x-1">
              <IoBedOutline className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(property.bedrooms)}
              </span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center space-x-1">
              <MdBathtub className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(property.bathrooms)}
              </span>
            </div>
          )}
          {property.indoor_area && (
            <div className="flex items-center space-x-1">
              <IoExpand className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(property.indoor_area)} м²
              </span>
            </div>
          )}
        </div>

        <button
          className="w-full bg-gradient-to-r from-[#ba2e2d] to-red-600 
                   hover:from-red-600 hover:to-red-700 text-white font-medium 
                   py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
        >
          <span>{t('property.complex.viewDetails') || 'Подробнее'}</span>
          <HiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

export default ComplexProperties