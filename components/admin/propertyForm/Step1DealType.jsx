// frontend/src/components/admin/propertyForm/Step1DealType.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiCurrencyDollar, HiHome, HiSwitchHorizontal } from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'

const Step1DealType = () => {
  const { t } = useTranslation()
  const { formData, updateFormData } = usePropertyFormStore()

  const dealTypes = [
    {
      id: 'sale',
      icon: HiCurrencyDollar,
      gradient: 'from-green-500 to-emerald-500',
      hoverGradient: 'from-green-600 to-emerald-600'
    },
    {
      id: 'rent',
      icon: HiHome,
      gradient: 'from-blue-500 to-indigo-500',
      hoverGradient: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'both',
      icon: HiSwitchHorizontal,
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'from-purple-600 to-pink-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step1.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step1.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dealTypes.map((type) => {
          const Icon = type.icon
          const isSelected = formData.dealType === type.id

          return (
            <motion.button
              key={type.id}
              type="button"
              onClick={() => updateFormData({ dealType: type.id })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-2xl border-2 transition-all
                ${isSelected
                  ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 shadow-lg shadow-red-500/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selectedDealType"
                  className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#DC2626] to-[#EF4444] 
                           rounded-full flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${type.gradient} 
                            flex items-center justify-center shadow-lg transform transition-transform
                            ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                <Icon className="w-8 h-8 text-white" />
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold mb-2 transition-colors
                ${isSelected ? 'text-[#DC2626]' : 'text-gray-900 dark:text-white'}
              `}>
                {t(`admin.addProperty.step1.${type.id}`)}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(`admin.addProperty.step1.${type.id}Description`)}
              </p>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default Step1DealType