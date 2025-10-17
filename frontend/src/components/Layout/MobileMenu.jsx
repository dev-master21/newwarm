import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiHeart, HiSun, HiMoon } from 'react-icons/hi'
import { useThemeStore } from '../../store/themeStore'
import { useShortlistStore } from '../../store/shortlistStore'

const MobileMenu = ({ isOpen, onClose, navLinks }) => {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()
  const { items } = useShortlistStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 
                     shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Menu
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-6">
              <div className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={onClose}
                    className="block py-3 text-lg text-gray-900 dark:text-white 
                             hover:text-primary-600 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                
                <Link
                  to="/shortlist"
                  onClick={onClose}
                  className="flex items-center justify-between py-3 text-lg 
                           text-gray-900 dark:text-white hover:text-primary-600 
                           transition-colors"
                >
                  <span>{t('nav.shortlist')}</span>
                  <div className="flex items-center space-x-2">
                    <HiHeart className="w-5 h-5" />
                    {items.length > 0 && (
                      <span className="bg-primary-600 text-white text-xs 
                                     rounded-full w-5 h-5 flex items-center justify-center">
                        {items.length}
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            </nav>

            {/* Settings */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-700 dark:text-gray-300">
                  Dark Mode
                </span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                >
                  {theme === 'dark' ? (
                    <HiSun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <HiMoon className="w-5 h-5 text-gray-700" />
                  )}
                </button>
              </div>

              {/* Language */}
              <div className="mb-4">
                <span className="text-gray-700 dark:text-gray-300 block mb-2">
                  Language
                </span>
                <select
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="th">ภาษาไทย</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-6 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Contact Us
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>📞 +66 123 456 789</p>
                <p>✉️ info@warmphuket.ru</p>
                <p>📍 Phuket, Thailand</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default MobileMenu