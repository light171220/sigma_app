import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Rnd } from 'react-rnd'
import { Component } from '@/types'
import { useAppBuilder } from '@/hooks/useAppBuilder'

interface ComponentRendererProps {
  component: Component
  isSelected: boolean
  onSelect: () => void
  onInteraction?: (componentId: string, eventType: string, data?: any) => void
  previewMode?: boolean
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  component,
  isSelected,
  onSelect,
  onInteraction,
  previewMode = false,
}) => {
  const { updateComponent } = useAppBuilder()
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)

  const handleDragStop = (e: any, data: any) => {
    setIsDragging(false)
    updateComponent(component.id, {
      position: { x: data.x, y: data.y }
    })
  }

  const handleResizeStop = (e: any, direction: any, ref: any, delta: any, position: any) => {
    setIsResizing(false)
    updateComponent(component.id, {
      size: { 
        width: parseInt(ref.style.width), 
        height: parseInt(ref.style.height) 
      },
      position: { x: position.x, y: position.y }
    })
  }

  const handleComponentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (previewMode && onInteraction) {
      onInteraction(component.id, 'onPress')
    } else {
      onSelect()
    }
  }

  const renderComponentContent = () => {
    const { style, properties } = component

    const baseStyle = {
      width: '100%',
      height: '100%',
      backgroundColor: style.appearance.backgroundColor ? 
        `rgba(${style.appearance.backgroundColor.r}, ${style.appearance.backgroundColor.g}, ${style.appearance.backgroundColor.b}, ${style.appearance.backgroundColor.a || 1})` :
        'transparent',
      borderRadius: style.appearance.border?.radius || 0,
      border: style.appearance.border?.width ? 
        `${style.appearance.border.width}px ${style.appearance.border.style} rgba(${style.appearance.border.color.r}, ${style.appearance.border.color.g}, ${style.appearance.border.color.b}, ${style.appearance.border.color.a || 1})` :
        'none',
      padding: `${style.spacing.padding.top}px ${style.spacing.padding.right}px ${style.spacing.padding.bottom}px ${style.spacing.padding.left}px`,
      display: 'flex',
      flexDirection: style.layout.flexDirection,
      justifyContent: style.layout.justifyContent,
      alignItems: style.layout.alignItems,
      opacity: style.appearance.opacity,
      overflow: style.appearance.overflow,
    }

    switch (component.type) {
      case 'text':
        return (
          <div style={baseStyle}>
            <span
              style={{
                fontFamily: style.typography?.fontFamily || 'Inter',
                fontSize: `${style.typography?.fontSize || 16}px`,
                fontWeight: style.typography?.fontWeight || '400',
                color: style.typography?.color ? 
                  `rgba(${style.typography.color.r}, ${style.typography.color.g}, ${style.typography.color.b}, ${style.typography.color.a || 1})` :
                  '#000000',
                textAlign: style.typography?.textAlign || 'left',
                lineHeight: style.typography?.lineHeight || 1.5,
              }}
            >
              {properties.text || 'Text'}
            </span>
          </div>
        )

      case 'button':
        return (
          <button
            style={{
              ...baseStyle,
              cursor: 'pointer',
              fontFamily: style.typography?.fontFamily || 'Inter',
              fontSize: `${style.typography?.fontSize || 16}px`,
              fontWeight: style.typography?.fontWeight || '600',
              color: style.typography?.color ? 
                `rgba(${style.typography.color.r}, ${style.typography.color.g}, ${style.typography.color.b}, ${style.typography.color.a || 1})` :
                '#ffffff',
            }}
            disabled={properties.disabled}
          >
            {properties.loading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Loading...
              </div>
            ) : (
              properties.title || 'Button'
            )}
          </button>
        )

      case 'textInput':
        return (
          <input
            type={properties.type || 'text'}
            placeholder={properties.placeholder || 'Enter text...'}
            value={properties.value || ''}
            disabled={properties.disabled}
            readOnly={properties.readOnly}
            style={{
              ...baseStyle,
              fontFamily: style.typography?.fontFamily || 'Inter',
              fontSize: `${style.typography?.fontSize || 16}px`,
              color: style.typography?.color ? 
                `rgba(${style.typography.color.r}, ${style.typography.color.g}, ${style.typography.color.b}, ${style.typography.color.a || 1})` :
                '#000000',
            }}
          />
        )

      case 'image':
        return (
          <div style={baseStyle}>
            <img
              src={properties.source || 'https://via.placeholder.com/300x200'}
              alt={properties.alt || 'Image'}
              style={{
                width: '100%',
                height: '100%',
                objectFit: properties.resizeMode || 'cover',
                borderRadius: 'inherit',
              }}
            />
          </div>
        )

      case 'container':
        return (
          <div style={baseStyle}>
            {component.children?.map(childId => (
              <div key={childId} className="child-component">
                Child Component
              </div>
            ))}
          </div>
        )

      default:
        return (
          <div style={baseStyle}>
            <div className="flex items-center justify-center h-full text-gray-400">
              <span className="text-sm">{component.type}</span>
            </div>
          </div>
        )
    }
  }

  if (previewMode) {
    return (
      <div
        style={{
          position: 'absolute',
          left: component.position.x,
          top: component.position.y,
          width: component.size.width,
          height: component.size.height,
          transform: `translate(${component.style.effects.transform.translateX}px, ${component.style.effects.transform.translateY}px) scale(${component.style.effects.transform.scaleX}, ${component.style.effects.transform.scaleY}) rotate(${component.style.effects.transform.rotate}deg)`,
          boxShadow: component.style.effects.shadow ? 
            `${component.style.effects.shadow.offsetX}px ${component.style.effects.shadow.offsetY}px ${component.style.effects.shadow.blur}px ${component.style.effects.shadow.spread}px rgba(${component.style.effects.shadow.color.r}, ${component.style.effects.shadow.color.g}, ${component.style.effects.shadow.color.b}, ${component.style.effects.shadow.color.a || 1})` :
            'none',
        }}
        onClick={handleComponentClick}
      >
        {renderComponentContent()}
      </div>
    )
  }

  return (
    <Rnd
      position={{ x: component.position.x, y: component.position.y }}
      size={{ width: component.size.width, height: component.size.height }}
      onDragStart={() => setIsDragging(true)}
      onDragStop={handleDragStop}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={handleResizeStop}
      bounds="parent"
      enableResizing={isSelected}
      disableDragging={component.locked}
      className={`
        ${isSelected ? 'component-selected' : ''}
        ${isDragging || isResizing ? 'z-50' : 'z-10'}
      `}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`
          w-full h-full relative
          ${isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
          ${isDragging ? 'shadow-lg' : ''}
        `}
        onClick={handleComponentClick}
        style={{
          transform: `translate(${component.style.effects.transform.translateX}px, ${component.style.effects.transform.translateY}px) scale(${component.style.effects.transform.scaleX}, ${component.style.effects.transform.scaleY}) rotate(${component.style.effects.transform.rotate}deg)`,
          boxShadow: component.style.effects.shadow ? 
            `${component.style.effects.shadow.offsetX}px ${component.style.effects.shadow.offsetY}px ${component.style.effects.shadow.blur}px ${component.style.effects.shadow.spread}px rgba(${component.style.effects.shadow.color.r}, ${component.style.effects.shadow.color.g}, ${component.style.effects.shadow.color.b}, ${component.style.effects.shadow.color.a || 1})` :
            'none',
        }}
      >
        {renderComponentContent()}

        {isSelected && (
          <div className="absolute -top-6 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {component.name}
          </div>
        )}

        {isSelected && (
          <>
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-600 rounded-full" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-600 rounded-full" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
          </>
        )}
      </motion.div>
    </Rnd>
  )
}