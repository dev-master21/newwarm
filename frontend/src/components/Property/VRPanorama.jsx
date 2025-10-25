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
  const controlsRef = useRef(null)
  const textureLoaderRef = useRef(null)
  
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)
  const [showLocationMenu, setShowLocationMenu] = useState(false)

  // Инициализация сцены
  useEffect(() => {
    if (!isOpen || !panoramas || panoramas.length === 0) return

    // Выбираем первую локацию по умолчанию
    if (!selectedLocation) {
      setSelectedLocation(panoramas[0])
    }
  }, [isOpen, panoramas, selectedLocation])

  // Инициализация Three.js сцены
  useEffect(() => {
    if (!isOpen || !containerRef.current || !selectedLocation) return

    // Создание сцены
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Создание камеры
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 0.1)
    cameraRef.current = camera

    // Создание рендерера
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Загрузка текстур
    loadPanorama(selectedLocation)

    // Обработка изменения размера окна
    const handleResize = () => {
      if (!containerRef.current) return
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    // Управление мышью/тачем
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    let lon = 0
    let lat = 0
    let phi = 0
    let theta = 0

    const onMouseDown = (event) => {
      isDragging = true
      setIsInteracting(true)
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
    }

    const onMouseUp = () => {
      isDragging = false
      setTimeout(() => setIsInteracting(false), 100)
    }

    // События мыши
    renderer.domElement.addEventListener('mousedown', onMouseDown)
    renderer.domElement.addEventListener('mousemove', onMouseMove)
    renderer.domElement.addEventListener('mouseup', onMouseUp)
    renderer.domElement.addEventListener('mouseleave', onMouseUp)

    // События тач
    renderer.domElement.addEventListener('touchstart', onMouseDown)
    renderer.domElement.addEventListener('touchmove', onMouseMove)
    renderer.domElement.addEventListener('touchend', onMouseUp)

    // Анимационный цикл
    const animate = () => {
      requestAnimationFrame(animate)

      phi = THREE.MathUtils.degToRad(90 - lat)
      theta = THREE.MathUtils.degToRad(lon)

      camera.target = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(theta)
      )

      camera.lookAt(camera.target)
      renderer.render(scene, camera)
    }
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      renderer.domElement.removeEventListener('mousedown', onMouseDown)
      renderer.domElement.removeEventListener('mousemove', onMouseMove)
      renderer.domElement.removeEventListener('mouseup', onMouseUp)
      renderer.domElement.removeEventListener('mouseleave', onMouseUp)
      renderer.domElement.removeEventListener('touchstart', onMouseDown)
      renderer.domElement.removeEventListener('touchmove', onMouseMove)
      renderer.domElement.removeEventListener('touchend', onMouseUp)
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [isOpen, selectedLocation])

  // Загрузка панорамы (6 изображений для cube map)
  const loadPanorama = async (location) => {
    if (!sceneRef.current) return

    setLoading(true)
    setLoadingProgress(0)

    const scene = sceneRef.current

    // Удаляем старую геометрию
    while (scene.children.length > 0) {
      scene.remove(scene.children[0])
    }

    try {
      const textureLoader = new THREE.TextureLoader()
      const loadedTextures = []
      let loadedCount = 0

      // Порядок загрузки: right, left, top, bottom, front, back
      const imageUrls = [
        location.rightImage,
        location.leftImage,
        location.topImage,
        location.bottomImage,
        location.frontImage,
        location.backImage
      ]

      // Загружаем все изображения с прогрессом
      const texturePromises = imageUrls.map((url, index) => {
        return new Promise((resolve, reject) => {
          textureLoader.load(
            getImageUrl(url),
            (texture) => {
              loadedTextures[index] = texture
              loadedCount++
              setLoadingProgress((loadedCount / 6) * 100)
              resolve(texture)
            },
            undefined,
            (error) => {
              console.error(`Error loading texture ${index}:`, error)
              reject(error)
            }
          )
        })
      })

      // Ждём загрузки всех текстур
      await Promise.all(texturePromises)

      // Создаём материалы для каждой стороны куба
      const materials = loadedTextures.map(texture => {
        return new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.BackSide
        })
      })

      // Создаём куб
      const geometry = new THREE.BoxGeometry(500, 500, 500)
      const cube = new THREE.Mesh(geometry, materials)
      scene.add(cube)

      setLoading(false)
    } catch (error) {
      console.error('Error loading panorama:', error)
      setLoading(false)
    }
  }

  // Получение полного URL изображения
  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path
    }
    const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://warm.novaestate.company'
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  }

  // Смена локации
  const handleLocationChange = (location) => {
    setSelectedLocation(location)
    setShowLocationMenu(false)
  }

  // Получение локализованного названия локации
  const getLocationName = (location) => {
    const baseKey = `vr.locations.${location.locationType}`
    const baseName = t(baseKey)
    
    // Если есть номер (например, bedroom_1, bedroom_2)
    if (location.locationNumber) {
      return `${baseName} ${location.locationNumber}`
    }
    
    return baseName
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[9999]"
      >
        {/* Заголовок */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <MdVrpano className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {t('vr.title')}
                </h2>
                {selectedLocation && (
                  <p className="text-sm text-white/80">
                    {getLocationName(selectedLocation)}
                  </p>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <HiX className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Контейнер для панорамы */}
        <div ref={containerRef} className="w-full h-full" />

        {/* Загрузчик */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black z-20"
            >
              <div className="text-center">
                {/* Анимированный круговой прогресс */}
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

        {/* Меню выбора локации (только если больше 1 локации) */}
        {!loading && panoramas && panoramas.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="relative">
              <button
                onClick={() => setShowLocationMenu(!showLocationMenu)}
                className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md
                         hover:bg-white/20 rounded-xl transition-all border border-white/20"
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
                    className="absolute bottom-full mb-2 left-0 right-0 bg-white/10 backdrop-blur-md
                             rounded-xl border border-white/20 overflow-hidden"
                  >
                    {panoramas.map((location, index) => (
                      <button
                        key={index}
                        onClick={() => handleLocationChange(location)}
                        className={`w-full px-6 py-3 text-left hover:bg-white/10 transition-colors
                                  ${selectedLocation === location ? 'bg-white/20' : ''}`}
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

        {/* Подсказка по управлению (появляется при первом открытии) */}
        {!loading && !isInteracting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10
                     pointer-events-none"
          >
            <div className="px-6 py-3 bg-black/60 backdrop-blur-sm rounded-full
                          border border-white/20">
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