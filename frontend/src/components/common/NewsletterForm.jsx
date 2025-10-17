import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { HiMail, HiCheck } from 'react-icons/hi'
import toast from 'react-hot-toast'
import { contactService } from '../../services/villa.service'

const NewsletterForm = ({ variant = 'default' }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email')
      return
    }

    try {
      setLoading(true)
      await contactService.joinClub(email)
      setSubscribed(true)
      toast.success('Successfully subscribed!')
      setEmail('')
      
      setTimeout(() => {
        setSubscribed(false)
      }, 3000)
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <HiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-md 
                       text-white placeholder-white/70 rounded-xl
                       border border-white/30 focus:border-white/50 
                       focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <motion.button
            type="submit"
            disabled={loading || subscribed}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white text-primary-600 rounded-xl 
                     font-semibold hover:bg-gray-100 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center justify-center space-x-2"
          >
            {subscribed ? (
              <>
                <HiCheck className="w-5 h-5" />
                <span>Subscribed!</span>
              </>
            ) : loading ? (
              <span>Subscribing...</span>
            ) : (
              <span>Subscribe</span>
            )}
          </motion.button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
      <div className="flex-1 relative">
        <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 
                   rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading || subscribed}
        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white 
                 rounded-lg font-medium transition-colors
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {subscribed ? 'Subscribed!' : loading ? 'Loading...' : 'Subscribe'}
      </button>
    </form>
  )
}

export default NewsletterForm