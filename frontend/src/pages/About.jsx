import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiCheckCircle, HiLightBulb, HiHeart, HiShieldCheck } from 'react-icons/hi'

const About = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: HiCheckCircle,
      title: 'Trusted Service',
      description: 'Over 10 years of experience in luxury villa rentals'
    },
    {
      icon: HiLightBulb,
      title: 'Local Expertise',
      description: 'Deep knowledge of Phuket and surrounding areas'
    },
    {
      icon: HiHeart,
      title: 'Personal Touch',
      description: '24/7 concierge service for all your needs'
    },
    {
      icon: HiShieldCheck,
      title: 'Secure Booking',
      description: 'Safe and transparent booking process'
    }
  ]

  const stats = [
    { value: '500+', label: 'Luxury Villas' },
    { value: '10K+', label: 'Happy Guests' },
    { value: '15+', label: 'Years Experience' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-primary-600 to-primary-700">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p>
                  Founded in 2010, WARM+ has been the premier destination for luxury villa rentals in Phuket. 
                  Our journey began with a simple vision: to provide travelers with exceptional accommodations 
                  that feel like home, but with the luxury and services of a five-star resort.
                </p>
                <p>
                  Over the years, we've carefully curated a collection of the finest villas across Phuket, 
                  each selected for its unique character, stunning location, and exceptional amenities. 
                  Our team of local experts ensures that every stay is memorable, providing personalized 
                  service that goes above and beyond.
                </p>
                <p>
                  Today, WARM+ is trusted by thousands of guests from around the world, and we continue 
                  to expand our portfolio while maintaining the high standards that have made us the 
                  leader in luxury villa rentals.
                </p>
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
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
                <div className="text-3xl font-bold text-primary-600">15+</div>
                <div className="text-gray-600 dark:text-gray-400">Years of Excellence</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white dark:bg-gray-800">
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
                <div className="text-4xl font-bold text-primary-600 mb-2">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose WARM+</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Experience the difference with our premium service
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
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 
                              text-primary-600 rounded-full mb-4">
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
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary-600">
                {t('about.mission')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                To provide exceptional luxury villa experiences that exceed our guests' expectations, 
                combining the comfort of home with the indulgence of a five-star resort, while 
                showcasing the natural beauty and culture of Phuket.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold mb-4 text-primary-600">
                {t('about.vision')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                To be the most trusted and sought-after luxury villa rental company in Southeast Asia, 
                known for our exceptional properties, personalized service, and commitment to creating 
                unforgettable holiday experiences.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About