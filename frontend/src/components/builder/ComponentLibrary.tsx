import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useDrag } from 'react-dnd'
import { Search, Grid, Type, MousePointer, Image, Database, Smartphone, Settings } from 'lucide-react'
import { ComponentLibraryItem } from '@/types'
import { COMPONENT_LIBRARY } from '@/utils/constants'

interface DraggableComponentProps {
  component: ComponentLibraryItem
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { 
      type: 'component',
      componentType: component.type,
      defaultProperties: component.defaultProperties,
      defaultStyle: component.defaultStyle,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      Type,
      MousePointer,
      Image,
      Grid,
      Database,
      Settings,
    }
    return icons[iconName] || Type
  }

  const IconComponent = getIconComponent(component.icon)

  return (
    <motion.div
      ref={drag}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-blue-300 hover:shadow-sm transition-all
        ${isDragging ? 'opacity-50' : ''}
        ${component.premium ? 'ring-1 ring-yellow-300' : ''}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <IconComponent className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {component.name}
            </h4>
            {component.premium && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                Pro
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {component.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export const ComponentLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { value: 'all', label: 'All', icon: Grid },
    { value: 'layout', label: 'Layout', icon: Grid },
    { value: 'input', label: 'Input', icon: MousePointer },
    { value: 'display', label: 'Display', icon: Type },
    { value: 'media', label: 'Media', icon: Image },
    { value: 'navigation', label: 'Navigation', icon: Smartphone },
    { value: 'business', label: 'Business', icon: Database },
  ]

  const filteredComponents = COMPONENT_LIBRARY.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedComponents = categories.reduce((acc, category) => {
    if (category.value === 'all') return acc
    
    acc[category.value] = filteredComponents.filter(
      component => component.category === category.value
    )
    return acc
  }, {} as Record<string, ComponentLibraryItem[]>)

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="flex flex-wrap gap-1">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => setSelectedCategory(category.value)}
            className={`
              flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-md transition-colors
              ${selectedCategory === category.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <category.icon className="w-3 h-3" />
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto scrollbar-thin">
        {selectedCategory === 'all' ? (
          Object.entries(groupedComponents).map(([categoryKey, components]) => {
            if (components.length === 0) return null
            
            const category = categories.find(c => c.value === categoryKey)
            if (!category) return null

            return (
              <div key={categoryKey}>
                <div className="flex items-center space-x-2 mb-3">
                  <category.icon className="w-4 h-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-900 capitalize">
                    {category.label}
                  </h4>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-2">
                  {components.map((component) => (
                    <DraggableComponent key={component.id} component={component} />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="space-y-2">
            {filteredComponents.map((component) => (
              <DraggableComponent key={component.id} component={component} />
            ))}
          </div>
        )}

        {filteredComponents.length === 0 && (
          <div className="text-center py-8">
            <Grid className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchQuery ? 'No components found' : 'No components in this category'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-blue-600 hover:text-blue-500 mt-1"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Smartphone className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-900">Pro Tip</p>
              <p className="text-xs text-blue-700 mt-1">
                Drag components directly onto the canvas to add them to your app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}