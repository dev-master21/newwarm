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
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
const Shortlist = lazy(() => import('./pages/Shortlist'))

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AddProperty = lazy(() => import('./pages/admin/AddProperty'))

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

  // Check if current route is admin
  const isAdminRoute = location.pathname.startsWith('/admin')

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
            <Route path="dashboard" element={
              <Suspense fallback={<LoadingScreen />}>
                <AdminDashboard />
              </Suspense>
            } />
            <Route path="add-property" element={
              <Suspense fallback={<LoadingScreen />}>
                <AddProperty />
              </Suspense>
            } />
            <Route path="properties" element={
              <Suspense fallback={<LoadingScreen />}>
                <div className="text-center py-20">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Список объектов
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    В разработке...
                  </p>
                </div>
              </Suspense>
            } />
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