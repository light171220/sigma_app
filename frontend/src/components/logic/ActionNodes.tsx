import React from 'react'
import { motion } from 'framer-motion'
import { useDrag } from 'react-dnd'
import { 
  MousePointer, Database, Mail, Smartphone, Globe, 
  Clock, Calculator, FileText, Bell, Share
} from 'lucide-react'
import { NodeType } from '@/types'

interface ActionNodeItem {
  type: NodeType
  name: string
  description: string
  icon: React.ComponentType<any>
  category: string
  color: string
}

interface DraggableActionNodeProps {
  node: ActionNodeItem
}

const DraggableActionNode: React.FC<DraggableActionNodeProps> = ({ node }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'workflow-node',
    item: {
      type: 'workflow-node',
      nodeType: node.type,
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

export const ActionNodes: React.FC = () => {
  const actionNodes: ActionNodeItem[] = [
    {
      type: 'api_call',
      name: 'API Call',
      description: 'Make HTTP requests',
      icon: Globe,
      category: 'Integration',
      color: 'bg-green-500',
    },
    {
      type: 'database_query',
      name: 'Database Query',
      description: 'Query database records',
      icon: Database,
      category: 'Data',
      color: 'bg-indigo-500',
    },
    {
      type: 'send_email',
      name: 'Send Email',
      description: 'Send email notifications',
      icon: Mail,
      category: 'Communication',
      color: 'bg-red-500',
    },
    {
      type: 'push_notification',
      name: 'Push Notification',
      description: 'Send push notifications',
      icon: Bell,
      category: 'Communication',
      color: 'bg-orange-500',
    },
    {
      type: 'delay',
      name: 'Delay',
      description: 'Wait for specified time',
      icon: Clock,
      category: 'Control',
      color: 'bg-gray-500',
    },
    {
      type: 'data_transform',
      name: 'Transform Data',
      description: 'Process and transform data',
      icon: Calculator,
      category: 'Data',
      color: 'bg-purple-500',
    },
    {
      type: 'file_operation',
      name: 'File Operation',
      description: 'Read, write, or process files',
      icon: FileText,
      category: 'File',
      color: 'bg-blue-500',
    },
    {
      type: 'webhook',
      name: 'Webhook',
      description: 'Send webhook requests',
      icon: Share,
      category: 'Integration',
      color: 'bg-teal-500',
    },
  ]

  const categories = Array.from(new Set(actionNodes.map(node => node.category)))

  return (
    <div className="p-4 space-y-6">
      <div>
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <MousePointer className="w-4 h-4 mr-2" />
          Action Nodes
        </h4>
        <p className="text-xs text-gray-600 mb-4">
          Drag nodes to add actions to your workflow
        </p>
      </div>

      {categories.map(category => (
        <div key={category}>
          <h5 className="text-sm font-medium text-gray-700 mb-2">{category}</h5>
          <div className="space-y-2">
            {actionNodes
              .filter(node => node.category === category)
              .map(node => (
                <DraggableActionNode key={node.type} node={node} />
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}