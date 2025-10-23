import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiHome, HiLocationMarker, HiUsers, HiCurrencyDollar } from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { propertyService } from '../../services/property.service'
import toast from 'react-hot-toast'

const AlternativeProperties = ({ propertyId, checkIn, checkOut, bedrooms }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadAlternatives()
  }, [propertyId, checkIn, checkOut])

  const loadAlternatives = async () => {
    try {
      setLoading(true)
      const response = await propertyService.findAlternatives(propertyId, {
        checkIn,
        checkOut,
        bedrooms,
        maxResults: 10
      })

      if (response.success) {
        setProperties(response.data.properties)
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!properties || properties.length === 0) {
    return null
  }

  const displayedProperties = showAll ? properties : properties.slice(0, 5)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2">
          <HiHome className="w-6 h-6 text-blue-500" />
          <span>{t('property.alternatives.title')}</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('property.alternatives.subtitle')}
        </p>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handlePropertyClick(property.id)}
            className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden cursor-pointer 
                     hover:shadow-xl transition-all duration-300 group"
          >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={getPhotoUrl(property.cover_photo)}
                alt={property.property_name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Price Badge */}
              {property.price_per_night && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                  ฿{parseFloat(property.price_per_night).toLocaleString()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Title */}
              <h4 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors">
                {property.property_name || `Property #${property.property_number}`}
              </h4>

              {/* Features */}
              <div className="flex items-center flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
                {property.bedrooms && (
                  <div className="flex items-center space-x-1">
                    <IoBedOutline className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center space-x-1">
                    <MdBathtub className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                {property.indoor_area && (
                  <div className="flex items-center space-x-1">
                    <span>{property.indoor_area} м²</span>
                  </div>
                )}
              </div>

              {/* View Details Button */}
              <button className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                {t('property.alternatives.viewDetails')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show More Button */}
      {properties.length > 5 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                     text-gray-700 dark:text-gray-300 font-medium py-3 px-8 rounded-xl transition-colors"
          >
            {showAll ? t('property.alternatives.showLess') : t('property.alternatives.showMore')}
          </button>
        </div>
      )}
    </div>
  )
}

export default AlternativeProperties