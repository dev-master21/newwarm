import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import ContactForm from '../components/common/ContactForm'
import Map from '../components/common/Map'

const Contact = () => {
  const { t } = useTranslation()
  
  const contactInfo = [
    {
      icon: HiPhone,
      title: t('footer.phone'),
      content: '+66 123 456 789',
      link: 'tel:+66123456789'
    },
    {
      icon: HiMail,
      title: t('footer.email'),
      content: 'info@warmphuket.ru',
      link: 'mailto:info@warmphuket.ru'
    },
    {
      icon: HiLocationMarker,
      title: t('footer.address'),
      content: 'Phuket, Thailand',
      link: null
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl font-bold mb-4">{t('contact.title')}</h1>
            <p className="text-xl opacity-90">{t('contact.subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Send us a message</h2>
              <ContactForm />
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
              <div className="space-y-6 mb-8">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary-100 text-primary-600 
                                  rounded-full flex items-center justify-center">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      {item.link ? (
                        <a href={item.link} className="text-primary-600 hover:text-primary-700">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                <Map />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact