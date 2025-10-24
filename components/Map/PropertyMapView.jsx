// frontend/src/components/Map/PropertyMapView.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiX, HiLocationMarker, HiHome } from 'react-icons/hi'
import { IoBed, IoLanguage } from 'react-icons/io5'
import { FaBath, FaSun, FaMoon } from 'react-icons/fa'
import { BiArea } from 'react-icons/bi'
import { mapService } from '../../services/map.service'
import PropertyMapModal from './PropertyMapModal'
import { useThemeStore } from '../../store/themeStore'
import darkMapTheme from '../../styles/darkMapTheme.json'
import lightMapTheme from '../../styles/lightMapTheme.json'
import toast from 'react-hot-toast'

const PropertyMapView = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useThemeStore()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const imageCache = useRef(new Map())
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [hoveredProperty, setHoveredProperty] = useState(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

  // Language options
  const languages = [
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' }
  ]

  // Change language
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode)
    setShowLanguageMenu(false)
    toast.success(t('common.languageChanged'))
  }

  // Get current language
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  // Get full image URL with thumbnail support
  const getImageUrl = (photoPath, useThumbnail = false) => {
    if (!photoPath) return null
    
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      if (useThumbnail) {
        const ext = photoPath.substring(photoPath.lastIndexOf('.'))
        const pathWithoutExt = photoPath.substring(0, photoPath.lastIndexOf('.'))
        return `${pathWithoutExt}_thumb${ext}`
      }
      return photoPath
    }
    
    const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://warm.novaestate.company'
    
    if (useThumbnail) {
      const ext = photoPath.substring(photoPath.lastIndexOf('.'))
      const pathWithoutExt = photoPath.substring(0, photoPath.lastIndexOf('.'))
      const thumbnailPath = `${pathWithoutExt}_thumb${ext}`
      return `${BASE_URL}${thumbnailPath.startsWith('/') ? '' : '/'}${thumbnailPath}`
    }
    
    return `${BASE_URL}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`
  }

  // Preload images
  const preloadImages = (properties) => {
    console.log('🖼️ Предзагрузка изображений...')
    
    properties.forEach(property => {
      if (property.photos && property.photos.length > 0) {
        property.photos.forEach(photoPath => {
          const thumbnailUrl = getImageUrl(photoPath, true)
          
          if (imageCache.current.has(thumbnailUrl)) {
            return
          }
          
          const img = new Image()
          img.onload = () => {
            imageCache.current.set(thumbnailUrl, true)
            console.log('✅ Thumbnail загружен:', thumbnailUrl)
          }
          img.onerror = () => {
            console.error('❌ Ошибка загрузки thumbnail:', thumbnailUrl)
            imageCache.current.set(thumbnailUrl, false)
          }
          img.src = thumbnailUrl
        })
      }
    })
  }

  // Load Google Maps API
  useEffect(() => {
    if (!isOpen) return

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true)
        return
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error('Google Maps API key not found')
        toast.error(t('map.errors.apiKeyMissing') || 'API key missing')
        setIsMapLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log('Google Maps loaded successfully')
        setIsMapLoaded(true)
      }
      script.onerror = () => {
        console.error('Failed to load Google Maps')
        toast.error(t('map.errors.loadFailed') || 'Failed to load map')
        setIsMapLoaded(true)
      }
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [isOpen, t])

  // Load properties
  useEffect(() => {
    if (!isOpen) return

    const loadProperties = async () => {
      try {
        setIsLoading(true)
        const data = await mapService.getPropertiesForMap()
        console.log('Loaded properties:', data)
        
        if (data && data.length > 0) {
          console.log('First property photos:', data[0].photos)
          preloadImages(data)
        }
        
        setProperties(data)
      } catch (error) {
        console.error('Error loading properties:', error)
        toast.error(t('map.errors.propertiesLoadFailed') || 'Failed to load properties')
      } finally {
        setIsLoading(false)
      }
    }

    loadProperties()
  }, [isOpen, t])

  // Create custom marker
  const createCustomMarker = (map, property, onClickHandler, onHoverHandler, onHoverOutHandler) => {
    if (!window.google || !window.google.maps) return null

    class CustomMarker extends window.google.maps.OverlayView {
      constructor(position, prop) {
        super()
        this.position = position
        this.property = prop
        this.div = null
      }

      onAdd() {
        const div = document.createElement('div')
        div.style.position = 'absolute'
        div.style.cursor = 'pointer'
        div.style.zIndex = '1'
        
        const propertyType = (this.property.property_type || '').toLowerCase()
        let iconType = 'home'
        
        if (propertyType.includes('villa')) iconType = 'villa'
        else if (propertyType.includes('condo')) iconType = 'apartment'
        else if (propertyType.includes('apartment')) iconType = 'apartment'
        else if (propertyType.includes('penthouse')) iconType = 'apartment'
        else if (propertyType.includes('land')) iconType = 'land'
        else if (propertyType.includes('house')) iconType = 'home'
        
        const iconSvgs = {
          home: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 1.5a1 1 0 011.414 0L15 7.793V13.5a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5V10H7v3.5A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5V7.793L7.293 1.5zM2 7.5V13.5a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V9.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v4a.5.5 0 00.5.5h3a.5.5 0 00.5-.5V7.5L8 2 2 7.5z"></path></svg>',
          villa: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M19 10c0-3.866-3.134-7-7-7S5 6.134 5 10v10h14V10zm-5 8h-4v-6h4v6zm2-8.142V18h2v-8.142a4.991 4.991 0 0 0-2 0zM7 10.142V18h2v-7.858c-.694.208-1.35.508-2 .858z"></path></svg>',
          apartment: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 256 256" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M240,208H224V96a16,16,0,0,0-16-16H164a4,4,0,0,0-4,4V208H148V32a16,16,0,0,0-16-16H48A16,16,0,0,0,32,32V208H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16ZM176,96h32V208H176ZM48,32h84V208H120V168a8,8,0,0,0-8-8H80a8,8,0,0,0-8,8v40H48ZM104,208H88V176h16Z"></path></svg>',
          land: '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20,2H4C2.9,2,2,2.9,2,4v16c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M8,8c0-0.55,0.45-1,1-1s1,0.45,1,1 s-0.45,1-1,1S8,8.55,8,8z M12,20H4v-4l3-3l1.5,1.5l3-3L12,12V20z M20,20h-6v-8l1.5-1.5l3,3l1.5-1.5l4,4V20z"></path></svg>'
        }

        div.innerHTML = `
          <div class="property-marker-wrapper">
            <div class="property-marker-pulse"></div>
            <div class="property-marker">
              <div class="property-marker-icon">
                ${iconSvgs[iconType]}
              </div>
            </div>
          </div>
        `

        if (!document.getElementById('property-marker-styles')) {
          const style = document.createElement('style')
          style.id = 'property-marker-styles'
          style.textContent = `
            .property-marker-wrapper {
              position: relative;
              width: 36px;
              height: 36px;
              transform: translate(-50%, -100%);
            }
            
            .property-marker {
              position: absolute;
              top: 0;
              left: 0;
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 3px 8px rgba(220, 38, 38, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.9);
              transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 2;
            }
            
            .property-marker-icon {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
              color: white;
              font-size: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 20px;
              height: 20px;
            }
            
            .property-marker-icon svg {
              width: 100%;
              height: 100%;
              filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
            }
            
            .property-marker-pulse {
              position: absolute;
              top: 0;
              left: 0;
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              opacity: 0;
              animation: marker-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              z-index: 1;
            }
            
            @keyframes marker-pulse {
              0% {
                transform: rotate(-45deg) scale(1);
                opacity: 0.6;
              }
              50% {
                transform: rotate(-45deg) scale(1.3);
                opacity: 0.3;
              }
              100% {
                transform: rotate(-45deg) scale(1.6);
                opacity: 0;
              }
            }
            
            .property-marker-wrapper:hover .property-marker {
              transform: rotate(-45deg) scale(1.15);
              box-shadow: 0 6px 16px rgba(220, 38, 38, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.95);
            }
            
            .property-marker-wrapper:hover .property-marker-pulse {
              animation: marker-pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
          `
          document.head.appendChild(style)
        }

        div.addEventListener('click', () => onClickHandler(this.property))
        div.addEventListener('mouseenter', (e) => onHoverHandler(this.property, e))
        div.addEventListener('mouseleave', () => onHoverOutHandler())
        div.addEventListener('mousemove', (e) => onHoverHandler(this.property, e))

        this.div = div
        const panes = this.getPanes()
        panes.overlayMouseTarget.appendChild(div)
      }

      draw() {
        const overlayProjection = this.getProjection()
        const position = overlayProjection.fromLatLngToDivPixel(
          new window.google.maps.LatLng(this.position.lat, this.position.lng)
        )

        if (this.div) {
          this.div.style.left = position.x + 'px'
          this.div.style.top = position.y + 'px'
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div)
          this.div = null
        }
      }
    }

    const marker = new CustomMarker(property.coordinates, property)
    marker.setMap(map)
    return marker
  }

  // Handle hover
  const handleMarkerHover = (property, event) => {
    setHoveredProperty(property)
    setHoverPosition({ x: event.clientX, y: event.clientY })
  }

  const handleMarkerHoverOut = () => {
    setHoveredProperty(null)
  }

  // Initialize map
  useEffect(() => {
    if (!isOpen || !isMapLoaded || !mapRef.current || !window.google || !window.google.maps || properties.length === 0) return

    const timer = setTimeout(() => {
      if (!mapRef.current || !document.body.contains(mapRef.current)) return

      try {
        const mapStyles = theme === 'dark' ? darkMapTheme : lightMapTheme
        const center = { lat: 7.8804, lng: 98.3923 }

        const map = new window.google.maps.Map(mapRef.current, {
          center: center,
          zoom: 11,
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        })

        mapInstanceRef.current = map

        markersRef.current.forEach(marker => {
          if (marker && marker.setMap) {
            marker.setMap(null)
          }
        })
        markersRef.current = []

        properties.forEach(property => {
          if (!property.coordinates) return

          const marker = createCustomMarker(
            map,
            property,
            (prop) => setSelectedProperty(prop),
            handleMarkerHover,
            handleMarkerHoverOut
          )

          if (marker) {
            markersRef.current.push(marker)
          }
        })

        if (properties.length > 0) {
          const bounds = new window.google.maps.LatLngBounds()
          properties.forEach(property => {
            if (property.coordinates) {
              bounds.extend({
                lat: property.coordinates.lat,
                lng: property.coordinates.lng
              })
            }
          })
          map.fitBounds(bounds)
        }
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }, 100)

    return () => {
      clearTimeout(timer)
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null)
        }
      })
      markersRef.current = []
    }
  }, [isOpen, isMapLoaded, properties, theme])

  // Update map theme
  useEffect(() => {
    if (mapInstanceRef.current && window.google && window.google.maps) {
      const mapStyles = theme === 'dark' ? darkMapTheme : lightMapTheme
      mapInstanceRef.current.setOptions({ styles: mapStyles })
    }
  }, [theme])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-white dark:bg-gray-900"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-0 left-0 right-0 z-10 bg-white/95 dark:bg-gray-900/95 
                   backdrop-blur-md shadow-lg border-b border-gray-200 dark:border-gray-700"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Title & Info */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 
                              rounded-xl flex items-center justify-center shadow-lg">
                  <HiLocationMarker className="w-7 h-7 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {t('map.title') || 'Properties Map'}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isLoading 
                      ? (t('map.loading') || 'Loading...')
                      : `${properties.length} ${t('map.properties') || 'properties'}`
                    }
                  </p>
                </div>
              </div>

              {/* Right side - Controls */}
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 flex items-center justify-center
                           bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                           rounded-xl transition-all transform hover:scale-110 active:scale-95
                           shadow-md hover:shadow-lg"
                  title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <FaSun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <FaMoon className="w-5 h-5 text-gray-700" />
                  )}
                </button>

                {/* Language Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="w-10 h-10 flex items-center justify-center
                             bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                             rounded-xl transition-all transform hover:scale-110 active:scale-95
                             shadow-md hover:shadow-lg"
                    title="Change Language"
                  >
                    <IoLanguage className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>

                  {/* Language Dropdown */}
                  <AnimatePresence>
                    {showLanguageMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 
                                 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
                                 overflow-hidden z-50"
                      >
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => changeLanguage(lang.code)}
                            className={`w-full px-4 py-3 flex items-center gap-3
                                     hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                     ${i18n.language === lang.code ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                          >
                            <span className="text-2xl">{lang.flag}</span>
                            <span className={`text-sm font-medium
                                          ${i18n.language === lang.code 
                                            ? 'text-red-600 dark:text-red-400' 
                                            : 'text-gray-700 dark:text-gray-300'}`}>
                              {lang.name}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="w-10 h-10 flex items-center justify-center
                           bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700
                           rounded-xl transition-all transform hover:scale-110 active:scale-95
                           shadow-md hover:shadow-lg"
                >
                  <HiX className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Mobile Title */}
            <div className="sm:hidden mt-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('map.title') || 'Properties Map'}
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isLoading 
                  ? (t('map.loading') || 'Loading...')
                  : `${properties.length} ${t('map.properties') || 'properties'}`
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Map Container */}
        <div className="w-full h-full pt-20 sm:pt-20">
          <div ref={mapRef} className="w-full h-full" />

          {/* Hover Preview (Desktop only) */}
          <AnimatePresence>
            {hoveredProperty && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="hidden md:block fixed z-30 pointer-events-none"
                style={{
                  left: `${hoverPosition.x}px`,
                  top: `${hoverPosition.y}px`,
                  transform: 'translate(20px, -50%)',
                }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden
                              border-2 border-gray-100 dark:border-gray-700 w-80">
                  {/* Image */}
                  <div className="relative h-36 bg-gray-200 dark:bg-gray-700">
                    {hoveredProperty.photos && hoveredProperty.photos.length > 0 ? (
                      <img
                        src={getImageUrl(hoveredProperty.photos[0], true)}
                        alt={hoveredProperty.name}
                        className="w-full h-full object-cover"
                        loading="eager"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <HiHome className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Price Badge */}
                    {hoveredProperty.price_per_night && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2.5 py-1 
                                    rounded-full text-xs font-bold shadow-lg">
                        ฿{parseInt(hoveredProperty.price_per_night).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2.5 line-clamp-1">
                      {hoveredProperty.name}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                      {hoveredProperty.bedrooms && (
                        <div className="flex items-center gap-1">
                          <IoBed className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium">{parseInt(hoveredProperty.bedrooms)}</span>
                        </div>
                      )}
                      {hoveredProperty.bathrooms && (
                        <div className="flex items-center gap-1">
                          <FaBath className="w-3.5 h-3.5 text-red-600" />
                          <span className="text-xs font-medium">{parseInt(hoveredProperty.bathrooms)}</span>
                        </div>
                      )}
                      {hoveredProperty.indoor_area && (
                        <div className="flex items-center gap-1">
                          <BiArea className="w-4 h-4 text-red-600" />
                          <span className="text-xs font-medium">
                            {parseInt(hoveredProperty.indoor_area)} {t('common.sqm')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center 
                          bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent 
                              rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-900 dark:text-white font-medium">
                  {t('map.loadingProperties') || 'Loading properties...'}
                </p>
              </div>
            </div>
          )}

          {/* No Properties Message */}
          {!isLoading && properties.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <HiHome className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('map.noProperties') || 'No properties found'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('map.noPropertiesDescription') || 'Check back later for new listings'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Property Modal */}
        {selectedProperty && (
          <PropertyMapModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default PropertyMapView