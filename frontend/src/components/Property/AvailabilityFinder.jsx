// frontend/src/components/Property/AvailabilityFinder.jsx
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiCalendar, 
  HiSearch, 
  HiX, 
  HiCheckCircle, 
  HiChevronRight,
  HiExclamationCircle,
  HiInformationCircle,
  HiSparkles,
  HiLightningBolt,
  HiClock,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { propertyService } from '../../services/property.service'
import 'react-datepicker/dist/react-datepicker.css'

const AvailabilityFinder = ({ propertyId, onSelectDates, onOpenCalculator, onShowAlternatives }) => {
  const { t } = useTranslation()
  
  // Режимы поиска
  const [searchMode, setSearchMode] = useState('month') // 'month' или 'period'
  
  // Поля для режима "месяц"
  const [selectedMonth, setSelectedMonth] = useState(null)
  
  // Поля для режима "период"
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  
  // Общие поля
  const [nightsCount, setNightsCount] = useState(3)
  const [searching, setSearching] = useState(false)
  
  // Результаты поиска
  const [availableSlots, setAvailableSlots] = useState([])
  const [periodCheckResult, setPeriodCheckResult] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [resultsLimit, setResultsLimit] = useState(3)
  
  // Спойлер для частичной доступности
  const [showPartialDetails, setShowPartialDetails] = useState(false)

  // Спойлер для "Как это работает"
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // Поиск свободных периодов (режим "месяц")
  const handleSearchByMonth = async () => {
    if (!selectedMonth) {
      toast.error(t('property.availabilityFinder.selectMonth'))
      return
    }

    if (nightsCount < 1) {
      toast.error(t('property.availabilityFinder.minNights'))
      return
    }

    try {
      setSearching(true)
      setShowResults(false)
      setPeriodCheckResult(null)
      setShowPartialDetails(false)

      const month = selectedMonth.getMonth() + 1
      const year = selectedMonth.getFullYear()

      const response = await propertyService.findAvailableSlots(propertyId, {
        searchMode: 'month',
        month,
        year,
        nightsCount,
        limit: 10
      })

      if (response.success) {
        setAvailableSlots(response.data.availableSlots)
        setShowResults(true)
        setResultsLimit(3)

        if (response.data.availableSlots.length === 0) {
          // Показываем альтернативные объекты через колбэк
          const monthStart = new Date(year, month - 1, 1)
          const monthEnd = new Date(year, month, 0)
          
          if (onShowAlternatives) {
            onShowAlternatives({
              startDate: monthStart.toISOString().split('T')[0],
              endDate: monthEnd.toISOString().split('T')[0],
              nightsCount
            })
          }
        } else {
          toast.success(t('property.availabilityFinder.foundSlots', { count: response.data.availableSlots.length }))
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(t('property.availabilityFinder.searchError'))
    } finally {
      setSearching(false)
    }
  }

  // Поиск в конкретном периоде (режим "период")
  const handleSearchByPeriod = async () => {
    if (!startDate || !endDate) {
      toast.error(t('property.availabilityFinder.selectPeriod'))
      return
    }

    if (endDate <= startDate) {
      toast.error(t('property.availabilityFinder.invalidPeriod'))
      return
    }

    if (nightsCount < 1) {
      toast.error(t('property.availabilityFinder.minNights'))
      return
    }

    try {
      setSearching(true)
      setShowResults(false)
      setAvailableSlots([])
      setPeriodCheckResult(null)
      setShowPartialDetails(false)

      const startDateStr = startDate.toISOString().split('T')[0]
      const endDateStr = endDate.toISOString().split('T')[0]

      // Сначала проверяем доступность периода
      const checkResponse = await propertyService.checkPeriodAvailability(propertyId, {
        startDate: startDateStr,
        endDate: endDateStr,
        nightsCount
      })

      if (checkResponse.success) {
        setPeriodCheckResult(checkResponse.data)
        setShowResults(true)

        if (checkResponse.data.isFullyAvailable) {
          toast.success(t('property.availabilityFinder.periodFullyAvailable'))
        } else {
          // Показываем альтернативные объекты через колбэк
          if (onShowAlternatives) {
            onShowAlternatives({
              startDate: startDateStr,
              endDate: endDateStr,
              nightsCount
            })
          }
        }

        // Если период не полностью свободен, ищем свободные периоды внутри диапазона
        if (!checkResponse.data.isFullyAvailable) {
          const slotsResponse = await propertyService.findAvailableSlots(propertyId, {
            searchMode: 'period',
            startDate: startDateStr,
            endDate: endDateStr,
            nightsCount,
            limit: 10
          })

          if (slotsResponse.success) {
            setAvailableSlots(slotsResponse.data.availableSlots)
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(t('property.availabilityFinder.searchError'))
    } finally {
      setSearching(false)
    }
  }

  // Обработчик поиска в зависимости от режима
  const handleSearch = () => {
    if (searchMode === 'month') {
      handleSearchByMonth()
    } else {
      handleSearchByPeriod()
    }
  }

  // Выбор периода - открываем калькулятор с датами
  const handleSelectSlot = (slot) => {
    console.log('🎯 Выбран слот:', slot)
    
    if (onOpenCalculator) {
      // Передаем даты в калькулятор
      console.log('📅 Открываем калькулятор с датами:', slot.checkIn, slot.checkOut)
      onOpenCalculator(slot.checkIn, slot.checkOut)
    } else if (onSelectDates) {
      console.log('📅 Используем onSelectDates')
      onSelectDates({
        checkIn: slot.checkIn,
        checkOut: slot.checkOut
      })
    }
    toast.success(t('property.availabilityFinder.datesSelected'))
  }

  // Сброс
  const handleReset = () => {
    setSelectedMonth(null)
    setStartDate(null)
    setEndDate(null)
    setNightsCount(3)
    setAvailableSlots([])
    setPeriodCheckResult(null)
    setShowResults(false)
    setResultsLimit(3)
    setShowPartialDetails(false)
  }

  // Форматирование даты
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  // Форматирование цены
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <HiSearch className="w-6 h-6 text-blue-500" />
            <span>{t('property.availabilityFinder.title')}</span>
          </h3>
        </div>
        {showResults && (
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Переключатель режима поиска */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('property.availabilityFinder.searchMode')}
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setSearchMode('month')
              setStartDate(null)
              setEndDate(null)
              setShowResults(false)
            }}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              searchMode === 'month'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                searchMode === 'month'
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {searchMode === 'month' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                )}
              </div>
              <div className="text-left">
                <div className={`font-semibold ${
                  searchMode === 'month'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t('property.availabilityFinder.byMonth')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('property.availabilityFinder.byMonthDesc')}
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setSearchMode('period')
              setSelectedMonth(null)
              setShowResults(false)
            }}
            className={`relative p-4 rounded-xl border-2 transition-all ${
              searchMode === 'period'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                searchMode === 'period'
                  ? 'border-blue-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {searchMode === 'period' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                )}
              </div>
              <div className="text-left">
                <div className={`font-semibold ${
                  searchMode === 'period'
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {t('property.availabilityFinder.byPeriod')}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t('property.availabilityFinder.byPeriodDesc')}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Форма поиска */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {searchMode === 'month' ? (
            <motion.div
              key="month-mode"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Выбор месяца */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <HiCalendar className="inline w-4 h-4 mr-1" />
                  {t('property.availabilityFinder.selectMonth')}
                </label>
                <DatePicker
                  selected={selectedMonth}
                  onChange={setSelectedMonth}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  minDate={new Date()}
                  placeholderText={t('property.availabilityFinder.monthPlaceholder')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="period-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Выбор периода */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('property.availabilityFinder.startDate')}
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={setStartDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()}
                    placeholderText={t('property.availabilityFinder.startDatePlaceholder')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('property.availabilityFinder.endDate')}
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={setEndDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || new Date()}
                    placeholderText={t('property.availabilityFinder.endDatePlaceholder')}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                             rounded-xl focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Количество ночей */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <HiClock className="inline w-4 h-4 mr-1" />
            {t('property.availabilityFinder.nightsCount')}
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setNightsCount(Math.max(1, nightsCount - 1))}
              className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       rounded-xl flex items-center justify-center transition-all hover:scale-105"
            >
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">−</span>
            </button>
            
            <div className="flex-1 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 
                          border-2 border-blue-200 dark:border-blue-800 rounded-xl py-3">
              <div className="text-4xl font-bold text-gray-900 dark:text-white">{nightsCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('property.availabilityFinder.nights')}
              </div>
            </div>
            
            <button
              onClick={() => setNightsCount(nightsCount + 1)}
              className="w-12 h-12 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 
                       rounded-xl flex items-center justify-center transition-all hover:scale-105"
            >
              <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">+</span>
            </button>
          </div>
        </div>

        {/* Кнопка поиска */}
        <button
          onClick={handleSearch}
          disabled={searching || (searchMode === 'month' && !selectedMonth) || (searchMode === 'period' && (!startDate || !endDate))}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                   disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                   text-white font-semibold py-4 px-6 rounded-xl transition-all
                   flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl 
                   transform hover:-translate-y-0.5 disabled:transform-none"
        >
          {searching ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('property.availabilityFinder.searching')}</span>
            </>
          ) : (
            <>
              <HiSparkles className="w-5 h-5" />
              <span>{t('property.availabilityFinder.findDates')}</span>
            </>
          )}
        </button>
      </div>

      {/* Сообщение об отсутствии свободных дат */}
      <AnimatePresence>
        {showResults && availableSlots.length === 0 && !periodCheckResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 
                     border-2 border-orange-300 dark:border-orange-700 rounded-xl p-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 to-red-400/10 animate-pulse" />
            <div className="relative flex items-start space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <HiExclamationCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold text-orange-900 dark:text-orange-100 mb-2">
                  {t('property.availabilityFinder.noSlotsFoundTitle')}
                </h4>
                <p className="text-orange-800 dark:text-orange-200 mb-3">
                  {t('property.availabilityFinder.noSlotsFoundDesc')}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                  {t('property.availabilityFinder.checkAlternatives')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Результаты для режима "период" */}
      <AnimatePresence>
        {showResults && periodCheckResult && searchMode === 'period' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Статус периода */}
            {periodCheckResult.isFullyAvailable ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 
                         border-2 border-green-300 dark:border-green-700 rounded-xl p-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 animate-pulse" />
                <div className="relative flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <HiCheckCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                      {t('property.availabilityFinder.fullyAvailable')}
                    </h4>
                    <p className="text-green-800 dark:text-green-200 mb-3">
                      {t('property.availabilityFinder.fullyAvailableDesc', { 
                        days: periodCheckResult.totalDays 
                      })}
                    </p>
                    <button
                      onClick={() => handleSelectSlot({
                        checkIn: startDate.toISOString().split('T')[0],
                        checkOut: endDate.toISOString().split('T')[0]
                      })}
                      className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg 
                               transition-all flex items-center space-x-2 shadow-md hover:shadow-lg"
                    >
                      <HiLightningBolt className="w-5 h-5" />
                      <span>{t('property.availabilityFinder.bookThisPeriod')}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="relative bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 
                         border-2 border-red-300 dark:border-red-700 rounded-xl p-6 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 to-orange-400/10 animate-pulse" />
                <div className="relative flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <HiExclamationCircle className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-red-900 dark:text-red-100 mb-2">
                      {periodCheckResult.isPartiallyAvailable 
                        ? t('property.availabilityFinder.partiallyAvailable')
                        : t('property.availabilityFinder.notAvailable')
                      }
                    </h4>
                    <p className="text-red-800 dark:text-red-200 mb-3">
                      {t('property.availabilityFinder.availabilityStatus', {
                        free: periodCheckResult.freeDays,
                        total: periodCheckResult.totalDays,
                        occupied: periodCheckResult.occupiedDays
                      })}
                    </p>
                    
                    {/* Кнопка спойлера */}
                    {(periodCheckResult.occupiedDates?.length > 0 || periodCheckResult.nearestSlots?.length > 0) && (
                      <button
                        onClick={() => setShowPartialDetails(!showPartialDetails)}
                        className="flex items-center space-x-2 text-red-700 dark:text-red-300 font-medium 
                                 hover:text-red-900 dark:hover:text-red-100 transition-colors mb-3"
                      >
                        <span>{showPartialDetails ? t('property.availabilityFinder.hideDetails') : t('property.availabilityFinder.showDetails')}</span>
                        {showPartialDetails ? (
                          <HiChevronUp className="w-5 h-5" />
                        ) : (
                          <HiChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    )}

                    {/* Детали (спойлер) */}
                    <AnimatePresence>
                      {showPartialDetails && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          {/* Занятые даты */}
                          {periodCheckResult.occupiedDates && periodCheckResult.occupiedDates.length > 0 && (
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3">
                              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                                {t('property.availabilityFinder.occupiedDates')}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {periodCheckResult.occupiedDates.slice(0, 5).map((date, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 
                                             px-2 py-1 rounded"
                                  >
                                    {formatDate(date)}
                                  </span>
                                ))}
                                {periodCheckResult.occupiedDates.length > 5 && (
                                  <span className="text-xs text-red-600 dark:text-red-400 px-2 py-1">
                                    +{periodCheckResult.occupiedDates.length - 5} {t('property.availabilityFinder.moreDates')}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Ближайшие свободные даты */}
                          {periodCheckResult.nearestSlots && periodCheckResult.nearestSlots.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {t('property.availabilityFinder.nearestAvailable')}:
                              </p>
                              {periodCheckResult.nearestSlots.map((slot, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSelectSlot(slot)}
                                  className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
                                           border border-gray-200 dark:border-gray-600 rounded-lg p-3 
                                           flex items-center justify-between transition-all group"
                                >
                                  <div className="text-left">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {formatDate(slot.checkIn)} - {formatDate(slot.checkOut)}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {slot.nights} {t('property.availabilityFinder.nights')}
                                    </div>
                                  </div>
                                  <HiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 
                                                           transition-all group-hover:translate-x-1" />
                                </button>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Результаты - список доступных периодов */}
      <AnimatePresence>
        {showResults && availableSlots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <HiCheckCircle className="w-5 h-5 text-green-500" />
                <span>{t('property.availabilityFinder.availableSlots')} ({availableSlots.length})</span>
              </h4>
            </div>

            {availableSlots.slice(0, resultsLimit).map((slot, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelectSlot(slot)}
                className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20
                         border-2 border-green-200 dark:border-green-800 rounded-xl
                         hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg
                         transition-all flex items-center justify-between group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/0 to-emerald-400/0 
                              group-hover:from-green-400/10 group-hover:to-emerald-400/10 transition-all" />
                
                <div className="relative flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl 
                                flex items-center justify-center flex-shrink-0 shadow-md">
                    <HiCheckCircle className="w-7 h-7 text-white" />
                  </div>
                  
                  <div className="text-left flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {formatDate(slot.checkIn)} - {formatDate(slot.checkOut)}
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <HiClock className="w-4 h-4" />
                        <span>{slot.nights} {t('property.availabilityFinder.nights')}</span>
                      </span>
                      {slot.totalPrice && (
                        <span className="flex items-center space-x-1 font-medium text-green-600 dark:text-green-400">
                          <span>฿{formatPrice(slot.totalPrice)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <HiChevronRight className="relative w-6 h-6 text-green-500 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            ))}

            {/* Кнопка "Показать еще" */}
            {availableSlots.length > resultsLimit && (
              <button
                onClick={() => setResultsLimit(Math.min(resultsLimit + 3, 10))}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600
                         text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                {t('property.availabilityFinder.showMore')} ({Math.min(availableSlots.length - resultsLimit, 3)})
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AvailabilityFinder