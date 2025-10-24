// frontend/src/components/Property/AlternativeProperties.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiHome, 
  HiLocationMarker, 
  HiCurrencyDollar,
  HiSparkles,
  HiArrowRight,
  HiCheckCircle
} from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { propertyService } from '../../services/property.service'
import toast from 'react-hot-toast'

const AlternativeProperties = ({ propertyId, startDate, endDate, nightsCount }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadAlternatives()
  }, [propertyId, startDate, endDate, nightsCount])

  const loadAlternatives = async () => {
    try {
      setLoading(true)
      const response = await propertyService.findAlternativeProperties(propertyId, {
        startDate,
        endDate,
        nightsCount
      })

      if (response.success) {
        setProperties(response.data.alternatives || [])
      }
    } catch (error) {
      console.error('Error loading alternatives:', error)
      toast.error(t('property.alternatives.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return '/placeholder-villa.jpg'
    if (photoUrl.startsWith('http')) return photoUrl
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${photoUrl}`
  }

  const handlePropertyClick = (id) => {
    navigate(`/properties/${id}`)
    window.scrollTo(0, 0)
  }

  const formatPrice = (price) => {
    if (!price) return '0'
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                    rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-purple-200 dark:bg-purple-700 rounded w-1/3" />
          <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded w-2/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-purple-200 dark:bg-purple-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 
                    rounded-2xl shadow-lg p-8 border-2 border-gray-200 dark:border-gray-700 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiHome className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('property.alternatives.noAlternatives')}
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            {t('property.alternatives.noAlternativesDesc')}
          </p>
        </div>
      </div>
    )
  }

  const displayedProperties = showAll ? properties : properties.slice(0, 6)

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 
                  rounded-2xl shadow-lg p-6 border-2 border-purple-200 dark:border-purple-800">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <HiSparkles className="w-6 h-6 text-purple-500" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('property.alternatives.title')}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {t('property.alternatives.subtitle')}
        </p>
        {startDate && endDate && (
          <div className="mt-2 inline-flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t('property.alternatives.forPeriod')}:</span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {formatDate(startDate)} - {formatDate(endDate)}
            </span>
            {nightsCount && (
              <span className="text-gray-600 dark:text-gray-400">
                ({nightsCount} {t('property.availabilityFinder.nights')})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {displayedProperties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handlePropertyClick(property.id)}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden cursor-pointer 
                       hover:shadow-2xl transition-all duration-300 group border border-gray-200 dark:border-gray-700
                       hover:border-purple-300 dark:hover:border-purple-600"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getPhotoUrl(property.coverPhoto)}
                  alt={property.propertyName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Price Badge */}
                {property.pricePerNight && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-blue-500 
                                text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    ฿{formatPrice(property.pricePerNight)}/{t('property.alternatives.night')}
                  </div>
                )}

                {/* Available Badge */}
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full 
                              text-xs font-semibold shadow-lg flex items-center space-x-1">
                  <HiCheckCircle className="w-3 h-3" />
                  <span>{t('property.alternatives.available')}</span>
                </div>

                {/* Property Number */}
                <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white 
                              px-2 py-1 rounded text-xs font-medium">
                  #{property.propertyNumber}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Title */}
                <h4 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 
                             group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors min-h-[56px]">
                  {property.propertyName || `${t('property.alternatives.property')} #${property.propertyNumber}`}
                </h4>

                {/* Location */}
                {property.region && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                    <HiLocationMarker className="w-4 h-4 text-gray-400" />
                    <span className="line-clamp-1">{property.region}</span>
                  </div>
                )}

                {/* Features */}
                <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                  {property.bedrooms && (
                    <div className="flex items-center space-x-1">
                      <IoBedOutline className="w-4 h-4" />
                      <span>{Math.round(property.bedrooms)}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center space-x-1">
                      <MdBathtub className="w-4 h-4" />
                      <span>{Math.round(property.bathrooms)}</span>
                    </div>
                  )}
                  {property.indoorArea && (
                    <div className="flex items-center space-x-1">
                      <span>{Math.round(property.indoorArea)} м²</span>
                    </div>
                  )}
                </div>

                {/* Total Price */}
                {property.totalPrice && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 
                                rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {t('property.alternatives.totalPrice')}:
                      </span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        ฿{formatPrice(property.totalPrice)}
                      </span>
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                <button 
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 
                           text-white font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center 
                           space-x-2 group-hover:shadow-lg"
                >
                  <span>{t('property.alternatives.viewDetails')}</span>
                  <HiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More/Less Button */}
      {properties.length > 6 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                     text-gray-700 dark:text-gray-300 font-medium py-3 px-8 rounded-xl 
                     transition-all border-2 border-gray-200 dark:border-gray-600
                     hover:border-purple-300 dark:hover:border-purple-600"
          >
            {showAll 
              ? t('property.alternatives.showLess')
              : t('property.alternatives.showMore') + ` (${properties.length - 6})`
            }
          </button>
        </div>
      )}
    </div>
  )
}

export default AlternativeProperties