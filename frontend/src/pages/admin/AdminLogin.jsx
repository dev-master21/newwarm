// frontend/src/pages/admin/AdminLogin.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiLockClosed, HiUser } from 'react-icons/hi'
import toast from 'react-hot-toast'
import axios from 'axios'

const AdminLogin = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post('/api/auth/admin/login', {
        email: formData.username,
        password: formData.password
      })

      if (response.data.success) {
        localStorage.setItem('adminToken', response.data.data.token)
        localStorage.setItem('adminUser', JSON.stringify(response.data.data.admin))
        toast.success(t('admin.login.welcome'))
        navigate('/admin/dashboard')
      }
    } catch (error) {
      toast.error(t('admin.login.error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 
                    flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 
                     bg-gradient-to-br from-red-500 to-purple-600 
                     rounded-2xl mb-4 shadow-2xl"
          >
            <HiLockClosed className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('admin.login.title')}
          </h1>
          <p className="text-gray-300">
            {t('admin.login.subtitle')}
          </p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.login.username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 
                           rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white
                           transition-all"
                  placeholder="admin"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.login.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HiLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 
                           rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent
                           dark:bg-gray-700 dark:border-gray-600 dark:text-white
                           transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-600 to-purple-600 
                       text-white font-semibold py-3 px-4 rounded-lg
                       hover:from-red-700 hover:to-purple-700
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? t('admin.login.loggingIn') : t('admin.login.loginButton')}
            </button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          WARM+ Admin Panel © 2025
        </p>
      </motion.div>
    </div>
  )
}

export default AdminLogin