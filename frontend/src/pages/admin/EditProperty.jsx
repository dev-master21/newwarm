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
        console.log('Loaded property data:', response.data)
        
        const data = {
          ...response.data.property,
          translations: response.data.translations || [],
          photos: response.data.photos || [],
          features: response.data.features || [],
          pricing: response.data.pricing || []
        }
        
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
      
      toast.success(t('admin.editProperty.saved'))
      setOriginalData(JSON.parse(JSON.stringify(propertyData)))
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save property:', error)
      toast.error(t('admin.editProperty.error'))
    } finally {
      setSaving(false)
    }
  }

  // Определение всех полей для редактирования
  const editableFields = useMemo(() => {
    if (!propertyData) return []

    return [
      // Основная информация
      {
        section: 'basic',
        icon: HiHome,
        fields: [
          {
            key: 'deal_type',
            label: t('admin.editProperty.fields.dealType'),
            type: 'select',
            options: ['sale', 'rent', 'both'].map(val => ({
              value: val,
              label: t(`admin.editProperty.dealTypes.${val}`)
            })),
            value: propertyData.deal_type
          },
          {
            key: 'property_type',
            label: t('admin.editProperty.fields.propertyType'),
            type: 'select',
            options: ['condo', 'apartment', 'villa', 'house', 'penthouse', 'land'].map(val => ({
              value: val,
              label: t(`admin.editProperty.propertyTypes.${val}`)
            })),
            value: propertyData.property_type
          },
          {
            key: 'property_number',
            label: t('admin.editProperty.fields.propertyNumber'),
            type: 'text',
            value: propertyData.property_number
          },
          {
            key: 'status',
            label: t('admin.editProperty.fields.status'),
            type: 'select',
            options: ['draft', 'published', 'hidden', 'archived'].map(val => ({
              value: val,
              label: t(`admin.editProperty.statuses.${val}`)
            })),
            value: propertyData.status
          }
        ]
      },
      // Местоположение
      {
        section: 'location',
        icon: HiLocationMarker,
        fields: [
          {
            key: 'region',
            label: t('admin.editProperty.fields.region'),
            type: 'select',
            options: ['phuket', 'samui', 'pattaya', 'bangkok', 'chiangmai', 'krabi', 'huahin'].map(val => ({
              value: val,
              label: t(`admin.editProperty.regions.${val}`)
            })),
            value: propertyData.region
          },
          {
            key: 'address',
            label: t('admin.editProperty.fields.address'),
            type: 'textarea',
            value: propertyData.address
          },
          {
            key: 'google_maps_link',
            label: t('admin.editProperty.fields.googleMapsLink'),
            type: 'url',
            value: propertyData.google_maps_link
          },
          {
            key: 'latitude',
            label: t('admin.editProperty.fields.latitude'),
            type: 'number',
            step: 'any',
            value: propertyData.latitude
          },
          {
            key: 'longitude',
            label: t('admin.editProperty.fields.longitude'),
            type: 'number',
            step: 'any',
            value: propertyData.longitude
          }
        ]
      },
      // Характеристики
      {
        section: 'specifications',
        icon: HiCube,
        fields: [
          {
            key: 'bedrooms',
            label: t('admin.editProperty.fields.bedrooms'),
            type: 'number',
            min: 0,
            value: propertyData.bedrooms
          },
          {
            key: 'bathrooms',
            label: t('admin.editProperty.fields.bathrooms'),
            type: 'number',
            step: 0.5,
            min: 0,
            value: propertyData.bathrooms
          },
          {
            key: 'indoor_area',
            label: t('admin.editProperty.fields.indoorArea'),
            type: 'number',
            min: 0,
            value: propertyData.indoor_area
          },
          {
            key: 'outdoor_area',
            label: t('admin.editProperty.fields.outdoorArea'),
            type: 'number',
            min: 0,
            value: propertyData.outdoor_area
          },
          {
            key: 'plot_size',
            label: t('admin.editProperty.fields.plotSize'),
            type: 'number',
            min: 0,
            value: propertyData.plot_size
          },
          {
            key: 'floors',
            label: t('admin.editProperty.fields.floors'),
            type: 'number',
            min: 1,
            value: propertyData.floors
          },
          {
            key: 'floor',
            label: t('admin.editProperty.fields.floor'),
            type: 'number',
            min: 0,
            value: propertyData.floor
          },
          {
            key: 'penthouse_floors',
            label: t('admin.editProperty.fields.penthouseFloors'),
            type: 'number',
            min: 1,
            value: propertyData.penthouse_floors
          }
        ]
      },
      // Дополнительная информация
      {
        section: 'additional',
        icon: HiClipboardList,
        fields: [
          {
            key: 'construction_year',
            label: t('admin.editProperty.fields.constructionYear'),
            type: 'number',
            min: 1900,
            max: new Date().getFullYear() + 5,
            value: propertyData.construction_year
          },
          {
            key: 'construction_month',
            label: t('admin.editProperty.fields.constructionMonth'),
            type: 'number',
            min: 1,
            max: 12,
            value: propertyData.construction_month
          },
          {
            key: 'furniture_status',
            label: t('admin.editProperty.fields.furnitureStatus'),
            type: 'select',
            options: ['fully', 'partially', 'unfurnished', 'negotiable'].map(val => ({
              value: val,
              label: t(`admin.editProperty.furnitureStatuses.${val}`)
            })),
            value: propertyData.furniture_status
          },
          {
            key: 'parking_spaces',
            label: t('admin.editProperty.fields.parkingSpaces'),
            type: 'number',
            min: 0,
            value: propertyData.parking_spaces
          },
          {
            key: 'pets_allowed',
            label: t('admin.editProperty.fields.petsAllowed'),
            type: 'select',
            options: ['allowed', 'not_allowed', 'negotiable'].map(val => ({
              value: val,
              label: t(`admin.editProperty.petsOptions.${val}`)
            })),
            value: propertyData.pets_allowed
          },
          {
            key: 'pets_custom',
            label: t('admin.editProperty.fields.petsCustom'),
            type: 'textarea',
            value: propertyData.pets_custom
          }
        ]
      },
      // Собственность
      {
        section: 'ownership',
        icon: HiShieldCheck,
        fields: [
          {
            key: 'building_ownership',
            label: t('admin.editProperty.fields.buildingOwnership'),
            type: 'select',
            options: ['freehold', 'leasehold', 'company'].map(val => ({
              value: val,
              label: t(`admin.editProperty.ownershipOptions.${val}`)
            })),
            value: propertyData.building_ownership
          },
          {
            key: 'land_ownership',
            label: t('admin.editProperty.fields.landOwnership'),
            type: 'select',
            options: ['freehold', 'leasehold', 'company'].map(val => ({
              value: val,
              label: t(`admin.editProperty.ownershipOptions.${val}`)
            })),
            value: propertyData.land_ownership
          },
          {
            key: 'ownership_type',
            label: t('admin.editProperty.fields.ownershipType'),
            type: 'select',
            options: ['freehold', 'leasehold', 'company'].map(val => ({
              value: val,
              label: t(`admin.editProperty.ownershipOptions.${val}`)
            })),
            value: propertyData.ownership_type
          }
        ]
      },
      // Цены
      {
        section: 'pricing',
        icon: HiCash,
        fields: [
          {
            key: 'sale_price',
            label: t('admin.editProperty.fields.salePrice'),
            type: 'number',
            min: 0,
            value: propertyData.sale_price
          },
          {
            key: 'minimum_nights',
            label: t('admin.editProperty.fields.minimumNights'),
            type: 'number',
            min: 1,
            value: propertyData.minimum_nights
          }
        ]
      },
      // Календарь
      {
        section: 'calendar',
        icon: HiCalendar,
        fields: [
          {
            key: 'ics_calendar_url',
            label: t('admin.editProperty.fields.icsCalendarUrl'),
            type: 'url',
            value: propertyData.ics_calendar_url
          }
        ]
      }
    ]
  }, [propertyData, t])

  // Фильтрация полей по поисковому запросу
  const filteredFields = useMemo(() => {
    if (!searchQuery.trim()) return editableFields

    const query = searchQuery.toLowerCase()
    
    return editableFields.map(section => ({
      ...section,
      fields: section.fields.filter(field => 
        field.label.toLowerCase().includes(query) ||
        field.key.toLowerCase().includes(query) ||
        t(`admin.editProperty.sections.${section.section}`).toLowerCase().includes(query)
      )
    })).filter(section => section.fields.length > 0)
  }, [editableFields, searchQuery, t])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 
                        border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.editProperty.loading')}
          </p>
        </div>
      </div>
    )
  }

  if (!propertyData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <HiExclamation className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 dark:text-white text-xl font-semibold">
            Объект не найден
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin/properties')}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 
                   hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>{t('admin.editProperty.backToList')}</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('admin.editProperty.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.editProperty.subtitle')}
            </p>
          </div>

          {/* Save Button */}
          <AnimatePresence>
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r 
                         from-green-500 to-green-600 hover:from-green-600 hover:to-green-700
                         text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
                         transition-all duration-300 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>{t('admin.editProperty.saving')}</span>
                  </>
                ) : (
                  <>
                    <HiSave className="w-5 h-5" />
                    <span>{t('admin.editProperty.saveChanges')}</span>
                  </>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="relative">
          <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.editProperty.search')}
            className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 
                     border-2 border-gray-200 dark:border-gray-600
                     rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                     text-gray-900 dark:text-white placeholder-gray-400
                     transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 
                       hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full
                       transition-colors"
            >
              <HiX className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {searchQuery && filteredFields.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center py-8"
          >
            <HiExclamation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              {t('admin.editProperty.noFieldsFound')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {t('admin.editProperty.noFieldsFoundDesc')}
            </p>
          </motion.div>
        )}
      </div>

      {/* Editable Fields */}
      <div className="space-y-6">
        {filteredFields.map((section, sectionIndex) => (
          <motion.div
            key={section.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {t(`admin.editProperty.sections.${section.section}`)}
                </h2>
              </div>
            </div>

            {/* Section Fields */}
            <div className="p-6 space-y-5">
              {section.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {field.label}
                  </label>

                  {field.type === 'select' ? (
                    <select
                      value={field.value ?? ''}
                      onChange={(e) => updateField(field.key, e.target.value || null)}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                               border-2 border-gray-200 dark:border-gray-600
                               rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                               text-gray-900 dark:text-white transition-all"
                    >
                      <option value="">{t('admin.editProperty.selectOption')}</option>
                      {field.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={field.value ?? ''}
                      onChange={(e) => updateField(field.key, e.target.value || null)}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 
                               border-2 border-gray-200 dark:border-gray-600
                               rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                               text-gray-900 dark:text-white resize-none transition-all"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={field.value ?? ''}
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
          </motion.div>
        ))}
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
  )
}

export default EditProperty