import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiSearch, HiPlay, HiMap } from 'react-icons/hi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import VideoPlayer from '../common/VideoPlayer'
import PropertyMapView from '../Map/PropertyMapView'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const HeroSection = ({ onSearchClick }) => {
  const { t } = useTranslation()
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1920',
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
    },
    {
      image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1920',
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
    },
    {
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920',
      title: t('hero.title'),
      subtitle: t('hero.subtitle'),
    },
  ]

  return (
    <>
      <section className="relative w-full h-screen">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          loop
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
                
                <div className="relative h-full flex items-center justify-center">
                  <div className="container mx-auto px-4 max-w-7xl">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-center text-white max-w-4xl mx-auto"
                    >
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-5xl md:text-7xl font-bold mb-4 leading-tight"
                      >
                        {slide.title}
                      </motion.h1>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        className="text-xl md:text-2xl mb-8 opacity-90"
                      >
                        {slide.subtitle}
                      </motion.p>
                      
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 }}
                        className="flex flex-col items-center gap-6"
                      >
                        {/* Main Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                          {/* Search Button */}
                          <div className="hover-scale-container">
                            <motion.button
                              onClick={onSearchClick}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="relative inline-flex items-center space-x-3 px-8 py-4 
                                       bg-gradient-to-r from-red-600 to-pink-600
                                       hover:from-red-700 hover:to-pink-700 text-white text-lg 
                                       font-semibold rounded-full shadow-2xl hover:shadow-red-500/50
                                       transition-all duration-300 overflow-hidden"
                            >
                              {/* Animated Background Effect */}
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-pink-600 to-red-600"
                                initial={{ x: '-100%' }}
                                whileHover={{ x: '100%' }}
                                transition={{ duration: 0.6 }}
                              />
                              
                              <HiSearch className="w-6 h-6 flex-shrink-0 relative z-10" />
                              <span className="relative z-10">{t('hero.searchButton')}</span>
                            </motion.button>
                          </div>
                          
                          {/* Map Button (Previously Video Button) */}
                          <div className="hover-scale-container">
                            <motion.button
                              onClick={() => setIsMapOpen(true)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                              className="inline-flex items-center space-x-3 px-8 py-4 
                                       bg-gradient-to-r from-blue-500 to-indigo-600
                                       hover:from-blue-600 hover:to-indigo-700
                                       text-white rounded-full font-semibold text-lg 
                                       transition-all duration-300 border-2 border-white/30
                                       hover:border-white/50 shadow-2xl hover:shadow-blue-500/50"
                            >
                              <HiMap className="w-6 h-6 flex-shrink-0" />
                              <span>{t('hero.viewOnMap')}</span>
                            </motion.button>
                          </div>
                        </div>

                        {/* Video Button - Icon Below */}
                        <motion.button
                          onClick={() => setVideoModalOpen(true)}
                          whileHover={{ scale: 1.1, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                          className="group flex items-center space-x-2 text-white/90 hover:text-white
                                   transition-all duration-300"
                          title={t('common.watchVideo') || 'Watch Video'}
                        >
                          <div className="relative flex items-center justify-center">
                            {/* Animated Circle */}
                            <motion.div
                              className="absolute w-12 h-12 rounded-full border-2 border-white/50"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            
                            {/* Play Icon Circle */}
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full 
                                          flex items-center justify-center group-hover:bg-white/30
                                          transition-all duration-300 border-2 border-white/50
                                          group-hover:border-white shadow-lg">
                              <HiPlay className="w-6 h-6 ml-0.5" />
                            </div>
                          </div>
                          
                          <span className="text-sm font-medium uppercase tracking-wider">
                            {t('common.watchVideo') || 'Watch Video'}
                          </span>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                {/* Scroll Down Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-white text-sm mb-2 opacity-80">
                      {t('common.scrollDown') || 'Scroll Down'}
                    </span>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
                    >
                      <div className="w-1 h-3 bg-white rounded-full mt-2 opacity-80" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Video Player Modal */}
      {videoModalOpen && (
        <VideoPlayer
          videoUrl="/video.mp4"
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
        />
      )}

      {/* Property Map View */}
      <PropertyMapView 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
      />
    </>
  )
}

export default HeroSection