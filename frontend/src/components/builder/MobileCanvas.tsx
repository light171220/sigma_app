import React from 'react'
import { useDrop } from 'react-dnd'
import { Screen, Device } from '@/types'
import { ComponentRenderer } from './ComponentRenderer'
import { useAppBuilder } from '@/hooks/useAppBuilder'
import { getMobileComponentDefaults, getComponentSize } from '@/utils/mobileComponents'

interface MobileCanvasProps {
  device: Device
  screen: Screen | null
  showGrid?: boolean
}

export const MobileCanvas: React.FC<MobileCanvasProps> = ({
  device,
  screen,
  showGrid = true,
}) => {
  const { selectedComponent, selectComponent, addComponent } = useAppBuilder()

  const canvasRef = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset()
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect()
        const x = offset.x - canvasRect.left
        const y = offset.y - canvasRect.top

        const size = getComponentSize(item.componentType)
        const defaults = getMobileComponentDefaults(item.componentType)

        addComponent({
          type: item.componentType,
          name: `${item.componentType}_${Date.now()}`,
          position: { x, y },
          size,
          properties: defaults.properties,
          style: defaults.style,
          events: {},
          conditions: {},
          visible: true,
          locked: false,
        })
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectComponent(null)
    }
  }

  return (
    <div className="relative">
      <div className="device-mockup" style={{ width: device.width / 2, height: device.height / 2 }}>
        <div
          ref={node => {
            canvasRef.current = node;
            drop(node);
          }}
          onClick={handleCanvasClick}
          className={`mobile-screen relative overflow-hidden ${isOver ? 'bg-blue-50' : ''}`}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: screen?.settings.backgroundColor ? 
              `rgba(${screen.settings.backgroundColor.r}, ${screen.settings.backgroundColor.g}, ${screen.settings.backgroundColor.b}, ${screen.settings.backgroundColor.a || 1})` :
              '#ffffff',
            backgroundImage: showGrid ? `
              linear-gradient(rgba(156, 163, 175, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(156, 163, 175, 0.2) 1px, transparent 1px)
            ` : 'none',
            backgroundSize: showGrid ? '20px 20px' : 'auto',
          }}
        >
          {screen?.components.map((component) => (
            <ComponentRenderer
              key={component.id}
              component={component}
              isSelected={selectedComponent?.id === component.id}
              onSelect={() => selectComponent(component.id)}
            />
          ))}
          
          {(!screen || screen.components.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <p className="text-sm">
                  {screen ? 'Drag components here' : 'No screen selected'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}