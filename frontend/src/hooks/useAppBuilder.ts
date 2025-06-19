import { useState, useCallback, useEffect } from 'react'
import { App, Screen, Component, AppSettings, ComponentProperties, ComponentStyle, Position, Size } from '@/types'
import { apiClient } from '@/utils/apiClient'

interface AppBuilderState {
  currentApp: App | null
  currentScreen: Screen | null
  selectedComponent: Component | null
  components: Component[]
  screens: Screen[]
  isLoading: boolean
  error: string | null
  isDirty: boolean
  history: AppBuilderAction[]
  historyIndex: number
}

interface AppBuilderAction {
  id: string
  type: 'add' | 'update' | 'delete' | 'move'
  target: 'component' | 'screen'
  data: any
  timestamp: string
}

interface UseAppBuilderReturn extends AppBuilderState {
  loadApp: (appId: string) => Promise<void>
  saveApp: () => Promise<void>
  createScreen: (screen: Omit<Screen, 'id' | 'components' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateScreen: (screenId: string, updates: Partial<Screen>) => Promise<void>
  deleteScreen: (screenId: string) => Promise<void>
  selectScreen: (screenId: string) => void
  addComponent: (component: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateComponent: (componentId: string, updates: Partial<Component>) => Promise<void>
  deleteComponent: (componentId: string) => Promise<void>
  selectComponent: (componentId: string | null) => void
  moveComponent: (componentId: string, position: Position) => Promise<void>
  resizeComponent: (componentId: string, size: Size) => Promise<void>
  updateComponentProperties: (componentId: string, properties: Partial<ComponentProperties>) => Promise<void>
  updateComponentStyle: (componentId: string, style: Partial<ComponentStyle>) => Promise<void>
  duplicateComponent: (componentId: string) => Promise<void>
  copyComponent: (componentId: string) => void
  pasteComponent: () => Promise<void>
  undo: () => void
  redo: () => void
  clearHistory: () => void
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>
  exportApp: () => Promise<string>
  importApp: (data: string) => Promise<void>
}

export const useAppBuilder = (): UseAppBuilderReturn => {
  const [state, setState] = useState<AppBuilderState>({
    currentApp: null,
    currentScreen: null,
    selectedComponent: null,
    components: [],
    screens: [],
    isLoading: false,
    error: null,
    isDirty: false,
    history: [],
    historyIndex: -1,
  })

  const [clipboard, setClipboard] = useState<Component | null>(null)
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null)

  const addToHistory = useCallback((action: Omit<AppBuilderAction, 'id' | 'timestamp'>) => {
    const newAction: AppBuilderAction = {
      ...action,
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
    }

    setState(prev => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1)
      newHistory.push(newAction)
      
      if (newHistory.length > 50) {
        newHistory.shift()
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        isDirty: true,
      }
    })
  }, [])

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const loadApp = useCallback(async (appId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<App>(`/apps/${appId}`)
      
      if (response.success && response.data) {
        const app = response.data
        setState(prev => ({
          ...prev,
          currentApp: app,
          screens: app.screens,
          currentScreen: app.screens[0] || null,
          components: app.screens[0]?.components || [],
          selectedComponent: null,
          isDirty: false,
          history: [],
          historyIndex: -1,
        }))
      } else {
        throw new Error(response.error || 'Failed to load app')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load app')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const saveApp = useCallback(async () => {
    if (!state.currentApp) return

    try {
      setLoading(true)
      setError(null)

      const appData = {
        ...state.currentApp,
        screens: state.screens,
      }

      const response = await apiClient.put(`/apps/${state.currentApp.id}`, appData)
      
      if (response.success) {
        setState(prev => ({ ...prev, isDirty: false }))
      } else {
        throw new Error(response.error || 'Failed to save app')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save app')
    } finally {
      setLoading(false)
    }
  }, [state.currentApp, state.screens, setLoading, setError])

  const createScreen = useCallback(async (screenData: Omit<Screen, 'id' | 'components' | 'createdAt' | 'updatedAt'>) => {
    const newScreen: Screen = {
      ...screenData,
      id: Math.random().toString(36),
      components: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      screens: [...prev.screens, newScreen],
    }))

    addToHistory({
      type: 'add',
      target: 'screen',
      data: newScreen,
    })
  }, [addToHistory])

  const updateScreen = useCallback(async (screenId: string, updates: Partial<Screen>) => {
    setState(prev => ({
      ...prev,
      screens: prev.screens.map(screen =>
        screen.id === screenId
          ? { ...screen, ...updates, updatedAt: new Date().toISOString() }
          : screen
      ),
      currentScreen: prev.currentScreen?.id === screenId
        ? { ...prev.currentScreen, ...updates, updatedAt: new Date().toISOString() }
        : prev.currentScreen,
    }))

    addToHistory({
      type: 'update',
      target: 'screen',
      data: { screenId, updates },
    })
  }, [addToHistory])

  const deleteScreen = useCallback(async (screenId: string) => {
    setState(prev => {
      const newScreens = prev.screens.filter(screen => screen.id !== screenId)
      const newCurrentScreen = prev.currentScreen?.id === screenId
        ? newScreens[0] || null
        : prev.currentScreen

      return {
        ...prev,
        screens: newScreens,
        currentScreen: newCurrentScreen,
        components: newCurrentScreen?.components || [],
        selectedComponent: null,
      }
    })

    addToHistory({
      type: 'delete',
      target: 'screen',
      data: { screenId },
    })
  }, [addToHistory])

  const selectScreen = useCallback((screenId: string) => {
    setState(prev => {
      const screen = prev.screens.find(s => s.id === screenId)
      return {
        ...prev,
        currentScreen: screen || null,
        components: screen?.components || [],
        selectedComponent: null,
      }
    })
  }, [])

  const addComponent = useCallback(async (componentData: Omit<Component, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!state.currentScreen) return

    const newComponent: Component = {
      ...componentData,
      id: Math.random().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      components: [...prev.components, newComponent],
      screens: prev.screens.map(screen =>
        screen.id === prev.currentScreen?.id
          ? { ...screen, components: [...screen.components, newComponent] }
          : screen
      ),
    }))

    addToHistory({
      type: 'add',
      target: 'component',
      data: newComponent,
    })
  }, [state.currentScreen, addToHistory])

  const updateComponent = useCallback(async (componentId: string, updates: Partial<Component>) => {
    setState(prev => ({
      ...prev,
      components: prev.components.map(component =>
        component.id === componentId
          ? { ...component, ...updates, updatedAt: new Date().toISOString() }
          : component
      ),
      screens: prev.screens.map(screen => ({
        ...screen,
        components: screen.components.map(component =>
          component.id === componentId
            ? { ...component, ...updates, updatedAt: new Date().toISOString() }
            : component
        ),
      })),
      selectedComponent: prev.selectedComponent?.id === componentId
        ? { ...prev.selectedComponent, ...updates, updatedAt: new Date().toISOString() }
        : prev.selectedComponent,
    }))

    addToHistory({
      type: 'update',
      target: 'component',
      data: { componentId, updates },
    })
  }, [addToHistory])

  const deleteComponent = useCallback(async (componentId: string) => {
    setState(prev => ({
      ...prev,
      components: prev.components.filter(component => component.id !== componentId),
      screens: prev.screens.map(screen => ({
        ...screen,
        components: screen.components.filter(component => component.id !== componentId),
      })),
      selectedComponent: prev.selectedComponent?.id === componentId ? null : prev.selectedComponent,
    }))

    addToHistory({
      type: 'delete',
      target: 'component',
      data: { componentId },
    })
  }, [addToHistory])

  const selectComponent = useCallback((componentId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedComponent: componentId
        ? prev.components.find(c => c.id === componentId) || null
        : null,
    }))
  }, [])

  const moveComponent = useCallback(async (componentId: string, position: Position) => {
    await updateComponent(componentId, { position })
  }, [updateComponent])

  const resizeComponent = useCallback(async (componentId: string, size: Size) => {
    await updateComponent(componentId, { size })
  }, [updateComponent])

  const updateComponentProperties = useCallback(async (componentId: string, properties: Partial<ComponentProperties>) => {
    const component = state.components.find(c => c.id === componentId)
    if (!component) return

    await updateComponent(componentId, {
      properties: { ...component.properties, ...properties },
    })
  }, [state.components, updateComponent])

  const updateComponentStyle = useCallback(async (componentId: string, style: Partial<ComponentStyle>) => {
    const component = state.components.find(c => c.id === componentId)
    if (!component) return

    await updateComponent(componentId, {
      style: { ...component.style, ...style },
    })
  }, [state.components, updateComponent])

  const duplicateComponent = useCallback(async (componentId: string) => {
    const component = state.components.find(c => c.id === componentId)
    if (!component) return

    const duplicated = {
      ...component,
      position: {
        x: component.position.x + 20,
        y: component.position.y + 20,
      },
    }

    await addComponent(duplicated)
  }, [state.components, addComponent])

  const copyComponent = useCallback((componentId: string) => {
    const component = state.components.find(c => c.id === componentId)
    if (component) {
      setClipboard(component)
    }
  }, [state.components])

  const pasteComponent = useCallback(async () => {
    if (!clipboard) return

    const pasted = {
      ...clipboard,
      position: {
        x: clipboard.position.x + 20,
        y: clipboard.position.y + 20,
      },
    }

    await addComponent(pasted)
  }, [clipboard, addComponent])

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex < 0) return prev

      return {
        ...prev,
        historyIndex: prev.historyIndex - 1,
      }
    })
  }, [])

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev

      return {
        ...prev,
        historyIndex: prev.historyIndex + 1,
      }
    })
  }, [])

  const clearHistory = useCallback(() => {
    setState(prev => ({
      ...prev,
      history: [],
      historyIndex: -1,
    }))
  }, [])

  const updateAppSettings = useCallback(async (settings: Partial<AppSettings>) => {
    if (!state.currentApp) return

    setState(prev => ({
      ...prev,
      currentApp: prev.currentApp
        ? {
            ...prev.currentApp,
            settings: { ...prev.currentApp.settings, ...settings },
            updatedAt: new Date().toISOString(),
          }
        : null,
    }))

    addToHistory({
      type: 'update',
      target: 'screen',
      data: { settings },
    })
  }, [state.currentApp, addToHistory])

  const exportApp = useCallback(async (): Promise<string> => {
    if (!state.currentApp) throw new Error('No app to export')

    const exportData = {
      app: state.currentApp,
      screens: state.screens,
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
    }

    return JSON.stringify(exportData, null, 2)
  }, [state.currentApp, state.screens])

  const importApp = useCallback(async (data: string) => {
    try {
      const importData = JSON.parse(data)
      
      if (!importData.app || !importData.screens) {
        throw new Error('Invalid app data')
      }

      setState(prev => ({
        ...prev,
        currentApp: importData.app,
        screens: importData.screens,
        currentScreen: importData.screens[0] || null,
        components: importData.screens[0]?.components || [],
        selectedComponent: null,
        isDirty: true,
        history: [],
        historyIndex: -1,
      }))
    } catch (error: any) {
      throw new Error('Failed to import app: ' + error.message)
    }
  }, [])

  useEffect(() => {
    if (state.isDirty && autoSaveTimeout) {
      clearTimeout(autoSaveTimeout)
    }

    if (state.isDirty) {
      const timeout = setTimeout(() => {
        saveApp()
      }, 30000)
      
      setAutoSaveTimeout(timeout)
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout)
      }
    }
  }, [state.isDirty, autoSaveTimeout, saveApp])

  return {
    ...state,
    loadApp,
    saveApp,
    createScreen,
    updateScreen,
    deleteScreen,
    selectScreen,
    addComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    moveComponent,
    resizeComponent,
    updateComponentProperties,
    updateComponentStyle,
    duplicateComponent,
    copyComponent,
    pasteComponent,
    undo,
    redo,
    clearHistory,
    updateAppSettings,
    exportApp,
    importApp,
  }
}