// frontend/src/components/admin/ProgressBar.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  HiCheckCircle, 
  HiHome,
  HiLocationMarker,
  HiViewGrid,
  HiInformationCircle,
  HiShieldCheck,
  HiStar,
  HiPhotograph,
  HiCurrencyDollar,
  HiCalendar
} from 'react-icons/hi'

const ProgressBar = ({ currentStep, totalSteps }) => {
  const { t } = useTranslation()
  const progress = (currentStep / totalSteps) * 100

  const steps = [
    { icon: HiHome, key: 'dealType' },
    { icon: HiViewGrid, key: 'propertyType' },
    { icon: HiLocationMarker, key: 'location' },
    { icon: HiInformationCircle, key: 'specifications' },
    { icon: HiInformationCircle, key: 'additionalInfo' },
    { icon: HiShieldCheck, key: 'ownership' },
    { icon: HiStar, key: 'features' },
    { icon: HiPhotograph, key: 'photos' },
    { icon: HiCurrencyDollar, key: 'pricing' },
    { icon: HiCalendar, key: 'calendar' }
  ]

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#DC2626] to-[#EF4444]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const Icon = step.icon

          return (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center
                          transition-all duration-300 ${
                  isCompleted
                    ? 'bg-[#DC2626] text-white shadow-lg'
                    : isCurrent
                    ? 'bg-[#DC2626] text-white shadow-xl ring-4 ring-red-100 dark:ring-red-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
                animate={{
                  scale: isCurrent ? 1.1 : 1
                }}
              >
                {isCompleted ? (
                  <HiCheckCircle className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </motion.div>
              
              <span className={`mt-2 text-xs font-medium hidden md:block ${
                isCurrent
                  ? 'text-[#DC2626]'
                  : isCompleted
                  ? 'text-gray-600 dark:text-gray-400'
                  : 'text-gray-400 dark:text-gray-600'
              }`}>
                {stepNumber}
              </span>
            </div>
          )
        })}
      </div>

      {/* Current Step Label */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.progress.step')} {currentStep} {t('admin.addProperty.progress.of')} {totalSteps}
        </p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
          {t(`admin.addProperty.progress.steps.step${currentStep}`)}
        </p>
      </div>
    </div>
  )
}

export default ProgressBar