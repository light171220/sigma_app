import { useState, useCallback } from 'react'
import { Screen, DeviceOrientation } from '@/types'

interface PreviewState {
  selectedDevice: string
  currentScreen: Screen | null
  orientation: DeviceOrientation
  zoom: number
  isInteracting: boolean
  screenHistory: string[]
  currentHistoryIndex: number
  interactions: InteractionEvent[]
}

interface InteractionEvent {
  id: string
  type: 'tap' | 'swipe' | 'input' | 'navigation'
  timestamp: string
  screenId: string
  componentId?: string
  data?: any
}

interface UsePreviewReturn extends PreviewState {
  setSelectedDevice: (deviceId: string) => void
  setOrientation: (orientation: DeviceOrientation) => void
  setZoom: (zoom: number) => void
  navigateToScreen: (screenId: string) => void
  goBack: () => void
  goForward: () => void
  resetNavigation: () => void
  recordInteraction: (interaction: Omit<InteractionEvent, 'id' | 'timestamp'>) => void
  clearInteractions: () => void
  exportInteractions: () => string
}

export const usePreview = (): UsePreviewReturn => {
  const [state, setState] = useState<PreviewState>({
    selectedDevice: 'iphone-14',
    currentScreen: null,
    orientation: 'portrait',
    zoom: 1,
    isInteracting: false,
    screenHistory: [],
    currentHistoryIndex: -1,
    interactions: [],
  })

  const setSelectedDevice = useCallback((deviceId: string) => {
    setState(prev => ({ ...prev, selectedDevice: deviceId }))
  }, [])

  const setOrientation = useCallback((orientation: DeviceOrientation) => {
    setState(prev => ({ ...prev, orientation }))
  }, [])

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(0.25, Math.min(2, zoom)) }))
  }, [])

  const navigateToScreen = useCallback((screenId: string) => {
    setState(prev => {
      const newHistory = prev.screenHistory.slice(0, prev.currentHistoryIndex + 1)
      newHistory.push(screenId)
      
      return {
        ...prev,
        screenHistory: newHistory,
        currentHistoryIndex: newHistory.length - 1,
      }
    })
  }, [])

  const goBack = useCallback(() => {
    setState(prev => {
      if (prev.currentHistoryIndex > 0) {
        return {
          ...prev,
          currentHistoryIndex: prev.currentHistoryIndex - 1,
        }
      }
      return prev
    })
  }, [])

  const goForward = useCallback(() => {
    setState(prev => {
      if (prev.currentHistoryIndex < prev.screenHistory.length - 1) {
        return {
          ...prev,
          currentHistoryIndex: prev.currentHistoryIndex + 1,
        }
      }
      return prev
    })
  }, [])

  const resetNavigation = useCallback(() => {
    setState(prev => ({
      ...prev,
      screenHistory: [],
      currentHistoryIndex: -1,
    }))
  }, [])

  const recordInteraction = useCallback((interaction: Omit<InteractionEvent, 'id' | 'timestamp'>) => {
    const newInteraction: InteractionEvent = {
      ...interaction,
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      interactions: [...prev.interactions, newInteraction],
    }))
  }, [])

  const clearInteractions = useCallback(() => {
    setState(prev => ({ ...prev, interactions: [] }))
  }, [])

  const exportInteractions = useCallback((): string => {
    const exportData = {
      interactions: state.interactions,
      device: state.selectedDevice,
      orientation: state.orientation,
      totalInteractions: state.interactions.length,
      duration: state.interactions.length > 0 ? 
        new Date(state.interactions[state.interactions.length - 1].timestamp).getTime() - 
        new Date(state.interactions[0].timestamp).getTime() : 0,
      exportedAt: new Date().toISOString(),
    }

    return JSON.stringify(exportData, null, 2)
  }, [state.interactions, state.selectedDevice, state.orientation])

  return {
    ...state,
    setSelectedDevice,
    setOrientation,
    setZoom,
    navigateToScreen,
    goBack,
    goForward,
    resetNavigation,
    recordInteraction,
    clearInteractions,
    exportInteractions,
  }
}