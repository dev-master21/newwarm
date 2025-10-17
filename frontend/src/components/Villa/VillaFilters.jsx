import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiX, HiFilter } from 'react-icons/hi'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const VillaFilters = ({ onFilterChange, onClose }) => {
  const { t } = useTranslation()
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
    bedrooms: '',
    bathrooms: '',
    guests: '',
    amenities: [],
    tags: []
  })

  const amenitiesList = [
    'WiFi', 'Pool', 'Air Conditioning', 'Kitchen',
    'Parking', 'Beach Access', 'Garden', 'BBQ',
    'Gym', 'Spa', 'Security', 'Pet Friendly'
  ]

  const tagsList = [
    'Beachfront', 'Sea View', 'Mountain View', 'City Center',
    'Luxury', 'Family Friendly', 'Romantic', 'Party House'
  ]

  const handleApplyFilters = () => {
    const params = {}
    
    if (filters.priceRange[0] > 0) params.minPrice = filters.priceRange[0]
    if (filters.priceRange[1] < 50000) params.maxPrice = filters.priceRange[1]
    if (filters.bedrooms) params.bedrooms = filters.bedrooms
    if (filters.bathrooms) params.bathrooms = filters.bathrooms
    if (filters.guests) params.guests = filters.guests
    if (filters.amenities.length) params.amenities = filters.amenities.join(',')
    if (filters.tags.length) params.tags = filters.tags.join(',')
    
    onFilterChange(params)
  }

  const handleReset = () => {
    setFilters({
      priceRange: [0, 50000],
      bedrooms: '',
      bathrooms: '',
      guests: '',
      amenities: [],
      tags: []
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <HiFilter className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <HiX className="w-5 h-5" />
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Price Range (THB)
        </label>
        <Slider
          range
          min={0}
          max={50000}
          step={1000}
          value={filters.priceRange}
          onChange={(value) => setFilters({ ...filters, priceRange: value })}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>฿{filters.priceRange[0].toLocaleString()}</span>
          <span>฿{filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Bedrooms
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, '6+'].map((num) => (
            <button
              key={num}
              onClick={() => setFilters({ ...filters, bedrooms: num.toString() })}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors
                ${filters.bedrooms === num.toString()
                  ? 'border-primary-600 bg-primary-50 text-primary-600 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Amenities
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {amenitiesList.map((amenity) => (
            <label key={amenity} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFilters({ ...filters, amenities: [...filters.amenities, amenity] })
                  } else {
                    setFilters({ 
                      ...filters, 
                      amenities: filters.amenities.filter(a => a !== amenity) 
                    })
                  }
                }}
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Property Type
        </label>
        <div className="flex flex-wrap gap-2">
          {tagsList.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                if (filters.tags.includes(tag)) {
                  setFilters({ 
                    ...filters, 
                    tags: filters.tags.filter(t => t !== tag) 
                  })
                } else {
                  setFilters({ ...filters, tags: [...filters.tags, tag] })
                }
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${filters.tags.includes(tag)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleReset}
          className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 
                   text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                   dark:hover:bg-gray-700 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleApplyFilters}
          className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg 
                   hover:bg-primary-700 transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  )
}

export default VillaFilters