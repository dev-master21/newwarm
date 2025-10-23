// frontend/src/pages/admin/AddProperty.jsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { HiArrowLeft, HiArrowRight, HiCheckCircle } from 'react-icons/hi'
import { usePropertyFormStore } from '../../store/propertyFormStore'
import propertyApi from '../../api/propertyApi'
import ProgressBar from '../../components/admin/ProgressBar'
import toast from 'react-hot-toast'

// Import all steps
import Step1DealType from '../../components/admin/propertyForm/Step1DealType'
import Step2PropertyType from '../../components/admin/propertyForm/Step2PropertyType'
import Step3Location from '../../components/admin/propertyForm/Step3Location'
import Step4Specifications from '../../components/admin/propertyForm/Step4Specifications'
import Step5AdditionalInfo from '../../components/admin/propertyForm/Step5AdditionalInfo'
import Step6Ownership from '../../components/admin/propertyForm/Step6Ownership'
import Step7Features from '../../components/admin/propertyForm/Step7Features'
import Step8Description from '../../components/admin/propertyForm/Step8Description'
import Step9Pricing from '../../components/admin/propertyForm/Step9Pricing'
import Step10Calendar from '../../components/admin/propertyForm/Step10Calendar'

const AddProperty = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { 
    currentStep, 
    totalSteps, 
    nextStep, 
    previousStep, 
    validateStep, 
    formErrors,
    formData,
    resetForm
  } = usePropertyFormStore()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const handleNext = () => {
    const isValid = validateStep(currentStep)
    
    if (!isValid) {
      toast.error(t('admin.addProperty.validation.fillAllRequired'))
      
      setTimeout(() => {
        const invalidFields = document.querySelectorAll('.border-red-500')
        invalidFields.forEach((field, index) => {
          setTimeout(() => {
            field.classList.add('animate-shake')
            setTimeout(() => {
              field.classList.remove('animate-shake')
            }, 500)
          }, index * 100)
        })
      }, 100)
      
      return
    }
    
    if (currentStep === totalSteps) {
      handleSubmit()
    } else {
      nextStep()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    previousStep()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

    const handleSubmit = async () => {
      const isValid = validateStep(currentStep)
    
      if (!isValid) {
        toast.error(t('admin.addProperty.validation.fillAllRequired'))
        return
      }
  
      // Модальное окно с прогрессом
      let progressToast = null
      let uploadProgress = {
        property: false,
        photos: 0,
        totalPhotos: 0,
        currentCategory: '',
        floorPlan: false
      }
  
      const updateProgressToast = () => {
        const messages = []
        
        if (uploadProgress.property) {
          messages.push('✅ Объект создан')
        } else {
          messages.push('⏳ Создание объекта...')
        }
        
        if (uploadProgress.totalPhotos > 0) {
          messages.push(
            `📸 Загружено фото: ${uploadProgress.photos}/${uploadProgress.totalPhotos}` +
            (uploadProgress.currentCategory ? ` (${uploadProgress.currentCategory})` : '')
          )
        }
        
        if (formData.floorPlan) {
          if (uploadProgress.floorPlan) {
            messages.push('✅ Планировка загружена')
          } else if (uploadProgress.property) {
            messages.push('⏳ Загрузка планировки...')
          }
        }
        
        if (progressToast) {
          toast.dismiss(progressToast)
        }
        
        progressToast = toast.loading(
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <div key={i} className="text-sm">{msg}</div>
            ))}
          </div>,
          {
            duration: Infinity,
            style: {
              minWidth: '300px'
            }
          }
        )
      }
  
      try {
        updateProgressToast()
    
        // Подготовка данных объекта
        const propertyData = {
          dealType: formData.dealType,
          propertyType: formData.propertyType,
          region: formData.region,
          address: formData.address,
          googleMapsLink: formData.googleMapsLink,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          propertyNumber: formData.propertyNumber,
          bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
          bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
          indoorArea: formData.indoorArea ? parseFloat(formData.indoorArea) : null,
          outdoorArea: formData.outdoorArea ? parseFloat(formData.outdoorArea) : null,
          plotSize: formData.plotSize ? parseFloat(formData.plotSize) : null,
          floors: formData.floors ? parseInt(formData.floors) : null,
          floor: formData.floor ? parseInt(formData.floor) : null,
          penthouseFloors: formData.penthouseFloors ? parseInt(formData.penthouseFloors) : null,
          constructionYear: formData.constructionYear ? parseInt(formData.constructionYear) : null,
          constructionMonth: formData.constructionMonth ? parseInt(formData.constructionMonth) : null,
          furnitureStatus: formData.furnitureStatus || null,
          parkingSpaces: formData.parkingSpaces ? parseInt(formData.parkingSpaces) : null,
          petsAllowed: formData.petsAllowed || null,
          petsCustom: formData.petsCustom || null,
          buildingOwnership: formData.buildingOwnership || null,
          landOwnership: formData.landOwnership || null,
          ownershipType: formData.ownershipType || null,
          propertyFeatures: formData.propertyFeatures || [],
          outdoorFeatures: formData.outdoorFeatures || [],
          rentalFeatures: formData.rentalFeatures || [],
          locationFeatures: formData.locationFeatures || [],
          views: formData.views || [],
          renovationDates: formData.renovationDates || {},
          propertyName: formData.propertyName || {},
          description: formData.description || {},
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
          minimumNights: formData.minimumNights ? parseInt(formData.minimumNights) : null,
          seasonalPricing: (formData.seasonalPricing || []).map(period => ({
            seasonType: period.seasonType,
            startDate: period.startDate,
            endDate: period.endDate,
            pricePerNight: parseFloat(period.pricePerNight),
            minimumNights: parseInt(period.minimumNights)
          })),
          icsCalendarUrl: formData.icsCalendarUrl || null,
          status: 'published'
        }
    
        console.log('📤 Отправка данных на сервер:', propertyData)
    
        // Создание объекта
        const response = await propertyApi.createProperty(propertyData)
        console.log('✅ Ответ от сервера:', response)
    
        if (response.success) {
          const propertyId = response.data.propertyId
          uploadProgress.property = true
          updateProgressToast()
        
          console.log(`🆔 ID созданного объекта: ${propertyId}`)
        
          // Загрузка фотографий с прогрессом
          if (formData.photos && formData.photos.length > 0) {
            console.log(`📸 Начинается загрузка ${formData.photos.length} фотографий...`)
            
            // Группируем фото по категориям
            const photosByCategory = {}
            formData.photos.forEach(photo => {
              if (photo && photo.file) {
                const category = photo.category || 'general'
                if (!photosByCategory[category]) {
                  photosByCategory[category] = []
                }
                photosByCategory[category].push(photo.file)
              }
            })
            
            uploadProgress.totalPhotos = formData.photos.length
            let uploadedCount = 0
            
            // Загружаем фото по категориям
            for (const [category, files] of Object.entries(photosByCategory)) {
              uploadProgress.currentCategory = category
              updateProgressToast()
            
              try {
                console.log(`📤 Загрузка ${files.length} фото в категорию "${category}"...`)
                
                await propertyApi.uploadPhotos(propertyId, files, category, (progress) => {
                  console.log(`📊 Прогресс загрузки ${category}: ${progress}%`)
                })
                
                uploadedCount += files.length
                uploadProgress.photos = uploadedCount
                updateProgressToast()
                
                console.log(`✅ Загружено ${files.length} фото в категорию "${category}"`)
              } catch (photoError) {
                console.error(`❌ Ошибка загрузки фото (${category}):`, photoError)
                toast.error(`Ошибка загрузки фото в категории "${category}"`)
              }
            }
            
            console.log(`✅ Все фотографии загружены: ${uploadedCount}/${formData.photos.length}`)
          }
          
          // Загружаем планировку
          if (formData.floorPlan && formData.floorPlan.file) {
            console.log('📋 Загрузка планировки...')
            updateProgressToast()
            
            try {
              await propertyApi.uploadFloorPlan(propertyId, formData.floorPlan.file, (progress) => {
                console.log(`📊 Прогресс загрузки планировки: ${progress}%`)
              })
              
              uploadProgress.floorPlan = true
              updateProgressToast()
              
              console.log('✅ Планировка загружена')
            } catch (floorPlanError) {
              console.error('❌ Ошибка загрузки планировки:', floorPlanError)
              toast.error('Ошибка загрузки планировки')
            }
          }
          
          // Закрываем прогресс и показываем успех
          if (progressToast) {
            toast.dismiss(progressToast)
          }
          
          toast.success(t('admin.addProperty.success'), {
            duration: 4000,
            icon: '🎉'
          })
          
          console.log('✅ Объект успешно создан!')
          
          // Сброс формы и переход
          resetForm()
          setTimeout(() => {
            navigate(`/admin/properties/${propertyId}/edit`)
          }, 1000)
        }
      } catch (error) {
        console.error('❌ Ошибка создания объекта:', error)
        
        if (progressToast) {
          toast.dismiss(progressToast)
        }
        
        if (error.code === 'ECONNABORTED') {
          toast.error('Превышено время ожидания. Попробуйте загрузить меньше файлов за раз.', {
            duration: 6000
          })
        } else {
          toast.error(error.response?.data?.message || t('admin.addProperty.error'), {
            duration: 6000
          })
        }
      }
    }

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1DealType />
      case 2: return <Step2PropertyType />
      case 3: return <Step3Location />
      case 4: return <Step4Specifications />
      case 5: return <Step5AdditionalInfo />
      case 6: return <Step6Ownership />
      case 7: return <Step7Features />
      case 8: return <Step8Description />
      case 9: return <Step9Pricing />
      case 10: return <Step10Calendar />
      default: return <Step1DealType />
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t('admin.addProperty.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('admin.addProperty.subtitle')}
        </p>
      </div>

      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-8 gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 px-6 py-3 
                   bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                   text-gray-700 dark:text-gray-300 font-medium rounded-lg
                   transition-all disabled:opacity-50 disabled:cursor-not-allowed
                   transform hover:scale-105 active:scale-95"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>{t('common.back')}</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center space-x-2 px-6 py-3 
                   bg-gradient-to-r from-[#DC2626] to-[#EF4444]
                   hover:from-[#B91C1C] hover:to-[#DC2626]
                   text-white font-medium rounded-lg transition-all
                   transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <span>{currentStep === totalSteps ? t('common.finish') : t('common.next')}</span>
          {currentStep === totalSteps ? (
            <HiCheckCircle className="w-5 h-5" />
          ) : (
            <HiArrowRight className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}

export default AddProperty