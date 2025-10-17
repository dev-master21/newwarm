import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { HiSearch, HiPlay } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import HeroSection from '../components/Home/HeroSection'
import FeaturedVillas from '../components/Home/FeaturedVillas'
import WhyChooseUs from '../components/Home/WhyChooseUs'
import Testimonials from '../components/Home/Testimonials'
import NewsletterSection from '../components/Home/NewsletterSection'
import SearchPanel from '../components/common/SearchPanel'

const Home = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <HeroSection onSearchClick={() => setIsSearchOpen(true)} />
      <FeaturedVillas />
      <WhyChooseUs />
      <Testimonials />
      <NewsletterSection />
      
      <SearchPanel 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  )
}

export default Home