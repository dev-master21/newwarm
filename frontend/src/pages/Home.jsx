import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import HeroSection from '../components/Home/HeroSection'
import FeaturedVillas from '../components/Home/FeaturedVillas'
import WhyChooseUs from '../components/Home/WhyChooseUs'
import WarmClubSection from '../components/Home/WarmClubSection'
import SearchPanel from '../components/common/SearchPanel'

const Home = () => {
  const { t } = useTranslation()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <div className="w-full">
      <HeroSection onSearchClick={() => setIsSearchOpen(true)} />
      <FeaturedVillas />
      <WhyChooseUs />
      <WarmClubSection />
      
      <SearchPanel 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </div>
  )
}

export default Home