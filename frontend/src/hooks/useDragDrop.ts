import { useState, useCallback, useRef } from 'react'
import { Position, Size } from '@/types'

interface DragDropState {
  isDragging: boolean
  draggedItem: any | null
  dragOffset: Position
  dropZones: string[]
  activeDropZone: string | null
}

interface UseDragDropReturn extends DragDropState {
  startDrag: (item: any, offset: Position) => void
  updateDrag: (position: Position) => void
  endDrag: () => void
  registerDropZone: (id: string) => void
  unregisterDropZone: (id: string) => void
  setActiveDropZone: (id: string | null) => void
  getDragPreview: () => React.ReactNode | null
}

export const useDragDrop = (): UseDragDropReturn => {
  const [state, setState] = useState<DragDropState>({
    isDragging: false,
    draggedItem: null,
    dragOffset: { x: 0, y: 0 },
    dropZones: [],
    activeDropZone: null,
  })

  const dragPreviewRef = useRef<React.ReactNode | null>(null)

  const startDrag = useCallback((item: any, offset: Position) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      draggedItem: item,
      dragOffset: offset,
    }))
  }, [])

  const updateDrag = useCallback((position: Position) => {
    setState(prev => ({
      ...prev,
      dragOffset: position,
    }))
  }, [])

  const endDrag = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragging: false,
      draggedItem: null,
      dragOffset: { x: 0, y: 0 },
      activeDropZone: null,
    }))
    dragPreviewRef.current = null
  }, [])

  const registerDropZone = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      dropZones: [...prev.dropZones, id],
    }))
  }, [])

  const unregisterDropZone = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      dropZones: prev.dropZones.filter(zone => zone !== id),
      activeDropZone: prev.activeDropZone === id ? null : prev.activeDropZone,
    }))
  }, [])

  const setActiveDropZone = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      activeDropZone: id,
    }))
  }, [])

  const getDragPreview = useCallback(() => {
    return dragPreviewRef.current
  }, [])

  return {
    ...state,
    startDrag,
    updateDrag,
    endDrag,
    registerDropZone,
    unregisterDropZone,
    setActiveDropZone,
    getDragPreview,
  }
}