import React from 'react'
import { motion } from 'framer-motion'
import { useDrag } from 'react-dnd'
import { 
  Zap, Smartphone, MousePointer, Send, Database, 
  Clock, User, Globe, Upload, MapPin
} from 'lucide-react'
import { TriggerType } from '@/types'

interface TriggerNodeItem {
  type: TriggerType
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  color: string
}

interface DraggableTriggerNodeProps {
  node: TriggerNodeItem
}

const DraggableTriggerNode: React.FC<DraggableTriggerNodeProps> = ({ node }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'workflow-trigger',
    item: {
      type: 'workflow-trigger',
      triggerType: node.type,
      name: node.name,
      description: node.description,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const IconComponent = node.icon

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-gray-300 hover:shadow-sm transition-all
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 ${node.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <IconComponent className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {node.name}
          </h4>
          <p className="text-xs text-gray-500 truncate">
            {node.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export const TriggerNodes: React.FC = () => {
  const triggerNodes: TriggerNodeItem[] = [
    {
      type: 'app_start',
      name: 'App Start',
      description: 'When the app launches',
      icon: Smartphone,
      category: 'App Events',
      color: 'bg-blue-500',
    },
    {
      type: 'button_click',
      name: 'Button Click',
      description: 'When a button is pressed',
      icon: MousePointer,
      category: 'User Interaction',
      color: 'bg-green-500',
    },
    {
      type: 'form_submit',
      name: 'Form Submit',
      description: 'When a form is submitted',
      icon: Send,
      category: 'User Interaction',
      color: 'bg-purple-500',
    },
    {
      type: 'data_change',
      name: 'Data Change',
      description: 'When data is modified',
      icon: Database,
      category: 'Data Events',
      color: 'bg-indigo-500',
    },
    {
      type: 'timer',
      name: 'Timer',
      description: 'At scheduled intervals',
      icon: Clock,
      category: 'Time Events',
      color: 'bg-orange-500',
    },
    {
      type: 'screen_load',
      name: 'Screen Load',
      description: 'When a screen is loaded',
      icon: Smartphone,
      category: 'App Events',
      color: 'bg-cyan-500',
    },
    {
      type: 'user_login',
      name: 'User Login',
      description: 'When user logs in',
      icon: User,
      category: 'User Events',
      color: 'bg-emerald-500',
    },
    {
      type: 'user_logout',
      name: 'User Logout',
      description: 'When user logs out',
      icon: User,
      category: 'User Events',
      color: 'bg-red-500',
    },
    {
      type: 'api_webhook',
      name: 'API Webhook',
      description: 'From external API calls',
      icon: Globe,
      category: 'External Events',
      color: 'bg-teal-500',
    },
    {
      type: 'file_upload',
      name: 'File Upload',
      description: 'When file is uploaded',
      icon: Upload,
      category: 'User Interaction',
      color: 'bg-pink-500',
    },
    {
      type: 'location_change',
      name: 'Location Change',
      description: 'When device location changes',
      icon: MapPin,
      category: 'Device Events',
      color: 'bg-amber-500',
    },
  ]

  const categories = Array.from(new Set(triggerNodes.map(node => node.category)))

  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Trigger Nodes
        </h4>
        <p className="text-xs text-gray-600 mb-4">
          Events that start your workflow
        </p>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h5 className="text-sm font-medium text-gray-700 mb-2">{category}</h5>
          <div className="space-y-2">
            {triggerNodes
              .filter(node => node.category === category)
              .map(node => (
                <DraggableTriggerNode key={node.type} node={node} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}