import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical, Home, Eye, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useAppBuilder } from '@/hooks/useAppBuilder'
import { Screen } from '@/types'

export const ScreenManager: React.FC = () => {
  const {
    screens,
    currentScreen,
    selectScreen,
    createScreen,
    updateScreen,
    deleteScreen,
  } = useAppBuilder()

  const [showNewScreenModal, setShowNewScreenModal] = useState(false)
  const [newScreenName, setNewScreenName] = useState('')
  const [newScreenTitle, setNewScreenTitle] = useState('')
  const [selectedScreenMenu, setSelectedScreenMenu] = useState<string | null>(null)

  const handleCreateScreen = async () => {
    if (!newScreenName.trim() || !newScreenTitle.trim()) return

    try {
      await createScreen({
        name: newScreenName.trim(),
        title: newScreenTitle.trim(),
        isHome: screens.length === 0,
        navigation: {
          type: 'stack',
          showHeader: true,
          headerTitle: newScreenTitle.trim(),
          headerTransparent: false,
        },
        settings: {
          backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
          safeAreaInsets: true,
          statusBarStyle: 'dark',
          orientation: 'portrait',
          scrollable: true,
          refreshable: false,
        },
      })

      setNewScreenName('')
      setNewScreenTitle('')
      setShowNewScreenModal(false)
    } catch (error) {
      console.error('Failed to create screen:', error)
    }
  }

  const handleDeleteScreen = async (screenId: string) => {
    if (screens.length <= 1) {
      alert('Cannot delete the last screen')
      return
    }

    if (confirm('Are you sure you want to delete this screen?')) {
      await deleteScreen(screenId)
    }
    setSelectedScreenMenu(null)
  }

  const handleSetHomeScreen = async (screenId: string) => {
    for (const screen of screens) {
      if (screen.id === screenId) {
        await updateScreen(screen.id, { isHome: true })
      } else if (screen.isHome) {
        await updateScreen(screen.id, { isHome: false })
      }
    }
    setSelectedScreenMenu(null)
  }

  const handleDuplicateScreen = async (screen: Screen) => {
    await createScreen({
      name: `${screen.name} Copy`,
      title: `${screen.title} Copy`,
      isHome: false,
      navigation: { ...screen.navigation },
      settings: { ...screen.settings },
    })
    setSelectedScreenMenu(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          {screens.length} screen{screens.length !== 1 ? 's' : ''}
        </span>
        <Button
          variant="ghost"
          size="sm"
          icon={Plus}
          onClick={() => setShowNewScreenModal(true)} children={undefined} />
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
        <AnimatePresence>
          {screens.map((screen, index) => (
            <motion.div
              key={screen.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative group p-3 rounded-lg border cursor-pointer transition-all
                ${currentScreen?.id === screen.id
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
              onClick={() => selectScreen(screen.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {screen.title}
                    </h4>
                    {screen.isHome && (
                      <Home className="w-3 h-3 text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {screen.components.length} component{screen.components.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="relative">
                  <button
                    title="Show screen options"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedScreenMenu(
                        selectedScreenMenu === screen.id ? null : screen.id
                      )
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {selectedScreenMenu === screen.id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            selectScreen(screen.id)
                            setSelectedScreenMenu(null)
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Select</span>
                        </button>

                        {!screen.isHome && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSetHomeScreen(screen.id)
                            }}
                            className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Home className="w-4 h-4" />
                            <span>Set as Home</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateScreen(screen)
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Copy className="w-4 h-4" />
                          <span>Duplicate</span>
                        </button>

                        <div className="border-t border-gray-100 my-1" />

                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteScreen(screen.id)
                          }}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          disabled={screens.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {currentScreen?.id === screen.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {screens.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📱</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">No screens yet</p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowNewScreenModal(true)}
            >
              Create first screen
            </Button>
          </div>
        )}
      </div>

      {selectedScreenMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedScreenMenu(null)}
        />
      )}

      <Modal
        isOpen={showNewScreenModal}
        onClose={() => setShowNewScreenModal(false)}
        title="Create New Screen"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Screen Name
            </label>
            <input
              type="text"
              value={newScreenName}
              onChange={(e) => setNewScreenName(e.target.value)}
              placeholder="e.g., profile, settings"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used for navigation and internal reference
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Screen Title
            </label>
            <input
              type="text"
              value={newScreenTitle}
              onChange={(e) => setNewScreenTitle(e.target.value)}
              placeholder="e.g., User Profile, App Settings"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Displayed in the app header
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewScreenModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateScreen}
              disabled={!newScreenName.trim() || !newScreenTitle.trim()}
            >
              Create Screen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}