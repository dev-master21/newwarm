// frontend/src/api/axios.js
import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Добавляем токен если он есть
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Обработка ошибок
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401:
          // Неавторизован
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
          if (window.location.pathname.startsWith('/admin') && 
              window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login'
          }
          toast.error('Сессия истекла. Пожалуйста, войдите снова.')
          break

        case 403:
          toast.error('Недостаточно прав доступа')
          break

        case 404:
          toast.error(data.message || 'Ресурс не найден')
          break

        case 500:
          toast.error('Ошибка сервера. Попробуйте позже.')
          break

        default:
          toast.error(data.message || 'Произошла ошибка')
      }
    } else if (error.request) {
      toast.error('Сервер не отвечает. Проверьте подключение к интернету.')
    } else {
      toast.error('Произошла ошибка при отправке запроса')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance