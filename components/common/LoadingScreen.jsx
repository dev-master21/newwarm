// frontend/src/components/common/LoadingScreen.jsx
import React from 'react'
import { motion } from 'framer-motion'

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center"
      >
        {/* Текстовый лоудер WARM+ */}
        <motion.div
          className="text-6xl font-bold"
          initial={{ color: '#9CA3AF' }}
          animate={{ color: '#ba2e2d' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          WARM+
        </motion.div>
        
        {/* Progress Bar */}
        <motion.div className="w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
          <motion.div
            className="h-full bg-[#ba2e2d]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoadingScreen