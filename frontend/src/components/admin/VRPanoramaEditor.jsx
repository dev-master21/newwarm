// frontend/src/components/admin/VRPanoramaEditor.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import {
  HiChevronDown,
  HiUpload,
  HiTrash,
  HiPhotograph,
  HiX,
  HiPlus,
  HiCheck,
  HiExclamationCircle
} from 'react-icons/hi'
import { MdVrpano, Md360 } from 'react-icons/md'
import vrPanoramaApi from '../../api/vrPanoramaApi'
import toast from 'react-hot-toast'

const VRPanoramaEditor = ({ propertyId, onUpdate }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)
  const [panoramas, setPanoramas] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Состояние формы добавления
  const [newPanorama, setNewPanorama] = useState({
    locationType: '',
    locationNumber: '',
    images: {
      front: null,
      back: null,
      left: null,
      right: null,
      top: null,
      bottom: null
    },
    previews: {
      front: null,
      back: null,
      left: null,
      right: null,
      top: null,
      bottom: null
    }
  })

  // Типы локаций
  const locationTypes = [
    { value: 'bedroom', label: t('vr.locations.bedroom'), numbered: true },
    { value: 'bathroom', label: t('vr.locations.bathroom'), numbered: true },
    { value: 'living_room', label: t('vr.locations.living_room') },
    { value: 'kitchen', label: t('vr.locations.kitchen') },
    { value: 'pool', label: t('vr.locations.pool') },
    { value: 'terrace', label: t('vr.locations.terrace'), numbered: true },
    { value: 'wardrobe', label: t('vr.locations.wardrobe') },
    { value: 'gym', label: t('vr.locations.gym') },
    { value: 'sauna', label: t('vr.locations.sauna') },
    { value: 'balcony', label: t('vr.locations.balcony'), numbered: true },
    { value: 'dining_room', label: t('vr.locations.dining_room') },
    { value: 'office', label: t('vr.locations.office') },
    { value: 'laundry', label: t('vr.locations.laundry') },
    { value: 'garage', label: t('vr.locations.garage') },
    { value: 'entrance', label: t('vr.locations.entrance') }
  ]

  // Направления для загрузки
  const directions = [
    { key: 'front', label: t('vr.directions.front'), icon: '⬆️' },
    { key: 'back', label: t('vr.directions.back'), icon: '⬇️' },
    { key: 'left', label: t('vr.directions.left'), icon: '⬅️' },
    { key: 'right', label: t('vr.directions.right'), icon: '➡️' },
    { key: 'top', label: t('vr.directions.top'), icon: '🔼' },
    { key: 'bottom', label: t('vr.directions.bottom'), icon: '🔽' }
  ]

  // Загрузка панорам
  useEffect(() => {
    if (propertyId) {
      loadPanoramas()
    }
  }, [propertyId])

  const loadPanoramas = async () => {
    try {
      setLoading(true)
      const response = await vrPanoramaApi.getPropertyPanoramas(propertyId)
      
      if (response.success) {
        setPanoramas(response.data.panoramas || [])
      }
    } catch (error) {
      console.error('Error loading VR panoramas:', error)
      toast.error(t('vr.errors.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // Обработка выбора файла
  const handleFileSelect = (direction, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      toast.error(t('vr.errors.invalidFileType'))
      return
    }

    // Проверка размера файла (макс 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error(t('vr.errors.fileTooLarge'))
      return
    }

    // Создаём превью
    const reader = new FileReader()
    reader.onloadend = () => {
      setNewPanorama(prev => ({
        ...prev,
        images: {
          ...prev.images,
          [direction]: file
        },
        previews: {
          ...prev.previews,
          [direction]: reader.result
        }
      }))
    }
    reader.readAsDataURL(file)
  }

  // Удаление выбранного изображения
  const handleRemoveImage = (direction) => {
    setNewPanorama(prev => ({
      ...prev,
      images: {
        ...prev.images,
        [direction]: null
      },
      previews: {
        ...prev.previews,
        [direction]: null
      }
    }))
  }

  // Проверка заполненности формы
  const isFormValid = () => {
    if (!newPanorama.locationType) return false
    
    // Проверяем, что все 6 изображений загружены
    return Object.values(newPanorama.images).every(img => img !== null)
  }

  // Добавление панорамы
  const handleAddPanorama = async () => {
    if (!isFormValid()) {
      toast.error(t('vr.errors.fillAllFields'))
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append('locationType', newPanorama.locationType)
      
      if (newPanorama.locationNumber) {
        formData.append('locationNumber', newPanorama.locationNumber)
      }

      // Добавляем все изображения
      Object.entries(newPanorama.images).forEach(([direction, file]) => {
        if (file) {
          formData.append(direction, file)
        }
      })

      const response = await vrPanoramaApi.createPanorama(propertyId, formData)

      if (response.success) {
        toast.success(t('vr.success.created'))
        
        // Сбрасываем форму
        setNewPanorama({
          locationType: '',
          locationNumber: '',
          images: {
            front: null,
            back: null,
            left: null,
            right: null,
            top: null,
            bottom: null
          },
          previews: {
            front: null,
            back: null,
            left: null,
            right: null,
            top: null,
            bottom: null
          }
        })
        
        setShowAddForm(false)
        loadPanoramas()
        
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error('Error creating VR panorama:', error)
      toast.error(t('vr.errors.createFailed'))
    } finally {
      setUploading(false)
    }
  }

  // Удаление панорамы
  const handleDeletePanorama = async (panoramaId) => {
    if (!confirm(t('vr.confirm.delete'))) return

    try {
      setDeletingId(panoramaId)
      
      const response = await vrPanoramaApi.deletePanorama(panoramaId)

      if (response.success) {
        toast.success(t('vr.success.deleted'))
        loadPanoramas()
        
        if (onUpdate) onUpdate()
      }
    } catch (error) {
      console.error('Error deleting VR panorama:', error)
      toast.error(t('vr.errors.deleteFailed'))
    } finally {
      setDeletingId(null)
    }
  }

  // Изменение порядка панорам
  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const items = Array.from(panoramas)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setPanoramas(items)

    try {
      const panoramaIds = items.map(p => p.id)
      await vrPanoramaApi.updatePanoramasOrder(propertyId, panoramaIds)
      toast.success(t('vr.success.orderUpdated'))
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error(t('vr.errors.orderUpdateFailed'))
      loadPanoramas() // Откатываем изменения
    }
  }

  // Получение имени локации
  const getLocationName = (panorama) => {
    const type = locationTypes.find(lt => lt.value === panorama.location_type)
    const baseName = type?.label || panorama.location_type
    
    if (panorama.location_number) {
      return `${baseName} ${panorama.location_number}`
    }
    
    return baseName
  }

  // Получение URL изображения
  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://warm.novaestate.company'
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  }

  // Проверка, нужен ли номер для выбранного типа
  const selectedTypeNeedsNumber = () => {
    const type = locationTypes.find(lt => lt.value === newPanorama.locationType)
    return type?.numbered || false
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden 
               border border-gray-200 dark:border-gray-700 mt-6"
    >
      {/* Заголовок */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center 
                          backdrop-blur-sm">
              <MdVrpano className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-white">
                {t('vr.editor.title')}
              </h2>
              <p className="text-sm text-white/80">
                {panoramas.length} {t('vr.editor.panoramasCount')}
              </p>
            </div>
          </div>
          
          <HiChevronDown 
            className={`w-6 h-6 text-white transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6"
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                {/* Список панорам */}
                {panoramas.length > 0 && (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="panoramas">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="space-y-3 mb-6"
                        >
                          {panoramas.map((panorama, index) => (
                            <Draggable
                              key={panorama.id}
                              draggableId={`panorama-${panorama.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`flex items-center space-x-4 p-4 
                                           bg-gray-50 dark:bg-gray-700/50 rounded-xl
                                           border-2 border-gray-200 dark:border-gray-600
                                           transition-all ${
                                             snapshot.isDragging ? 'shadow-xl scale-105' : ''
                                           }`}
                                >
                                  {/* Превью */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getImageUrl(panorama.front_image)}
                                      alt={getLocationName(panorama)}
                                      className="w-20 h-20 object-cover rounded-lg"
                                    />
                                  </div>

                                  {/* Информация */}
                                  <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                      {getLocationName(panorama)}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {t('vr.editor.imagesCount', { count: 6 })}
                                    </p>
                                  </div>

                                  {/* Кнопки */}
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleDeletePanorama(panorama.id)}
                                      disabled={deletingId === panorama.id}
                                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg
                                               transition-colors disabled:opacity-50"
                                    >
                                      {deletingId === panorama.id ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent 
                                                      rounded-full animate-spin" />
                                      ) : (
                                        <HiTrash className="w-5 h-5" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}

                {/* Кнопка добавления */}
                {!showAddForm && (
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600
                             hover:border-purple-500 dark:hover:border-purple-500
                             rounded-xl transition-all group"
                  >
                    <div className="flex items-center justify-center space-x-2 
                                  text-gray-500 dark:text-gray-400 
                                  group-hover:text-purple-500 dark:group-hover:text-purple-400">
                      <HiPlus className="w-5 h-5" />
                      <span className="font-medium">{t('vr.editor.addPanorama')}</span>
                    </div>
                  </button>
                )}

                {/* Форма добавления */}
                <AnimatePresence>
                  {showAddForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-2 border-purple-200 dark:border-purple-800 
                               rounded-xl p-6 space-y-6"
                    >
                      {/* Заголовок формы */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {t('vr.editor.newPanorama')}
                        </h3>
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <HiX className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>

                      {/* Выбор типа локации */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {t('vr.editor.locationType')}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                          value={newPanorama.locationType}
                          onChange={(e) => setNewPanorama(prev => ({
                            ...prev,
                            locationType: e.target.value,
                            locationNumber: '' // Сбрасываем номер при смене типа
                          }))}
                          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                                   border-2 border-gray-200 dark:border-gray-600
                                   rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                   text-gray-900 dark:text-white transition-all"
                        >
                          <option value="">{t('vr.editor.selectLocation')}</option>
                          {locationTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Номер локации (если нужен) */}
                      {selectedTypeNeedsNumber() && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('vr.editor.locationNumber')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={newPanorama.locationNumber}
                            onChange={(e) => setNewPanorama(prev => ({
                              ...prev,
                              locationNumber: e.target.value
                            }))}
                            placeholder="1"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                                     border-2 border-gray-200 dark:border-gray-600
                                     rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent
                                     text-gray-900 dark:text-white transition-all"
                          />
                        </div>
                      )}

                      {/* Загрузка изображений */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          {t('vr.editor.uploadImages')}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {directions.map(direction => (
                            <div key={direction.key} className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(direction.key, e)}
                                className="hidden"
                                id={`file-${direction.key}`}
                              />
                              
                              {newPanorama.previews[direction.key] ? (
                                <div className="relative group">
                                  <img
                                    src={newPanorama.previews[direction.key]}
                                    alt={direction.label}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 
                                                group-hover:opacity-100 transition-opacity
                                                flex items-center justify-center rounded-lg">
                                    <button
                                      onClick={() => handleRemoveImage(direction.key)}
                                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg"
                                    >
                                      <HiTrash className="w-5 h-5 text-white" />
                                    </button>
                                  </div>
                                  <div className="absolute top-2 left-2 px-2 py-1 
                                                bg-black/60 rounded text-white text-xs font-medium">
                                    {direction.icon} {direction.label}
                                  </div>
                                  <div className="absolute top-2 right-2">
                                    <HiCheck className="w-5 h-5 text-green-400" />
                                  </div>
                                </div>
                              ) : (
                                <label
                                  htmlFor={`file-${direction.key}`}
                                  className="block w-full h-32 border-2 border-dashed 
                                           border-gray-300 dark:border-gray-600
                                           hover:border-purple-500 dark:hover:border-purple-500
                                           rounded-lg cursor-pointer transition-all
                                           flex flex-col items-center justify-center
                                           bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100
                                           dark:hover:bg-gray-700"
                                >
                                  <HiPhotograph className="w-8 h-8 text-gray-400 mb-2" />
                                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    {direction.icon} {direction.label}
                                  </span>
                                </label>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Подсказка */}
                        <div className="mt-3 flex items-start space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <HiExclamationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <p>{t('vr.editor.uploadHint')}</p>
                        </div>
                      </div>

                      {/* Кнопки действий */}
                      <div className="flex items-center justify-end space-x-3 pt-4 border-t 
                                    border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setShowAddForm(false)}
                          disabled={uploading}
                          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 
                                   hover:bg-gray-300 dark:hover:bg-gray-600
                                   text-gray-700 dark:text-gray-300 rounded-lg
                                   transition-colors disabled:opacity-50"
                        >
                          {t('common.cancel')}
                        </button>
                        
                        <button
                          onClick={handleAddPanorama}
                          disabled={!isFormValid() || uploading}
                          className="flex items-center space-x-2 px-6 py-3 
                                   bg-gradient-to-r from-purple-500 to-indigo-600
                                   hover:from-purple-600 hover:to-indigo-700
                                   text-white rounded-lg transition-all
                                   disabled:opacity-50 disabled:cursor-not-allowed
                                   shadow-lg hover:shadow-xl"
                        >
                          {uploading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent 
                                            rounded-full animate-spin" />
                              <span>{t('vr.editor.uploading')}</span>
                            </>
                          ) : (
                            <>
                              <HiUpload className="w-5 h-5" />
                              <span>{t('vr.editor.create')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default VRPanoramaEditor