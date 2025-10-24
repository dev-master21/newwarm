// frontend/src/components/admin/FormField.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HiExclamationCircle, HiCheckCircle } from 'react-icons/hi'
import { useTranslation } from 'react-i18next'

const FormField = ({ 
  label, 
  required, 
  error, 
  children, 
  hint,
  className = '',
  success = false
}) => {
  const { t } = useTranslation()
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {children}
        
        {/* Status Icons */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <HiExclamationCircle className="w-5 h-5 text-red-500" />
            </motion.div>
          )}
          {success && !error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            >
              <HiCheckCircle className="w-5 h-5 text-green-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-600 dark:text-red-400 flex items-center space-x-1"
          >
            <HiExclamationCircle className="w-4 h-4" />
            <span>{t(`admin.addProperty.validation.${error}`)}</span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hint */}
      {hint && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
    </div>
  )
}

export default FormField