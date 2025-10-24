// frontend/src/pages/admin/AdminDashboard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiPlus, HiOfficeBuilding, HiClock, HiChartBar } from 'react-icons/hi'

const AdminDashboard = () => {
  const { t } = useTranslation()

  const stats = [
    {
      icon: HiOfficeBuilding,
      label: t('admin.dashboard.properties'),
      value: '0',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: HiClock,
      label: t('admin.dashboard.bookings'),
      value: '0',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: HiChartBar,
      label: t('admin.dashboard.views'),
      value: '0',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const quickActions = [
    {
      icon: HiPlus,
      label: t('admin.dashboard.addProperty'),
      description: t('admin.dashboard.addPropertyDesc'),
      path: '/admin/add-property',
      color: 'from-red-500 to-purple-600'
    },
    {
      icon: HiOfficeBuilding,
      label: t('admin.dashboard.properties'),
      description: t('admin.dashboard.managePropertiesDesc'),
      path: '/admin/properties',
      color: 'from-blue-500 to-cyan-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('admin.dashboard.welcome')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {t('admin.dashboard.managementTitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} 
                            rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {t('admin.dashboard.quickActions')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={action.path}
                className="block bg-white dark:bg-gray-800 rounded-2xl p-6 
                         shadow-lg hover:shadow-xl transition-all group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${action.color} 
                                rounded-xl flex items-center justify-center
                                group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white 
                                 group-hover:text-red-500 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard