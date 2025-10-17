import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiLightBulb, HiHeart, HiShieldCheck } from 'react-icons/hi'

const About = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: HiCheckCircle,
      title: t('about.features.trustedService'),
      description: t('about.features.trustedServiceDesc')
    },
    {
      icon: HiLightBulb,
      title: t('about.features.localExpertise'),
      description: t('about.features.localExpertiseDesc')
    },
    {
      icon: HiHeart,
      title: t('about.features.personalTouch'),
      description: t('about.features.personalTouchDesc')
    },
    {
      icon: HiShieldCheck,
      title: t('about.features.secureBooking'),
      description: t('about.features.secureBookingDesc')
    }
  ]

  const stats = [
    { value: '500+', label: t('about.stats.villas') },
    { value: '10K+', label: t('about.stats.guests') },
    { value: '15+', label: t('about.stats.experience') },
    { value: '24/7', label: t('about.stats.support') },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-[#ba2e2d] to-purple-600">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h1 className="text-5xl font-bold mb-6">{t('about.title')}</h1>
            <p className="text-xl opacity-90">
              {t('about.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 overflow-visible">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('about.ourStory')}</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>{t('about.ourStoryText1')}</p>
                <p>{t('about.ourStoryText2')}</p>
                <p>{t('about.ourStoryText3')}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img
                src="https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"
                alt="Luxury Villa"
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="text-3xl font-bold text-[#ba2e2d]">15+</div>
                <div className="text-gray-600 dark:text-gray-400">{t('about.yearsOfExcellence')}</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white dark:bg-gray-800 overflow-visible">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
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
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 overflow-visible">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">{t('about.whyChooseTitle')}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {t('about.whyChooseSubtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#ba2e2d]/10 
                              text-[#ba2e2d] rounded-full mb-4">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-100 dark:bg-gray-800 overflow-visible">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4 text-[#ba2e2d]">
                {t('about.mission')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('about.missionText')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4 text-[#ba2e2d]">
                {t('about.vision')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('about.visionText')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About