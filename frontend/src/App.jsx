import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import LoadingScreen from './components/common/LoadingScreen'
import { useThemeStore } from './store/themeStore'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Villas = lazy(() => import('./pages/Villas'))
const VillaDetail = lazy(() => import('./pages/VillaDetail'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Shortlist = lazy(() => import('./pages/Shortlist'))

function App() {
  const location = useLocation()
  const { theme, initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Layout />}>
            <Route index element={
              <Suspense fallback={<LoadingScreen />}>
                <Home />
              </Suspense>
            } />
            <Route path="villas" element={
              <Suspense fallback={<LoadingScreen />}>
                <Villas />
              </Suspense>
            } />
            <Route path="villas/:id" element={
              <Suspense fallback={<LoadingScreen />}>
                <VillaDetail />
              </Suspense>
            } />
            <Route path="about" element={
              <Suspense fallback={<LoadingScreen />}>
                <About />
              </Suspense>
            } />
            <Route path="contact" element={
              <Suspense fallback={<LoadingScreen />}>
                <Contact />
              </Suspense>
            } />
            <Route path="shortlist" element={
              <Suspense fallback={<LoadingScreen />}>
                <Shortlist />
              </Suspense>
            } />
          </Route>
        </Routes>
      </AnimatePresence>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: theme === 'dark' ? '#1f2937' : '#fff',
            color: theme === 'dark' ? '#fff' : '#1f2937',
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />
    </>
  )
}

export default App