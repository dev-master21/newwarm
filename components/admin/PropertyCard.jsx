// frontend/src/components/admin/PropertyCard.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiChevronLeft,
  HiChevronRight,
  HiPencil,
  HiEye,
  HiEyeOff,
  HiTrash,
  HiPhotograph,
  HiHome,
  HiCash,
  HiLocationMarker,
  HiTag
} from 'react-icons/hi'

const PropertyCard = ({ property, onDelete, onToggleVisibility }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Получаем все фотографии или используем плейсхолдер
  const photos = property.photos || []
  const hasPhotos = photos.length > 0
  
  // Формируем полный URL для фотографии
  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null
    // Если URL уже полный, возвращаем как есть
    if (photoUrl.startsWith('http')) return photoUrl
    // Иначе добавляем базовый URL
    return `https://warm.novaestate.company${photoUrl}`
  }
  
  const currentPhoto = hasPhotos ? getPhotoUrl(photos[currentPhotoIndex]) : null

  const nextPhoto = (e) => {
    e.stopPropagation()
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
      setImageLoaded(false)
    }
  }

  const prevPhoto = (e) => {
    e.stopPropagation()
    if (hasPhotos) {
      setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
      setImageLoaded(false)
    }
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    navigate(`/admin/properties/${property.id}/edit`)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(property.id)
  }

  const handleToggleVisibility = (e) => {
    e.stopPropagation()
    const newStatus = property.status === 'published' ? 'hidden' : 'published'
    onToggleVisibility(property.id, newStatus)
  }

  const formatPrice = (price) => {
    if (!price) return null
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  const isHidden = property.status === 'hidden'
  const isDraft = property.status === 'draft'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden 
                 border-2 border-gray-100 dark:border-gray-700 hover:border-red-500 
                 dark:hover:border-red-500 transition-all duration-300 cursor-pointer"
      onClick={handleEdit}
    >
      {/* Image Slider */}
      <div className="relative h-64 bg-gray-200 dark:bg-gray-700 overflow-hidden group">
        <AnimatePresence mode="wait">
          {hasPhotos && currentPhoto ? (
            <motion.img
              key={currentPhotoIndex}
              src={currentPhoto}
              alt={property.property_name || 'Property'}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: imageLoaded ? 1 : 0.5, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                console.error('Image load error:', currentPhoto)
                e.target.style.display = 'none'
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiPhotograph className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </AnimatePresence>

        {/* Photo Navigation */}
        {hasPhotos && photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 
                       hover:bg-black/70 text-white rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              <HiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 
                       hover:bg-black/70 text-white rounded-full flex items-center justify-center
                       opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            >
              <HiChevronRight className="w-6 h-6" />
            </button>

            {/* Photo Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setCurrentPhotoIndex(index)
                    setImageLoaded(false)
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentPhotoIndex
                      ? 'w-8 bg-white'
                      : 'w-1.5 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Photos Count Badge */}
        {hasPhotos && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-sm 
                        rounded-full flex items-center space-x-1.5 z-10">
            <HiPhotograph className="w-4 h-4 text-white" />
            <span className="text-xs font-medium text-white">
              {t('admin.properties.photosCount', { count: photos.length })}
            </span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 z-10">
          {isHidden && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2.5 py-1 bg-yellow-500 backdrop-blur-sm rounded-full"
            >
              <span className="text-xs font-semibold text-white">
                {t('admin.properties.hidden')}
              </span>
            </motion.div>
          )}
          {isDraft && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2.5 py-1 bg-gray-500 backdrop-blur-sm rounded-full"
            >
              <span className="text-xs font-semibold text-white">
                {t('admin.properties.draft')}
              </span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title and Number */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
            {property.property_name || t('admin.properties.noName')}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <HiTag className="w-4 h-4" />
            <span className="font-medium">#{property.property_number}</span>
          </div>
        </div>

        {/* Location */}
        {property.address && (
          <div className="flex items-start space-x-2 mb-4">
            <HiLocationMarker className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {property.address}
            </p>
          </div>
        )}

        {/* Property Type */}
        {property.property_type && (
          <div className="flex items-center space-x-2 mb-4">
            <HiHome className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t(`admin.editProperty.propertyTypes.${property.property_type}`)}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="mb-5">
          {property.sale_price ? (
            <div className="flex items-center space-x-2">
              <HiCash className="w-5 h-5 text-green-500" />
              <div>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(property.sale_price)}
                </span>
                <span className="text-lg text-gray-600 dark:text-gray-400 ml-1">
                  {t('admin.properties.priceTotal')}
                </span>
              </div>
            </div>
          ) : property.minimum_rent_price ? (
            <div className="flex items-center space-x-2">
              <HiCash className="w-5 h-5 text-green-500" />
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.properties.priceFrom')}{' '}
                </span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(property.minimum_rent_price)}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  {t('admin.properties.pricePerNight')}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <HiCash className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.properties.priceNotSet')}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Edit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5
                     bg-blue-500 hover:bg-blue-600 text-white rounded-lg
                     transition-colors duration-200 font-medium"
          >
            <HiPencil className="w-4 h-4" />
            <span>{t('admin.properties.actions.edit')}</span>
          </motion.button>

          {/* Toggle Visibility Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleVisibility}
            className={`flex items-center justify-center p-2.5 rounded-lg
                     transition-colors duration-200 ${
              isHidden
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            }`}
            title={isHidden ? t('admin.properties.actions.show') : t('admin.properties.actions.hide')}
          >
            {isHidden ? (
              <HiEye className="w-5 h-5" />
            ) : (
              <HiEyeOff className="w-5 h-5" />
            )}
          </motion.button>

          {/* Delete Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            className="flex items-center justify-center p-2.5 bg-red-500 hover:bg-red-600
                     text-white rounded-lg transition-colors duration-200"
            title={t('admin.properties.actions.delete')}
          >
            <HiTrash className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default PropertyCard