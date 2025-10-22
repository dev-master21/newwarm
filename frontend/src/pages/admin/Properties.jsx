// frontend/src/pages/admin/Properties.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiSearch,
  HiViewGrid,
  HiViewList,
  HiPlus,
  HiFilter,
  HiRefresh
} from 'react-icons/hi'
import propertyApi from '../../api/propertyApi'
import PropertyCard from '../../components/admin/PropertyCard'
import ConfirmModal from '../../components/admin/ConfirmModal'
import toast from 'react-hot-toast'

const Properties = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('cards')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'danger',
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: '',
    cancelText: ''
  })

  const loadProperties = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      }

      const response = await propertyApi.getProperties(params)
      
      if (response.success) {
        setProperties(response.data.properties)
        setPagination(prev => ({
          ...prev,
          ...response.data.pagination
        }))
      }
    } catch (error) {
      console.error('Failed to load properties:', error)
      toast.error(t('admin.properties.loadError'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [pagination.page, statusFilter, searchQuery])

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDelete = (propertyId) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: t('admin.properties.confirmDelete.title'),
      message: t('admin.properties.confirmDelete.message'),
      confirmText: t('admin.properties.confirmDelete.confirm'),
      cancelText: t('admin.properties.confirmDelete.cancel'),
      onConfirm: async () => {
        try {
          await propertyApi.deleteProperty(propertyId)
          toast.success(t('admin.properties.deleteSuccess'))
          loadProperties()
        } catch (error) {
          console.error('Failed to delete property:', error)
          toast.error(t('admin.properties.deleteError'))
        }
      }
    })
  }

  const handleToggleVisibility = (propertyId, newStatus) => {
    const isHiding = newStatus === 'hidden'
    
    setConfirmModal({
      isOpen: true,
      type: isHiding ? 'warning' : 'success',
      title: isHiding 
        ? t('admin.properties.confirmHide.title')
        : t('admin.properties.confirmShow.title'),
      message: isHiding
        ? t('admin.properties.confirmHide.message')
        : t('admin.properties.confirmShow.message'),
      confirmText: isHiding
        ? t('admin.properties.confirmHide.confirm')
        : t('admin.properties.confirmShow.confirm'),
      cancelText: isHiding
        ? t('admin.properties.confirmHide.cancel')
        : t('admin.properties.confirmShow.cancel'),
      onConfirm: async () => {
        try {
          await propertyApi.toggleVisibility(propertyId, newStatus)
          toast.success(
            isHiding 
              ? t('admin.properties.hideSuccess')
              : t('admin.properties.showSuccess')
          )
          loadProperties()
        } catch (error) {
          console.error('Failed to toggle visibility:', error)
          toast.error(t('admin.properties.visibilityError'))
        }
      }
    })
  }

  const statusFilters = [
    { value: 'all', label: t('admin.properties.filters.all') },
    { value: 'published', label: t('admin.properties.filters.published') },
    { value: 'hidden', label: t('admin.properties.filters.hidden') },
    { value: 'draft', label: t('admin.properties.filters.draft') }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('admin.properties.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.properties.subtitle')}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/add-property')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r 
                     from-red-500 to-red-600 hover:from-red-600 hover:to-red-700
                     text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
                     transition-all duration-300"
          >
            <HiPlus className="w-5 h-5" />
            <span>{t('admin.properties.addProperty')}</span>
          </motion.button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={t('admin.properties.search')}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 
                       border-2 border-gray-200 dark:border-gray-600
                       rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent
                       text-gray-900 dark:text-white placeholder-gray-400
                       transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 lg:pb-0">
            <HiFilter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => handleStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap
                         transition-all duration-200 ${
                  statusFilter === filter.value
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-gray-600 text-red-500 shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
              title={t('admin.properties.viewMode.cards')}
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 text-red-500 shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
              title={t('admin.properties.viewMode.table')}
            >
              <HiViewList className="w-5 h-5" />
            </button>
          </div>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={loadProperties}
            className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 
                     dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300
                     rounded-lg transition-colors"
            title={t('admin.properties.refresh')}
          >
            <HiRefresh className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent" />
        </div>
      )}

      {/* Empty State */}
      {!loading && properties.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full 
                        flex items-center justify-center">
            <HiViewGrid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {searchQuery || statusFilter !== 'all' 
              ? t('admin.properties.noResults')
              : t('admin.properties.empty')
            }
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || statusFilter !== 'all'
              ? t('admin.properties.noResultsDesc')
              : t('admin.properties.emptyDesc')
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/add-property')}
              className="inline-flex items-center space-x-2 px-6 py-3 
                       bg-gradient-to-r from-red-500 to-red-600
                       hover:from-red-600 hover:to-red-700
                       text-white font-semibold rounded-xl shadow-lg
                       transition-all duration-300"
            >
              <HiPlus className="w-5 h-5" />
              <span>{t('admin.properties.addProperty')}</span>
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Properties Grid */}
      {!loading && properties.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={handleDelete}
                onToggleVisibility={handleToggleVisibility}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {!loading && properties.length > 0 && pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center space-x-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 
                     dark:border-gray-700 rounded-lg font-medium text-gray-700 
                     dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {t('common.previous')}
          </button>
          
          <div className="flex items-center space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setPagination(prev => ({ ...prev, page }))}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  page === pagination.page
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 
                     dark:border-gray-700 rounded-lg font-medium text-gray-700 
                     dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {t('common.next')}
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        type={confirmModal.type}
      />
    </div>
  )
}

export default Properties