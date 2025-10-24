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
  HiHashtag
} from 'react-icons/hi'
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
  
  // Фиксированные категории
  const categories = [
    { value: 'general', label: t('admin.photosEditor.categories.general') },
    { value: 'bedroom', label: t('admin.photosEditor.categories.bedroom') },
    { value: 'bathroom', label: t('admin.photosEditor.categories.bathroom') },
    { value: 'kitchen', label: t('admin.photosEditor.categories.kitchen') },
    { value: 'living', label: t('admin.photosEditor.categories.living') },
    { value: 'exterior', label: t('admin.photosEditor.categories.exterior') },
    { value: 'pool', label: t('admin.photosEditor.categories.pool') },
    { value: 'view', label: t('admin.photosEditor.categories.view') }
  ]

  // Синхронизация с props
  useEffect(() => {
    setLocalPhotos(initialPhotos)
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

  // Удаление фото с optimistic update
  const handleDeletePhoto = async (photoId, closeModal = false) => {
    if (!window.confirm(t('admin.photosEditor.confirm.deletePhoto'))) return

    if (closeModal) {
      setSelectedPhotoForMobile(null)
    }

    // Optimistic update
    const oldPhotos = [...localPhotos]
    setLocalPhotos(localPhotos.filter(p => p.id !== photoId))
    
    setProcessingPhotoId(photoId)

    try {
      await propertyApi.deletePhoto(photoId)
      toast.success(t('admin.photosEditor.success.deleted'))
    } catch (error) {
      console.error('Failed to delete photo:', error)
      toast.error(t('admin.photosEditor.errors.deleteFailed'))
      
      // Откат изменений
      setLocalPhotos(oldPhotos)
    } finally {
      setProcessingPhotoId(null)
    }
  }

  // Установка главной фотографии с optimistic update
  const handleSetPrimary = async (photoId, closeModal = false) => {
    if (closeModal) {
      setSelectedPhotoForMobile(null)
    }

    // Optimistic update
    const oldPhotos = [...localPhotos]
    setLocalPhotos(localPhotos.map(p => ({
      ...p,
      is_primary: p.id === photoId
    })))
    
    setProcessingPhotoId(photoId)

    try {
      await propertyApi.setPrimaryPhoto(photoId, 'global')
      toast.success(t('admin.photosEditor.success.primarySet'))
    } catch (error) {
      console.error('Failed to set primary photo:', error)
      toast.error(t('admin.photosEditor.errors.primaryFailed'))
      
      // Откат изменений
      setLocalPhotos(oldPhotos)
    } finally {
      setProcessingPhotoId(null)
    }
  }

  // Перемещение фото в другую категорию
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
      
      setProcessingPhotoId(movedItem.id)

      try {
        await propertyApi.updatePhotoCategory(movedItem.id, destinationCategory)
        toast.success(t('admin.photosEditor.success.photoMoved'))
      } catch (error) {
        console.error('Failed to move photo:', error)
        toast.error(t('admin.photosEditor.errors.moveFailed'))
        
        // Откат изменений
        setLocalPhotos(oldPhotos)
      } finally {
        setProcessingPhotoId(null)
      }
    } else {
      // Перемещение внутри одной категории (изменение порядка)
      const items = Array.from(groupedPhotos[sourceCategory])
      const [reorderedItem] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reorderedItem)

      // Optimistic update - обновляем sort_order
      const updatedPhotos = items.map((photo, index) => ({
        ...photo,
        sort_order: index
      }))

      const newLocalPhotos = localPhotos.map(photo => {
        const updated = updatedPhotos.find(p => p.id === photo.id)
        return updated || photo
      })
      setLocalPhotos(newLocalPhotos)

      try {
        const photosToUpdate = updatedPhotos.map((photo, index) => ({
          id: photo.id,
          sort_order: index
        }))
        
        await propertyApi.updatePhotosOrder(propertyId, photosToUpdate)
        toast.success(t('admin.photosEditor.success.reordered'))
      } catch (error) {
        console.error('Failed to update order:', error)
        toast.error(t('admin.photosEditor.errors.reorderFailed'))
        
        // Откат изменений
        setLocalPhotos(oldPhotos)
      }
    }
  }

  // Получить текущую категорию фото
  const getPhotoCategory = (photoId) => {
    for (const [category, photos] of Object.entries(groupedPhotos)) {
      if (photos.some(p => p.id === photoId)) {
        return category
      }
    }
    return 'general'
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
                <div className="flex items-center space-x-3 mb-4">
                  <HiUpload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t('admin.photosEditor.upload.title')}
                  </h4>
                </div>

                {/* Category Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.value
                    const photoCount = groupedPhotos[cat.value]?.length || 0
                    
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
                        <HiTag className={`w-6 h-6 mb-2 ${
                          isSelected 
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400'
                        }`} />
                        <span className={`text-sm font-semibold ${
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {cat.label}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {photoCount} {t('admin.photosEditor.photos')}
                        </span>
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
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>{t('admin.photosEditor.upload.uploading')}</span>
                    </>
                  ) : (
                    <>
                      <HiUpload className="w-6 h-6" />
                      <span>{t('admin.photosEditor.upload.selectFiles')}</span>
                    </>
                  )}
                </motion.button>

                {/* Upload Progress */}
                {uploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-blue-700 dark:text-blue-300">
                      <span>{t('admin.photosEditor.upload.progress')}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Info Banner */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl p-4">
                <p className="text-sm text-purple-800 dark:text-purple-200 font-medium text-center">
                  💡 {t('admin.photosEditor.dragDropHint')}
                </p>
              </div>

              {/* Photos Grid by Category */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="space-y-8">
                  {Object.keys(groupedPhotos).length === 0 ? (
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
                        
                        return (
                          <div key={category.value} className="space-y-4">
                            {/* Category Header */}
                            <div className="flex items-center justify-between pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                  <HiTag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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
                                      ? 'bg-blue-100 dark:bg-blue-900/20 border-2 border-dashed border-blue-500 scale-[1.02]' 
                                      : 'bg-gray-50 dark:bg-gray-700/30 border-2 border-transparent'
                                  }`}
                                >
                                  {categoryPhotos.map((photo, index) => (
                                    <Draggable
                                      key={photo.id}
                                      draggableId={String(photo.id)}
                                      index={index}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            ...provided.draggableProps.style,
                                            // Исправление для Drag&Drop - убираем смещение
                                            transform: snapshot.isDragging
                                              ? provided.draggableProps.style?.transform
                                              : 'translate(0px, 0px)'
                                          }}
                                          className={`relative group ${
                                            snapshot.isDragging ? 'z-50 opacity-80' : ''
                                          }`}
                                        >
                                          {/* Photo Container */}
                                          <div 
                                            className={`relative aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-600 shadow-md hover:shadow-2xl transition-all ${
                                              snapshot.isDragging ? 'cursor-grabbing' : 'cursor-grab'
                                            } ${
                                              photo.is_primary ? 'ring-4 ring-yellow-400 ring-offset-2 dark:ring-yellow-500' : ''
                                            } ${
                                              processingPhotoId === photo.id ? 'opacity-50' : ''
                                            }`}
                                            onClick={() => setSelectedPhotoForMobile(photo)}
                                          >
                                            <img
                                              src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${photo.photo_url}`}
                                              alt=""
                                              className="w-full h-full object-cover pointer-events-none select-none"
                                              draggable="false"
                                            />
                                            
                                            {/* Primary Badge - ВСЕГДА ПОКАЗЫВАЕТСЯ если is_primary */}
                                            {photo.is_primary && (
                                              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-yellow-500/90 to-transparent p-3 z-10">
                                                <div className="flex items-center space-x-2 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg w-fit">
                                                  <HiStar className="w-4 h-4" />
                                                  <span>{t('admin.photosEditor.badges.primary')}</span>
                                                </div>
                                              </div>
                                            )}

                                            {/* Category & Order Badge */}
                                            <div className="absolute top-3 right-3 bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg z-10">
                                              #{index + 1}
                                            </div>

                                            {/* Desktop Hover Overlay with Actions */}
                                            <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                              <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                                                {/* Set Primary Button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleSetPrimary(photo.id)
                                                  }}
                                                  disabled={processingPhotoId === photo.id}
                                                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors shadow-lg text-sm font-semibold disabled:opacity-50"
                                                >
                                                  <HiStar className="w-4 h-4" />
                                                  <span>{t('admin.photosEditor.actions.setPrimary')}</span>
                                                </button>

                                                {/* Change Position Button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPositionChangePhotoId(photo.id)
                                                  }}
                                                  disabled={processingPhotoId === photo.id}
                                                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-lg text-sm font-semibold disabled:opacity-50"
                                                >
                                                  <HiHashtag className="w-4 h-4" />
                                                  <span>{t('admin.photosEditor.actions.changePosition')}</span>
                                                </button>

                                                {/* Move Button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    setMovingPhotoId(photo.id)
                                                  }}
                                                  disabled={processingPhotoId === photo.id}
                                                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors shadow-lg text-sm font-semibold disabled:opacity-50"
                                                >
                                                  <HiArrowRight className="w-4 h-4" />
                                                  <span>{t('admin.photosEditor.actions.move')}</span>
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeletePhoto(photo.id)
                                                  }}
                                                  disabled={processingPhotoId === photo.id}
                                                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg text-sm font-semibold disabled:opacity-50"
                                                >
                                                  {processingPhotoId === photo.id ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                  ) : (
                                                    <>
                                                      <HiTrash className="w-4 h-4" />
                                                      <span>{t('admin.photosEditor.actions.delete')}</span>
                                                    </>
                                                  )}
                                                </button>
                                              </div>
                                            </div>
                                          </div>
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

      {/* Mobile Action Modal */}
      <AnimatePresence>
        {selectedPhotoForMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-0"
            onClick={() => setSelectedPhotoForMobile(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('admin.photosEditor.mobileModal.title')}
                </h3>
                <button
                  onClick={() => setSelectedPhotoForMobile(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <HiX className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Photo Preview */}
              <div className="p-4">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-600 mb-4">
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedPhotoForMobile.photo_url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {/* Primary Badge - ВСЕГДА ПОКАЗЫВАЕТСЯ если is_primary */}
                  {selectedPhotoForMobile.is_primary && (
                    <div className="absolute top-3 left-3 bg-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center space-x-1">
                      <HiStar className="w-4 h-4" />
                      <span>{t('admin.photosEditor.badges.primary')}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Set Primary Button */}
                  <button
                    onClick={() => handleSetPrimary(selectedPhotoForMobile.id, true)}
                    disabled={processingPhotoId === selectedPhotoForMobile.id}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors shadow-md font-bold disabled:opacity-50"
                  >
                    <HiStar className="w-6 h-6" />
                    <span>{t('admin.photosEditor.actions.setPrimary')}</span>
                  </button>

                  {/* Change Position Button */}
                  <button
                    onClick={() => {
                      setPositionChangePhotoId(selectedPhotoForMobile.id)
                      setSelectedPhotoForMobile(null)
                    }}
                    disabled={processingPhotoId === selectedPhotoForMobile.id}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors shadow-md font-bold disabled:opacity-50"
                  >
                    <HiHashtag className="w-6 h-6" />
                    <span>{t('admin.photosEditor.actions.changePosition')}</span>
                  </button>

                  {/* Move Button */}
                  <button
                    onClick={() => {
                      setMovingPhotoId(selectedPhotoForMobile.id)
                      setSelectedPhotoForMobile(null)
                    }}
                    disabled={processingPhotoId === selectedPhotoForMobile.id}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors shadow-md font-bold disabled:opacity-50"
                  >
                    <HiArrowRight className="w-6 h-6" />
                    <span>{t('admin.photosEditor.actions.move')}</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeletePhoto(selectedPhotoForMobile.id, true)}
                    disabled={processingPhotoId === selectedPhotoForMobile.id}
                    className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors shadow-md font-bold disabled:opacity-50"
                  >
                    {processingPhotoId === selectedPhotoForMobile.id ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <HiTrash className="w-6 h-6" />
                        <span>{t('admin.photosEditor.actions.delete')}</span>
                      </>
                    )}
                  </button>

                  {/* Cancel Button */}
                  <button
                    onClick={() => setSelectedPhotoForMobile(null)}
                    className="w-full px-6 py-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl transition-colors font-bold"
                  >
                    {t('admin.photosEditor.mobileModal.cancel')}
                  </button>
                </div>
              </div>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setPositionChangePhotoId(null)
              setNewPosition('')
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                  <HiHashtag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('admin.photosEditor.positionModal.title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('admin.photosEditor.positionModal.subtitle', {
                      max: groupedPhotos[getPhotoCategory(positionChangePhotoId)]?.length || 1
                    })}
                  </p>
                </div>
              </div>

              {/* Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.photosEditor.positionModal.label')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={groupedPhotos[getPhotoCategory(positionChangePhotoId)]?.length || 1}
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold text-center text-2xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="1"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setPositionChangePhotoId(null)
                    setNewPosition('')
                  }}
                  className="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-xl transition-colors"
                >
                  {t('admin.photosEditor.positionModal.cancel')}
                </button>
                <button
                  onClick={handleChangePosition}
                  className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors"
                >
                  {t('admin.photosEditor.positionModal.confirm')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Photo Modal (for both mobile and desktop) */}
      <AnimatePresence>
        {movingPhotoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setMovingPhotoId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                  <HiArrowRight className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('admin.photosEditor.moveModal.title')}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('admin.photosEditor.moveModal.subtitle')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
                {categories
                  .filter(cat => cat.value !== getPhotoCategory(movingPhotoId))
                  .map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleMovePhoto(movingPhotoId, cat.value)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all group"
                    >
                      <div className="flex items-center space-x-3">
                        <HiTag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {cat.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {groupedPhotos[cat.value]?.length || 0} {t('admin.photosEditor.photos')}
                      </span>
                    </button>
                  ))}
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
    </motion.div>
  )
}

export default PhotosEditor