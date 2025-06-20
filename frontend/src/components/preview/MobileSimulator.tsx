import React, { useState, useRef } from 'react'
import { Wifi, Battery, Signal } from 'lucide-react'
import { App, Screen, Device, DeviceOrientation } from '@/types'
import { ComponentRenderer } from '@/components/builder/ComponentRenderer'

interface MobileSimulatorProps {
  app: App
  screen: Screen | null
  device: Device
  orientation: DeviceOrientation
  zoom: number
  showFrame: boolean
  showStatusBar: boolean
  onScreenChange: (screenId: string) => void
  onInteraction: (interaction: any) => void
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  screen,
  device,
  orientation,
  zoom,
  showFrame,
  showStatusBar,
  onScreenChange,
  onInteraction,
}) => {
  const [currentTime] = useState(new Date())
  const simulatorRef = useRef<HTMLDivElement>(null)

  const isLandscape = orientation === 'landscape'
  const screenWidth = isLandscape ? device.height : device.width
  const screenHeight = isLandscape ? device.width : device.height

  const StatusBar: React.FC = () => (
    <div className="h-6 bg-black flex items-center justify-between px-4 text-white text-xs font-medium">
      <div className="flex items-center space-x-1">
        <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <Battery className="w-4 h-3" />
        <span className="text-xs">100%</span>
      </div>
    </div>
  )

  const DynamicIsland: React.FC = () => (
    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-full flex items-center justify-center z-50">
      <div className="w-4 h-4 bg-gray-700 rounded-full" />
    </div>
  )

  const HomeIndicator: React.FC = () => (
    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60" />
  )

  const handleComponentInteraction = (componentId: string, eventType: string, data?: any) => {
    onInteraction({
      type: 'tap',
      screenId: screen?.id || '',
      componentId,
      data: { eventType, ...data },
    })

    const component = screen?.components.find(c => c.id === componentId)
    if (!component) return

    component.events[eventType]?.forEach(event => {
      switch (event.action.type) {
        case 'navigate':
          const targetScreenId = event.action.parameters.screenId
          if (targetScreenId) {
            onScreenChange(targetScreenId)
          }
          break
        case 'showModal':
          console.log('Show modal:', event.action.parameters)
          break
        case 'showToast':
          console.log('Show toast:', event.action.parameters.message)
          break
        default:
          console.log('Unhandled action:', event.action.type)
      }
    })
  }

  const simulatorStyle = {
    transform: `scale(${zoom})`,
    transformOrigin: 'center center',
  }

  if (showFrame) {
    return (
      <div ref={simulatorRef} style={simulatorStyle}>
        <div 
          className={`relative bg-black rounded-3xl p-2 shadow-2xl ${
            device.type === 'tablet' ? 'w-96 h-[28rem]' : 'w-80 h-[36rem]'
          }`}
          style={{
            width: (screenWidth / 2) + 16,
            height: (screenHeight / 2) + 16,
          }}
        >
          {device.type === 'iphone' && <DynamicIsland />}
          
          <div
            className="w-full h-full bg-black rounded-2xl overflow-hidden relative"
            style={{
              backgroundColor: screen?.settings.backgroundColor ? 
                `rgba(${screen.settings.backgroundColor.r}, ${screen.settings.backgroundColor.g}, ${screen.settings.backgroundColor.b}, ${screen.settings.backgroundColor.a || 1})` :
                '#ffffff'
            }}
          >
            {showStatusBar && <StatusBar />}
            
            <div 
              className="flex-1 relative overflow-hidden"
              style={{
                height: showStatusBar ? 'calc(100% - 24px)' : '100%',
                backgroundColor: screen?.settings.backgroundColor ? 
                  `rgba(${screen.settings.backgroundColor.r}, ${screen.settings.backgroundColor.g}, ${screen.settings.backgroundColor.b}, ${screen.settings.backgroundColor.a || 1})` :
                  '#ffffff'
              }}
            >
              {screen?.components.map((component) => (
                <ComponentRenderer
                  key={component.id}
                  component={component}
                  isSelected={false}
                  onSelect={() => {}}
                  onInteraction={handleComponentInteraction}
                  previewMode={true}
                />
              ))}

              {(!screen || screen.components.length === 0) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {screen ? 'Empty Screen' : 'No Screen Selected'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {screen 
                        ? 'This screen has no components yet'
                        : 'Select a screen to preview'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {device.homeIndicatorHeight && <HomeIndicator />}
          </div>
        </div>

        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-xs text-gray-400">{device.name}</p>
          <p className="text-xs text-gray-500">
            {screenWidth} × {screenHeight}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={simulatorRef} style={simulatorStyle}>
      <div
        className="bg-white border border-gray-300 shadow-lg"
        style={{
          width: screenWidth / 2,
          height: screenHeight / 2,
          backgroundColor: screen?.settings.backgroundColor ? 
            `rgba(${screen.settings.backgroundColor.r}, ${screen.settings.backgroundColor.g}, ${screen.settings.backgroundColor.b}, ${screen.settings.backgroundColor.a || 1})` :
            '#ffffff'
        }}
      >
        {showStatusBar && <StatusBar />}
        
        <div 
          className="flex-1 relative overflow-hidden"
          style={{
            height: showStatusBar ? 'calc(100% - 24px)' : '100%',
          }}
        >
          {screen?.components.map((component) => (
            <ComponentRenderer
              key={component.id}
              component={component}
              isSelected={false}
              onSelect={() => {}}
              onInteraction={handleComponentInteraction}
              previewMode={true}
            />
          ))}

          {(!screen || screen.components.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {screen ? 'Empty Screen' : 'No Screen Selected'}
                </h3>
                <p className="text-sm text-gray-500">
                  {screen 
                    ? 'This screen has no components yet'
                    : 'Select a screen to preview'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}