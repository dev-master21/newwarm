import React from 'react'
import { motion } from 'framer-motion'
import NewsletterForm from '../common/NewsletterForm'

const NewsletterSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-purple-600">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="mb-6">
            <svg
              className="w-20 h-20 mx-auto text-white/20"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Content */}
          <h2 className="text-4xl font-bold text-white mb-4">
            Stay Updated with Exclusive Offers
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter and get special deals on luxury villas
          </p>

          {/* Form */}
          <NewsletterForm variant="hero" />

          {/* Trust Badge */}
          <p className="text-white/70 text-sm mt-6">
            🔒 We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default NewsletterSection