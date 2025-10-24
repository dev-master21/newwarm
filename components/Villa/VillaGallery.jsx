import React, { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'

const VillaGallery = ({ images = [] }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null)

  // Default images if none provided
  const galleryImages = images.length > 0 ? images : [
    { path: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200' },
    { path: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200' },
    { path: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200' },
    { path: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200' },
  ]

  return (
    <div className="relative">
      {/* Main Swiper */}
      <Swiper
        modules={[Navigation, Pagination, Thumbs]}
        spaceBetween={0}
        navigation
        pagination={{ clickable: true }}
        thumbs={{ swiper: thumbsSwiper }}
        className="h-96 md:h-[500px]"
      >
        {galleryImages.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image.path || image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbs Swiper */}
      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[FreeMode, Navigation, Thumbs]}
        spaceBetween={10}
        slidesPerView={4}
        freeMode
        watchSlidesProgress
        className="mt-4 h-20 md:h-24"
        breakpoints={{
          640: { slidesPerView: 5 },
          768: { slidesPerView: 6 },
          1024: { slidesPerView: 8 },
        }}
      >
        {galleryImages.map((image, index) => (
          <SwiperSlide key={index}>
            <img
              src={image.path || image}
              alt={`Thumb ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer rounded-lg"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default VillaGallery