// frontend/src/components/Property/PropertyGallery.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiChevronLeft, HiChevronRight, HiPhotograph } from 'react-icons/hi'
import { MdVrpano } from 'react-icons/md'
import VRPanorama from './VRPanorama'
import propertyApi from '../../api/propertyApi'
import toast from 'react-hot-toast'

const PropertyGallery = ({ photos = [], photosByCategory = {}, propertyId }) => {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isVROpen, setIsVROpen] = useState(false)
  const [vrPanoramas, setVrPanoramas] = useState([])
  const [hasVRPanoramas, setHasVRPanoramas] = useState(false)
  const [checkingVR, setCheckingVR] = useState(true)

  const hasCategories = Object.keys(photosByCategory).length > 1

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return '/placeholder-villa.jpg'
    if (photoUrl.startsWith('http')) return photoUrl
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${photoUrl}`
  }

  const categories = hasCategories 
    ? ['all', ...Object.keys(photosByCategory).filter(cat => cat !== 'general')]
    : []

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : (photosByCategory[selectedCategory] || [])

  useEffect(() => {
    const checkVRAvailability = async () => {
      if (!propertyId) {
        setCheckingVR(false)
        return
      }

      try {
        const response = await propertyApi.getPropertyVRPanoramas(propertyId)
        
        if (response.success && response.data.panoramas && response.data.panoramas.length > 0) {
          setHasVRPanoramas(true)
        }
      } catch (error) {
        console.log('No VR panoramas available for this property')
      } finally {
        setCheckingVR(false)
      }
    }

    checkVRAvailability()
  }, [propertyId])

  const loadVRPanoramas = async () => {
    try {
      const response = await propertyApi.getPropertyVRPanoramas(propertyId)
      
      if (response.success && response.data.panoramas.length > 0) {
        setVrPanoramas(response.data.panoramas)
        setIsVROpen(true)
      } else {
        toast.error(t('vr.errors.noPanoramas'))
      }
    } catch (error) {
      console.error('Error loading VR panoramas:', error)
      toast.error(t('vr.errors.loadFailed'))
    }
  }

  const openModal = (index) => {
    setCurrentIndex(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = 'unset'
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredPhotos.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredPhotos.length) % filteredPhotos.length)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') goToNext()
    if (e.key === 'ArrowLeft') goToPrev()
    if (e.key === 'Escape') closeModal()
  }

  useEffect(() => {
    if (isModalOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isModalOpen, filteredPhotos.length])

  const getCategoryName = (category) => {
    if (category === 'all') return t('property.gallery.allPhotos')
    return t(`property.gallery.categories.${category}`) || category
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl h-96 flex items-center justify-center">
        <div className="text-center">
          <HiPhotograph className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('property.gallery.noPhotos')}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Category Selector */}
      {hasCategories && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category)
                  setCurrentIndex(0)
                }}
                className={`
                  px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all
                  ${selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {getCategoryName(category)}
                <span className="ml-2 text-sm opacity-75">
                  ({category === 'all' ? photos.length : (photosByCategory[category]?.length || 0)})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {/* Main large photo */}
        {filteredPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
            onClick={() => openModal(0)}
          >
            <img
              src={getPhotoUrl(filteredPhotos[0].photo_url)}
              alt="Property"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </motion.div>
        )}

        {/* Other photos */}
        {filteredPhotos.slice(1, 5).map((photo, index) => {
          const actualIndex = index + 1
          const isLastSmallPhoto = actualIndex === 4 && filteredPhotos.length > 5
          
          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: actualIndex * 0.05 }}
              className="relative rounded-xl overflow-hidden cursor-pointer group aspect-square"
              onClick={() => openModal(actualIndex)}
            >
              <img
                src={getPhotoUrl(photo.photo_url)}
                alt={`Property ${actualIndex + 1}`}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                  isLastSmallPhoto ? 'filter blur-sm' : ''
                }`}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              
              {isLastSmallPhoto && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
                  <HiPhotograph className="w-8 h-8 text-white" />
                  <span className="text-white font-semibold text-xl">
                    +{filteredPhotos.length - 5}
                  </span>
                  <span className="text-white/90 text-sm font-medium">
                    {t('property.gallery.viewAll')}
                  </span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Кнопка VR с пульсацией без изменения цвета */}
      {!checkingVR && hasVRPanoramas && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 w-full"
        >
          <motion.button
            onClick={loadVRPanoramas}
            className="relative w-full group flex items-center justify-center space-x-3 px-8 py-4 
                       bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl 
                       transition-colors cursor-pointer overflow-hidden"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                '0 0 0 0px rgba(59,130,246,0.3), 0 0 0 0px rgba(59,130,246,0.2)',
                '0 0 0 0px rgba(59,130,246,0.3), 0 0 0 0px rgba(59,130,246,0.2)',
                '0 0 0 0px rgba(59,130,246,0.3), 0 0 0 0px rgba(59,130,246,0.2)',
                '0 0 0 0px rgba(59,130,246,0.3), 0 0 0 0px rgba(59,130,246,0.2)',
                '0 0 0 16px rgba(59,130,246,0), 0 0 0 27px rgba(59,130,246,0)'
              ],
              scale: [1, 1.02, 0.99, 1],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.18, 0.35, 0.76, 1]
            }}
          >
            {/* Контент кнопки */}
            <div className="relative z-10 flex items-center space-x-3">
              <MdVrpano className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">{t('property.gallery.view360')}</span>
                <span className="text-xs text-blue-100">{t('property.gallery.vrTourAvailable')}</span>
              </div>
            </div>
          
            {/* Hover glow эффект */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ boxShadow: '0 0 0 0px rgba(59,130,246,0), 0 0 0 0px rgba(59,130,246,0)' }}
              whileHover={{
                boxShadow: '0 0 0 4px rgba(59,130,246,0.3), 0 0 0 8px rgba(59,130,246,0.2)'
              }}
              transition={{ duration: 0.35 }}
            />
          </motion.button>
        </motion.div>
      )}


      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full
                       flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <HiX className="w-6 h-6 text-white" />
            </button>

            <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
              {currentIndex + 1} / {filteredPhotos.length}
            </div>

            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm 
                       rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <HiChevronLeft className="w-8 h-8 text-white" />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm 
                       rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <HiChevronRight className="w-8 h-8 text-white" />
            </button>

            <div className="w-full h-full flex items-center justify-center p-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  src={getPhotoUrl(filteredPhotos[currentIndex].photo_url)}
                  alt={`Property ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              </AnimatePresence>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
                {filteredPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`
                      flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                      ${index === currentIndex 
                        ? 'border-white scale-110' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                      }
                    `}
                  >
                    <img
                      src={getPhotoUrl(photo.photo_url)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <VRPanorama 
        panoramas={vrPanoramas}
        isOpen={isVROpen}
        onClose={() => setIsVROpen(false)}
      />
    </div>
  )
}

export default PropertyGallery