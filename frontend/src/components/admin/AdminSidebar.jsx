// frontend/src/components/admin/AdminSidebar.jsx
import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiX,
  HiHome,
  HiViewGrid,
  HiCalendar,
  HiCog,
  HiLogout
} from 'react-icons/hi'

const AdminSidebar = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    onClose()
  }, [location.pathname])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  // Navigation items
  const navigation = [
    {
      name: t('admin.nav.dashboard'),
      href: '/admin/dashboard',
      icon: HiHome,
      current: location.pathname === '/admin/dashboard'
    },
    {
      name: t('admin.nav.properties'),
      href: '/admin/properties',
      icon: HiViewGrid,
      current: location.pathname.startsWith('/admin/properties') || location.pathname === '/admin/add-property'
    },
    {
      name: t('admin.nav.bookings'),
      href: '/admin/bookings',
      icon: HiCalendar,
      current: location.pathname.startsWith('/admin/bookings')
    },
    {
      name: t('admin.nav.settings'),
      href: '/admin/settings',
      icon: HiCog,
      current: location.pathname === '/admin/settings'
    }
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 
                 border-r border-gray-200 dark:border-gray-700 shadow-xl
                 transform transition-transform duration-300 ease-in-out lg:translate-x-0
                 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl 
                            flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">W+</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  WARM+
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('admin.layout.adminPanel') || 'Панель администратора'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-colors"
            >
              <HiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                           transition-all group ${
                    item.current
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${
                    item.current
                      ? 'text-white'
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-red-500'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 text-xs font-semibold bg-red-500 
                                   text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {/* Language Switcher */}
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('admin.layout.language') || 'Язык'}
              </span>
              <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => i18n.changeLanguage('ru')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    i18n.language === 'ru'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  RU
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    i18n.language === 'en'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl
                       text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20
                       transition-colors group"
            >
              <HiLogout className="w-5 h-5" />
              <span className="font-medium">{t('admin.layout.logout') || 'Выйти'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar