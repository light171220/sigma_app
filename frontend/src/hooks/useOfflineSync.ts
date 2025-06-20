import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/utils/apiClient'

interface PendingAction {
  id: string
  type: 'create' | 'update' | 'delete'
  endpoint: string
  data?: any
  timestamp: string
  retryCount: number
}

interface OfflineSyncState {
  isOnline: boolean
  isSyncing: boolean
  pendingActions: PendingAction[]
  lastSyncTime: string | null
  syncError: string | null
}

interface UseOfflineSyncReturn extends OfflineSyncState {
  addPendingAction: (action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => void
  syncPendingActions: () => Promise<void>
  clearPendingActions: () => void
  forceSync: () => Promise<void>
}

const STORAGE_KEY = 'offline_pending_actions'
const MAX_RETRY_COUNT = 3

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingActions: [],
    lastSyncTime: null,
    syncError: null,
  })

  const loadPendingActions = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const actions = JSON.parse(stored)
        setState(prev => ({ ...prev, pendingActions: actions }))
      }
    } catch (error) {
      console.error('Failed to load pending actions:', error)
    }
  }, [])

  const savePendingActions = useCallback((actions: PendingAction[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actions))
    } catch (error) {
      console.error('Failed to save pending actions:', error)
    }
  }, [])

  const addPendingAction = useCallback((actionData: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const action: PendingAction = {
      ...actionData,
      id: Math.random().toString(36),
      timestamp: new Date().toISOString(),
      retryCount: 0,
    }

    setState(prev => {
      const newActions = [...prev.pendingActions, action]
      savePendingActions(newActions)
      return { ...prev, pendingActions: newActions }
    })
  }, [savePendingActions])

  const syncPendingActions = useCallback(async () => {
    if (!state.isOnline || state.isSyncing || state.pendingActions.length === 0) {
      return
    }

    setState(prev => ({ ...prev, isSyncing: true, syncError: null }))

    const successfulActions: string[] = []
    const failedActions: PendingAction[] = []

    for (const action of state.pendingActions) {
      try {
        let response
        
        switch (action.type) {
          case 'create':
            response = await apiClient.post(action.endpoint, action.data)
            break
          case 'update':
            response = await apiClient.put(action.endpoint, action.data)
            break
          case 'delete':
            response = await apiClient.delete(action.endpoint)
            break
          default:
            throw new Error(`Unknown action type: ${action.type}`)
        }

        if (response.success) {
          successfulActions.push(action.id)
        } else {
          throw new Error(response.error || 'Action failed')
        }
      } catch (error) {
        console.error(`Failed to sync action ${action.id}:`, error)
        
        if (action.retryCount < MAX_RETRY_COUNT) {
          failedActions.push({
            ...action,
            retryCount: action.retryCount + 1,
          })
        }
      }
    }

    setState(prev => {
      const newPendingActions = failedActions
      savePendingActions(newPendingActions)
      
      return {
        ...prev,
        pendingActions: newPendingActions,
        isSyncing: false,
        lastSyncTime: new Date().toISOString(),
        syncError: failedActions.length > 0 ? `${failedActions.length} actions failed to sync` : null,
      }
    })
  }, [state.isOnline, state.isSyncing, state.pendingActions, savePendingActions])

  const clearPendingActions = useCallback(() => {
    setState(prev => ({ ...prev, pendingActions: [] }))
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const forceSync = useCallback(async () => {
    if (state.isOnline) {
      await syncPendingActions()
    }
  }, [state.isOnline, syncPendingActions])

  useEffect(() => {
    loadPendingActions()
  }, [loadPendingActions])

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
      syncPendingActions()
    }

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncPendingActions])

  useEffect(() => {
    if (state.isOnline && state.pendingActions.length > 0) {
      const syncInterval = setInterval(() => {
        syncPendingActions()
      }, 30000)

      return () => clearInterval(syncInterval)
    }
  }, [state.isOnline, state.pendingActions.length, syncPendingActions])

  return {
    ...state,
    addPendingAction,
    syncPendingActions,
    clearPendingActions,
    forceSync,
  }
}