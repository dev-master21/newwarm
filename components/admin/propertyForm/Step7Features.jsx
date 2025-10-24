// frontend/src/components/admin/propertyForm/Step7Features.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiFilm, 
  HiFire, 
  HiLightningBolt, 
  HiSparkles,
  HiViewGrid,
  HiHome,
  HiCube,
  HiTemplate,
  HiBeaker,
  HiShieldCheck,
  HiWifi,
  HiDesktopComputer,
  HiSun,
  HiClock,
  HiCheckCircle,
  HiOutlineCheckCircle
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'

const Step7Features = () => {
  const { t } = useTranslation()
  const { formData, updateFormData } = usePropertyFormStore()

  const handleFeatureToggle = (category, feature) => {
    const currentFeatures = formData[category] || []
    const isSelected = currentFeatures.includes(feature)
    
    if (isSelected) {
      updateFormData({
        [category]: currentFeatures.filter(f => f !== feature)
      })
      
      // Remove renovation date if unchecking
      if (feature.includes('renovated') || feature.includes('Renovated')) {
        const newDates = { ...formData.renovationDates }
        delete newDates[feature]
        updateFormData({ renovationDates: newDates })
      }
    } else {
      updateFormData({
        [category]: [...currentFeatures, feature]
      })
    }
  }

  const handleRenovationDateChange = (feature, date) => {
    try {
      updateFormData({
        renovationDates: {
          ...formData.renovationDates,
          [feature]: date
        }
      })
    } catch (error) {
      console.error('Error updating renovation date:', error)
    }
  }

  const propertyFeatures = [
    { value: 'mediaRoom', label: t('admin.addProperty.step7.mediaRoom'), icon: HiFilm },
    { value: 'privateGym', label: t('admin.addProperty.step7.privateGym'), icon: HiFire },
    { value: 'privateLift', label: t('admin.addProperty.step7.privateLift'), icon: HiLightningBolt },
    { value: 'privateSauna', label: t('admin.addProperty.step7.privateSauna'), icon: HiFire },
    { value: 'jacuzzi', label: t('admin.addProperty.step7.jacuzzi'), icon: HiSparkles },
    { value: 'cornerUnit', label: t('admin.addProperty.step7.cornerUnit'), icon: HiViewGrid },
    { value: 'maidsQuarters', label: t('admin.addProperty.step7.maidsQuarters'), icon: HiHome },
    { value: 'duplex', label: t('admin.addProperty.step7.duplex'), icon: HiCube },
    { value: 'balcony', label: t('admin.addProperty.step7.balcony'), icon: HiTemplate },
    { value: 'westernKitchen', label: t('admin.addProperty.step7.westernKitchen'), icon: HiBeaker },
    { value: 'bathtub', label: t('admin.addProperty.step7.bathtub'), icon: HiSparkles },
    { value: 'fullyRenovated', label: t('admin.addProperty.step7.fullyRenovated'), icon: HiShieldCheck, hasDate: true },
    { value: 'renovatedKitchen', label: t('admin.addProperty.step7.renovatedKitchen'), icon: HiShieldCheck, hasDate: true },
    { value: 'renovatedBathroom', label: t('admin.addProperty.step7.renovatedBathroom'), icon: HiShieldCheck, hasDate: true },
    { value: 'smartHome', label: t('admin.addProperty.step7.smartHome'), icon: HiDesktopComputer }
  ]

  const outdoorFeatures = [
    { value: 'privatePool', label: t('admin.addProperty.step7.privatePool'), icon: HiSparkles },
    { value: 'poolAccess', label: t('admin.addProperty.step7.poolAccess'), icon: HiSparkles },
    { value: 'rooftopTerrace', label: t('admin.addProperty.step7.rooftopTerrace'), icon: HiSun },
    { value: 'privateGarden', label: t('admin.addProperty.step7.privateGarden'), icon: HiSparkles },
    { value: 'gardenAccess', label: t('admin.addProperty.step7.gardenAccess'), icon: HiSparkles },
    { value: 'terrace', label: t('admin.addProperty.step7.terrace'), icon: HiTemplate },
    { value: 'coveredParking', label: t('admin.addProperty.step7.coveredParking'), icon: HiShieldCheck },
    { value: 'outdoorShowers', label: t('admin.addProperty.step7.outdoorShowers'), icon: HiSparkles }
  ]

  const rentalFeatures = [
    { value: 'wifiIncluded', label: t('admin.addProperty.step7.wifiIncluded'), icon: HiWifi },
    { value: 'washingMachine', label: t('admin.addProperty.step7.washingMachine'), icon: HiClock },
    { value: 'microwave', label: t('admin.addProperty.step7.microwave'), icon: HiBeaker },
    { value: 'oven', label: t('admin.addProperty.step7.oven'), icon: HiBeaker },
    { value: 'tv', label: t('admin.addProperty.step7.tv'), icon: HiDesktopComputer },
    { value: 'cableTV', label: t('admin.addProperty.step7.cableTV'), icon: HiDesktopComputer },
    { value: 'truevision', label: t('admin.addProperty.step7.truevision'), icon: HiDesktopComputer },
    { value: 'gardeningIncluded', label: t('admin.addProperty.step7.gardeningIncluded'), icon: HiSparkles },
    { value: 'poolCleaningIncluded', label: t('admin.addProperty.step7.poolCleaningIncluded'), icon: HiSparkles }
  ]

  const locationFeatures = [
    { value: 'beachfront', label: t('admin.addProperty.step7.beachfront'), icon: HiSparkles },
    { value: 'beachAccess', label: t('admin.addProperty.step7.beachAccess'), icon: HiSparkles },
    { value: 'oceanfront', label: t('admin.addProperty.step7.oceanfront'), icon: HiSparkles },
    { value: 'oceanAccess', label: t('admin.addProperty.step7.oceanAccess'), icon: HiSparkles }
  ]

  const viewOptions = [
    { value: 'blockedView', label: t('admin.addProperty.step7.blockedView') },
    { value: 'unblockedView', label: t('admin.addProperty.step7.unblockedView') },
    { value: 'cityView', label: t('admin.addProperty.step7.cityView') },
    { value: 'riverView', label: t('admin.addProperty.step7.riverView') },
    { value: 'poolView', label: t('admin.addProperty.step7.poolView') },
    { value: 'gardenView', label: t('admin.addProperty.step7.gardenView') },
    { value: 'parkView', label: t('admin.addProperty.step7.parkView') },
    { value: 'seaView', label: t('admin.addProperty.step7.seaView') },
    { value: 'partialSeaView', label: t('admin.addProperty.step7.partialSeaView') },
    { value: 'lakeView', label: t('admin.addProperty.step7.lakeView') },
    { value: 'mountainView', label: t('admin.addProperty.step7.mountainView') },
    { value: 'golfView', label: t('admin.addProperty.step7.golfView') }
  ]

  const showRentalFeatures = formData.dealType === 'rent' || formData.dealType === 'both'

  const FeatureButton = ({ feature, category }) => {
    const isSelected = (formData[category] || []).includes(feature.value)
    
    return (
      <div>
        <motion.button
          type="button"
          onClick={(e) => {
            // ✅ ИСПРАВЛЕНО: Предотвращаем прокрутку
            e.preventDefault()
            handleFeatureToggle(category, feature.value)
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 
                   transition-all ${
            isSelected
              ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 shadow-md'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          {feature.icon && (
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isSelected
                ? 'bg-[#DC2626]'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              <feature.icon className={`w-4 h-4 ${
                isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'
              }`} />
            </div>
          )}
          <span className={`text-sm font-medium text-left flex-1 ${
            isSelected
              ? 'text-[#DC2626]'
              : 'text-gray-900 dark:text-white'
          }`}>
            {feature.label}
          </span>
          {isSelected ? (
            <HiCheckCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0" />
          ) : (
            <HiOutlineCheckCircle className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
          )}
        </motion.button>
        
        {/* ✅ ИСПРАВЛЕНО: Renovation Date Input с AnimatePresence */}
        <AnimatePresence>
          {feature.hasDate && isSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 ml-11"
            >
              <input
                type="month"
                value={formData.renovationDates?.[feature.value] || ''}
                onChange={(e) => {
                  e.stopPropagation()
                  handleRenovationDateChange(feature.value, e.target.value)
                }}
                placeholder={t('admin.addProperty.step7.renovationDatePlaceholder') || 'YYYY-MM'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const totalSelected = 
    (formData.propertyFeatures?.length || 0) +
    (formData.outdoorFeatures?.length || 0) +
    (formData.rentalFeatures?.length || 0) +
    (formData.locationFeatures?.length || 0) +
    (formData.views?.length || 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step7.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step7.subtitle')}
        </p>
      </div>

      {/* Property Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {t('admin.addProperty.step7.propertyFeatures')}
            </h3>
            <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
              {formData.propertyFeatures?.length || 0} {t('admin.addProperty.step7.selected')}
            </span>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {propertyFeatures.map(feature => (
            <FeatureButton key={feature.value} feature={feature} category="propertyFeatures" />
          ))}
        </div>
      </div>

      {/* Outdoor Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {t('admin.addProperty.step7.outdoorFeatures')}
            </h3>
            <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
              {formData.outdoorFeatures?.length || 0} {t('admin.addProperty.step7.selected')}
            </span>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {outdoorFeatures.map(feature => (
            <FeatureButton key={feature.value} feature={feature} category="outdoorFeatures" />
          ))}
        </div>
      </div>

      {/* Rental Features */}
      {showRentalFeatures && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-white">
                  {t('admin.addProperty.step7.rentalFeatures')}
                </h3>
                <span className="text-xs px-2 py-1 bg-white/20 text-white rounded-full">
                  {t('admin.addProperty.step7.rentalFeaturesNote')}
                </span>
              </div>
              <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
                {formData.rentalFeatures?.length || 0} {t('admin.addProperty.step7.selected')}
              </span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {rentalFeatures.map(feature => (
              <FeatureButton key={feature.value} feature={feature} category="rentalFeatures" />
            ))}
          </div>
        </div>
      )}

      {/* Location Features */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {t('admin.addProperty.step7.locationFeatures')}
            </h3>
            <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
              {formData.locationFeatures?.length || 0} {t('admin.addProperty.step7.selected')}
            </span>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {locationFeatures.map(feature => (
            <FeatureButton key={feature.value} feature={feature} category="locationFeatures" />
          ))}
        </div>
      </div>

      {/* Views */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              {t('admin.addProperty.step7.views')}
            </h3>
            <span className="text-sm text-white/90 bg-white/20 px-3 py-1 rounded-full">
              {formData.views?.length || 0} {t('admin.addProperty.step7.selected')}
            </span>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {viewOptions.map(view => {
            const isSelected = (formData.views || []).includes(view.value)
            return (
              <motion.button
                key={view.value}
                type="button"
                onClick={(e) => {
                  // ✅ ИСПРАВЛЕНО: Предотвращаем прокрутку
                  e.preventDefault()
                  handleFeatureToggle('views', view.value)
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                  isSelected
                    ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 text-[#DC2626] shadow-md'
                    : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-gray-300'
                }`}
              >
                {view.label}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
            <HiSparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              {totalSelected > 0 ? t('admin.addProperty.step7.greatSelection') : t('admin.addProperty.step7.noFeaturesSelected')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalSelected > 0 
                ? t('admin.addProperty.step7.summaryText', { count: totalSelected })
                : t('admin.addProperty.step7.selectFeaturesHint')
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Step7Features