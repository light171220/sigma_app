import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Play, Settings, Users, Calendar, Smartphone } from 'lucide-react'
import { App } from '@/types'
import { Button } from '@/components/common/Button'

interface AppCardProps {
  app: App
  viewMode: 'grid' | 'list'
}

export const AppCard: React.FC<AppCardProps> = ({ app, viewMode }) => {
  const navigate = useNavigate()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-50'
      case 'draft': return 'text-gray-600 bg-gray-50'
      case 'building': return 'text-blue-600 bg-blue-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return 'text-blue-600 bg-blue-50'
      case 'productivity': return 'text-green-600 bg-green-50'
      case 'finance': return 'text-yellow-600 bg-yellow-50'
      case 'hr': return 'text-purple-600 bg-purple-50'
      case 'service': return 'text-indigo-600 bg-indigo-50'
      case 'education': return 'text-pink-600 bg-pink-50'
      case 'healthcare': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
        onClick={() => navigate(`/apps/${app.id}/builder`)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
              <p className="text-sm text-gray-600">{app.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                {app.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(app.category)}`}>
                {app.category}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{app.collaborators.length}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
            </div>
            
            <Button variant="ghost" size="sm" icon={MoreVertical} />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/apps/${app.id}/builder`)}
    >
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Smartphone className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {app.name}
          </h3>
          <Button variant="ghost" size="sm" icon={MoreVertical} />
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {app.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
              {app.status}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(app.category)}`}>
              {app.category}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{app.collaborators.length} collaborators</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="mt-4 flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            icon={Play}
            fullWidth
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/apps/${app.id}/preview`)
            }}
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Settings}
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/apps/${app.id}/settings`)
            }}
          />
        </div>
      </div>
    </motion.div>
  )
}