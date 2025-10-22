// frontend/src/components/admin/propertyForm/Step4Specifications.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  HiBadgeCheck,
  HiHome,
  HiColorSwatch,
  HiChartSquareBar,
  HiArrowsExpand,
  HiViewGrid
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'
import FormField from '../FormField'

const Step4Specifications = () => {
  const { t } = useTranslation()
  const { formData, updateFormData, formErrors } = usePropertyFormStore()

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  const showFloors = ['house', 'villa'].includes(formData.propertyType)
  const showFloor = ['condo', 'apartment', 'penthouse'].includes(formData.propertyType)
  const showPenthouseFloors = formData.propertyType === 'penthouse'
  const showPlotSize = ['house', 'villa'].includes(formData.propertyType)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step4.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step4.subtitle')}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bedrooms */}
        <FormField
          label={t('admin.addProperty.step4.bedrooms')}
          required
          error={formErrors.bedrooms}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiBadgeCheck className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="0"
              value={formData.bedrooms}
              onChange={(e) => handleInputChange('bedrooms', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all
                ${formErrors.bedrooms 
                  ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                }
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              `}
              placeholder={t('admin.addProperty.step4.bedroomsPlaceholder')}
            />
          </div>
        </FormField>

        {/* Bathrooms */}
        <FormField
          label={t('admin.addProperty.step4.bathrooms')}
          required
          error={formErrors.bathrooms}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiColorSwatch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.bathrooms}
              onChange={(e) => handleInputChange('bathrooms', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all
                ${formErrors.bathrooms 
                  ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                }
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              `}
              placeholder={t('admin.addProperty.step4.bathroomsPlaceholder')}
            />
          </div>
        </FormField>

        {/* Indoor Area */}
        <FormField
          label={t('admin.addProperty.step4.indoorArea')}
          required
          error={formErrors.indoorArea}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiHome className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="0"
              value={formData.indoorArea}
              onChange={(e) => handleInputChange('indoorArea', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all
                ${formErrors.indoorArea 
                  ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                  : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                }
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
              `}
              placeholder={t('admin.addProperty.step4.indoorAreaPlaceholder')}
            />
          </div>
        </FormField>

        {/* Outdoor Area */}
        <FormField
          label={t('admin.addProperty.step4.outdoorArea')}
          error={formErrors.outdoorArea}
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiArrowsExpand className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              min="0"
              value={formData.outdoorArea}
              onChange={(e) => handleInputChange('outdoorArea', e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
              placeholder={t('admin.addProperty.step4.outdoorAreaPlaceholder')}
            />
          </div>
        </FormField>

        {/* Plot Size (for house/villa) */}
        {showPlotSize && (
          <FormField
            label={t('admin.addProperty.step4.plotSize')}
            error={formErrors.plotSize}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiChartSquareBar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="0"
                value={formData.plotSize}
                onChange={(e) => handleInputChange('plotSize', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                         rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                placeholder={t('admin.addProperty.step4.plotSizePlaceholder')}
              />
            </div>
          </FormField>
        )}

        {/* Floors (for house/villa) */}
        {showFloors && (
          <FormField
            label={t('admin.addProperty.step4.floors')}
            required
            error={formErrors.floors}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiViewGrid className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                value={formData.floors}
                onChange={(e) => handleInputChange('floors', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all
                  ${formErrors.floors 
                    ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder={t('admin.addProperty.step4.floorsPlaceholder')}
              />
            </div>
          </FormField>
        )}

        {/* Floor (for condo/apartment/penthouse) */}
        {showFloor && (
          <FormField
            label={t('admin.addProperty.step4.floor')}
            required
            error={formErrors.floor}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiViewGrid className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                value={formData.floor}
                onChange={(e) => handleInputChange('floor', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all
                  ${formErrors.floor 
                    ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder={t('admin.addProperty.step4.floorPlaceholder')}
              />
            </div>
          </FormField>
        )}

        {/* Penthouse Floors */}
        {showPenthouseFloors && (
          <FormField
            label={t('admin.addProperty.step4.penthouseFloors')}
            required
            error={formErrors.penthouseFloors}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiViewGrid className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                value={formData.penthouseFloors}
                onChange={(e) => handleInputChange('penthouseFloors', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg transition-all
                  ${formErrors.penthouseFloors 
                    ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
                  }
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                `}
                placeholder={t('admin.addProperty.step4.penthouseFloorsPlaceholder')}
              />
            </div>
          </FormField>
        )}
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
      >
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <HiChartSquareBar className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
              {t('admin.addProperty.step4.helpTitle')}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('admin.addProperty.step4.helpText')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Step4Specifications