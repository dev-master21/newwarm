import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import ContactForm from '../components/common/ContactForm'

const Contact = () => {
  const { t, i18n } = useTranslation()
  
  // Контакты зависят от языка
  const getContactInfo = () => {
    const lang = i18n.language
    const contacts = {
      en: {
        phone: '+66 123 456 789',
        email: 'info@warmplus.com',
        address: 'Phuket, Thailand'
      },
      ru: {
        phone: '+7 495 123 45 67',
        email: 'info@warmphuket.ru',
        address: 'Пхукет, Таиланд'
      },
      th: {
        phone: '+66 123 456 789',
        email: 'info@warmplus.co.th',
        address: 'ภูเก็ต ประเทศไทย'
      },
      fr: {
        phone: '+33 1 23 45 67 89',
        email: 'info@warmplus.fr',
        address: 'Phuket, Thaïlande'
      },
      es: {
        phone: '+34 123 456 789',
        email: 'info@warmplus.es',
        address: 'Phuket, Tailandia'
      }
    }
    return contacts[lang] || contacts.en
  }

  const contactData = getContactInfo()
  
  const contactInfo = [
    {
      icon: HiPhone,
      title: t('contact.form.phone'),
      content: contactData.phone,
      link: `tel:${contactData.phone.replace(/\s/g, '')}`
    },
    {
      icon: HiMail,
      title: t('contact.form.email'),
      content: contactData.email,
      link: `mailto:${contactData.email}`
    },
    {
      icon: HiLocationMarker,
      title: t('footer.address'),
      content: contactData.address,
      link: null
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <section className="bg-gradient-to-r from-[#ba2e2d] to-purple-600 py-20">
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

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('contact.sendMessage')}</h2>
              <ContactForm />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold mb-6">{t('contact.getInTouch')}</h2>
              <div className="space-y-6 mb-8">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#ba2e2d]/10 text-[#ba2e2d] 
                                  rounded-full flex items-center justify-center">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      {item.link ? (
                        <a href={item.link} className="text-[#ba2e2d] hover:text-[#a02624]">
                          {item.content}
                        </a>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">{item.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126115.83064946958!2d98.29523084423826!3d7.848593411433744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x305031fd2d6380b3%3A0x3c2fb7fcbc7844e2!2sPhuket%2C%20Thailand!5e0!3m2!1sen!2s!4v1637237879450!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact