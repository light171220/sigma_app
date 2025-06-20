import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Save, Play, Settings, Database, Workflow,
  Undo, Redo, Layers, Smartphone, Tablet,
  Eye, EyeOff, ZoomIn, ZoomOut
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ComponentLibrary } from '@/components/builder/ComponentLibrary'
import { MobileCanvas } from '@/components/builder/MobileCanvas'
import { PropertiesPanel } from '@/components/builder/PropertiesPanel'
import { ScreenManager } from '@/components/builder/ScreenManager'
import { useAppBuilder } from '@/hooks/useAppBuilder'
import { useAuth } from '@/hooks/useAuth'
import { DEVICES } from '@/utils/constants'

const AppBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentApp,
    currentScreen,
    selectedComponent,
    isLoading,
    error,
    isDirty,
    loadApp,
    saveApp,
    undo,
    redo,
    history,
    historyIndex,
  } = useAppBuilder()

  const [selectedDevice, setSelectedDevice] = useState('iphone-14')
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  useEffect(() => {
    if (id) {
      loadApp(id)
    }
  }, [id, loadApp])

  const handleSave = async () => {
    try {
      await saveApp()
    } catch (error) {
      console.error('Failed to save app:', error)
    }
  }

  const handlePreview = () => {
    navigate(`/apps/${id}/preview`)
  }

  const handleSettings = () => {
    navigate(`/apps/${id}/settings`)
  }

  const handleDatabase = () => {
    navigate(`/apps/${id}/database`)
  }

  const handleWorkflow = () => {
    navigate(`/apps/${id}/logic`)
  }

  const device = DEVICES.find(d => d.id === selectedDevice) || DEVICES[0]
  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load app</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
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
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{currentApp.name}</h1>
                <p className="text-sm text-gray-500">
                  {currentScreen?.title || 'No screen selected'}
                </p>
              </div>
            </div>

            {isDirty && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                icon={Undo}
                onClick={undo}
                disabled={!canUndo}
                className="!p-2"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Redo}
                onClick={redo}
                disabled={!canRedo}
                className="!p-2"
              />
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSelectedDevice('iphone-14')}
                className={`p-2 rounded-md transition-colors ${
                  selectedDevice === 'iphone-14'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDevice('ipad-air')}
                className={`p-2 rounded-md transition-colors ${
                  selectedDevice === 'ipad-air'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                icon={ZoomOut}
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                className="!p-2"
              />
              <span className="px-2 text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={ZoomIn}
                onClick={() => setZoom(Math.min(150, zoom + 25))}
                className="!p-2"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={showGrid ? EyeOff : Eye}
              onClick={() => setShowGrid(!showGrid)}
            />

            <div className="w-px h-6 bg-gray-300" />

            <Button variant="secondary" size="sm" icon={Database} onClick={handleDatabase}>
              Database
            </Button>
            <Button variant="secondary" size="sm" icon={Workflow} onClick={handleWorkflow}>
              Logic
            </Button>
            <Button variant="secondary" size="sm" icon={Settings} onClick={handleSettings}>
              Settings
            </Button>
            
            <div className="w-px h-6 bg-gray-300" />

            <Button variant="secondary" size="sm" icon={Save} onClick={handleSave} disabled={!isDirty}>
              Save
            </Button>
            <Button variant="primary" size="sm" icon={Play} onClick={handlePreview}>
              Preview
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div
          initial={false}
          animate={{ width: leftPanelCollapsed ? 0 : 320 }}
          className="bg-white border-r border-gray-200 overflow-hidden"
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Screens</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={leftPanelCollapsed ? Layers : Layers}
                  onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                />
              </div>
              <ScreenManager />
            </div>
            
            <div className="flex-1 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Components</h3>
              <ComponentLibrary />
            </div>
          </div>
        </motion.div>

        <div className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 flex items-center justify-center p-8">
            <div 
              className="relative"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center'
              }}
            >
              <MobileCanvas
                device={device}
                screen={currentScreen}
                showGrid={showGrid}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{ width: rightPanelCollapsed ? 0 : 320 }}
          className="bg-white border-l border-gray-200 overflow-hidden"
        >
          <div className="h-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={rightPanelCollapsed ? Settings : Settings}
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                />
              </div>
            </div>
            
            <div className="p-4">
              {selectedComponent ? (
                <PropertiesPanel component={selectedComponent} />
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    Select a component to edit its properties
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.firstName}</span>
            <span>•</span>
            <span>{currentApp.screens.length} screen{currentApp.screens.length !== 1 ? 's' : ''}</span>
            <span>•</span>
            <span>Last saved: {new Date(currentApp.updatedAt).toLocaleTimeString()}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>All changes saved</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppBuilder