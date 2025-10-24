// frontend/src/components/Layout/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaTelegram } from 'react-icons/fa'

const Footer = () => {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    quickLinks: [
      { path: '/', label: t('nav.home') },
      { path: '/villas', label: t('nav.villas') },
      { path: '/about', label: t('nav.about') },
      { path: '/contact', label: t('nav.contact') },
    ],
    social: [
      { icon: FaFacebook, href: 'https://facebook.com/warmplus', label: 'Facebook' },
      { icon: FaInstagram, href: 'https://instagram.com/warmplus', label: 'Instagram' },
      { icon: FaYoutube, href: 'https://youtube.com/warmplus', label: 'YouTube' },
      { icon: FaTiktok, href: 'https://tiktok.com/@warmplus', label: 'TikTok' },
      { icon: FaTelegram, href: 'https://t.me/warmplus', label: 'Telegram' },
    ],
  }
  
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-lg font-semibold mb-4">WARM+</h3>
            <p className="text-gray-400 mb-6">
              {t('footer.description')}
            </p>
            {/* Social Links */}
            <div className="flex space-x-4">
              {footerLinks.social.map((social) => (
                
                 <a key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-full hover:bg-[#ba2e2d] 
                           transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">{t('footer.booking')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <HiPhone className="w-5 h-5 text-[#ba2e2d] mt-0.5" />
                <div>
                  <a href={`tel:${t('contacts.phone')}`} className="text-gray-400 hover:text-white">
                    {t('contacts.phone')}
                  </a>
                  <div className="text-sm text-gray-500">{t('footer.support247')}</div>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <HiMail className="w-5 h-5 text-[#ba2e2d] mt-0.5" />
                <div>
                  <a href={`mailto:${t('contacts.email')}`} className="text-gray-400 hover:text-white">
                    {t('contacts.email')}
                  </a>
                  <div className="text-sm text-gray-500">{t('footer.quickResponse')}</div>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <HiLocationMarker className="w-5 h-5 text-[#ba2e2d] mt-0.5" />
                <div className="text-gray-400">
                  {t('contacts.address')}
                  <div className="text-sm text-gray-500">{t('footer.mainOffice')}</div>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center text-sm text-gray-400">
            <p>
              © {currentYear} WARM+. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer