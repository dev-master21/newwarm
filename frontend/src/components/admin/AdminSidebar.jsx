// frontend/src/components/admin/AdminSidebar.jsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  HiHome, 
  HiViewGrid, 
  HiCog, 
  HiLogout,
  HiPlus,
  HiUsers,
  HiChartBar,
  HiCalendar,
  HiX
} from 'react-icons/hi'

const AdminSidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation()

  const menuItems = [
    { path: '/admin/dashboard', icon: HiHome, label: t('admin.sidebar.dashboard') },
    { path: '/admin/properties', icon: HiViewGrid, label: t('admin.sidebar.allProperties') },
    { path: '/admin/add-property', icon: HiPlus, label: t('admin.sidebar.addProperty') },
    { path: '/admin/bookings', icon: HiCalendar, label: t('admin.sidebar.bookings') },
    { path: '/admin/users', icon: HiUsers, label: t('admin.sidebar.users') },
    { path: '/admin/analytics', icon: HiChartBar, label: t('admin.sidebar.analytics') },
    { path: '/admin/settings', icon: HiCog, label: t('admin.sidebar.settings') },
  ]

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/admin/login'
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          w-64 shadow-2xl lg:shadow-none
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#DC2626] to-[#EF4444] rounded-xl 
                            flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">W+</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {t('admin.sidebar.admin')}
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <HiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-lg
                  transition-all duration-200 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white shadow-lg shadow-red-500/30' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#DC2626] to-[#EF4444]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={`w-5 h-5 relative z-10 ${
                      isActive ? 'text-white' : 'text-gray-500 group-hover:text-[#DC2626]'
                    }`} />
                    <span className="font-medium relative z-10">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full
                       text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20
                       hover:text-red-600 dark:hover:text-red-400 transition-all group"
            >
              <HiLogout className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
              <span className="font-medium">{t('admin.sidebar.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar