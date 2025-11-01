// frontend/src/components/Property/VRPanorama.jsx
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { HiX, HiLocationMarker, HiChevronDown } from 'react-icons/hi'
import { MdVrpano } from 'react-icons/md'

const VRPanorama = ({ panoramas, isOpen, onClose }) => {
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const animationRef = useRef(null)
  const lastInteractionRef = useRef(Date.now())
  const autoRotateRef = useRef(false)
  const autoRotateSpeedRef = useRef(0)
  const textureCache = useRef(new Map())
  const isPreloadingRef = useRef(false)
  const fovAnimationRef = useRef(null)
  
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)

  // Блокировка скролла при открытии VR
  useEffect(() => {
    if (isOpen) {
      // Блокируем скролл body
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.height = '100%'
      
      return () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !panoramas || panoramas.length === 0) return

    if (!selectedLocation) {
      setSelectedLocation(panoramas[0])
    }
  }, [isOpen, panoramas, selectedLocation])

  const getImageUrl = (path) => {
    if (!path) {
      console.error('Image path is null or undefined')
      return null
    }
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://warm.novaestate.company'
    const fullUrl = `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
    return fullUrl
  }

  const getLocationName = (panorama) => {
    const locationTypes = {
      'living-room': t('vr.locations.living_room'),
      'living_room': t('vr.locations.living_room'),
      'bedroom': t('vr.locations.bedroom'),
      'bathroom': t('vr.locations.bathroom'),
      'kitchen': t('vr.locations.kitchen'),
      'terrace': t('vr.locations.terrace'),
      'pool': t('vr.locations.pool'),
      'garden': t('vr.locations.garden'),
      'entrance': t('vr.locations.entrance'),
    }

    const baseName = locationTypes[panorama.location_type] || panorama.location_type
    
    if (panorama.location_number) {
      return `${baseName} ${panorama.location_number}`
    }
    
    return baseName
  }

  const getLocationKey = (location) => {
    return `${location.id || location.location_type}_${location.location_number || 0}`
  }

  // Анимация FOV (zoom in эффект)
  const animateFOV = (camera) => {
    const startFOV = 120 // Начальный широкий угол
    const endFOV = 75 // Конечный нормальный угол
    const duration = 1500 // 1.5 секунды
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing функция для плавности
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)
      
      const currentFOV = startFOV - (startFOV - endFOV) * easedProgress
      camera.fov = currentFOV
      camera.updateProjectionMatrix()
      
      if (progress < 1) {
        fovAnimationRef.current = requestAnimationFrame(animate)
      }
    }
    
    animate()
  }

  useEffect(() => {
    if (!isOpen || !containerRef.current || !selectedLocation) return

    console.log('🎬 Initializing VR scene for location:', selectedLocation)

    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 0.01)
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Блокируем события touch на canvas для предотвращения скролла
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false })
    renderer.domElement.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false })

    loadPanorama(selectedLocation)

    const handleResize = () => {
      if (!containerRef.current) return
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let lon = 0
    let lat = 0

    const onMouseDown = (event) => {
      event.preventDefault()
      isDragging = true
      setIsInteracting(true)
      autoRotateRef.current = false
      autoRotateSpeedRef.current = 0
      lastInteractionRef.current = Date.now()
      previousMousePosition = {
        x: event.clientX || event.touches?.[0]?.clientX,
        y: event.clientY || event.touches?.[0]?.clientY
      }
    }

    const onMouseMove = (event) => {
      if (!isDragging) return
      event.preventDefault()

      const currentX = event.clientX || event.touches?.[0]?.clientX
      const currentY = event.clientY || event.touches?.[0]?.clientY

      const deltaX = currentX - previousMousePosition.x
      const deltaY = currentY - previousMousePosition.y

      lon -= deltaX * 0.1
      lat += deltaY * 0.1
      lat = Math.max(-85, Math.min(85, lat))

      previousMousePosition = { x: currentX, y: currentY }
      lastInteractionRef.current = Date.now()
    }

    const onMouseUp = (event) => {
      event.preventDefault()
      isDragging = false
      setTimeout(() => setIsInteracting(false), 100)
      lastInteractionRef.current = Date.now()
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown, { passive: false })
    renderer.domElement.addEventListener('mousemove', onMouseMove, { passive: false })
    renderer.domElement.addEventListener('mouseup', onMouseUp, { passive: false })
    renderer.domElement.addEventListener('mouseleave', onMouseUp, { passive: false })
    renderer.domElement.addEventListener('touchstart', onMouseDown, { passive: false })
    renderer.domElement.addEventListener('touchmove', onMouseMove, { passive: false })
    renderer.domElement.addEventListener('touchend', onMouseUp, { passive: false })

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate)

      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current
      if (timeSinceLastInteraction > 2000 && !isDragging) {
        autoRotateRef.current = true
      }

      if (autoRotateRef.current) {
        const targetSpeed = 0.05
        const accelerationRate = 0.001
        
        if (autoRotateSpeedRef.current < targetSpeed) {
          autoRotateSpeedRef.current += accelerationRate
        }
        
        lon += autoRotateSpeedRef.current
      } else {
        autoRotateSpeedRef.current *= 0.95
      }

      const phi = THREE.MathUtils.degToRad(90 - lat)
      const theta = THREE.MathUtils.degToRad(lon)

      const target = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      )

      camera.lookAt(target)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (fovAnimationRef.current) {
        cancelAnimationFrame(fovAnimationRef.current)
      }
      window.removeEventListener('resize', handleResize)
      
      // Удаляем все event listeners
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('mouseleave', onMouseUp)
      renderer.domElement.removeEventListener('touchstart', onMouseDown)
      renderer.domElement.removeEventListener('touchmove', onMouseMove)
      renderer.domElement.removeEventListener('touchend', onMouseUp)
      
      if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement)
      }
      
      renderer.dispose()
      if (sceneRef.current) {
        while (sceneRef.current.children.length > 0) {
          const object = sceneRef.current.children[0]
          if (object.geometry) object.geometry.dispose()
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
          sceneRef.current.remove(object)
        }
      }
    }
  }, [isOpen, selectedLocation])

  const loadLocationTextures = async (location, showProgress = true) => {
    const locationKey = getLocationKey(location)
    
    if (textureCache.current.has(locationKey)) {
      console.log(`✅ Using cached textures for ${locationKey}`)
      return textureCache.current.get(locationKey)
    }

    console.log(`📥 Loading textures for ${locationKey}`)

    const textureLoader = new THREE.TextureLoader()
    const loadedTextures = []
    let loadedCount = 0

    const imageUrls = [
      location.left_image,
      location.right_image,
      location.top_image,
      location.bottom_image,
      location.front_image,
      location.back_image
    ]

    const texturePromises = imageUrls.map((url, index) => {
      return new Promise((resolve, reject) => {
        const fullUrl = getImageUrl(url)
        
        if (!fullUrl) {
          console.error(`❌ Missing image URL for texture ${index}`)
          reject(new Error(`Missing image URL for texture ${index}`))
          return
        }

        textureLoader.load(
          fullUrl,
          (texture) => {
            console.log(`✅ Loaded texture ${index} for ${locationKey}`)
            
            texture.wrapS = THREE.RepeatWrapping
            texture.repeat.x = -1
            texture.colorSpace = THREE.SRGBColorSpace
            
            loadedTextures[index] = texture
            loadedCount++
            
            if (showProgress) {
              setLoadingProgress((loadedCount / 6) * 100)
            }
            
            resolve(texture)
          },
          undefined,
          (error) => {
            console.error(`❌ Error loading texture ${index}:`, error)
            reject(error)
          }
        )
      })
    })

    const textures = await Promise.all(texturePromises)
    
    textureCache.current.set(locationKey, textures)
    console.log(`💾 Cached textures for ${locationKey}`)
    
    return textures
  }

  const preloadOtherLocations = async () => {
    if (isPreloadingRef.current || !panoramas || panoramas.length <= 1) return
    
    isPreloadingRef.current = true
    console.log('🔄 Starting background preload of other locations...')
    
    for (const location of panoramas) {
      const locationKey = getLocationKey(location)
      
      if (textureCache.current.has(locationKey)) {
        continue
      }
      
      try {
        await loadLocationTextures(location, false)
        console.log(`✅ Preloaded ${locationKey}`)
      } catch (error) {
        console.error(`❌ Failed to preload ${locationKey}:`, error)
      }
    }
    
    console.log('🎉 All locations preloaded!')
    isPreloadingRef.current = false
  }

  const loadPanorama = async (location) => {
    if (!sceneRef.current) return

    console.log('📥 Loading panorama for location:', location)

    setLoading(true)
    setLoadingProgress(0)
    lastInteractionRef.current = Date.now()
    autoRotateSpeedRef.current = 0

    const scene = sceneRef.current

    while (scene.children.length > 0) {
      const object = scene.children[0]
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
      scene.remove(object)
    }

    try {
      const textures = await loadLocationTextures(location, true)

      console.log('✅ All textures ready')

      const materials = textures.map(texture => {
        return new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide
        })
      })

      const geometry = new THREE.BoxGeometry(500, 500, 500)
      const cube = new THREE.Mesh(geometry, materials)
      
      scene.add(cube)

      console.log('🎉 VR panorama loaded successfully')
      setLoading(false)
      
      // Запускаем анимацию FOV после загрузки
      if (cameraRef.current) {
        animateFOV(cameraRef.current)
      }
      
      setTimeout(() => {
        preloadOtherLocations()
      }, 1000)
      
    } catch (error) {
      console.error('❌ Error loading panorama:', error)
      setLoading(false)
    }
  }

  const handleLocationChange = (location) => {
    console.log('🔄 Switching to location:', location)
    setSelectedLocation(location)
    setShowLocationMenu(false)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
        style={{ touchAction: 'none' }}
      >
        {/* Header - ВСЕГДА видна (и при загрузке тоже) */}
        <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* Location selector */}
            {panoramas && panoramas.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setShowLocationMenu(!showLocationMenu)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm 
                           hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
                >
                  <HiLocationMarker className="w-5 h-5" />
                  <span>{selectedLocation ? getLocationName(selectedLocation) : t('vr.selectLocation')}</span>
                  <HiChevronDown className={`w-4 h-4 transition-transform ${showLocationMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showLocationMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full mt-2 left-0 min-w-[200px] bg-white dark:bg-gray-800 
                               rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {panoramas.map((panorama) => (
                        <button
                          key={getLocationKey(panorama)}
                          onClick={() => handleLocationChange(panorama)}
                          className={`w-full px-4 py-3 text-left transition-colors ${
                            selectedLocation && getLocationKey(selectedLocation) === getLocationKey(panorama)
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {getLocationName(panorama)}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Close button - ВСЕГДА видна */}
            <button
              onClick={onClose}
              className="p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full 
                       transition-colors ml-auto"
              aria-label={t('vr.close')}
            >
              <HiX className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div ref={containerRef} className="w-full h-full" />

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-20 pointer-events-none"
            >
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="#abaeb3ff"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: loadingProgress / 100 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        strokeDasharray: '351.68',
                        strokeDashoffset: '0'
                      }}
                    />
                  </svg>
                </div>
                <p className="text-white text-lg font-medium mb-2">
                  {t('vr.loading')}
                </p>
                <p className="text-gray-300 text-sm">
                  {Math.round(loadingProgress)}%
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default VRPanorama