import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      author: 'Sarah Johnson',
      country: 'United States',
      rating: 5,
      content: 'Absolutely stunning villa with breathtaking ocean views. The staff went above and beyond to make our stay memorable. Highly recommend WARM+ for luxury villa rentals in Phuket!',
      avatar: 'https://i.pravatar.cc/150?img=1',
      date: '2024-01-15'
    },
    {
      id: 2,
      author: 'Michael Chen',
      country: 'Singapore',
      rating: 5,
      content: 'Perfect family vacation! The villa was spacious, clean, and had all the amenities we needed. The private pool and beach access were amazing. Will definitely book again!',
      avatar: 'https://i.pravatar.cc/150?img=3',
      date: '2024-02-10'
    },
    {
      id: 3,
      author: 'Elena Petrov',
      country: 'Russia',
      rating: 5,
      content: 'Exceptional service from start to finish. The concierge helped arrange everything from airport transfers to restaurant reservations. The villa exceeded all our expectations!',
      avatar: 'https://i.pravatar.cc/150?img=5',
      date: '2024-01-20'
    },
    {
      id: 4,
      author: 'James Wilson',
      country: 'Australia',
      rating: 5,
      content: 'We had the most incredible honeymoon at this beautiful villa. Private, luxurious, and romantic. The sunset views were spectacular. Thank you WARM+ for making our special time perfect!',
      avatar: 'https://i.pravatar.cc/150?img=8',
      date: '2024-03-05'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary-50 to-purple-50 
                     dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Guests Say
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real experiences from our valued guests around the world
          </p>
        </motion.div>

        {/* Testimonials Slider */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="pb-12"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg h-full"
                >
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <HiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.author}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.country}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button className="swiper-button-prev-custom p-3 bg-white dark:bg-gray-800 
                             rounded-full shadow-lg hover:shadow-xl transition-shadow">
              <HiChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
            <button className="swiper-button-next-custom p-3 bg-white dark:bg-gray-800 
                             rounded-full shadow-lg hover:shadow-xl transition-shadow">
              <HiChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Testimonials