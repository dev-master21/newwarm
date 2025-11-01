// frontend/src/components/admin/PhotosEditor.jsx
import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import {
  HiPhotograph,
  HiChevronDown,
  HiUpload,
  HiTrash,
  HiStar,
  HiTag,
  HiArrowRight,
  HiX,
  HiHashtag,
  HiHome,
  HiEye,
  HiPlus
} from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import { MdBathtub, MdKitchen, MdWeekend } from 'react-icons/md'
import { FaSwimmingPool } from 'react-icons/fa'
import propertyApi from '../../api/propertyApi'
import toast from 'react-hot-toast'

const PhotosEditor = ({ photos: initialPhotos, propertyId, onUpdate }) => {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  
  const [isExpanded, setIsExpanded] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [localPhotos, setLocalPhotos] = useState(initialPhotos)
  const [processingPhotoId, setProcessingPhotoId] = useState(null)
  const [selectedPhotoForMobile, setSelectedPhotoForMobile] = useState(null)
  const [movingPhotoId, setMovingPhotoId] = useState(null)
  const [positionChangePhotoId, setPositionChangePhotoId] = useState(null)
  const [newPosition, setNewPosition] = useState('')
  const [bedroomCount, setBedroomCount] = useState(1)
  
  // Получаем иконку для категории
  const getCategoryIcon = (categoryValue) => {
    const iconMap = {
      general: HiPhotograph,
      bedroom: IoBedOutline,
      bathroom: MdBathtub,
      kitchen: MdKitchen,
      living: MdWeekend,
      exterior: HiHome,
      pool: FaSwimmingPool,
      view: HiEye
    }
    
    // Для спален с номерами (bedroom-1, bedroom-2 и т.д.)
    if (categoryValue.startsWith('bedroom-')) {
      return IoBedOutline
    }
    
    const Icon = iconMap[categoryValue] || HiPhotograph
    return Icon
  }

  // Базовые категории
  const baseCategories = [
    { value: 'general', label: t('admin.photosEditor.categories.general') },
    { value: 'bedroom', label: t('admin.photosEditor.categories.bedroom') },
    { value: 'bathroom', label: t('admin.photosEditor.categories.bathroom') },
    { value: 'kitchen', label: t('admin.photosEditor.categories.kitchen') },
    { value: 'living', label: t('admin.photosEditor.categories.living') },
    { value: 'exterior', label: t('admin.photosEditor.categories.exterior') },
    { value: 'pool', label: t('admin.photosEditor.categories.pool') },
    { value: 'view', label: t('admin.photosEditor.categories.view') }
  ]

  // Генерируем категории с учетом количества спален
  const generateCategories = () => {
    const cats = []
    
    for (const cat of baseCategories) {
      if (cat.value === 'bedroom') {
        // Добавляем спальни с номерами
        for (let i = 1; i <= bedroomCount; i++) {
          cats.push({
            value: `bedroom-${i}`,
            label: `${t('admin.photosEditor.categories.bedroom')} ${i}`,
            isSubcategory: true,
            parentCategory: 'bedroom'
          })
        }
      } else {
        cats.push(cat)
      }
    }
    
    return cats
  }

  const categories = generateCategories()

  // Синхронизация с props
  useEffect(() => {
    setLocalPhotos(initialPhotos)
    
    // Определяем максимальное количество спален из существующих фото
    const maxBedroom = initialPhotos.reduce((max, photo) => {
      if (photo.category && photo.category.startsWith('bedroom-')) {
        const num = parseInt(photo.category.split('-')[1])
        return Math.max(max, num)
      }
      return max
    }, 1)
    
    setBedroomCount(maxBedroom)
  }, [initialPhotos])

  // Группировка фотографий по категориям
  const groupedPhotos = localPhotos.reduce((acc, photo) => {
    const category = photo.category || 'general'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(photo)
    return acc
  }, {})

  // Сортировка фото по sort_order
  Object.keys(groupedPhotos).forEach(category => {
    groupedPhotos[category].sort((a, b) => a.sort_order - b.sort_order)
  })

  // Добавление спальни
  const handleAddBedroom = () => {
    setBedroomCount(prev => prev + 1)
    toast.success(t('admin.photosEditor.success.bedroomAdded', { number: bedroomCount + 1 }))
  }

  // Удаление спальни
  const handleRemoveBedroom = async (bedroomNumber) => {
    const bedroomCategory = `bedroom-${bedroomNumber}`
    const bedroomPhotos = groupedPhotos[bedroomCategory] || []
    
    if (bedroomPhotos.length > 0) {
      const confirmed = window.confirm(
        t('admin.photosEditor.confirm.deleteBedroomWithPhotos', { 
          number: bedroomNumber, 
          count: bedroomPhotos.length 
        })
      )
      if (!confirmed) return
      
      // Удаляем все фото этой спальни
      for (const photo of bedroomPhotos) {
        try {
          await propertyApi.deletePhoto(photo.id)
        } catch (error) {
          console.error('Failed to delete photo:', error)
        }
      }
    }
    
    setBedroomCount(prev => Math.max(1, prev - 1))
    
    if (onUpdate) {
      await onUpdate()
    }
    
    toast.success(t('admin.photosEditor.success.bedroomRemoved', { number: bedroomNumber }))
  }

  // Загрузка файлов
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error(t('admin.photosEditor.errors.fileTooLarge'))
      return
    }

    try {
      setUploading(true)
      setUploadProgress(0)
      
      const result = await propertyApi.uploadPhotos(propertyId, files, selectedCategory, (progress) => {
        setUploadProgress(progress)
      })
      
      toast.success(t('admin.photosEditor.success.uploaded', { count: files.length }))
      
      // Перезагружаем данные после успешной загрузки
      if (onUpdate) {
        await onUpdate()
      }
    } catch (error) {
      console.error('Failed to upload photos:', error)
      toast.error(t('admin.photosEditor.errors.uploadFailed'))
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Удаление фотографии
  const handleDeletePhoto = async (photoId) => {
    const confirmed = window.confirm(t('admin.photosEditor.confirm.deletePhoto'))
    if (!confirmed) return

    const oldPhotos = [...localPhotos]
    setLocalPhotos(localPhotos.filter(p => p.id !== photoId))

    try {
      await propertyApi.deletePhoto(photoId)
      toast.success(t('admin.photosEditor.success.photoDeleted'))
      
      if (onUpdate) {
        await onUpdate()
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
      toast.error(t('admin.photosEditor.errors.deleteFailed'))
      setLocalPhotos(oldPhotos)
    }
  }

  // Установка главной фотографии
  const handleSetPrimary = async (photoId) => {
    const oldPhotos = [...localPhotos]
    setLocalPhotos(localPhotos.map(p => ({
      ...p,
      is_primary: p.id === photoId
    })))

    try {
      await propertyApi.setPrimaryPhoto(photoId, 'global')
      toast.success(t('admin.photosEditor.success.primarySet'))
      
      if (onUpdate) {
        await onUpdate()
      }
    } catch (error) {
      console.error('Failed to set primary photo:', error)
      toast.error(t('admin.photosEditor.errors.primaryFailed'))
      setLocalPhotos(oldPhotos)
    }
  }

  // Получение категории фотографии
  const getPhotoCategory = (photoId) => {
    const photo = localPhotos.find(p => p.id === photoId)
    return photo?.category || 'general'
  }

  // Перемещение фотографии в другую категорию
  const handleMovePhoto = async (photoId, newCategory) => {
    const oldPhotos = [...localPhotos]
    
    setLocalPhotos(localPhotos.map(p => 
      p.id === photoId ? { ...p, category: newCategory } : p
    ))

    setMovingPhotoId(null)
    setSelectedPhotoForMobile(null)

    try {
      await propertyApi.updatePhotoCategory(photoId, newCategory)
      toast.success(t('admin.photosEditor.success.photoMoved'))
    } catch (error) {
      console.error('Failed to move photo:', error)
      toast.error(t('admin.photosEditor.errors.moveFailed'))
      
      // Откат изменений
      setLocalPhotos(oldPhotos)
    }
  }

  // Изменение позиции фотографии вручную
  const handleChangePosition = async () => {
    const position = parseInt(newPosition)
    const photo = localPhotos.find(p => p.id === positionChangePhotoId)
    if (!photo) return

    const categoryPhotos = groupedPhotos[photo.category || 'general']
    
    if (isNaN(position) || position < 1 || position > categoryPhotos.length) {
      toast.error(t('admin.photosEditor.errors.invalidPosition'))
      return
    }

    const oldPhotos = [...localPhotos]
    const newIndex = position - 1

    // Обновляем порядок фотографий в категории
    const updatedCategoryPhotos = categoryPhotos.filter(p => p.id !== positionChangePhotoId)
    updatedCategoryPhotos.splice(newIndex, 0, photo)
    
    // Обновляем sort_order для всех фото в категории
    const updatedPhotos = updatedCategoryPhotos.map((p, index) => ({
      ...p,
      sort_order: index
    }))

    const newLocalPhotos = localPhotos.map(p => {
      const updated = updatedPhotos.find(up => up.id === p.id)
      return updated || p
    })

    setLocalPhotos(newLocalPhotos)
    setPositionChangePhotoId(null)
    setNewPosition('')
    setSelectedPhotoForMobile(null)

    try {
      const photosToUpdate = updatedPhotos.map((p, index) => ({
        id: p.id,
        sort_order: index
      }))
      
      await propertyApi.updatePhotosOrder(propertyId, photosToUpdate)
      toast.success(t('admin.photosEditor.success.positionChanged'))
    } catch (error) {
      console.error('Failed to change position:', error)
      toast.error(t('admin.photosEditor.errors.positionFailed'))
      
      // Откат изменений
      setLocalPhotos(oldPhotos)
    }
  }

  // Drag & Drop - поддержка перемещения между категориями
  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const sourceCategory = result.source.droppableId
    const destinationCategory = result.destination.droppableId
    
    const oldPhotos = [...localPhotos]

    // Перемещение между категориями
    if (sourceCategory !== destinationCategory) {
      const sourceItems = Array.from(groupedPhotos[sourceCategory])
      const [movedItem] = sourceItems.splice(result.source.index, 1)
      
      // Optimistic update - меняем категорию
      const updatedPhoto = { ...movedItem, category: destinationCategory }
      const newLocalPhotos = localPhotos.map(p => 
        p.id === movedItem.id ? updatedPhoto : p
      )

      setLocalPhotos(newLocalPhotos)

      try {
        await propertyApi.updatePhotoCategory(movedItem.id, destinationCategory)
        toast.success(t('admin.photosEditor.success.photoMoved'))
        
        if (onUpdate) {
          await onUpdate()
        }
      } catch (error) {
        console.error('Failed to move photo:', error)
        toast.error(t('admin.photosEditor.errors.moveFailed'))
        setLocalPhotos(oldPhotos)
      }
    } else {
      // Перемещение внутри одной категории
      const items = Array.from(groupedPhotos[sourceCategory])
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)

      // Обновляем sort_order
      const updatedPhotos = items.map((item, index) => ({
        ...item,
        sort_order: index
      }))

      const newLocalPhotos = localPhotos.map(p => {
        const updated = updatedPhotos.find(up => up.id === p.id)
        return updated || p
      })

      setLocalPhotos(newLocalPhotos)

      try {
        const photosToUpdate = updatedPhotos.map((p, index) => ({
          id: p.id,
          sort_order: index
        }))
        
        await propertyApi.updatePhotosOrder(propertyId, photosToUpdate)
      } catch (error) {
        console.error('Failed to reorder photos:', error)
        toast.error(t('admin.photosEditor.errors.reorderFailed'))
        setLocalPhotos(oldPhotos)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 mt-6"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-cyan-500 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <HiPhotograph className="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {t('admin.photosEditor.title')}
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              {t('admin.photosEditor.subtitle', { count: localPhotos.length })}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <HiChevronDown className="w-6 h-6 text-white" />
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Upload Section */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <HiUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('admin.photosEditor.upload.title')}
                    </h4>
                  </div>
                  
                  {/* Кнопка добавления спальни */}
                  {selectedCategory.startsWith('bedroom-') && (
                    <button
                      onClick={handleAddBedroom}
                      className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 
                               text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <HiPlus className="w-4 h-4" />
                      <span>{t('admin.photosEditor.addBedroom')}</span>
                    </button>
                  )}
                </div>

                {/* Category Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.value
                    const photoCount = groupedPhotos[cat.value]?.length || 0
                    const Icon = getCategoryIcon(cat.value)
                    
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-lg scale-105'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${
                          isSelected 
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-semibold text-center ${
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {cat.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {photoCount} {t('admin.photosEditor.photos')}
                        </span>
                        
                        {/* Кнопка удаления спальни */}
                        {cat.value.startsWith('bedroom-') && photoCount === 0 && bedroomCount > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveBedroom(parseInt(cat.value.split('-')[1]))
                            }}
                            className="mt-2 p-1 hover:bg-red-100 dark:hover:bg-red-900/20 
                                     text-red-600 rounded-full transition-colors"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Upload Button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4
                           bg-gradient-to-r from-blue-600 to-cyan-600 
                           hover:from-blue-700 hover:to-cyan-700
                           text-white font-bold rounded-xl shadow-lg hover:shadow-xl
                           transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{t('admin.photosEditor.upload.uploading')} {uploadProgress}%</span>
                    </>
                  ) : (
                    <>
                      <HiUpload className="w-6 h-6" />
                      <span>{t('admin.photosEditor.upload.selectFiles')}</span>
                    </>
                  )}
                </motion.button>

                {uploading && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  {t('admin.photosEditor.dragDropHint')}
                </p>
              </div>

              {/* Photos Grid - Drag & Drop */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="space-y-6">
                  {localPhotos.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <HiPhotograph className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                      <p className="text-xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                        {t('admin.photosEditor.empty.title')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {t('admin.photosEditor.empty.subtitle')}
                      </p>
                    </div>
                  ) : (
                    categories
                      .filter(cat => groupedPhotos[cat.value])
                      .map((category) => {
                        const categoryPhotos = groupedPhotos[category.value]
                        const Icon = getCategoryIcon(category.value)
                        
                        return (
                          <div key={category.value} className="space-y-4">
                            {/* Category Header */}
                            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {category.label}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {t('admin.photosEditor.photoCount', { count: categoryPhotos.length })}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Photos Grid with Drag & Drop */}
                            <Droppable droppableId={category.value} direction="horizontal">
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 rounded-xl transition-all min-h-[200px] ${
                                    snapshot.isDraggingOver 
                                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-dashed border-blue-400'
                                      : 'bg-gray-50 dark:bg-gray-700/50'
                                  }`}
                                >
                                  {categoryPhotos.map((photo, index) => (
                                    <Draggable 
                                      key={photo.id} 
                                      draggableId={photo.id.toString()} 
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`relative group rounded-xl overflow-hidden shadow-md transition-all ${
                                            snapshot.isDragging 
                                              ? 'ring-4 ring-blue-400 scale-105 z-50' 
                                              : 'hover:shadow-xl'
                                          }`}
                                        >
                                          <img
                                            src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${photo.photo_url}`}
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-48 object-cover"
                                          />
                                          
                                          {/* Primary Badge */}
                                          {photo.is_primary && (
                                            <div className="absolute top-2 left-2 px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center space-x-1">
                                              <HiStar className="w-4 h-4" />
                                              <span>{t('admin.photosEditor.badges.primary')}</span>
                                            </div>
                                          )}

                                          {/* Position Number */}
                                          <div className="absolute top-2 right-2 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                          </div>

                                          {/* Actions - Desktop */}
                                          <div className="hidden md:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center space-x-2">
                                            {!photo.is_primary && (
                                              <button
                                                onClick={() => handleSetPrimary(photo.id)}
                                                className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                                                title={t('admin.photosEditor.actions.setPrimary')}
                                              >
                                                <HiStar className="w-5 h-5" />
                                              </button>
                                            )}
                                            
                                            <button
                                              onClick={() => setMovingPhotoId(photo.id)}
                                              className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                                              title={t('admin.photosEditor.actions.move')}
                                            >
                                              <HiArrowRight className="w-5 h-5" />
                                            </button>

                                            <button
                                              onClick={() => {
                                                setPositionChangePhotoId(photo.id)
                                                setNewPosition((index + 1).toString())
                                              }}
                                              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                              title={t('admin.photosEditor.actions.changePosition')}
                                            >
                                              <HiHashtag className="w-5 h-5" />
                                            </button>
                                            
                                            <button
                                              onClick={() => handleDeletePhoto(photo.id)}
                                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                              title={t('admin.photosEditor.actions.delete')}
                                            >
                                              <HiTrash className="w-5 h-5" />
                                            </button>
                                          </div>

                                          {/* Actions - Mobile */}
                                          <button
                                            onClick={() => setSelectedPhotoForMobile(photo.id)}
                                            className="md:hidden absolute bottom-2 right-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-lg"
                                          >
                                            <HiTag className="w-5 h-5" />
                                          </button>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )
                      })
                  )}
                </div>
              </DragDropContext>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Actions Modal */}
      <AnimatePresence>
        {selectedPhotoForMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4"
            onClick={() => setSelectedPhotoForMobile(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('admin.photosEditor.mobileModal.title')}
              </h3>

              <button
                onClick={() => {
                  handleSetPrimary(selectedPhotoForMobile)
                  setSelectedPhotoForMobile(null)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-xl transition-colors"
              >
                <HiStar className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t('admin.photosEditor.actions.setPrimary')}
                </span>
              </button>

              <button
                onClick={() => {
                  setMovingPhotoId(selectedPhotoForMobile)
                  setSelectedPhotoForMobile(null)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors"
              >
                <HiArrowRight className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t('admin.photosEditor.actions.move')}
                </span>
              </button>

              <button
                onClick={() => {
                  const photo = localPhotos.find(p => p.id === selectedPhotoForMobile)
                  const categoryPhotos = groupedPhotos[photo.category || 'general']
                  const currentIndex = categoryPhotos.findIndex(p => p.id === selectedPhotoForMobile)
                  setPositionChangePhotoId(selectedPhotoForMobile)
                  setNewPosition((currentIndex + 1).toString())
                  setSelectedPhotoForMobile(null)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors"
              >
                <HiHashtag className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t('admin.photosEditor.actions.changePosition')}
                </span>
              </button>

              <button
                onClick={() => {
                  handleDeletePhoto(selectedPhotoForMobile)
                  setSelectedPhotoForMobile(null)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors"
              >
                <HiTrash className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {t('admin.photosEditor.actions.delete')}
                </span>
              </button>

              <button
                onClick={() => setSelectedPhotoForMobile(null)}
                className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
              >
                {t('admin.photosEditor.mobileModal.cancel')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Photo Modal */}
      <AnimatePresence>
        {movingPhotoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setMovingPhotoId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <HiArrowRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('admin.photosEditor.moveModal.title')}
                  </h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-13">
                  {t('admin.photosEditor.moveModal.subtitle')}
                </p>
              </div>
              
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {categories
                  .filter(cat => cat.value !== getPhotoCategory(movingPhotoId))
                  .map((cat) => {
                    const Icon = getCategoryIcon(cat.value)
                    
                    return (
                      <button
                        key={cat.value}
                        onClick={() => handleMovePhoto(movingPhotoId, cat.value)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all group"
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {cat.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {groupedPhotos[cat.value]?.length || 0} {t('admin.photosEditor.photos')}
                        </span>
                      </button>
                    )
                  })}
              </div>

              <button
                onClick={() => setMovingPhotoId(null)}
                className="w-full px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
              >
                {t('admin.photosEditor.moveModal.cancel')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Position Modal */}
      <AnimatePresence>
        {positionChangePhotoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setPositionChangePhotoId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('admin.photosEditor.positionModal.title')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('admin.photosEditor.positionModal.subtitle', { 
                    max: groupedPhotos[getPhotoCategory(positionChangePhotoId)]?.length || 0 
                  })}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.photosEditor.positionModal.label')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={groupedPhotos[getPhotoCategory(positionChangePhotoId)]?.length || 0}
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 
                           dark:focus:ring-blue-800 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setPositionChangePhotoId(null)}
                  className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
                >
                  {t('admin.photosEditor.positionModal.cancel')}
                </button>
                <button
                  onClick={handleChangePosition}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl transition-colors"
                >
                  {t('admin.photosEditor.positionModal.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PhotosEditor