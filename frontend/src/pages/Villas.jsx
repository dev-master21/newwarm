import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiFilter, HiX, HiViewGrid, HiViewList } from 'react-icons/hi'
import VillaCard from '../components/Villa/VillaCard'
import VillaFilters from '../components/Villa/VillaFilters'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Pagination from '../components/common/Pagination'
import { villaService } from '../services/villa.service'
import toast from 'react-hot-toast'

const Villas = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [villas, setVillas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    loadVillas()
  }, [searchParams])

  const loadVillas = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries([...searchParams])
      const response = await villaService.getVillas({
        ...params,
        page: params.page || 1,
        limit: params.limit || 12
      })
      
      setVillas(response.data)
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error loading villas:', error)
      toast.error('Failed to load villas')
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setSearchParams({ ...Object.fromEntries([...searchParams]), page })
  }

  const handleFilterChange = (filters) => {
    setSearchParams(filters)
    setShowFilters(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('nav.villas')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {pagination.total} villas found
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : ''}`}
                >
                  <HiViewGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 shadow-sm' 
                    : ''}`}
                >
                  <HiViewList className="w-5 h-5" />
                </button>
              </div>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white 
                         rounded-lg hover:bg-primary-700 transition-colors"
              >
                <HiFilter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-80 flex-shrink-0"
              >
                <VillaFilters 
                  onFilterChange={handleFilterChange}
                  onClose={() => setShowFilters(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Villas Grid/List */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="large" />
              </div>
            ) : villas.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  No villas found matching your criteria
                </p>
                <button
                  onClick={() => setSearchParams({})}
                  className="mt-4 text-primary-600 hover:text-primary-700"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-6'
                }>
                  {villas.map((villa, index) => (
                    <motion.div
                      key={villa.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <VillaCard 
                        villa={villa} 
                        viewMode={viewMode}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Villas