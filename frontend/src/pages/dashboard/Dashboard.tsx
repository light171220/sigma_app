import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Grid, List, Filter, Smartphone, Users, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { AppCard } from './AppCard'
import { NewAppModal } from './NewAppModal'
import { useAuth } from '@/hooks/useAuth'
import { App } from '@/types'
import { apiClient } from '@/utils/apiClient'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showNewAppModal, setShowNewAppModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    loadApps()
  }, [])

  const loadApps = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<App[]>('/apps')
      if (response.success && response.data) {
        setApps(response.data)
      }
    } catch (error) {
      console.error('Failed to load apps:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = [
    {
      label: 'Total Apps',
      value: apps.length,
      icon: Smartphone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Published Apps',
      value: apps.filter(app => app.status === 'published').length,
      icon: Zap,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Collaborators',
      value: apps.reduce((total, app) => total + app.collaborators.length, 0),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'This Month',
      value: apps.filter(app => {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return new Date(app.createdAt) > monthAgo
      }).length,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  const categories = [
    { value: 'all', label: 'All Apps' },
    { value: 'business', label: 'Business' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'HR' },
    { value: 'service', label: 'Service' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Sigma</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome back, {user?.firstName}!
              </span>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowNewAppModal(true)}
              >
                New App
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h1 className="text-2xl font-bold text-gray-900">My Apps</h1>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search apps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>

                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredApps.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredApps.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AppCard app={app} viewMode={viewMode} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedCategory !== 'all' ? 'No apps found' : 'No apps yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || selectedCategory !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by creating your first mobile app.'
                  }
                </p>
                {!searchQuery && selectedCategory === 'all' && (
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setShowNewAppModal(true)}
                  >
                    Create Your First App
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showNewAppModal}
        onClose={() => setShowNewAppModal(false)}
        title="Create New App"
        size="lg"
      >
        <NewAppModal
          onClose={() => setShowNewAppModal(false)}
          onSuccess={loadApps}
        />
      </Modal>
    </div>
  )
}

export default Dashboard