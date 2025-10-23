// frontend/src/App.jsx
import React, { useEffect, Suspense, lazy } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout/Layout'
import AdminLayout from './components/admin/AdminLayout'
import LoadingScreen from './components/common/LoadingScreen'
import { useThemeStore } from './store/themeStore'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'))
const Villas = lazy(() => import('./pages/Villas'))
const VillaDetail = lazy(() => import('./pages/VillaDetail'))
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Shortlist = lazy(() => import('./pages/Shortlist'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AddProperty = lazy(() => import('./pages/admin/AddProperty'))
const Properties = lazy(() => import('./pages/admin/Properties'))
const EditProperty = lazy(() => import('./pages/admin/EditProperty'))
const Bookings = lazy(() => import('./pages/admin/Bookings'))

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken')
  
  if (!token) {
    return <Navigate to="/admin/login" replace />
  }
  
  return children
}

function App() {
  const location = useLocation()
  const { theme, initTheme } = useThemeStore()

  useEffect(() => {
    initTheme()
  }, [initTheme])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
  }, [theme])

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
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
            {/* НОВЫЙ РОУТ для страницы объекта */}
            <Route path="properties/:propertyId" element={
              <Suspense fallback={<LoadingScreen />}>
                <PropertyDetail />
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

          {/* Admin Login Route */}
          <Route path="/admin/login" element={
            <Suspense fallback={<LoadingScreen />}>
              <AdminLogin />
            </Suspense>
          } />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route path="dashboard" element={
              <Suspense fallback={<LoadingScreen />}>
                <AdminDashboard />
              </Suspense>
            } />
            
            {/* Properties Management */}
            <Route path="properties" element={
              <Suspense fallback={<LoadingScreen />}>
                <Properties />
              </Suspense>
            } />
            
            <Route path="properties/:propertyId/edit" element={
              <Suspense fallback={<LoadingScreen />}>
                <EditProperty />
              </Suspense>
            } />
            
            {/* Add Property */}
            <Route path="add-property" element={
              <Suspense fallback={<LoadingScreen />}>
                <AddProperty />
              </Suspense>
            } />

            {/* Bookings */}
            <Route path="bookings" element={
              <Suspense fallback={<LoadingScreen />}>
                <Bookings />
              </Suspense>
            } />
            
            {/* Settings */}
            <Route path="settings" element={
              <Suspense fallback={<LoadingScreen />}>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Настройки
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    В разработке...
                  </p>
                </div>
              </Suspense>
            } />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-9xl font-bold text-red-500">404</h1>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
                  Страница не найдена
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-2 mb-8">
                  Запрашиваемая страница не существует
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 
                           hover:from-red-600 hover:to-red-700 text-white rounded-lg
                           font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Вернуться на главную
                </button>
              </div>
            </div>
          } />
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
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}

export default App