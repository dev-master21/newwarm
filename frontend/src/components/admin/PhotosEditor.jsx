// frontend/src/components/admin/PhotosEditor.jsx
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiPhotograph,
  HiChevronDown,
  HiUpload,
  HiTrash,
  HiX,
  HiCheck,
  HiTag
} from 'react-icons/hi'
import propertyApi from '../../api/propertyApi'
import toast from 'react-hot-toast'

const PhotosEditor = ({ photos, propertyId, onUpdate }) => {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [deletingPhotoId, setDeletingPhotoId] = useState(null)

  const categories = [
    { value: 'general', label: t('admin.editProperty.photos.categories.general') },
    { value: 'bedroom', label: t('admin.editProperty.photos.categories.bedroom') },
    { value: 'bathroom', label: t('admin.editProperty.photos.categories.bathroom') },
    { value: 'kitchen', label: t('admin.editProperty.photos.categories.kitchen') },
    { value: 'living', label: t('admin.editProperty.photos.categories.living') },
    { value: 'exterior', label: t('admin.editProperty.photos.categories.exterior') },
    { value: 'pool', label: t('admin.editProperty.photos.categories.pool') },
    { value: 'view', label: t('admin.editProperty.photos.categories.view') }
  ]

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    try {
      setUploading(true)
      await propertyApi.uploadPhotos(propertyId, files, selectedCategory)
      toast.success(t('admin.editProperty.photos.uploadSuccess', { count: files.length }))
      onUpdate()
    } catch (error) {
      console.error('Failed to upload photos:', error)
      toast.error(t('admin.editProperty.photos.uploadError'))
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeletePhoto = async (photoId) => {
    try {
      setDeletingPhotoId(photoId)
      await propertyApi.deletePhoto(photoId)
      toast.success(t('admin.editProperty.photos.deleteSuccess'))
      onUpdate()
    } catch (error) {
      console.error('Failed to delete photo:', error)
      toast.error(t('admin.editProperty.photos.deleteError'))
    } finally {
      setDeletingPhotoId(null)
    }
  }

  const groupedPhotos = photos.reduce((acc, photo) => {
    const category = photo.category || 'general'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(photo)
    return acc
  }, {})

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mt-6"
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 cursor-pointer
                 hover:from-blue-600 hover:to-blue-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <HiPhotograph className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t('admin.editProperty.photos.title')}
              </h2>
              <p className="text-sm text-white/80">
                {photos.length} {t('admin.editProperty.photos.totalPhotos')}
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
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Upload Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 
                            dark:to-indigo-900/20 rounded-xl p-6 mb-6 border-2 border-blue-200 
                            dark:border-blue-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('admin.editProperty.photos.uploadNew')}
                </h3>

                {/* Category Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.editProperty.photos.selectCategory')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
                                 font-medium transition-all ${
                          selectedCategory === cat.value
                            ? 'bg-blue-500 text-white shadow-md'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <HiTag className="w-4 h-4" />
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
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
                           bg-gradient-to-r from-blue-500 to-blue-600 
                           hover:from-blue-600 hover:to-blue-700
                           text-white font-semibold rounded-xl shadow-md hover:shadow-lg
                           transition-all duration-300 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      <span>{t('admin.editProperty.photos.uploading')}</span>
                    </>
                  ) : (
                    <>
                      <HiUpload className="w-5 h-5" />
                      <span>{t('admin.editProperty.photos.selectFiles')}</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Photos Grid by Category */}
              {Object.keys(groupedPhotos).length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedPhotos).map(([category, categoryPhotos]) => (
                    <div key={category}>
                      <div className="flex items-center space-x-2 mb-3">
                        <HiTag className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {categories.find(c => c.value === category)?.label || category}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({categoryPhotos.length})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {categoryPhotos.map((photo, index) => (
                          <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative group aspect-square rounded-xl overflow-hidden
                                     bg-gray-200 dark:bg-gray-700"
                          >
                            <img
                              src={photo.photo_url}
                              alt={`Photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />

                            {/* Delete Button */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 
                                          group-hover:opacity-100 transition-opacity
                                          flex items-center justify-center">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeletePhoto(photo.id)}
                                disabled={deletingPhotoId === photo.id}
                                className="p-3 bg-red-500 hover:bg-red-600 text-white 
                                         rounded-full shadow-lg transition-colors
                                         disabled:opacity-50"
                              >
                                {deletingPhotoId === photo.id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 
                                                border-2 border-white border-t-transparent" />
                                ) : (
                                  <HiTrash className="w-5 h-5" />
                                )}
                              </motion.button>
                            </div>

                            {/* Sort Order Badge */}
                            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 
                                          backdrop-blur-sm rounded-full">
                              <span className="text-xs font-semibold text-white">
                                #{photo.sort_order}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HiPhotograph className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {t('admin.editProperty.photos.noPhotos')}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    {t('admin.editProperty.photos.uploadFirst')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PhotosEditor