// frontend/src/components/admin/propertyForm/Step3Location.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiLocationMarker, 
  HiInformationCircle, 
  HiX, 
  HiClipboardCopy,
  HiDeviceMobile,
  HiDesktopComputer,
  HiPencilAlt,
  HiCheckCircle,
  HiExclamationCircle
} from 'react-icons/hi'
import { usePropertyFormStore } from '../../../store/propertyFormStore'
import { extractCoordinatesFromGoogleMapsLink, validateCoordinates, parseManualCoordinates } from '../../../utils/googleMapsUtils'
import GoogleMapPicker from '../GoogleMapPicker'
import { useThemeStore } from '../../../store/themeStore'
import FormField from '../FormField'
import toast from 'react-hot-toast'

const Step3Location = () => {
  const { t } = useTranslation()
  const { formData, updateFormData, formErrors } = usePropertyFormStore()
  const { theme } = useThemeStore()
  const [isLoadingCoordinates, setIsLoadingCoordinates] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [instructionTab, setInstructionTab] = useState('mobile')
  const [showMap, setShowMap] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualCoords, setManualCoords] = useState('')

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value })
  }

  const handleGetCoordinates = async () => {
    if (!formData.googleMapsLink) {
      toast.error(t('admin.addProperty.validation.required'))
      return
    }

    setIsLoadingCoordinates(true)
    try {
      const coords = await extractCoordinatesFromGoogleMapsLink(formData.googleMapsLink)
      
      if (validateCoordinates(coords.lat, coords.lng)) {
        updateFormData({ coordinates: coords })
        setShowMap(true)
        toast.success(t('admin.addProperty.step3.coordinatesReceived'))
      } else {
        throw new Error('Invalid coordinates')
      }
    } catch (error) {
      console.error('Error getting coordinates:', error)
      toast.error(t('admin.addProperty.step3.coordinatesError'))
      setShowManualInput(true)
    } finally {
      setIsLoadingCoordinates(false)
    }
  }

  const handleManualCoordinates = () => {
    try {
      const coords = parseManualCoordinates(manualCoords)
      updateFormData({ coordinates: coords })
      setShowMap(true)
      setShowManualInput(false)
      toast.success(t('admin.addProperty.step3.coordinatesSet'))
    } catch (error) {
      toast.error(t('admin.addProperty.step3.invalidFormat'))
    }
  }

  const handleMapConfirm = (coords, confirmed) => {
    if (confirmed && coords) {
      updateFormData({ coordinates: coords })
      setShowMap(false)
      toast.success(t('admin.addProperty.step3.locationConfirmed'))
    } else {
      setShowMap(false)
      updateFormData({ coordinates: null })
    }
  }

  const copyExampleCoords = () => {
    const example = '7.8804, 98.3923'
    setManualCoords(example)
    navigator.clipboard.writeText(example)
    toast.success(t('admin.addProperty.step3.exampleCopied'))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.step3.title')}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.step3.subtitle')}
        </p>
      </div>

      {/* Region */}
      <FormField
        label={t('admin.addProperty.step3.region')}
        required
        error={formErrors.region}
        hint={t('admin.addProperty.step3.regionHint')}
      >
        <select
          value={formData.region}
          onChange={(e) => handleInputChange('region', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg transition-all
            ${formErrors.region 
              ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
            }
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          `}
        >
          <option value="">{t('admin.addProperty.step3.regionPlaceholder')}</option>
          <option value="bangkok">{t('admin.addProperty.step3.bangkok')}</option>
          <option value="phuket">{t('admin.addProperty.step3.phuket')}</option>
        </select>
      </FormField>

      {/* Address */}
      <FormField
        label={t('admin.addProperty.step3.address')}
        required
        error={formErrors.address}
        hint={t('admin.addProperty.step3.addressHint')}
      >
        <textarea
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          rows={3}
          className={`w-full px-4 py-3 border rounded-lg transition-all resize-none
            ${formErrors.address 
              ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
            }
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          `}
          placeholder={t('admin.addProperty.step3.addressPlaceholder')}
        />
      </FormField>

      {/* Google Maps Link */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('admin.addProperty.step3.googleMapsLink')}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowInstructions(true)}
            className="flex items-center space-x-1 text-sm text-blue-600 dark:text-blue-400 
                     hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <HiInformationCircle className="w-4 h-4" />
            <span>{t('admin.addProperty.step3.googleMapsHelp')}</span>
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={formData.googleMapsLink}
            onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
            className={`flex-1 px-4 py-3 border rounded-lg transition-all
              ${formErrors.googleMapsLink 
                ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
              }
              bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            `}
            placeholder={t('admin.addProperty.step3.googleMapsPlaceholder')}
          />
          <button
            type="button"
            onClick={handleGetCoordinates}
            disabled={isLoadingCoordinates || !formData.googleMapsLink}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                     text-white rounded-lg transition-all 
                     disabled:opacity-50 disabled:cursor-not-allowed
                     whitespace-nowrap shadow-md hover:shadow-lg 
                     transform hover:scale-105 active:scale-95
                     flex items-center justify-center space-x-2"
          >
            {isLoadingCoordinates ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">{t('admin.addProperty.step3.gettingCoordinates')}</span>
              </>
            ) : (
              <>
                <HiLocationMarker className="w-5 h-5" />
                <span className="hidden sm:inline">{t('admin.addProperty.step3.getCoordinates')}</span>
              </>
            )}
          </button>
        </div>

        {/* Manual Input Button */}
        {!formData.coordinates && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              className="flex items-center space-x-2 text-sm text-[#DC2626] hover:text-[#B91C1C]
                       font-medium transition-colors"
            >
              <HiPencilAlt className="w-4 h-4" />
              <span>
                {showManualInput 
                  ? t('admin.addProperty.step3.hideManualInput')
                  : t('admin.addProperty.step3.manualInputButton')
                }
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Manual Coordinates Input */}
      <AnimatePresence>
        {showManualInput && !formData.coordinates && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 
                          border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-inner">
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <HiPencilAlt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('admin.addProperty.step3.manualInputTitle')}
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {t('admin.addProperty.step3.manualInputDescription')}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualCoords}
                  onChange={(e) => setManualCoords(e.target.value)}
                  placeholder={t('admin.addProperty.step3.manualInputPlaceholder')}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleManualCoordinates()
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={copyExampleCoords}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 
                           dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 
                           rounded-lg transition-all flex items-center justify-center"
                  title={t('admin.addProperty.step3.copyExample')}
                >
                  <HiClipboardCopy className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleManualCoordinates}
                  className="px-6 py-2 bg-gradient-to-r from-[#DC2626] to-[#EF4444]
                           hover:from-[#B91C1C] hover:to-[#DC2626]
                           text-white rounded-lg transition-all shadow-md hover:shadow-lg
                           transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                >
                  <HiCheckCircle className="w-5 h-5" />
                  <span>{t('admin.addProperty.step3.applyCoordinates')}</span>
                </button>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {t('admin.addProperty.step3.formatHint')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Display */}
      <AnimatePresence>
        {showMap && formData.coordinates && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <GoogleMapPicker
              coordinates={formData.coordinates}
              onConfirm={handleMapConfirm}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coordinates Display */}
      <AnimatePresence>
        {formData.coordinates && !showMap && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                     border-2 border-green-200 dark:border-green-800 rounded-xl p-4 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 
                              rounded-full flex items-center justify-center shadow-lg">
                  <HiCheckCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {t('admin.addProperty.step3.coordinatesReceived')}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 font-mono mt-1">
                    {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  updateFormData({ coordinates: null })
                  setShowManualInput(true)
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 
                         dark:hover:text-red-300 font-medium transition-colors
                         px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                {t('admin.addProperty.step3.changeCoordinates')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Property Number */}
      <FormField
        label={t('admin.addProperty.step3.propertyNumber')}
        required
        error={formErrors.propertyNumber}
        hint={t('admin.addProperty.step3.propertyNumberHint')}
      >
        <input
          type="text"
          value={formData.propertyNumber}
          onChange={(e) => handleInputChange('propertyNumber', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg transition-all
            ${formErrors.propertyNumber 
              ? 'border-red-500 ring-2 ring-red-200 dark:ring-red-900' 
              : 'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-[#DC2626]'
            }
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          `}
          placeholder={t('admin.addProperty.step3.propertyNumberPlaceholder')}
        />
      </FormField>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
               onClick={() => setShowInstructions(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full 
                       max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#DC2626] to-[#EF4444] p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <HiInformationCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {t('admin.addProperty.step3.instructions.title')}
                  </h3>
                </div>
                <button
                  onClick={() => setShowInstructions(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <HiX className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                <button
                  onClick={() => setInstructionTab('mobile')}
                  className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center space-x-2 ${
                    instructionTab === 'mobile'
                      ? 'text-[#DC2626] bg-white dark:bg-gray-800 border-b-2 border-[#DC2626]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <HiDeviceMobile className="w-5 h-5" />
                  <span>{t('admin.addProperty.step3.instructions.mobile')}</span>
                </button>
                <button
                  onClick={() => setInstructionTab('desktop')}
                  className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-center space-x-2 ${
                    instructionTab === 'desktop'
                      ? 'text-[#DC2626] bg-white dark:bg-gray-800 border-b-2 border-[#DC2626]'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <HiDesktopComputer className="w-5 h-5" />
                  <span>{t('admin.addProperty.step3.instructions.desktop')}</span>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={instructionTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {instructionTab === 'mobile' ? (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <motion.div 
                            key={num}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: num * 0.1 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#DC2626] to-[#EF4444] 
                                          text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                              {num}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 pt-1 leading-relaxed">
                              {t(`admin.addProperty.step3.instructions.mobileStep${num}`)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6].map(num => (
                          <motion.div 
                            key={num}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: num * 0.1 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#DC2626] to-[#EF4444] 
                                          text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                              {num}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 pt-1 leading-relaxed">
                              {t(`admin.addProperty.step3.instructions.desktopStep${num}`)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Step3Location