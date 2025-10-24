// frontend/src/components/Home/WarmClubSection.jsx
import React from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { 
  HiSparkles, 
  HiGift, 
  HiLightningBolt, 
  HiTicket,
  HiHeart
} from 'react-icons/hi'
import NewsletterForm from '../common/NewsletterForm'

const WarmClubSection = () => {
  const { t } = useTranslation()
  
  const benefits = [
    {
      icon: HiSparkles,
      text: t('warmClub.exclusiveBenefits'),
    },
    {
      icon: HiLightningBolt,
      text: t('warmClub.priorityAccess'),
    },
    {
      icon: HiTicket,
      text: t('warmClub.welcomeDiscount'),
    },
    {
      icon: HiHeart,
      text: t('warmClub.travelInspiration'),
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-r from-[#ba2e2d] to-purple-600">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="mb-6">
            <HiGift className="w-20 h-20 mx-auto text-white/20" />
          </div>

          {/* Title */}
          <h2 className="text-4xl font-bold text-white mb-8">
            {t('warmClub.title')}
          </h2>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 text-left"
              >
                <benefit.icon className="w-6 h-6 text-yellow-300 flex-shrink-0" />
                <span className="text-white/90 text-lg">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Description */}
          <p className="text-xl text-white/90 mb-8">
            {t('warmClub.description')}
          </p>

          {/* Form */}
          <NewsletterForm variant="hero" />

          {/* Trust Badge */}
          <p className="text-white/70 text-sm mt-6">
            🔒 {t('warmClub.privacy')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default WarmClubSection