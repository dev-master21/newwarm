import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HiMenu,
  HiX,
  HiHeart,
  HiSearch,
  HiSun,
  HiMoon,
  HiTranslate,
} from 'react-icons/hi'
import { useThemeStore } from '../../store/themeStore'
import { useShortlistStore } from '../../store/shortlistStore'
import SearchPanel from '../common/SearchPanel'
import LanguageSwitcher from '../common/LanguageSwitcher'
import MobileMenu from './MobileMenu'

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { theme, toggleTheme } = useThemeStore()
  const { items } = useShortlistStore()
  
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/villas', label: t('nav.villas') },
    { path: '/about', label: t('nav.about') },
    { path: '/contact', label: t('nav.contact') },
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
            : location.pathname === '/' 
              ? 'bg-transparent' 
              : 'bg-white dark:bg-gray-900 shadow-sm'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              to="/"
              className="flex items-center space-x-2 z-50"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <svg
                  className="w-10 h-10"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
                  <path
                    d="M20 10L26 16L26 26L20 30L14 26L14 16L20 10Z"
                    fill="white"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className={`text-2xl font-bold ${
                  isScrolled || location.pathname !== '/'
                    ? 'text-gray-900 dark:text-white'
                    : 'text-white'
                }`}>
                  WARM+
                </span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? isScrolled || location.pathname !== '/'
                        ? 'text-primary-600'
                        : 'text-white'
                      : isScrolled || location.pathname !== '/'
                        ? 'text-gray-700 dark:text-gray-300 hover:text-primary-600'
                        : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary-600"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled || location.pathname !== '/'
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'hover:bg-white/10'
                }`}
              >
                <HiSearch className={`w-5 h-5 ${
                  isScrolled || location.pathname !== '/'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-white'
                }`} />
              </button>

              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled || location.pathname !== '/'
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'hover:bg-white/10'
                }`}
              >
                <HiTranslate className={`w-5 h-5 ${
                  isScrolled || location.pathname !== '/'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-white'
                }`} />
              </button>

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isScrolled || location.pathname !== '/'
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'hover:bg-white/10'
                }`}
              >
                {theme === 'dark' ? (
                  <HiSun className="w-5 h-5 text-yellow-400" />
                ) : (
                  <HiMoon className={`w-5 h-5 ${
                    isScrolled || location.pathname !== '/'
                      ? 'text-gray-700'
                      : 'text-white'
                  }`} />
                )}
              </button>

              <Link
                to="/shortlist"
                className={`relative p-2 rounded-lg transition-colors ${
                  isScrolled || location.pathname !== '/'
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    : 'hover:bg-white/10'
                }`}
              >
                <HiHeart className={`w-5 h-5 ${
                  isScrolled || location.pathname !== '/'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-white'
                }`} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs 
                                 rounded-full w-5 h-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 z-50"
            >
              {isMobileMenuOpen ? (
                <HiX className={`w-6 h-6 ${
                  isScrolled || location.pathname !== '/'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-white'
                }`} />
              ) : (
                <HiMenu className={`w-6 h-6 ${
                  isScrolled || location.pathname !== '/'
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-white'
                }`} />
              )}
            </button>
          </div>
        </div>

        {/* Language Dropdown */}
        <AnimatePresence>
          {isLangOpen && (
            <LanguageSwitcher 
              isOpen={isLangOpen}
              onClose={() => setIsLangOpen(false)}
            />
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
      />

      {/* Search Panel */}
      <SearchPanel 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  )
}

export default Header