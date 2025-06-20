import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, RotateCcw, Download, Settings } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { DeviceSelector } from '@/components/preview/DeviceSelector'
import { MobileSimulator } from '@/components/preview/MobileSimulator'
import { useAppBuilder } from '@/hooks/useAppBuilder'
import { usePreview } from '@/hooks/usePreview'
import { DEVICES } from '@/utils/constants'

const Preview: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentApp, screens, loadApp, isLoading } = useAppBuilder()
  const {
    selectedDevice,
    currentScreen,
    orientation,
    zoom,
    setSelectedDevice,
    setOrientation,
    setZoom,
    navigateToScreen,
    goBack,
    goForward,
    recordInteraction,
    exportInteractions,
  } = usePreview()

  const [currentScreenId, setCurrentScreenId] = useState<string>('')
  const [showFrame, setShowFrame] = useState(true)
  const [showStatusBar, setShowStatusBar] = useState(true)

  useEffect(() => {
    if (id) {
      loadApp(id)
    }
  }, [id, loadApp])

  useEffect(() => {
    if (screens.length > 0 && !currentScreenId) {
      const homeScreen = screens.find(s => s.isHome) || screens[0]
      setCurrentScreenId(homeScreen.id)
    }
  }, [screens, currentScreenId])

  const handleScreenChange = (screenId: string) => {
    setCurrentScreenId(screenId)
    navigateToScreen(screenId)
  }

  const handleInteraction = (interaction: any) => {
    recordInteraction(interaction)
    
    if (interaction.type === 'navigation' && interaction.data.targetScreen) {
      handleScreenChange(interaction.data.targetScreen)
    }
  }

  const handleExportInteractions = () => {
    const data = exportInteractions()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentApp?.name || 'app'}-interactions.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const device = DEVICES.find(d => d.id === selectedDevice) || DEVICES[0]
  const screen = screens.find(s => s.id === currentScreenId) || null

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!currentApp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">App not found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate(`/apps/${id}/builder`)}
              className="text-gray-300 hover:text-white"
            />
            
            <div className="text-white">
              <h1 className="text-lg font-semibold">{currentApp.name}</h1>
              <p className="text-sm text-gray-400">Preview Mode</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DeviceSelector
              selectedDevice={selectedDevice}
              onDeviceChange={setSelectedDevice}
            />

            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setOrientation('portrait')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  orientation === 'portrait'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Portrait
              </button>
              <button
                onClick={() => setOrientation('landscape')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  orientation === 'landscape'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Landscape
              </button>
            </div>

            <div className="flex items-center bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                className="px-2 py-1 text-gray-300 hover:text-white"
              >
                -
              </button>
              <span className="px-3 py-1 text-sm text-gray-300 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                className="px-2 py-1 text-gray-300 hover:text-white"
              >
                +
              </button>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={handleExportInteractions}
              className="text-gray-300 border-gray-600"
            >
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Screens</h3>
          
          <div className="space-y-2">
            {screens.map((screenItem) => (
              <button
                key={screenItem.id}
                onClick={() => handleScreenChange(screenItem.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentScreenId === screenItem.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{screenItem.title}</div>
                <div className="text-sm opacity-75">
                  {screenItem.components.length} components
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Preview Options</h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showFrame}
                  onChange={(e) => setShowFrame(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Show device frame</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showStatusBar}
                  onChange={(e) => setShowStatusBar(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-300">Show status bar</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <MobileSimulator
            app={currentApp}
            screen={screen}
            device={device}
            orientation={orientation}
            zoom={zoom}
            showFrame={showFrame}
            showStatusBar={showStatusBar}
            onScreenChange={handleScreenChange}
            onInteraction={handleInteraction}
          />
        </div>
      </div>

      <div className="bg-gray-800 border-t border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Preview Mode</span>
            <span>•</span>
            <span>{screen?.title || 'No screen'}</span>
            <span>•</span>
            <span>{device.name}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Live preview</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Preview