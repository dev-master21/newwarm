// frontend/src/components/admin/FeaturesEditor.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSparkles,
  HiChevronDown,
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiOutlineCheckCircle
} from 'react-icons/hi'

const FeaturesEditor = ({ features, propertyId, onUpdate }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(true)
  const [selectedFeatures, setSelectedFeatures] = useState(
    features.reduce((acc, feature) => {
      if (!acc[feature.feature_type]) {
        acc[feature.feature_type] = []
      }
      acc[feature.feature_type].push(feature.feature_value)
      return acc
    }, {})
  )

  const featureOptions = {
    property: [
      { value: 'mediaRoom', label: t('admin.editProperty.features.mediaRoom') },
      { value: 'privateGym', label: t('admin.editProperty.features.privateGym') },
      { value: 'privateLift', label: t('admin.editProperty.features.privateLift') },
      { value: 'privateSauna', label: t('admin.editProperty.features.privateSauna') },
      { value: 'jacuzzi', label: t('admin.editProperty.features.jacuzzi') },
      { value: 'cornerUnit', label: t('admin.editProperty.features.cornerUnit') },
      { value: 'maidsQuarters', label: t('admin.editProperty.features.maidsQuarters') },
      { value: 'duplex', label: t('admin.editProperty.features.duplex') },
      { value: 'balcony', label: t('admin.editProperty.features.balcony') },
      { value: 'westernKitchen', label: t('admin.editProperty.features.westernKitchen') },
      { value: 'bathtub', label: t('admin.editProperty.features.bathtub') },
      { value: 'smartHome', label: t('admin.editProperty.features.smartHome') }
    ],
    outdoor: [
      { value: 'privatePool', label: t('admin.editProperty.features.privatePool') },
      { value: 'poolAccess', label: t('admin.editProperty.features.poolAccess') },
      { value: 'rooftopTerrace', label: t('admin.editProperty.features.rooftopTerrace') },
      { value: 'privateGarden', label: t('admin.editProperty.features.privateGarden') },
      { value: 'gardenAccess', label: t('admin.editProperty.features.gardenAccess') },
      { value: 'terrace', label: t('admin.editProperty.features.terrace') },
      { value: 'coveredParking', label: t('admin.editProperty.features.coveredParking') },
      { value: 'outdoorShowers', label: t('admin.editProperty.features.outdoorShowers') }
    ],
    rental: [
      { value: 'wifiIncluded', label: t('admin.editProperty.features.wifiIncluded') },
      { value: 'washingMachine', label: t('admin.editProperty.features.washingMachine') },
      { value: 'microwave', label: t('admin.editProperty.features.microwave') },
      { value: 'oven', label: t('admin.editProperty.features.oven') },
      { value: 'tv', label: t('admin.editProperty.features.tv') },
      { value: 'cableTV', label: t('admin.editProperty.features.cableTV') },
      { value: 'truevision', label: t('admin.editProperty.features.truevision') },
      { value: 'gardeningIncluded', label: t('admin.editProperty.features.gardeningIncluded') },
      { value: 'poolCleaningIncluded', label: t('admin.editProperty.features.poolCleaningIncluded') }
    ],
    location: [
      { value: 'beachfront', label: t('admin.editProperty.features.beachfront') },
      { value: 'beachAccess', label: t('admin.editProperty.features.beachAccess') },
      { value: 'oceanfront', label: t('admin.editProperty.features.oceanfront') },
      { value: 'oceanAccess', label: t('admin.editProperty.features.oceanAccess') }
    ],
    view: [
      { value: 'blockedView', label: t('admin.editProperty.features.blockedView') },
      { value: 'unblockedView', label: t('admin.editProperty.features.unblockedView') },
      { value: 'cityView', label: t('admin.editProperty.features.cityView') },
      { value: 'riverView', label: t('admin.editProperty.features.riverView') },
      { value: 'poolView', label: t('admin.editProperty.features.poolView') },
      { value: 'gardenView', label: t('admin.editProperty.features.gardenView') },
      { value: 'parkView', label: t('admin.editProperty.features.parkView') },
      { value: 'seaView', label: t('admin.editProperty.features.seaView') },
      { value: 'partialSeaView', label: t('admin.editProperty.features.partialSeaView') },
      { value: 'lakeView', label: t('admin.editProperty.features.lakeView') },
      { value: 'mountainView', label: t('admin.editProperty.features.mountainView') },
      { value: 'golfView', label: t('admin.editProperty.features.golfView') }
    ]
  }

  const featureCategories = [
    { type: 'property', label: t('admin.editProperty.features.propertyFeatures'), color: 'blue' },
    { type: 'outdoor', label: t('admin.editProperty.features.outdoorFeatures'), color: 'green' },
    { type: 'rental', label: t('admin.editProperty.features.rentalFeatures'), color: 'purple' },
    { type: 'location', label: t('admin.editProperty.features.locationFeatures'), color: 'orange' },
    { type: 'view', label: t('admin.editProperty.features.views'), color: 'indigo' }
  ]

  const toggleFeature = (type, value) => {
    setSelectedFeatures(prev => {
      const typeFeatures = prev[type] || []
      const isSelected = typeFeatures.includes(value)
      
      return {
        ...prev,
        [type]: isSelected
          ? typeFeatures.filter(f => f !== value)
          : [...typeFeatures, value]
      }
    })
  }

  const isFeatureSelected = (type, value) => {
    return (selectedFeatures[type] || []).includes(value)
  }

  const getTotalSelected = () => {
    return Object.values(selectedFeatures).reduce((sum, arr) => sum + arr.length, 0)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden mt-6"
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-pink-500 to-pink-600 p-4 cursor-pointer
                 hover:from-pink-600 hover:to-pink-700 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <HiSparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t('admin.editProperty.features.title')}
              </h2>
              <p className="text-sm text-white/80">
                {getTotalSelected()} {t('admin.editProperty.features.selected')}
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
            <div className="p-6 space-y-6">
              {featureCategories.map(category => (
                <div key={category.type} className="space-y-3">
                  <div className={`flex items-center space-x-2 pb-2 border-b-2 border-${category.color}-200 
                                 dark:border-${category.color}-800`}>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.label}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({(selectedFeatures[category.type] || []).length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {featureOptions[category.type]?.map(feature => {
                      const isSelected = isFeatureSelected(category.type, feature.value)
                      return (
                        <motion.button
                          key={feature.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleFeature(category.type, feature.value)}
                          className={`flex items-center justify-between p-3 rounded-lg 
                                   border-2 transition-all ${
                            isSelected
                              ? `border-${category.color}-500 bg-${category.color}-50 dark:bg-${category.color}-900/20`
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className={`text-sm font-medium ${
                            isSelected
                              ? `text-${category.color}-700 dark:text-${category.color}-300`
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {feature.label}
                          </span>
                          {isSelected ? (
                            <HiCheckCircle className={`w-5 h-5 text-${category.color}-500`} />
                          ) : (
                            <HiOutlineCheckCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default FeaturesEditor