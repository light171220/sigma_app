import { useState, useEffect, useCallback, useRef } from 'react'
import { WebSocketMessage, CollaborationEvent } from '@/types'

interface WebSocketState {
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  error: string | null
  lastMessage: WebSocketMessage | null
  collaborators: string[]
}

interface UseWebSocketReturn extends WebSocketState {
  connect: (url: string, roomId?: string) => void
  disconnect: () => void
  sendMessage: (event: string, data: any) => void
  subscribe: (event: string, callback: (data: any) => void) => () => void
  unsubscribe: (event: string) => void
}

export const useWebSocket = (): UseWebSocketReturn => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    error: null,
    lastMessage: null,
    collaborators: [],
  })

  const ws = useRef<WebSocket | null>(null)
  const eventListeners = useRef<Map<string, Set<(data: any) => void>>>(new Map())
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = useRef(1000)

  const connect = useCallback((url: string, roomId?: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return
    }

    setState(prev => ({ ...prev, connectionStatus: 'connecting', error: null }))

    const wsUrl = roomId ? `${url}?room=${roomId}` : url
    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        connectionStatus: 'connected',
        error: null,
      }))
      reconnectAttempts.current = 0
      reconnectDelay.current = 1000
    }

    ws.current.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        setState(prev => ({ ...prev, lastMessage: message }))

        const listeners = eventListeners.current.get(message.event)
        if (listeners) {
          listeners.forEach(callback => callback(message.data))
        }

        if (message.event === 'user:joined') {
          setState(prev => ({
            ...prev,
            collaborators: [...prev.collaborators, message.data.userId],
          }))
        } else if (message.event === 'user:left') {
          setState(prev => ({
            ...prev,
            collaborators: prev.collaborators.filter(id => id !== message.data.userId),
          }))
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    ws.current.onclose = (event) => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        connectionStatus: 'disconnected',
      }))

      if (!event.wasClean && reconnectAttempts.current < maxReconnectAttempts) {
        setTimeout(() => {
          reconnectAttempts.current++
          reconnectDelay.current *= 2
          connect(url, roomId)
        }, reconnectDelay.current)
      }
    }

    ws.current.onerror = () => {
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        error: 'WebSocket connection failed',
      }))
    }
  }, [])

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close()
      ws.current = null
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected',
      collaborators: [],
    }))
  }, [])

  const sendMessage = useCallback((event: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        event,
        data,
        timestamp: new Date().toISOString(),
      }
      ws.current.send(JSON.stringify(message))
    }
  }, [])

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!eventListeners.current.has(event)) {
      eventListeners.current.set(event, new Set())
    }
    eventListeners.current.get(event)!.add(callback)

    return () => {
      const listeners = eventListeners.current.get(event)
      if (listeners) {
        listeners.delete(callback)
        if (listeners.size === 0) {
          eventListeners.current.delete(event)
        }
      }
    }
  }, [])

  const unsubscribe = useCallback((event: string) => {
    eventListeners.current.delete(event)
  }, [])

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
  }
}