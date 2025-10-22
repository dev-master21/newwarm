import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiSearch, HiPlay } from 'react-icons/hi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import VideoPlayer from '../common/VideoPlayer'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

const HeroSection = ({ onSearchClick }) => {
  const { t } = useTranslation()
  const [videoModalOpen, setVideoModalOpen] = useState(false)

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
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                      >
                        <div className="hover-scale-container">
                          <motion.button
                            onClick={onSearchClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex items-center space-x-3 px-8 py-4 
                                     bg-red-600 hover:bg-red-700 text-white text-lg 
                                     font-medium rounded-full shadow-xl 
                                     transition-colors duration-300"
                          >
                            <HiSearch className="w-6 h-6 flex-shrink-0" />
                            <span>{t('hero.searchButton')}</span>
                          </motion.button>
                        </div>
                        
                        <div className="hover-scale-container">
                          <motion.button
                            onClick={() => setVideoModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="inline-flex items-center space-x-3 px-8 py-4 
                                     bg-white/10 backdrop-blur-md hover:bg-white/20 
                                     text-white rounded-full font-medium text-lg 
                                     transition-colors duration-300 border border-white/30"
                          >
                            <HiPlay className="w-6 h-6 flex-shrink-0" />
                            <span>{t('common.watchVideo') || 'Watch Video'}</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

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

      {/* Custom Video Player Modal - передаем путь к видео */}
      {videoModalOpen && (
        <VideoPlayer
          videoUrl="/video.mp4"  // Путь к вашему локальному видео
          isOpen={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
        />
      )}
    </>
  )
}

export default HeroSection