// frontend/src/components/admin/propertyForm/Step6Ownership.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiShieldCheck, HiHome, HiOfficeBuilding, HiGlobe } from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'

const Step6Ownership = () => {
  const { t } = useTranslation()
  const { formData, updateFormData, formErrors } = usePropertyFormStore()

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  // Skip ownership for rent-only properties
  if (formData.dealType === 'rent') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('admin.addProperty.step6.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.addProperty.step6.subtitle')}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                   border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center"
        >
          <HiShieldCheck className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('admin.addProperty.step6.rentOnlyTitle')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.addProperty.step6.rentOnlyDescription')}
          </p>
        </motion.div>
      </div>
    )
  }

  const isHouseOrVilla = ['house', 'villa'].includes(formData.propertyType)

  // Building ownership options for House/Villa
  const buildingOwnershipTypes = [
    { id: 'foreign', icon: HiGlobe },
    { id: 'thai', icon: HiHome },
    { id: 'leasehold', icon: HiShieldCheck },
    { id: 'company', icon: HiOfficeBuilding }
  ]

  // Land ownership options for House/Villa
  const landOwnershipTypes = [
    { id: 'thai', icon: HiHome },
    { id: 'leasehold', icon: HiShieldCheck },
    { id: 'company', icon: HiOfficeBuilding }
  ]

  // Ownership options for Condo/Apartment/Penthouse
  const condoOwnershipTypes = [
    { id: 'foreignQuota', icon: HiGlobe },
    { id: 'thaiQuota', icon: HiHome },
    { id: 'leasehold', icon: HiShieldCheck },
    { id: 'company', icon: HiOfficeBuilding }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step6.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step6.subtitle')}
        </p>
      </div>

      {isHouseOrVilla ? (
        <>
          {/* Building Ownership */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                        border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg 
                            flex items-center justify-center shadow-lg">
                <HiHome className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('admin.addProperty.step6.buildingOwnership')}
                </h3>
                {formErrors.buildingOwnership && (
                  <p className="text-sm text-red-500 mt-1">
                    {t('admin.addProperty.validation.required')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {buildingOwnershipTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.buildingOwnership === type.id

                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('buildingOwnership', type.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 shadow-lg'
                        : formErrors.buildingOwnership
                        ? 'border-red-300 dark:border-red-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      isSelected ? 'text-[#DC2626]' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium text-sm ${
                      isSelected ? 'text-[#DC2626]' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {t(`admin.addProperty.step6.${type.id}`)}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Land Ownership */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                        border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg 
                            flex items-center justify-center shadow-lg">
                <HiShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('admin.addProperty.step6.landOwnership')}
                </h3>
                {formErrors.landOwnership && (
                  <p className="text-sm text-red-500 mt-1">
                    {t('admin.addProperty.validation.required')}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {landOwnershipTypes.map((type) => {
                const Icon = type.icon
                const isSelected = formData.landOwnership === type.id

                return (
                  <motion.button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('landOwnership', type.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 transition-all
                      ${isSelected
                        ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 shadow-lg'
                        : formErrors.landOwnership
                        ? 'border-red-300 dark:border-red-800'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      isSelected ? 'text-[#DC2626]' : 'text-gray-400'
                    }`} />
                    <p className={`font-medium text-sm ${
                      isSelected ? 'text-[#DC2626]' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {t(`admin.addProperty.step6.${type.id}`)}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        /* Condo/Apartment/Penthouse Ownership */
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 
                      border-2 border-purple-200 dark:border-purple-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg 
                          flex items-center justify-center shadow-lg">
              <HiOfficeBuilding className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('admin.addProperty.step6.ownershipType')}
              </h3>
              {formErrors.ownershipType && (
                <p className="text-sm text-red-500 mt-1">
                  {t('admin.addProperty.validation.required')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {condoOwnershipTypes.map((type) => {
              const Icon = type.icon
              const isSelected = formData.ownershipType === type.id

              return (
                <motion.button
                  key={type.id}
                  type="button"
                  onClick={() => handleInputChange('ownershipType', type.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all
                    ${isSelected
                      ? 'border-[#DC2626] bg-red-50 dark:bg-red-900/20 shadow-lg'
                      : formErrors.ownershipType
                      ? 'border-red-300 dark:border-red-800'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    isSelected ? 'text-[#DC2626]' : 'text-gray-400'
                  }`} />
                  <p className={`font-medium text-sm ${
                    isSelected ? 'text-[#DC2626]' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {t(`admin.addProperty.step6.${type.id}`)}
                  </p>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Step6Ownership