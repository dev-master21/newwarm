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
  
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)

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
    // ИСПРАВЛЕНИЕ ТУСКЛОСТИ: правильное цветовое пространство
    renderer.outputColorSpace = THREE.SRGBColorSpace
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

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

    const onMouseUp = () => {
      isDragging = false
      setTimeout(() => setIsInteracting(false), 100)
      lastInteractionRef.current = Date.now()
    }

    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mouseleave', onMouseUp)
    renderer.domElement.addEventListener('touchstart', onMouseDown)
    renderer.domElement.addEventListener('touchmove', onMouseMove)
    renderer.domElement.addEventListener('touchend', onMouseUp)

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
      window.removeEventListener('resize', handleResize)
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
              object.material.forEach(material => {
                material.dispose()
              })
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
            // ИСПРАВЛЕНИЕ ТУСКЛОСТИ: правильное цветовое пространство
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
    autoRotateRef.current = false
    autoRotateSpeedRef.current = 0
    lastInteractionRef.current = Date.now()
  }

  useEffect(() => {
    return () => {
      if (!isOpen) {
        console.log('🧹 Cleaning up texture cache')
        textureCache.current.forEach((textures) => {
          textures.forEach(texture => {
            if (texture) texture.dispose()
          })
        })
        textureCache.current.clear()
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black"
      >
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <MdVrpano className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t('vr.title')}
                </h2>
                {selectedLocation && (
                  <p className="text-sm text-white/70">
                    {getLocationName(selectedLocation)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full
                       flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <HiX className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        <div ref={containerRef} className="w-full h-full" />

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-20"
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
                      stroke="#ba2e2d"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: loadingProgress / 100 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        strokeDasharray: '351.68',
                        strokeDashoffset: `${351.68 * (1 - loadingProgress / 100)}`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MdVrpano className="w-12 h-12 text-white animate-pulse" />
                  </div>
                </div>
                
                <p className="text-2xl font-bold text-white mb-2">
                  {Math.round(loadingProgress)}%
                </p>
                <p className="text-white/60">
                  {t('vr.loading')}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && panoramas && panoramas.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center space-x-3 px-6 py-3 
                         bg-gray-900 hover:bg-gray-800 rounded-xl transition-all 
                         border-2 border-white/30 shadow-2xl"
              >
                <HiLocationMarker className="w-5 h-5 text-white" />
                <span className="text-white font-medium">
                  {selectedLocation && getLocationName(selectedLocation)}
                </span>
                <HiChevronDown 
                  className={`w-5 h-5 text-white transition-transform ${
                    showLocationMenu ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              <AnimatePresence>
                {showLocationMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full mb-2 left-0 right-0 
                             bg-gray-900 rounded-xl border-2 border-white/30 
                             overflow-hidden shadow-2xl"
                  >
                    {panoramas.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationChange(location)}
                        className={`w-full px-6 py-3 text-left hover:bg-gray-800 transition-colors
                                  ${selectedLocation === location ? 'bg-gray-800' : ''}`}
                      >
                        <span className="text-white font-medium">
                          {getLocationName(location)}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Подсказка - скрывается когда открыто меню локаций */}
        {!loading && !isInteracting && !showLocationMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
          >
            <div className="px-6 py-3 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
              <p className="text-white/80 text-sm">
                {t('vr.hint')}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default VRPanorama