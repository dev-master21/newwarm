import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HiArrowRight } from 'react-icons/hi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import VillaCard from '../Villa/VillaCard'
import LoadingSpinner from '../common/LoadingSpinner'
import { villaService } from '../../services/villa.service'

const FeaturedVillas = () => {
  const { t } = useTranslation()
  const [villas, setVillas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedVillas()
  }, [])

  const loadFeaturedVillas = async () => {
    try {
      const response = await villaService.getFeaturedVillas()
      setVillas(response.data || [])
    } catch (error) {
      console.error('Error loading featured villas:', error)
      setVillas(getDemoVillas())
    } finally {
      setLoading(false)
    }
  }

  const getDemoVillas = () => [
    {
      id: 1,
      name: 'Ocean View Villa',
      slug: 'ocean-view-villa',
      city: 'Phuket',
      price: 15000,
      original_price: 20000,
      bedrooms_num: 4,
      bathrooms_num: 3,
      adults_num: 8,
      cover: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800',
      tags: [{ slug: 'featured', name: 'Featured' }]
    },
    {
      id: 2,
      name: 'Sunset Paradise',
      slug: 'sunset-paradise',
      city: 'Phuket',
      price: 12000,
      bedrooms_num: 3,
      bathrooms_num: 2,
      adults_num: 6,
      cover: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800'
    },
    {
      id: 3,
      name: 'Tropical Retreat',
      slug: 'tropical-retreat',
      city: 'Phuket',
      price: 18000,
      bedrooms_num: 5,
      bathrooms_num: 4,
      adults_num: 10,
      cover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'
    },
    {
      id: 4,
      name: 'Beach House Deluxe',
      slug: 'beach-house-deluxe',
      city: 'Phuket',
      price: 25000,
      bedrooms_num: 6,
      bathrooms_num: 5,
      adults_num: 12,
      cover: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      tags: [{ slug: 'featured', name: 'Featured' }]
    }
  ]

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('featured.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : (
          <>
            <div className="hidden lg:grid grid-cols-3 gap-8 mb-8">
              {villas.slice(0, 6).map((villa, index) => (
                <motion.div
                  key={villa.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <VillaCard villa={villa} />
                </motion.div>
              ))}
            </div>

            <div className="lg:hidden">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 2 }
                }}
                className="pb-12"
              >
                {villas.map((villa) => (
                  <SwiperSlide key={villa.id}>
                    <VillaCard villa={villa} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Link
                to="/villas"
                className="inline-flex items-center space-x-2 px-8 py-3 
                         bg-[#ba2e2d] hover:bg-[#a02624] text-white 
                         rounded-full font-medium transition-colors"
                style={{ display: 'inline-flex' }}
              >
                <span>{t('featured.viewAll')}</span>
                <HiArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  )
}

export default FeaturedVillas