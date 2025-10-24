import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiHeart, HiTrash } from 'react-icons/hi'
import VillaCard from '../components/Villa/VillaCard'
import { useShortlistStore } from '../store/shortlistStore'

const Shortlist = () => {
  const { t } = useTranslation()
  const { items, removeItem, clearAll } = useShortlistStore()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t('nav.shortlist')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {items.length} {items.length === 1 ? 'villa' : 'villas'} saved
              </p>
            </div>
            
            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white 
                         rounded-lg hover:bg-red-700 transition-colors"
              >
                <HiTrash className="w-5 h-5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <HiHeart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Your shortlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Start adding villas to your shortlist to compare them later
            </p>
            <Link
              to="/villas"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg 
                       hover:bg-primary-700 transition-colors"
            >
              Browse Villas
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((villa, index) => (
              <motion.div
                key={villa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <VillaCard villa={villa} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shortlist