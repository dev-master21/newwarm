import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { 
  HiUsers, HiLocationMarker, 
  HiHeart, HiShare, HiArrowLeft, HiCheck 
} from 'react-icons/hi'
import { IoBedOutline } from 'react-icons/io5'
import { MdBathtub } from 'react-icons/md'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import VillaGallery from '../components/Villa/VillaGallery'
import VillaBooking from '../components/Villa/VillaBooking'
import VillaMap from '../components/Villa/VillaMap'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { villaService } from '../services/villa.service'
import { useShortlistStore } from '../store/shortlistStore'
import toast from 'react-hot-toast'


const VillaDetail = () => {
  const { t } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const [villa, setVilla] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const { addItem, removeItem, isInShortlist } = useShortlistStore()

  useEffect(() => {
    loadVilla()
  }, [id])

  const loadVilla = async () => {
    try {
      setLoading(true)
      const response = await villaService.getVilla(id)
      setVilla(response.data)
    } catch (error) {
      console.error('Error loading villa:', error)
      toast.error('Failed to load villa details')
      navigate('/villas')
    } finally {
      setLoading(false)
    }
  }

  const handleShortlistToggle = () => {
    if (isInShortlist(villa.id)) {
      removeItem(villa.id)
    } else {
      addItem(villa)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!villa) {
    return null
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'amenities', label: 'Amenities' },
    { id: 'location', label: 'Location' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Gallery */}
      <VillaGallery images={villa.gallery_images || []} />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {villa.name}
                  </h1>
                  <div className="flex items-center text-gray-600 dark:text-gray-400">
                    <HiLocationMarker className="w-5 h-5 mr-1" />
                    <span>{villa.city}, Thailand</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleShortlistToggle}
                    className={`p-3 rounded-lg transition-colors ${
                      isInShortlist(villa.id)
                        ? 'bg-red-100 text-red-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <HiHeart className="w-6 h-6" />
                  </button>
                  <button className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                    <HiShare className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <IoBedOutline className="w-5 h-5 text-gray-400" />
                  <span>{villa.bedrooms_num} {t('villa.bedrooms')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MdBathtub className="w-5 h-5 text-gray-400" />
                  <span>{villa.bathrooms_num || 2} {t('villa.bathrooms')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HiUsers className="w-5 h-5 text-gray-400" />
                  <span>{villa.adults_num} {t('villa.adults')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Area: {villa.area || '200'} m²</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6">
                <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 font-medium transition-colors relative ${
                        activeTab === tab.id
                          ? 'text-primary-600'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                        />
                      )}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === 'overview' && (
                    <div className="prose dark:prose-invert max-w-none">
                      <p>{villa.description || 'Beautiful luxury villa in Phuket with stunning views and modern amenities.'}</p>
                      
                      {villa.quickFacts && villa.quickFacts.length > 0 && (
                        <div className="mt-6">
                          <h3>{t('villa.quickFacts')}</h3>
                          <div className="space-y-3">
                            {villa.quickFacts.map((fact, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <HiCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <strong>{fact.name}:</strong> {fact.description}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'amenities' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(villa.amenities || [
                        'WiFi', 'Air Conditioning', 'Swimming Pool', 'Kitchen',
                        'Parking', 'TV', 'Washing Machine', 'Garden'
                      ]).map((amenity, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <HiCheck className="w-5 h-5 text-green-500" />
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'location' && (
                    <div>
                      <p className="mb-4">Located in {villa.city}, this villa offers easy access to beaches, restaurants, and attractions.</p>
                      <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg">
                        <VillaMap 
                          location={villa.location || '7.8804,98.3923'} 
                          name={villa.name}
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {(villa.reviews || []).length > 0 ? (
                        villa.reviews.map((review, index) => (
                          <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{review.author}</h4>
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.review_date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No reviews yet</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Booking Widget */}
          <div className="lg:sticky lg:top-24 h-fit">
            <VillaBooking villa={villa} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VillaDetail