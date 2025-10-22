// frontend/src/components/admin/propertyForm/Step8Description.jsx
import React, { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  HiPhotograph, 
  HiX, 
  HiPlus, 
  HiTrash,
  HiDocumentText,
  HiTranslate
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'
import toast from 'react-hot-toast'

const Step8Description = () => {
  const { t } = useTranslation()
  const { formData, updateFormData } = usePropertyFormStore()
  const [activeLanguage, setActiveLanguage] = useState('ru')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showAddCategory, setShowAddCategory] = useState(false)
  const fileInputRef = useRef(null)
  const floorPlanInputRef = useRef(null)

  const languages = [
    { code: 'ru', label: t('admin.addProperty.step8.russian'), flag: '🇷🇺' },
    { code: 'en', label: t('admin.addProperty.step8.english'), flag: '🇬🇧' },
    { code: 'es', label: t('admin.addProperty.step8.spanish'), flag: '🇪🇸' },
    { code: 'fr', label: t('admin.addProperty.step8.french'), flag: '🇫🇷' },
    { code: 'th', label: t('admin.addProperty.step8.thai'), flag: '🇹🇭' },
    { code: 'zh', label: t('admin.addProperty.step8.chinese'), flag: '🇨🇳' }
  ]

  const defaultCategories = {
    bedroom: t('admin.addProperty.step8.defaultCategories.bedroom'),
    bathroom: t('admin.addProperty.step8.defaultCategories.bathroom'),
    living: t('admin.addProperty.step8.defaultCategories.living'),
    kitchen: t('admin.addProperty.step8.defaultCategories.kitchen'),
    exterior: t('admin.addProperty.step8.defaultCategories.exterior'),
    pool: t('admin.addProperty.step8.defaultCategories.pool'),
    view: t('admin.addProperty.step8.defaultCategories.view')
  }

  const handleUploadMethodChange = (method) => {
    updateFormData({ uploadMethod: method })
    
    if (method === 'withCategories' && (!formData.categories || formData.categories.length === 0)) {
      updateFormData({ categories: ['bedroom', 'bathroom', 'living'] })
    }
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    
    const currentCategories = formData.categories || []
    if (!currentCategories.includes(newCategoryName)) {
      updateFormData({ categories: [...currentCategories, newCategoryName] })
      setNewCategoryName('')
      setShowAddCategory(false)
    }
  }

  const handleRemoveCategory = (category) => {
    const currentCategories = formData.categories || []
    updateFormData({ 
      categories: currentCategories.filter(c => c !== category),
      photos: (formData.photos || []).filter(p => p.category !== category)
    })
  }

  const handleFileSelect = (category = '') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = 'image/*'
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      if (files.length === 0) return

      const currentPhotos = formData.photos || []
      const newPhotos = files.map(file => ({
        file,
        category,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }))

      updateFormData({ photos: [...currentPhotos, ...newPhotos] })
      toast.success(`${files.length} ${t('admin.addProperty.step8.photoUploaded')}`)
    }
    
    input.click()
  }

  const handleRemovePhoto = (photoId) => {
    const currentPhotos = formData.photos || []
    const photo = currentPhotos.find(p => p.id === photoId)
    if (photo?.preview) {
      URL.revokeObjectURL(photo.preview)
    }
    updateFormData({ 
      photos: currentPhotos.filter(p => p.id !== photoId)
    })
  }

  const handleFloorPlanSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    updateFormData({
      floorPlan: {
        file,
        preview: URL.createObjectURL(file)
      }
    })
    toast.success(t('admin.addProperty.step8.floorPlanUploaded'))
  }

  const handleNameChange = (lang, value) => {
    updateFormData({
      propertyName: {
        ...formData.propertyName,
        [lang]: value
      }
    })
  }

  const handleDescriptionChange = (lang, value) => {
    updateFormData({
      description: {
        ...formData.description,
        [lang]: value
      }
    })
  }

  const getPhotosByCategory = (category) => {
    return (formData.photos || []).filter(p => p.category === category)
  }

  const getPhotosWithoutCategory = () => {
    return (formData.photos || []).filter(p => !p.category)
  }

  const totalPhotos = (formData.photos || []).length

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step8.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step8.subtitle')}
        </p>
      </div>

      {/* Upload Method */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('admin.addProperty.step8.uploadMethod')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => handleUploadMethodChange('withCategories')}
            className={`p-6 rounded-xl border-2 transition-all ${
              formData.uploadMethod === 'withCategories'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <HiDocumentText className={`w-8 h-8 mx-auto mb-2 ${
              formData.uploadMethod === 'withCategories'
                ? 'text-red-600'
                : 'text-gray-400'
            }`} />
            <h4 className={`font-semibold ${
              formData.uploadMethod === 'withCategories'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {t('admin.addProperty.step8.withCategories')}
            </h4>
          </button>

          <button
            onClick={() => handleUploadMethodChange('withoutCategories')}
            className={`p-6 rounded-xl border-2 transition-all ${
              formData.uploadMethod === 'withoutCategories'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <HiPhotograph className={`w-8 h-8 mx-auto mb-2 ${
              formData.uploadMethod === 'withoutCategories'
                ? 'text-red-600'
                : 'text-gray-400'
            }`} />
            <h4 className={`font-semibold ${
              formData.uploadMethod === 'withoutCategories'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-900 dark:text-white'
            }`}>
              {t('admin.addProperty.step8.withoutCategories')}
            </h4>
          </button>
        </div>
      </div>

      {/* Photos Upload */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.addProperty.step8.uploadPhotos')}
            <span className="text-red-500 ml-1">*</span>
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {totalPhotos} {t('admin.addProperty.step8.photos')}
          </span>
        </div>

        {formData.uploadMethod === 'withCategories' ? (
          <div className="space-y-4">
            {/* Categories */}
            {(formData.categories || []).map(category => (
              <div key={category} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {defaultCategories[category] || category}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getPhotosByCategory(category).length} фото
                    </span>
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 
                               text-red-600 rounded"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getPhotosByCategory(category).map(photo => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.preview}
                        alt=""
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 
                                 text-white rounded-full opacity-0 group-hover:opacity-100 
                                 transition-opacity"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Add Photo Button */}
                  <button
                    onClick={() => handleFileSelect(category)}
                    className="h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 
                             rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                             transition-colors flex items-center justify-center"
                  >
                    <HiPlus className="w-8 h-8 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Category */}
            {showAddCategory ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t('admin.addProperty.step8.categoryPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                >
                  {t('common.save')}
                </button>
                <button
                  onClick={() => {
                    setShowAddCategory(false)
                    setNewCategoryName('')
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 
                           dark:hover:bg-gray-600 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddCategory(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 
                         rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                         transition-colors flex items-center justify-center space-x-2"
              >
                <HiPlus className="w-5 h-5" />
                <span>{t('admin.addProperty.step8.addCategory')}</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              {getPhotosWithoutCategory().map(photo => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.preview}
                    alt=""
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemovePhoto(photo.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 hover:bg-red-600 
                             text-white rounded-full opacity-0 group-hover:opacity-100 
                             transition-opacity"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleFileSelect()}
              className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 
                       rounded-lg hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-colors"
            >
              <HiPhotograph className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('admin.addProperty.step8.dropzone')}
              </p>
            </button>
          </div>
        )}
      </div>

        {/* Floor Plan */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('admin.addProperty.step8.uploadFloorPlan')}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({t('admin.addProperty.step8.floorPlanOptional')})
            </span>
          </h3>
            
          {formData.floorPlan ? (
            <div className="relative inline-block">
              <img
                src={formData.floorPlan.preview}
                alt="Floor Plan"
                className="w-full max-w-md h-auto rounded-lg"
              />
              <button
                onClick={() => updateFormData({ floorPlan: null })}
                className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 
                         text-white rounded-full"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => floorPlanInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 
                       rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20
                       transition-colors"
            >
              <HiDocumentText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('admin.addProperty.step8.floorPlanUploadPrompt')}
              </p>
            </button>
          )}
          <input
            ref={floorPlanInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFloorPlanSelect}
          />
        </div>

      {/* Property Name & Description */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('admin.addProperty.step8.propertyDescription')}
          <span className="text-red-500 ml-1">*</span>
        </h3>

        {/* Language Tabs */}
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => setActiveLanguage(lang.code)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg 
                       whitespace-nowrap transition-colors ${
                activeLanguage === lang.code
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.addProperty.step8.propertyName')}
          </label>
          <input
            type="text"
            value={formData.propertyName?.[activeLanguage] || ''}
            onChange={(e) => handleNameChange(activeLanguage, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={t('admin.addProperty.step8.namePlaceholder')}
          />
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('admin.addProperty.step8.descriptionLanguages')}
          </label>
          <textarea
            value={formData.description?.[activeLanguage] || ''}
            onChange={(e) => handleDescriptionChange(activeLanguage, e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 
                     rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder={t('admin.addProperty.step8.descriptionPlaceholder')}
          />
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {t('admin.addProperty.step8.atLeastOneLanguage')}
        </p>
      </div>
    </div>
  )
}

export default Step8Description