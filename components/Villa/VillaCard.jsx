import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiHeart, HiLocationMarker, HiUsers, HiStar } from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { useShortlistStore } from '../../store/shortlistStore'

const VillaCard = ({ villa, viewMode = 'grid' }) => {
  const { t } = useTranslation()
  const { addItem, removeItem, isInShortlist } = useShortlistStore()

  const handleShortlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isInShortlist(villa.id)) {
      removeItem(villa.id)
    } else {
      addItem(villa)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // List View
  if (viewMode === 'list') {
    return (
      <div className="villa-card-container">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden 
                   hover:shadow-xl transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <Link to={`/villas/${villa.slug || villa.id}`} className="relative md:w-96 h-64 md:h-auto overflow-hidden group">
              <img
                src={villa.cover || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'}
                alt={villa.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Badge - всегда поверх всего */}
              {villa.tags && villa.tags.some && villa.tags.some(tag => tag.slug === 'featured') && (
                <div className="absolute top-4 left-4 z-20 pointer-events-none">
                  <span className="px-3 py-1 bg-red-600 text-white text-xs 
                                 font-semibold rounded-full">
                    {t('villa.featured') || 'Featured'}
                  </span>
                </div>
              )}
            </Link>
            
            {/* Shortlist Button - ВНЕ Link компонента */}
            <button
              onClick={handleShortlistToggle}
              className={`absolute top-4 right-4 p-2 rounded-full z-30
                       bg-white/90 backdrop-blur-sm transition-colors duration-200
                       hover:bg-white hover:shadow-lg
                       ${isInShortlist(villa.id) 
                         ? 'text-red-600' 
                         : 'text-gray-600 hover:text-red-600'}`}
              aria-label={isInShortlist(villa.id) ? t('villa.removeFromShortlist') : t('villa.addToShortlist')}
            >
              <HiHeart className={`w-5 h-5 transition-transform duration-200 ${
                isInShortlist(villa.id) ? 'fill-current scale-110' : 'hover:scale-110'
              }`} />
            </button>
            
            {/* Content */}
            <Link to={`/villas/${villa.slug || villa.id}`} className="flex-1 p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {villa.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                    <HiLocationMarker className="w-4 h-4 mr-1" />
                    <span className="text-sm">{villa.city}, Thailand</span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {villa.description || 'Luxury villa with stunning views and modern amenities'}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                      <IoBedOutline className="w-4 h-4 mr-1" />
                      <span>{villa.bedrooms_num} {t('villa.bedrooms')}</span>
                    </div>
                    <div className="flex items-center">
                      <MdBathtub className="w-4 h-4 mr-1" />
                      <span>{villa.bathrooms_num || 2} {t('villa.bathrooms')}</span>
                    </div>
                    <div className="flex items-center">
                      <HiUsers className="w-4 h-4 mr-1" />
                      <span>{villa.adults_num} {t('villa.adults')}</span>
                    </div>
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right ml-4">
                  {villa.original_price && villa.original_price > villa.price && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(villa.original_price)}
                    </div>
                  )}
                  <div className="text-2xl font-bold text-red-600">
                    {formatPrice(villa.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('villa.perNight')}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // Grid View (default)
  return (
    <div className="villa-card-container">
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ duration: 0.3 }}
        className="villa-card bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-shadow duration-300 relative"
      >
        {/* Image Container с Link */}
        <Link to={`/villas/${villa.slug || villa.id}`} className="block">
          <div className="villa-card-image relative h-64 group overflow-hidden">
            <img
              src={villa.cover || 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'}
              alt={villa.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay Gradient - только визуальный эффект */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
            
            {/* Badge - с pointer-events-none чтобы не блокировать клики */}
            {villa.tags && villa.tags.some && villa.tags.some(tag => tag.slug === 'featured') && (
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="px-3 py-1 bg-red-600 text-white text-xs 
                               font-semibold rounded-full shadow-lg">
                  {t('villa.featured') || 'Рекомендуемое'}
                </span>
              </div>
            )}
            
            {/* Price Badge - с pointer-events-none */}
            <div className="absolute bottom-4 right-4 z-20 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                {villa.original_price && villa.original_price > villa.price && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatPrice(villa.original_price)}
                  </div>
                )}
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(villa.price)}
                  <span className="text-xs text-gray-500 font-normal ml-1">
                    /{t('villa.perNight') || 'за ночь'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-5">
            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 
                         hover:text-red-600 transition-colors">
              {villa.name}
            </h3>
            
            {/* Location */}
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3">
              <HiLocationMarker className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="text-sm truncate">{villa.city}, Thailand</span>
            </div>
            
            {/* Features */}
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <IoBedOutline className="w-4 h-4 mr-1" />
                <span>{villa.bedrooms_num}</span>
              </div>
              <div className="flex items-center">
                <MdBathtub className="w-4 h-4 mr-1" />
                <span>{villa.bathrooms_num || 2}</span>
              </div>
              <div className="flex items-center">
                <HiUsers className="w-4 h-4 mr-1" />
                <span>{villa.adults_num}</span>
              </div>
              {villa.rating && (
                <div className="flex items-center">
                  <HiStar className="w-4 h-4 mr-1 text-yellow-400" />
                  <span>{villa.rating}</span>
                </div>
              )}
            </div>
          </div>
        </Link>
        
        {/* Shortlist Button - АБСОЛЮТНО ПОЗИЦИОНИРОВАН ВНЕ Link */}
        <button
          onClick={handleShortlistToggle}
          onMouseDown={(e) => e.stopPropagation()} // Предотвращаем всплытие события
          className={`absolute top-4 right-4 p-2 rounded-full z-30
                   bg-white/90 backdrop-blur-sm transition-all duration-200
                   hover:bg-white hover:shadow-lg cursor-pointer
                   ${isInShortlist(villa.id) 
                     ? 'text-red-600' 
                     : 'text-gray-600 hover:text-red-600'}`}
          aria-label={isInShortlist(villa.id) ? t('villa.removeFromShortlist') : t('villa.addToShortlist')}
          style={{ isolation: 'isolate' }} // Изолируем от других элементов
        >
          <HiHeart className={`w-5 h-5 transition-all duration-200 ${
            isInShortlist(villa.id) ? 'fill-current' : ''
          }`} />
        </button>
      </motion.div>
    </div>
  )
}

export default VillaCard