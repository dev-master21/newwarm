import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HiX, 
  HiPlay, 
  HiPause, 
  HiVolumeUp, 
  HiVolumeOff,
  HiRewind,
  HiFastForward,
  HiDesktopComputer,
  HiChevronUp
} from 'react-icons/hi'
import { MdFullscreen, MdFullscreenExit, MdPictureInPictureAlt } from 'react-icons/md'

const VideoPlayer = ({ videoUrl, isOpen, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimeoutRef = useRef(null)
  const progressBarRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed
    }
  }, [playbackSpeed])

  useEffect(() => {
    const hideControls = () => {
      if (isPlaying && !showSpeedMenu && !showQualityMenu) {
        setShowControls(false)
      }
    }

    if (showControls && isPlaying) {
      clearTimeout(controlsTimeoutRef.current)
      controlsTimeoutRef.current = setTimeout(hideControls, 3000)
    }

    return () => clearTimeout(controlsTimeoutRef.current)
  }, [showControls, isPlaying, showSpeedMenu, showQualityMenu])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return

      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-10)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          changeVolume(0.1)
          break
        case 'ArrowDown':
          e.preventDefault()
          changeVolume(-0.1)
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 'Escape':
          e.preventDefault()
          if (isFullscreen) {
            toggleFullscreen()
          } else {
            onClose()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isOpen, isPlaying, isFullscreen])

  const handleMouseMove = () => {
    setShowControls(true)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
      if (!isMuted) {
        setVolume(0)
      } else {
        setVolume(1)
        videoRef.current.volume = 1
      }
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const changeVolume = (delta) => {
    const newVolume = Math.max(0, Math.min(1, volume + delta))
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const handleSeek = (e) => {
    const rect = progressBarRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const seekTime = percentage * duration
    
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime
      setCurrentTime(seekTime)
    }
  }

  const skip = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const togglePictureInPicture = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else if (videoRef.current) {
      await videoRef.current.requestPictureInPicture()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl"
      >
        <motion.div
          ref={containerRef}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full h-full flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
        >
          {/* Close button */}
          {!isFullscreen && (
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-3 bg-white/10 hover:bg-white/20 
                       backdrop-blur-sm rounded-full transition-all"
            >
              <HiX className="w-6 h-6 text-white" />
            </motion.button>
          )}

          {/* Video Container */}
          <div className="relative w-full max-w-6xl mx-auto">
            {/* WARM+ Branding Header */}
            {showControls && !isFullscreen && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute -top-16 left-0 right-0 flex items-center justify-between px-4"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-lg 
                                flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">W+</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">WARM+ Luxury Villas</h3>
                    <p className="text-white/60 text-sm">Experience Paradise in Phuket</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Video Element */}
            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl">
              <video
                ref={videoRef}
                className="w-full h-full max-h-[80vh] cursor-pointer"
                src={videoUrl}
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
              />

              {/* Buffering Indicator */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent 
                                rounded-full animate-spin" />
                </div>
              )}

              {/* Play/Pause Overlay - Элегантная кнопка */}
              <AnimatePresence>
                {!isPlaying && !isBuffering && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center"
                    onClick={togglePlay}
                  >
                    {/* Затемнение фона */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
                    
                    {/* Элегантная кнопка Play */}
                    <motion.button
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="relative z-10 group"
                    >
                      {/* Внешнее кольцо с градиентом */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/30 to-red-700/30 
                                    rounded-full blur-xl group-hover:blur-2xl transition-all duration-500" />
                      
                      {/* Основная кнопка */}
                      <div className="relative flex items-center justify-center w-20 h-20 
                                    bg-white/10 backdrop-blur-md rounded-full 
                                    border border-white/20 group-hover:bg-white/15 
                                    transition-all duration-300 shadow-2xl">
                        {/* Иконка Play */}
                        <svg 
                          className="w-8 h-8 text-white ml-1 drop-shadow-lg"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      
                      {/* Пульсирующий эффект */}
                      <div className="absolute inset-0 rounded-full border border-white/20 
                                    animate-ping" style={{ animationDuration: '3s' }} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showControls ? 1 : 0 }}
                className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent"
              >
                {/* Progress Bar */}
                <div className="px-4 py-2">
                  <div 
                    ref={progressBarRef}
                    className="relative h-1 bg-white/20 rounded-full cursor-pointer group"
                    onClick={handleSeek}
                  >
                    <div 
                      className="absolute h-full bg-red-600 rounded-full transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 
                                    bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 
                                    transition-opacity" />
                    </div>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between">
                    {/* Left Controls */}
                    <div className="flex items-center space-x-2">
                      {/* Play/Pause */}
                      <button
                        onClick={togglePlay}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                      >
                        {isPlaying ? (
                          <HiPause className="w-7 h-7 text-white" />
                        ) : (
                          <HiPlay className="w-7 h-7 text-white ml-0.5" />
                        )}
                      </button>

                      {/* Skip Backward */}
                      <button
                        onClick={() => skip(-10)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <HiRewind className="w-6 h-6 text-white" />
                      </button>

                      {/* Skip Forward */}
                      <button
                        onClick={() => skip(10)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <HiFastForward className="w-6 h-6 text-white" />
                      </button>

                      {/* Volume Controls */}
                      <div className="flex items-center space-x-2 group">
                        <button
                          onClick={toggleMute}
                          className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        >
                          {isMuted || volume === 0 ? (
                            <HiVolumeOff className="w-6 h-6 text-white" />
                          ) : (
                            <HiVolumeUp className="w-6 h-6 text-white" />
                          )}
                        </button>
                        <div className="w-0 group-hover:w-24 overflow-hidden transition-all">
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer
                                     [&::-webkit-slider-thumb]:appearance-none 
                                     [&::-webkit-slider-thumb]:w-3 
                                     [&::-webkit-slider-thumb]:h-3 
                                     [&::-webkit-slider-thumb]:bg-white 
                                     [&::-webkit-slider-thumb]:rounded-full
                                     [&::-webkit-slider-thumb]:hover:scale-125"
                          />
                        </div>
                      </div>

                      {/* Time Display */}
                      <span className="text-white text-sm font-medium ml-2">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Right Controls */}
                    <div className="flex items-center space-x-1">
                      {/* Playback Speed */}
                      <div className="relative">
                        <button
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="px-3 py-2 hover:bg-white/20 rounded-lg transition-all text-white text-sm"
                        >
                          {playbackSpeed}x
                        </button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-gray-900 rounded-lg 
                                        overflow-hidden shadow-xl">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                              <button
                                key={speed}
                                onClick={() => {
                                  setPlaybackSpeed(speed)
                                  setShowSpeedMenu(false)
                                }}
                                className={`block w-full px-4 py-2 text-left text-white 
                                         hover:bg-white/20 transition-all text-sm
                                         ${playbackSpeed === speed ? 'bg-red-600' : ''}`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Picture in Picture */}
                      <button
                        onClick={togglePictureInPicture}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                      >
                        <MdPictureInPictureAlt className="w-6 h-6 text-white" />
                      </button>

                      {/* Fullscreen */}
                      <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                      >
                        {isFullscreen ? (
                          <MdFullscreenExit className="w-6 h-6 text-white" />
                        ) : (
                          <MdFullscreen className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* WARM+ Watermark */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-4 left-4 pointer-events-none"
                  >
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                      <span className="text-white/80 text-sm font-semibold">WARM+ VILLAS</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default VideoPlayer