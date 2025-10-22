// frontend/src/components/admin/GoogleMapPicker.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiXCircle, HiLocationMarker } from 'react-icons/hi'

const GoogleMapPicker = ({ coordinates, onConfirm, theme }) => {
  const { t } = useTranslation()
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [marker, setMarker] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentCoords, setCurrentCoords] = useState(coordinates)

  // Load Google Maps API
  useEffect(() => {
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error('Google Maps API key not found')
      setIsLoaded(true) // Set to true to show fallback
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Google Maps API')
      setIsLoaded(true) // Set to true to show fallback
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
    if (!isLoaded || !mapRef.current || !coordinates || !window.google) return

    try {
      // Map styles based on theme
      const mapStyles = theme === 'dark' ? [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ] : []

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: coordinates.lat, lng: coordinates.lng },
        zoom: 16,
        styles: mapStyles,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true
      })

      const markerInstance = new window.google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lng },
        map: mapInstance,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
        title: t('admin.addProperty.step3.dragMarker')
      })

      // Handle marker drag
      markerInstance.addListener('dragend', (event) => {
        const newPos = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        }
        setCurrentCoords(newPos)
      })

      setMap(mapInstance)
      setMarker(markerInstance)

      return () => {
        if (markerInstance) {
          markerInstance.setMap(null)
        }
      }
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }, [isLoaded, coordinates, theme, t])

  if (!coordinates) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Map Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <HiLocationMarker className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {t('admin.addProperty.step3.verifyLocation')}
            </h3>
            <p className="text-sm text-white/80">
              {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700">
        <div
          ref={mapRef}
          className="w-full h-96"
          style={{ minHeight: '400px' }}
        />
        {(!isLoaded || !window.google) && (
          <div className="absolute inset-0 flex items-center justify-center 
                        bg-gray-100 dark:bg-gray-800">
            <div className="text-center p-6">
              <HiLocationMarker className="w-16 h-16 mx-auto text-[#DC2626] mb-4 animate-pulse" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {t('admin.addProperty.step3.mapPreview')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {t('admin.addProperty.step3.coordinates')}: {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start space-x-2">
          <HiLocationMarker className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{t('admin.addProperty.step3.dragMarkerHint')}</span>
        </p>
      </div>

      {/* Confirmation Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
        <p className="text-gray-900 dark:text-white font-medium mb-4">
          {t('admin.addProperty.step3.confirmLocationQuestion')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onConfirm(currentCoords, true)}
            className="flex-1 flex items-center justify-center space-x-2 
                     px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500
                     hover:from-green-600 hover:to-emerald-600
                     text-white font-medium rounded-lg transition-all
                     transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <HiCheckCircle className="w-5 h-5" />
            <span>{t('admin.addProperty.step3.locationCorrect')}</span>
          </button>
          <button
            onClick={() => onConfirm(null, false)}
            className="flex-1 flex items-center justify-center space-x-2 
                     px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500
                     hover:from-red-600 hover:to-pink-600
                     text-white font-medium rounded-lg transition-all
                     transform hover:scale-105 active:scale-95 shadow-lg"
          >
            <HiXCircle className="w-5 h-5" />
            <span>{t('admin.addProperty.step3.locationIncorrect')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default GoogleMapPicker