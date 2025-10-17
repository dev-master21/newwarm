import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiSearch, HiPlay } from 'react-icons/hi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
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
      <section className="relative h-screen overflow-hidden">
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
          className="h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50" />
                
                {/* Content */}
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
                        <motion.button
                          onClick={onSearchClick}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center space-x-3 px-8 py-4 
                                   bg-[#ba2e2d] hover:bg-[#a02624] text-white text-lg 
                                   font-medium rounded-full shadow-xl 
                                   transition-all duration-300"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <HiSearch className="w-6 h-6 flex-shrink-0" />
                          <span>{t('hero.searchButton')}</span>
                        </motion.button>
                        
                        <motion.button
                          onClick={() => setVideoModalOpen(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center space-x-3 px-8 py-4 
                                   bg-white/10 backdrop-blur-md hover:bg-white/20 
                                   text-white rounded-full font-medium text-lg 
                                   transition-all duration-300"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <HiPlay className="w-6 h-6 flex-shrink-0" />
                          <span>{t('common.watchVideo') || 'Watch Video'}</span>
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-white text-sm mb-2">
                      {t('common.scrollDown') || 'Scroll Down'}
                    </span>
                    <motion.div
                      animate={{ y: [0, 10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
                    >
                      <div className="w-1 h-3 bg-white rounded-full mt-2" />
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Video Modal */}
      {videoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setVideoModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full rounded-xl"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="WARM+ Luxury Villas"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
              aria-label="Close video"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  )
}

export default HeroSection