import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiLocationMarker, HiExternalLink } from 'react-icons/hi'

const PropertyMap = ({ property }) => {
  const { t } = useTranslation()
  const mapRef = useRef(null)

  useEffect(() => {
    if (!property.latitude || !property.longitude) return

    // Инициализация карты (если используется Google Maps или Leaflet)
    // Здесь простая реализация с статической картой
  }, [property])

  if (!property.latitude || !property.longitude) {
    return null
  }

  const mapUrl = property.google_maps_link || 
    `https://www.google.com/maps?q=${property.latitude},${property.longitude}`

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${property.latitude},${property.longitude}&zoom=15&size=800x400&markers=color:red%7C${property.latitude},${property.longitude}&key=YOUR_API_KEY`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          <HiLocationMarker className="w-6 h-6 text-red-500" />
          <span>{t('property.location.title')}</span>
        </h3>
        {property.address && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {property.address}, {property.region}
          </p>
        )}
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-200 dark:bg-gray-700">
        <iframe
          src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Open in Maps Button */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        
         <a href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl
                   transition-colors flex items-center justify-center space-x-2"
        >
          <HiExternalLink className="w-5 h-5" />
          <span>{t('property.location.openInMaps')}</span>
        </a>
      </div>
    </div>
  )
}

export default PropertyMap