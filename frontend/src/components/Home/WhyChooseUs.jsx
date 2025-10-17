import React from 'react'
import { motion } from 'framer-motion'
import { 
  HiShieldCheck, HiClock, HiUserGroup, 
  HiHeart, HiHome, HiSparkles 
} from 'react-icons/hi'

const WhyChooseUs = () => {
  const features = [
    {
      icon: HiShieldCheck,
      title: 'Trusted & Secure',
      description: 'Verified properties with secure booking and payment process',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: HiClock,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for all your needs during your stay',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: HiUserGroup,
      title: 'Local Expertise',
      description: 'Deep knowledge of Phuket with personalized recommendations',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: HiHeart,
      title: 'Handpicked Villas',
      description: 'Every villa is personally selected for quality and comfort',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      icon: HiHome,
      title: 'Best Locations',
      description: 'Prime locations near beaches, restaurants, and attractions',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    {
      icon: HiSparkles,
      title: 'Exclusive Perks',
      description: 'Special amenities and services for our valued guests',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
  ]

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose WARM+
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience the difference with our premium service and exceptional properties
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-8 bg-gray-50 dark:bg-gray-900 rounded-2xl 
                            hover:shadow-xl transition-all duration-300 h-full">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 
                              ${feature.bgColor} ${feature.color} rounded-2xl mb-6
                              group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r 
                              from-primary-600/10 to-purple-600/10 opacity-0 
                              group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '500+', label: 'Luxury Villas' },
            { value: '10K+', label: 'Happy Guests' },
            { value: '15+', label: 'Years Experience' },
            { value: '4.9/5', label: 'Average Rating' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className="text-4xl font-bold text-primary-600 mb-2"
              >
                {stat.value}
              </motion.div>
              <div className="text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default WhyChooseUs