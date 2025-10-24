import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiCalendar, HiCurrencyDollar, HiMoon, HiChevronDown, HiChevronUp } from 'react-icons/hi'

const SeasonalPriceTable = ({ seasonalPricing = [] }) => {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  if (!seasonalPricing || seasonalPricing.length === 0) {
    return null
  }

  const displayedPricing = isExpanded ? seasonalPricing : seasonalPricing.slice(0, 4)

  const getSeasonColor = (seasonType) => {
    const colors = {
      low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      mid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      peak: 'bg-[#b92e2d]/10 text-[#b92e2d] dark:bg-[#b92e2d]/20 dark:text-red-400',
      prime: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
    return colors[seasonType] || colors.mid
  }

  const getSeasonName = (seasonType) => {
    return t(`property.seasons.${seasonType}`)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    
    // В базе формат DD-MM (день-месяц), например: 22-12 = 22 декабря
    const [day, month] = dateStr.split('-')
    const monthNum = parseInt(month, 10)
    const dayNum = parseInt(day, 10)
    
    // Получаем локализованное название месяца
    const monthName = t(`months.short.${monthNum}`)
    
    return `${dayNum} ${monthName}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
        <HiCurrencyDollar className="w-5 h-5 text-[#b92e2d]" />
        <span>{t('property.pricing.title')}</span>
      </h3>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('property.pricing.season')}
              </th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('property.pricing.dates')}
              </th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('property.pricing.minStay')}
              </th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                {t('property.pricing.pricePerNight')}
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedPricing.map((period, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
              >
                <td className="py-3 px-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getSeasonColor(period.season_type)}`}>
                    {getSeasonName(period.season_type)}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center space-x-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <HiCalendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="whitespace-nowrap">{formatDate(period.start_date_recurring)} - {formatDate(period.end_date_recurring)}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-center">
                  <div className="inline-flex items-center space-x-1 text-sm text-gray-700 dark:text-gray-300">
                    <HiMoon className="w-3.5 h-3.5 text-gray-400" />
                    <span>{period.minimum_nights || 1}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    ฿{Math.round(parseFloat(period.price_per_night)).toLocaleString()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {displayedPricing.map((period, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 space-y-2"
          >
            {/* Season Type & Price */}
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getSeasonColor(period.season_type)}`}>
                {getSeasonName(period.season_type)}
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ฿{Math.round(parseFloat(period.price_per_night)).toLocaleString()}
              </span>
            </div>

            {/* Dates & Min Stay */}
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-1.5">
                <HiCalendar className="w-3.5 h-3.5" />
                <span>{formatDate(period.start_date_recurring)} - {formatDate(period.end_date_recurring)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <HiMoon className="w-3.5 h-3.5" />
                <span>{t('property.pricing.minimum')} {period.minimum_nights || 1} {t('property.pricing.nights')}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show More Button */}
      {seasonalPricing.length > 4 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 w-full py-2.5 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-600/50
                   text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors
                   flex items-center justify-center space-x-2"
        >
          <span>{isExpanded ? t('property.pricing.showLess') : t('property.pricing.showMore')}</span>
          {isExpanded ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
        </button>
      )}

      {/* Info - Компактная версия */}
      <div className="mt-4 p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{t('property.pricing.note')}:</span>{' '}
          {t('property.pricing.noteText')}
        </p>
      </div>
    </div>
  )
}

export default SeasonalPriceTable