// frontend/src/components/Property/PropertyGallery.jsx
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiChevronLeft, HiChevronRight, HiPhotograph, HiChevronDown, HiHome, HiEye } from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import { MdBathtub, MdKitchen, MdWeekend, MdVrpano } from 'react-icons/md'
import { FaSwimmingPool } from 'react-icons/fa'
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
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(true)
  const [isBedroomSubMenuOpen, setIsBedroomSubMenuOpen] = useState(false)
  const [showBedroomButtons, setShowBedroomButtons] = useState(false)

  const hasCategories = Object.keys(photosByCategory).length > 1

  const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return '/placeholder-villa.jpg'
    if (photoUrl.startsWith('http')) return photoUrl
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${photoUrl}`
  }

  // Получаем иконку для категории
  const getCategoryIcon = (categoryValue) => {
    const iconMap = {
      all: HiPhotograph,
      general: HiPhotograph,
      bedroom: IoBedOutline,
      bathroom: MdBathtub,
      kitchen: MdKitchen,
      living: MdWeekend,
      exterior: HiHome,
      pool: FaSwimmingPool,
      view: HiEye
    }
    
    if (categoryValue.startsWith('bedroom-')) {
      return IoBedOutline
    }
    
    return iconMap[categoryValue] || HiPhotograph
  }

  // Группируем спальни
  const getBedroomCategories = () => {
    const bedrooms = []
    Object.keys(photosByCategory).forEach(cat => {
      if (cat.startsWith('bedroom-')) {
        const number = parseInt(cat.split('-')[1])
        bedrooms.push({
          value: cat,
          number: number,
          label: `${t('property.gallery.categories.bedroom')} ${number}`,
          count: photosByCategory[cat]?.length || 0
        })
      }
    })
    return bedrooms.sort((a, b) => a.number - b.number)
  }

  const bedroomCategories = getBedroomCategories()
  const hasMultipleBedrooms = bedroomCategories.length > 1

  // Основные категории (без спален с номерами)
  const getMainCategories = () => {
    const cats = ['all']
    
    if (bedroomCategories.length > 0) {
      cats.push('bedroom')
    }
    
    Object.keys(photosByCategory).forEach(cat => {
      if (!cat.startsWith('bedroom-') && cat !== 'general') {
        cats.push(cat)
      }
    })
    
    return cats
  }

  const mainCategories = getMainCategories()

  const filteredPhotos = selectedCategory === 'all' 
    ? photos 
    : selectedCategory === 'bedroom' && hasMultipleBedrooms
      ? bedroomCategories.reduce((acc, b) => [...acc, ...(photosByCategory[b.value] || [])], [])
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
    if (category === 'bedroom' && hasMultipleBedrooms) return t('property.gallery.categories.bedrooms')
    if (category.startsWith('bedroom-')) {
      const number = category.split('-')[1]
      return `${t('property.gallery.categories.bedroom')} ${number}`
    }
    return t(`property.gallery.categories.${category}`) || category
  }

  const getCategoryCount = (category) => {
    if (category === 'all') return photos.length
    if (category === 'bedroom' && hasMultipleBedrooms) {
      return bedroomCategories.reduce((sum, b) => sum + b.count, 0)
    }
    return photosByCategory[category]?.length || 0
  }

  const handleCategorySelect = (category) => {
    if (category === 'bedroom' && hasMultipleBedrooms) {
      setShowBedroomButtons(!showBedroomButtons)
    } else {
      setSelectedCategory(category)
      setCurrentIndex(0)
      setShowBedroomButtons(false)
    }
  }

  const handleBedroomSelect = (bedroomCategory) => {
    setSelectedCategory(bedroomCategory)
    setCurrentIndex(0)
    setIsBedroomSubMenuOpen(false)
    setShowBedroomButtons(false)
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
    <motion.div
      key={selectedCategory}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Photo Grid */}
      <div className="relative" style={{ minHeight: '350px' }}>
        <div className="transition-all duration-300">
          {filteredPhotos.length === 1 && (
            // Одно фото - показываем большим
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group h-[350px] md:h-[450px]"
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

          {filteredPhotos.length === 2 && (
            // Два фото - на мобильном вертикально, на ПК горизонтально
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group h-[175px] md:h-[450px]"
                  onClick={() => openModal(index)}
                >
                  <img
                    src={getPhotoUrl(photo.photo_url)}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </motion.div>
              ))}
            </div>
          )}

          {filteredPhotos.length === 3 && (
            // Три фото - на мобильном: 1 большое + 2 маленьких, на ПК: 3 в ряд
            <>
              {/* Мобильная версия */}
              <div className="md:hidden space-y-2">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group h-[250px]"
                  onClick={() => openModal(0)}
                >
                  <img
                    src={getPhotoUrl(filteredPhotos[0].photo_url)}
                    alt="Property 1"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </motion.div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredPhotos.slice(1).map((photo, index) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (index + 1) * 0.1 }}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group h-[120px]"
                      onClick={() => openModal(index + 1)}
                    >
                      <img
                        src={getPhotoUrl(photo.photo_url)}
                        alt={`Property ${index + 2}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Десктопная версия */}
              <div className="hidden md:grid md:grid-cols-3 md:gap-4">
                {filteredPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group h-[450px]"
                    onClick={() => openModal(index)}
                  >
                    <img
                      src={getPhotoUrl(photo.photo_url)}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {filteredPhotos.length === 4 && (
            // Четыре фото - сетка 2x2
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group h-[175px] md:h-[280px]"
                  onClick={() => openModal(index)}
                >
                  <img
                    src={getPhotoUrl(photo.photo_url)}
                    alt={`Property ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </motion.div>
              ))}
            </div>
          )}

          {filteredPhotos.length >= 5 && (
            // Пять и больше фото - стандартный layout
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              {/* Main large photo */}
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
                        isLastSmallPhoto ? 'brightness-75' : ''
                      }`}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    
                    {isLastSmallPhoto && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center text-white">
                          <HiPhotograph className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2" />
                          <p className="text-xl md:text-2xl font-bold">+{filteredPhotos.length - 5}</p>
                          <p className="text-xs md:text-sm">{t('property.gallery.morePhotos')}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Category Selector */}
      {hasCategories && (
        <div className="hidden md:block mt-6">
          <div className="flex items-center justify-center flex-wrap gap-2">
            {mainCategories.map((category) => {
              const Icon = getCategoryIcon(category)
              const isBedroomGroup = category === 'bedroom' && hasMultipleBedrooms
              const isSelected = isBedroomGroup 
                ? bedroomCategories.some(b => b.value === selectedCategory) || selectedCategory === 'bedroom'
                : selectedCategory === category
              
              return (
                <div key={category} className="relative">
                  <button
                    onClick={() => handleCategorySelect(category)}
                    className={`
                      px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all flex items-center space-x-2
                      ${isSelected
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{getCategoryName(category)}</span>
                    <span className="text-sm opacity-75">
                      ({getCategoryCount(category)})
                    </span>
                    {isBedroomGroup && (
                      <HiChevronDown className={`w-4 h-4 transition-transform ${showBedroomButtons ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Bedroom Buttons */}
                  {isBedroomGroup && showBedroomButtons && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                               border border-gray-200 dark:border-gray-700 p-2 z-10 min-w-full"
                    >
                      {bedroomCategories.map((bedroom) => (
                        <button
                          key={bedroom.value}
                          onClick={() => handleBedroomSelect(bedroom.value)}
                          className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
                            selectedCategory === bedroom.value
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <IoBedOutline className="w-4 h-4" />
                            <span className="font-medium">{bedroom.label}</span>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({bedroom.count})
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Mobile Category Selector */}
      {hasCategories && (
        <div className="md:hidden mt-4">
          <button
            onClick={() => setIsMobileCategoryOpen(!isMobileCategoryOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 
                     rounded-xl text-gray-900 dark:text-white font-medium transition-all hover:bg-gray-200 
                     dark:hover:bg-gray-600"
          >
            <div className="flex items-center space-x-2">
              {(() => {
                const Icon = getCategoryIcon(selectedCategory)
                return <Icon className="w-5 h-5" />
              })()}
              <span>{getCategoryName(selectedCategory)}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({getCategoryCount(selectedCategory)})
              </span>
            </div>
            <motion.div
              animate={{ rotate: isMobileCategoryOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <HiChevronDown className="w-5 h-5" />
            </motion.div>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMobileCategoryOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg 
                         border border-gray-200 dark:border-gray-700"
              >
                <div className="py-2">
                  {mainCategories.map((category) => {
                    const Icon = getCategoryIcon(category)
                    const isBedroomGroup = category === 'bedroom' && hasMultipleBedrooms
                    const isSelected = isBedroomGroup 
                      ? bedroomCategories.some(b => b.value === selectedCategory) || selectedCategory === 'bedroom'
                      : selectedCategory === category
                    
                    return (
                      <div key={category}>
                        <button
                          onClick={() => {
                            if (isBedroomGroup) {
                              setIsBedroomSubMenuOpen(!isBedroomSubMenuOpen)
                            } else {
                              handleCategorySelect(category)
                            }
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{getCategoryName(category)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              ({getCategoryCount(category)})
                            </span>
                            {isBedroomGroup && (
                              <HiChevronDown className={`w-4 h-4 transition-transform ${isBedroomSubMenuOpen ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </button>

                        {/* Bedroom Submenu */}
                        {isBedroomGroup && isBedroomSubMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 dark:bg-gray-900/50"
                          >
                            {bedroomCategories.map((bedroom) => (
                              <button
                                key={bedroom.value}
                                onClick={() => handleBedroomSelect(bedroom.value)}
                                className={`w-full flex items-center justify-between px-8 py-3 transition-all ${
                                  selectedCategory === bedroom.value
                                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <IoBedOutline className="w-4 h-4" />
                                  <span className="font-medium">{bedroom.label}</span>
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ({bedroom.count})
                                </span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* VR Button */}
      {hasVRPanoramas && !checkingVR && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <motion.button
            onClick={loadVRPanoramas}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white 
                     font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl 
                     transition-all overflow-hidden group"
            animate={{
              scale: [1, 1.02, 0.99, 1],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeOut",
              times: [0, 0.18, 0.35, 0.76, 1]
            }}
          >
            <div className="relative z-10 flex items-center justify-center space-x-3">
              <MdVrpano className="w-7 h-7" />
              <div className="flex flex-col items-start">
                <span className="text-lg font-bold">{t('property.gallery.view360')}</span>
                <span className="text-xs text-blue-100">{t('property.gallery.vrTourAvailable')}</span>
              </div>
            </div>
          
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
    </motion.div>
  )
}

export default PropertyGallery