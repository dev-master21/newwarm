// frontend/src/components/admin/propertyForm/Step2PropertyType.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  HiHome, 
  HiOfficeBuilding, 
  HiLibrary,
  HiLocationMarker,
  HiCube
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'

const Step2PropertyType = () => {
  const { t } = useTranslation()
  const { formData, updateFormData } = usePropertyFormStore()

  const propertyTypes = [
    { id: 'house', icon: HiHome, color: 'blue' },
    { id: 'villa', icon: HiLibrary, color: 'purple' },
    { id: 'condo', icon: HiOfficeBuilding, color: 'green' },
    { id: 'apartment', icon: HiCube, color: 'yellow' },
    { id: 'penthouse', icon: HiLocationMarker, color: 'red' }
  ]

  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-500',
      text: 'text-blue-600'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-500',
      text: 'text-purple-600'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-500',
      text: 'text-green-600'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-500',
      text: 'text-yellow-600'
    },
    red: {
      gradient: 'from-red-500 to-pink-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-500',
      text: 'text-red-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step2.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step2.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {propertyTypes.map((type) => {
          const Icon = type.icon
          const isSelected = formData.propertyType === type.id
          const colors = colorClasses[type.color]

          return (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => updateFormData({ propertyType: type.id })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-6 rounded-2xl border-2 transition-all
                ${isSelected
                  ? `${colors.border} ${colors.bg} shadow-xl`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedPropertyType"
                  className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br ${colors.gradient} 
                           rounded-full flex items-center justify-center shadow-lg`}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${colors.gradient} 
                            flex items-center justify-center shadow-lg transform transition-transform
                            ${isSelected ? 'scale-110' : ''}`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className={`text-base font-bold transition-colors
                ${isSelected ? colors.text : 'text-gray-900 dark:text-white'}
              `}>
                {t(`admin.addProperty.step2.${type.id}`)}
              </h3>
            </motion.button>
          )
        })}
      </div>

      {/* Description */}
      {formData.propertyType && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 
                   rounded-xl border border-gray-200 dark:border-gray-600"
        >
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t(`admin.addProperty.step2.${formData.propertyType}Description`)}
          </p>
        </motion.div>
      )}
    </div>
  )
}

export default Step2PropertyType