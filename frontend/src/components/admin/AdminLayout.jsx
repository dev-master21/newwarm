// frontend/src/components/admin/AdminLayout.jsx
import React, { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AdminSidebar from './AdminSidebar'
import { HiMenu, HiPlus, HiMoon, HiSun } from 'react-icons/hi'
import { useThemeStore } from '../../store/themeStore'

const AdminLayout = () => {
  const { t } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 
                         sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                       transition-colors"
            >
              <HiMenu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4 ml-auto">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-colors"
                title={t('admin.layout.toggleTheme')}
              >
                {theme === 'dark' ? (
                  <HiSun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <HiMoon className="w-6 h-6 text-gray-600" />
                )}
              </button>

              {/* Add Property Button */}
              <button
                onClick={() => navigate('/admin/add-property')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#DC2626] to-[#EF4444]
                         hover:from-[#B91C1C] hover:to-[#DC2626]
                         text-white rounded-lg transition-all shadow-md hover:shadow-lg
                         transform hover:scale-105 active:scale-95"
              >
                <HiPlus className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">{t('admin.layout.addProperty')}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout