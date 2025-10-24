// frontend/src/pages/admin/EditProperty.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiArrowLeft,
  HiSearch,
  HiSave,
  HiX,
  HiExclamation
} from 'react-icons/hi'
import {
  HiHome,
  HiLocationMarker,
  HiCube,
  HiClipboardList,
  HiShieldCheck,
  HiCash,
  HiCalendar
} from 'react-icons/hi'
import propertyApi from '../../api/propertyApi'
import toast from 'react-hot-toast'

// Импортируем компоненты
import TranslationsEditor from '../../components/admin/TranslationsEditor'
import SeasonalPricingEditor from '../../components/admin/SeasonalPricingEditor'
import PhotosEditor from '../../components/admin/PhotosEditor'
import FeaturesEditor from '../../components/admin/FeaturesEditor'

const EditProperty = () => {
  const { t } = useTranslation()
  const { propertyId } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [propertyData, setPropertyData] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Загрузка данных объекта
  useEffect(() => {
    loadPropertyData()
  }, [propertyId])

  const loadPropertyData = async () => {
    try {
      setLoading(true)
      const response = await propertyApi.getPropertyDetails(propertyId)
      
      if (response.success) {
        console.log('📥 Loaded property data:', response.data)
        
        const property = response.data.property
        
        // ИСПРАВЛЕНО: Преобразуем translations из объекта в массив
        const translationsArray = []
        if (property.translations && typeof property.translations === 'object') {
          Object.keys(property.translations).forEach(langCode => {
            translationsArray.push({
              language_code: langCode,
              property_name: property.translations[langCode].propertyName || '',
              description: property.translations[langCode].description || ''
            })
          })
        }
        
        // ИСПРАВЛЕНО: Собираем все features в один массив с правильной структурой
        const featuresArray = []
        
        // Property features
        if (property.propertyFeatures && Array.isArray(property.propertyFeatures)) {
          property.propertyFeatures.forEach(feature => {
            featuresArray.push({
              feature_type: 'property',
              feature_value: feature,
              renovation_date: property.renovationDates?.[feature] || null
            })
          })
        }
        
        // Outdoor features
        if (property.outdoorFeatures && Array.isArray(property.outdoorFeatures)) {
          property.outdoorFeatures.forEach(feature => {
            featuresArray.push({
              feature_type: 'outdoor',
              feature_value: feature,
              renovation_date: property.renovationDates?.[feature] || null
            })
          })
        }
        
        // Rental features
        if (property.rentalFeatures && Array.isArray(property.rentalFeatures)) {
          property.rentalFeatures.forEach(feature => {
            featuresArray.push({
              feature_type: 'rental',
              feature_value: feature,
              renovation_date: property.renovationDates?.[feature] || null
            })
          })
        }
        
        // Location features
        if (property.locationFeatures && Array.isArray(property.locationFeatures)) {
          property.locationFeatures.forEach(feature => {
            featuresArray.push({
              feature_type: 'location',
              feature_value: feature,
              renovation_date: property.renovationDates?.[feature] || null
            })
          })
        }
        
        // Views
        if (property.views && Array.isArray(property.views)) {
          property.views.forEach(feature => {
            featuresArray.push({
              feature_type: 'view',
              feature_value: feature,
              renovation_date: property.renovationDates?.[feature] || null
            })
          })
        }
        
        const data = {
          ...property,
          translations: translationsArray,
          photos: property.photos || [],
          features: featuresArray,
          // ИСПРАВЛЕНО: используем seasonalPricing вместо pricing
          pricing: property.seasonalPricing || []
        }
        
        console.log('✅ Processed data:', {
          translations: data.translations.length,
          features: data.features.length,
          pricing: data.pricing.length,
          photos: data.photos.length
        })
        
        setPropertyData(data)
        setOriginalData(JSON.parse(JSON.stringify(data)))
      }
    } catch (error) {
      console.error('Failed to load property:', error)
      toast.error(t('admin.editProperty.loadError'))
      navigate('/admin/properties')
    } finally {
      setLoading(false)
    }
  }

  // Отслеживание изменений
  useEffect(() => {
    if (propertyData && originalData) {
      const changed = JSON.stringify(propertyData) !== JSON.stringify(originalData)
      setHasChanges(changed)
    }
  }, [propertyData, originalData])

  // Обновление поля
  const updateField = (field, value) => {
    setPropertyData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Обновление перевода
  const updateTranslation = (lang, field, value) => {
    setPropertyData(prev => {
      const translations = [...(prev.translations || [])]
      const langIndex = translations.findIndex(t => t.language_code === lang)
      
      if (langIndex >= 0) {
        translations[langIndex] = {
          ...translations[langIndex],
          [field]: value
        }
      } else {
        translations.push({
          language_code: lang,
          [field]: value
        })
      }
      
      return { ...prev, translations }
    })
  }

  // Сохранение изменений
  const handleSave = async () => {
    try {
      setSaving(true)
      
      const updateData = {
        deal_type: propertyData.deal_type,
        property_type: propertyData.property_type,
        region: propertyData.region,
        address: propertyData.address,
        google_maps_link: propertyData.google_maps_link,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        property_number: propertyData.property_number,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        indoor_area: propertyData.indoor_area,
        outdoor_area: propertyData.outdoor_area,
        plot_size: propertyData.plot_size,
        floors: propertyData.floors,
        floor: propertyData.floor,
        penthouse_floors: propertyData.penthouse_floors,
        construction_year: propertyData.construction_year,
        construction_month: propertyData.construction_month,
        furniture_status: propertyData.furniture_status,
        parking_spaces: propertyData.parking_spaces,
        pets_allowed: propertyData.pets_allowed,
        pets_custom: propertyData.pets_custom,
        building_ownership: propertyData.building_ownership,
        land_ownership: propertyData.land_ownership,
        ownership_type: propertyData.ownership_type,
        sale_price: propertyData.sale_price,
        minimum_nights: propertyData.minimum_nights,
        ics_calendar_url: propertyData.ics_calendar_url,
        status: propertyData.status
      }

      await propertyApi.updateProperty(propertyId, updateData)
      
      toast.success(t('admin.editProperty.saveSuccess'))
      setOriginalData(JSON.parse(JSON.stringify(propertyData)))
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save property:', error)
      toast.error(t('admin.editProperty.saveError'))
    } finally {
      setSaving(false)
    }
  }

  // Группировка полей
  const fieldGroups = useMemo(() => [
    {
      title: t('admin.editProperty.sections.basic'),
      icon: HiHome,
      color: 'blue',
      fields: [
        { key: 'deal_type', label: t('admin.editProperty.fields.dealType'), type: 'select', 
          options: ['sale', 'rent', 'both'] },
        { key: 'property_type', label: t('admin.editProperty.fields.propertyType'), type: 'select',
          options: ['villa', 'apartment', 'house', 'condo', 'land', 'commercial'] },
        { key: 'property_number', label: t('admin.editProperty.fields.propertyNumber'), type: 'text' },
        { key: 'status', label: t('admin.editProperty.fields.status'), type: 'select',
          options: ['draft', 'published', 'sold', 'rented'] }
      ]
    },
    {
      title: t('admin.editProperty.sections.location'),
      icon: HiLocationMarker,
      color: 'green',
      fields: [
        { key: 'region', label: t('admin.editProperty.fields.region'), type: 'text' },
        { key: 'address', label: t('admin.editProperty.fields.address'), type: 'text' },
        { key: 'google_maps_link', label: t('admin.editProperty.fields.googleMapsLink'), type: 'text' },
        { key: 'latitude', label: t('admin.editProperty.fields.latitude'), type: 'number', step: '0.000001' },
        { key: 'longitude', label: t('admin.editProperty.fields.longitude'), type: 'number', step: '0.000001' }
      ]
    },
    {
      title: t('admin.editProperty.sections.specifications'),
      icon: HiCube,
      color: 'purple',
      fields: [
        { key: 'bedrooms', label: t('admin.editProperty.fields.bedrooms'), type: 'number', min: 0 },
        { key: 'bathrooms', label: t('admin.editProperty.fields.bathrooms'), type: 'number', min: 0 },
        { key: 'indoor_area', label: t('admin.editProperty.fields.indoorArea'), type: 'number', min: 0 },
        { key: 'outdoor_area', label: t('admin.editProperty.fields.outdoorArea'), type: 'number', min: 0 },
        { key: 'plot_size', label: t('admin.editProperty.fields.plotSize'), type: 'number', min: 0 },
        { key: 'floors', label: t('admin.editProperty.fields.floors'), type: 'number', min: 0 },
        { key: 'floor', label: t('admin.editProperty.fields.floor'), type: 'number', min: 0 }
      ]
    },
    {
      title: t('admin.editProperty.sections.additional'),
      icon: HiClipboardList,
      color: 'orange',
      fields: [
        { key: 'construction_year', label: t('admin.editProperty.fields.constructionYear'), type: 'number', min: 1900, max: new Date().getFullYear() },
        { key: 'construction_month', label: t('admin.editProperty.fields.constructionMonth'), type: 'number', min: 1, max: 12 },
        { key: 'furniture_status', label: t('admin.editProperty.fields.furnitureStatus'), type: 'select',
          options: ['fullyFurnished', 'unfurnished', 'partiallyFurnished'] },
        { key: 'parking_spaces', label: t('admin.editProperty.fields.parkingSpaces'), type: 'number', min: 0 }
      ]
    },
    {
      title: t('admin.editProperty.sections.ownership'),
      icon: HiShieldCheck,
      color: 'red',
      fields: [
        { key: 'building_ownership', label: t('admin.editProperty.fields.buildingOwnership'), type: 'select',
          options: ['freehold', 'leasehold', 'cooperative'] },
        { key: 'land_ownership', label: t('admin.editProperty.fields.landOwnership'), type: 'select',
          options: ['freehold', 'leasehold', 'cooperative'] },
        { key: 'ownership_type', label: t('admin.editProperty.fields.ownershipType'), type: 'select',
          options: ['individual', 'company', 'foundation'] }
      ]
    },
    {
      title: t('admin.editProperty.sections.pricing'),
      icon: HiCash,
      color: 'emerald',
      fields: [
        { key: 'sale_price', label: t('admin.editProperty.fields.salePrice'), type: 'number', min: 0 },
        { key: 'minimum_nights', label: t('admin.editProperty.fields.minimumNights'), type: 'number', min: 1 }
      ]
    },
    {
      title: t('admin.editProperty.sections.calendar'),
      icon: HiCalendar,
      color: 'indigo',
      fields: [
        { key: 'ics_calendar_url', label: t('admin.editProperty.fields.icsCalendarUrl'), type: 'text' }
      ]
    }
  ], [t])

  // Фильтрация полей по поиску
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return fieldGroups
    
    return fieldGroups
      .map(group => ({
        ...group,
        fields: group.fields.filter(field =>
          field.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          field.key.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(group => group.fields.length > 0)
  }, [fieldGroups, searchQuery])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!propertyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">{t('admin.editProperty.notFound')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/properties')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 
                     hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('admin.editProperty.title')}
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                {propertyData.property_number}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 
                           text-yellow-800 dark:text-yellow-200 rounded-lg"
                >
                  <HiExclamation className="w-5 h-5" />
                  <span className="text-sm font-medium">{t('admin.editProperty.unsavedChanges')}</span>
                </motion.div>
              )}

              <button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700
                         text-white rounded-lg hover:from-red-700 hover:to-red-800
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all shadow-lg hover:shadow-xl"
              >
                <HiSave className="w-5 h-5" />
                <span>{saving ? t('common.saving') : t('common.save')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.editProperty.searchFields')}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 
                       border-2 border-gray-200 dark:border-gray-700
                       rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                       text-gray-900 dark:text-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2"
              >
                <HiX className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Field Groups */}
        <div className="space-y-6">
          {filteredGroups.map((group, groupIndex) => {
            const Icon = group.icon
            
            return (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden 
                         border border-gray-200 dark:border-gray-700"
              >
                <div className={`bg-gradient-to-r from-${group.color}-500 to-${group.color}-600 p-6`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center 
                                  backdrop-blur-sm">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">{group.title}</h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {group.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          {field.label}
                        </label>
                        {field.type === 'select' ? (
                          <select
                            value={propertyData[field.key] || ''}
                            onChange={(e) => updateField(field.key, e.target.value || null)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                                     border-2 border-gray-200 dark:border-gray-600
                                     rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                                     text-gray-900 dark:text-white transition-all"
                          >
                            <option value="">{t('common.select')}</option>
                            {field.options?.map(option => (
                              <option key={option} value={option}>
                                {t(`admin.editProperty.options.${option}`) || option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={propertyData[field.key] ?? ''}
                            onChange={(e) => {
                              const value = e.target.value
                              if (field.type === 'number') {
                                updateField(field.key, value === '' ? null : parseFloat(value))
                              } else {
                                updateField(field.key, value || null)
                              }
                            }}
                            min={field.min}
                            max={field.max}
                            step={field.step}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                                     border-2 border-gray-200 dark:border-gray-600
                                     rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                                     text-gray-900 dark:text-white transition-all"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Translations Section */}
        <TranslationsEditor
          translations={propertyData?.translations || []}
          onUpdate={updateTranslation}
        />

        {/* Seasonal Pricing Section */}
        <SeasonalPricingEditor
          pricing={propertyData?.pricing || []}
          propertyId={propertyId}
          onUpdate={loadPropertyData}
        />

        {/* Photos Section */}
        <PhotosEditor
          photos={propertyData?.photos || []}
          propertyId={propertyId}
          onUpdate={loadPropertyData}
        />

        {/* Features Section */}
        <FeaturesEditor
          features={propertyData?.features || []}
          propertyId={propertyId}
          onUpdate={loadPropertyData}
        />
      </div>
    </div>
  )
}

export default EditProperty