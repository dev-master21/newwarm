// frontend/src/components/admin/bookings/ExportBookings.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiDownload,
  HiDocumentText,
  HiTable,
  HiCalendar,
  HiX,
  HiCheck
} from 'react-icons/hi'
import toast from 'react-hot-toast'
import bookingApi from '../../../api/bookingApi'

const ExportBookings = ({ isOpen, onClose, currentMonth }) => {
  const { t } = useTranslation()
  const [exportFormat, setExportFormat] = useState('xlsx')
  const [exportType, setExportType] = useState('month') // 'month', 'range', 'all'
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    try {
      setExporting(true)

      let params = {
        format: exportFormat
      }

      if (exportType === 'month') {
        params.year = currentMonth.getFullYear()
        params.month = currentMonth.getMonth() + 1
      } else if (exportType === 'range') {
        if (!dateRange.start || !dateRange.end) {
          toast.error(t('admin.bookings.export.selectDateRange'))
          return
        }
        params.startDate = dateRange.start
        params.endDate = dateRange.end
      }

      const response = await bookingApi.exportBookings(params)

      // Create download link
      const blob = new Blob([response], { 
        type: exportFormat === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookings_${new Date().toISOString().split('T')[0]}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(t('admin.bookings.export.success'))
      onClose()
    } catch (error) {
      console.error('Export error:', error)
      toast.error(t('admin.bookings.export.error'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 
                     sm:-translate-x-1/2 max-w-lg w-full bg-white dark:bg-gray-800 rounded-2xl 
                     shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <HiDownload className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {t('admin.bookings.export.title')}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <HiX className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Export Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('admin.bookings.export.period')}
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setExportType('month')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      exportType === 'month'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <HiCalendar className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">
                          {t('admin.bookings.export.currentMonth')}
                        </div>
                        <div className="text-xs opacity-80">
                          {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    {exportType === 'month' && <HiCheck className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setExportType('range')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      exportType === 'range'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <HiCalendar className="w-5 h-5" />
                      <span className="font-semibold">
                        {t('admin.bookings.export.customRange')}
                      </span>
                    </div>
                    {exportType === 'range' && <HiCheck className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setExportType('all')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                      exportType === 'all'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <HiDocumentText className="w-5 h-5" />
                      <span className="font-semibold">
                        {t('admin.bookings.export.allBookings')}
                      </span>
                    </div>
                    {exportType === 'all' && <HiCheck className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Date Range Picker */}
              <AnimatePresence>
                {exportType === 'range' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 
                                  rounded-xl border-2 border-blue-200 dark:border-blue-800">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.bookings.startDate')}
                        </label>
                        <input
                          type="date"
                          value={dateRange.start}
                          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 
                                   border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('admin.bookings.endDate')}
                        </label>
                        <input
                          type="date"
                          value={dateRange.end}
                          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border-2 
                                   border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  {t('admin.bookings.export.format')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('xlsx')}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-xl 
                               transition-all ${
                      exportFormat === 'xlsx'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <HiTable className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">Excel</div>
                      <div className="text-xs opacity-80">.xlsx</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`flex items-center justify-center space-x-2 p-4 rounded-xl 
                               transition-all ${
                      exportFormat === 'csv'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <HiDocumentText className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-semibold">CSV</div>
                      <div className="text-xs opacity-80">.csv</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white 
                         font-semibold rounded-xl transition-all"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || (exportType === 'range' && (!dateRange.start || !dateRange.end))}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 
                         bg-gradient-to-r from-green-500 to-green-600 
                         hover:from-green-600 hover:to-green-700 text-white font-semibold 
                         rounded-xl transition-all shadow-md hover:shadow-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>{t('admin.bookings.export.exporting')}</span>
                  </>
                ) : (
                  <>
                    <HiDownload className="w-5 h-5" />
                    <span>{t('admin.bookings.export.export')}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ExportBookings