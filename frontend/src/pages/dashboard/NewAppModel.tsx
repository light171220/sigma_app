import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Template, Zap, Users, DollarSign, GraduationCap, Heart, Building } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { AppCreateSchema, AppCreateFormData } from '@/utils/validationSchemas'
import { getAllBusinessTemplates } from '@/utils/businessTemplates'
import { apiClient } from '@/utils/apiClient'

interface NewAppModalProps {
  onClose: () => void
  onSuccess: () => void
}

export const NewAppModal: React.FC<NewAppModalProps> = ({ onClose, onSuccess }) => {
  const navigate = useNavigate()
  const [step, setStep] = useState<'method' | 'template' | 'custom'>('method')
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AppCreateFormData>({
    resolver: zodResolver(AppCreateSchema),
  })

  const templates = getAllBusinessTemplates()

  const categories = [
    { value: 'business', label: 'Business', icon: Building, color: 'text-blue-600 bg-blue-50' },
    { value: 'productivity', label: 'Productivity', icon: Zap, color: 'text-green-600 bg-green-50' },
    { value: 'finance', label: 'Finance', icon: DollarSign, color: 'text-yellow-600 bg-yellow-50' },
    { value: 'hr', label: 'HR', icon: Users, color: 'text-purple-600 bg-purple-50' },
    { value: 'education', label: 'Education', icon: GraduationCap, color: 'text-pink-600 bg-pink-50' },
    { value: 'healthcare', label: 'Healthcare', icon: Heart, color: 'text-red-600 bg-red-50' },
  ]

  const onSubmit = async (data: AppCreateFormData) => {
    try {
      setLoading(true)
      
      const payload = {
        ...data,
        templateId: selectedTemplate,
      }

      const response = await apiClient.post('/apps', payload)
      
      if (response.success && response.data) {
        onSuccess()
        onClose()
        navigate(`/apps/${response.data.id}/builder`)
      }
    } catch (error) {
      console.error('Failed to create app:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setValue('name', template.name)
      setValue('description', template.description)
      setValue('category', template.category)
      setStep('custom')
    }
  }

  if (step === 'method') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            How would you like to start?
          </h3>
          <p className="text-gray-600">
            Choose a starting point for your new mobile app
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('template')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Template className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Use Template</h4>
                <p className="text-sm text-gray-600">Start with a pre-built app</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ready-to-use components</li>
              <li>• Pre-configured database</li>
              <li>• Business logic included</li>
            </ul>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep('custom')}
            className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Start from Scratch</h4>
                <p className="text-sm text-gray-600">Build your own app</p>
              </div>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Complete creative control</li>
              <li>• Custom design and layout</li>
              <li>• Build exactly what you need</li>
            </ul>
          </motion.button>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (step === 'template') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Choose a Template
          </h3>
          <p className="text-gray-600">
            Select a pre-built template to get started quickly
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <motion.button
              key={template.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => handleTemplateSelect(template.id)}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      categories.find(c => c.value === template.category)?.color || 'text-gray-600 bg-gray-50'
                    }`}>
                      {template.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Difficulty: {template.difficulty}</span>
                    <span>Setup time: {template.estimatedTime}min</span>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setStep('method')}>
            Back
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          App Details
        </h3>
        <p className="text-gray-600">
          {selectedTemplate ? 'Customize your template' : 'Create your app from scratch'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            App Name
          </label>
          <input
            {...register('name')}
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Awesome App"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what your app does..."
          />
          {errors.description && (
            <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {categories.map((category) => (
              <label key={category.value} className="cursor-pointer">
                <input
                  {...register('category')}
                  type="radio"
                  value={category.value}
                  className="sr-only"
                />
                <div className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-2">
                    <category.icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {category.label}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="secondary" 
          onClick={() => selectedTemplate ? setStep('template') : setStep('method')}
        >
          Back
        </Button>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" color="white" /> : 'Create App'}
          </Button>
        </div>
      </div>
    </form>
  )
}