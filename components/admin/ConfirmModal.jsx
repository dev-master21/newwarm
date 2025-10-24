// frontend/src/components/admin/ConfirmModal.jsx
import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiExclamation } from 'react-icons/hi'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type = 'danger' }) => {
  const { t } = useTranslation()

  const typeColors = {
    danger: {
      bg: 'bg-red-100 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      button: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      button: 'bg-yellow-500 hover:bg-yellow-600'
    },
    success: {
      bg: 'bg-green-100 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      button: 'bg-green-500 hover:bg-green-600'
    }
  }

  const colors = typeColors[type]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700
                           rounded-lg transition-colors"
                >
                  <HiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>

                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${colors.bg}`}>
                    <HiExclamation className={`w-6 h-6 ${colors.icon}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3 p-6 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 
                           hover:bg-gray-300 dark:hover:bg-gray-600
                           text-gray-700 dark:text-gray-300 font-medium rounded-lg
                           transition-colors"
                >
                  {cancelText || t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className={`flex-1 px-4 py-2.5 ${colors.button} text-white font-medium 
                           rounded-lg transition-colors`}
                >
                  {confirmText || t('common.confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ConfirmModal