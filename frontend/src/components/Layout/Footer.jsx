import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'
import { FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaTwitter, FaTelegram } from 'react-icons/fa'
import NewsletterForm from '../common/NewsletterForm'

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
    services: [
      { path: '/villas?type=luxury', label: 'Luxury Villas' },
      { path: '/villas?type=beachfront', label: 'Beachfront Properties' },
      { path: '/villas?type=family', label: 'Family Villas' },
      { path: '/villas?type=honeymoon', label: 'Honeymoon Suites' },
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
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-400 mb-6">
              Get exclusive offers and updates on new luxury villas
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <svg
                className="w-10 h-10"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="20" cy="20" r="20" fill="url(#footer-gradient)" />
                <path
                  d="M20 10L26 16L26 26L20 30L14 26L14 16L20 10Z"
                  fill="white"
                />
                <defs>
                  <linearGradient id="footer-gradient" x1="0" y1="0" x2="40" y2="40">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-2xl font-bold">WARM+</span>
            </Link>
            <p className="text-gray-400 mb-4">
              Your trusted partner for luxury villa rentals in Phuket. 
              Experience paradise with our handpicked collection of premium properties.
            </p>
            <div className="flex space-x-3">
              {footerLinks.social.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center 
                           hover:bg-primary-600 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
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
            <h3 className="text-lg font-semibold mb-4">{t('footer.links')}</h3>
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

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
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
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">{t('footer.booking')}</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <HiPhone className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <a href="tel:+66123456789" className="text-gray-400 hover:text-white">
                    +66 123 456 789
                  </a>
                  <div className="text-sm text-gray-500">24/7 Support</div>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <HiMail className="w-5 h-5 text-primary-400 mt-0.5" />
                <div>
                  <a href="mailto:info@warmphuket.ru" className="text-gray-400 hover:text-white">
                    info@warmphuket.ru
                  </a>
                  <div className="text-sm text-gray-500">Quick Response</div>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <HiLocationMarker className="w-5 h-5 text-primary-400 mt-0.5" />
                <div className="text-gray-400">
                  Phuket, Thailand
                  <div className="text-sm text-gray-500">Main Office</div>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>
              © {currentYear} WARM Plus. {t('footer.copyright')}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="hover:text-white transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer