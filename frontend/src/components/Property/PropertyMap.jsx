import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiLocationMarker, HiExternalLink } from 'react-icons/hi'
import { useThemeStore } from '../../store/themeStore'
import darkMapTheme from '../../styles/darkMapTheme.json'
import lightMapTheme from '../../styles/lightMapTheme.json'

const PropertyMap = ({ property }) => {
  const { t } = useTranslation()
  const { theme } = useThemeStore()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsMapLoaded(true)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('Google Maps API key not found')
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsMapLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Google Maps API')
    }
    document.head.appendChild(script)

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !property.latitude || !property.longitude) return
    if (!window.google || !window.google.maps) return

    try {
      // Выбираем стили карты в зависимости от темы
      const mapStyles = theme === 'dark' ? darkMapTheme : lightMapTheme

      const center = {
        lat: parseFloat(property.latitude),
        lng: parseFloat(property.longitude)
      }

      // Создаем карту
      const map = new window.google.maps.Map(mapRef.current, {
        center: center,
        zoom: 15,
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
      })

      mapInstanceRef.current = map

      // Создаем маркер
      const marker = new window.google.maps.Marker({
        position: center,
        map: map,
        animation: window.google.maps.Animation.DROP,
        title: property.name || t('property.location.propertyLocation')
      })

      markerRef.current = marker

      // Добавляем информационное окно при клике на маркер
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #111;">
              ${property.name || t('property.location.propertyLocation')}
            </h3>
            ${property.address ? `
              <p style="margin: 0; font-size: 12px; color: #666;">
                ${property.address}, ${property.region || ''}
              </p>
            ` : ''}
          </div>
        `
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

    } catch (error) {
      console.error('Error initializing map:', error)
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      mapInstanceRef.current = null
    }
  }, [isMapLoaded, property, theme, t])

  // Update map theme when theme changes
  useEffect(() => {
    if (mapInstanceRef.current && window.google) {
      const mapStyles = theme === 'dark' ? darkMapTheme : lightMapTheme
      mapInstanceRef.current.setOptions({ styles: mapStyles })
    }
  }, [theme])

  if (!property.latitude || !property.longitude) {
    return null
  }

  const mapUrl = property.google_maps_link || 
    `https://www.google.com/maps?q=${property.latitude},${property.longitude}`

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        {property.address && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {property.address}, {property.region}
          </p>
        )}
      </div>

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="relative h-96 bg-gray-200 dark:bg-gray-700"
      >
        {!isMapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-red-600 border-t-transparent 
                            rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('common.loading') || 'Loading map...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Open in Maps Button */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        <a 
          href={mapUrl}
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