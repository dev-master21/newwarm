// frontend/src/components/Home/WhyChooseUs.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  HiShieldCheck, HiClock, HiUserGroup, 
  HiHeart, HiHome, HiSparkles 
} from 'react-icons/hi'

const WhyChooseUs = () => {
  const { t } = useTranslation()
  
  const features = [
    {
      icon: HiShieldCheck,
      title: t('whyChoose.trustedSecure'),
      description: t('whyChoose.trustedSecureDesc'),
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: HiClock,
      title: t('whyChoose.support247'),
      description: t('whyChoose.support247Desc'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: HiUserGroup,
      title: t('whyChoose.localExpertise'),
      description: t('whyChoose.localExpertiseDesc'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: HiHeart,
      title: t('whyChoose.handpickedVillas'),
      description: t('whyChoose.handpickedVillasDesc'),
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      icon: HiHome,
      title: t('whyChoose.bestLocations'),
      description: t('whyChoose.bestLocationsDesc'),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: HiSparkles,
      title: t('whyChoose.exclusivePerks'),
      description: t('whyChoose.exclusivePerksDesc'),
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  const stats = [
    { value: '500+', label: 'Luxury Villas' },
    { value: '10K+', label: 'Happy Guests' },
    { value: '15+', label: 'Years Experience' },
    { value: '4.9/5', label: 'Average Rating' },
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-800 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('whyChoose.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {t('whyChoose.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className={`${feature.bgColor} dark:bg-opacity-20 w-16 h-16 rounded-xl 
                           flex items-center justify-center mb-6`}>
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-gray-200 dark:border-gray-700"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-[#ba2e2d] mb-2">
                {stat.value}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUs