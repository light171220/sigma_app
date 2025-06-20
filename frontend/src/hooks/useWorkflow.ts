import { useState, useCallback, useEffect } from 'react'
import { Workflow, WorkflowNode, WorkflowConnection, WorkflowVariable, WorkflowExecution } from '@/types'
import { apiClient } from '@/utils/apiClient'

interface WorkflowState {
  workflows: Workflow[]
  currentWorkflow: Workflow | null
  selectedNode: WorkflowNode | null
  isLoading: boolean
  error: string | null
  executions: WorkflowExecution[]
  isExecuting: boolean
}

interface UseWorkflowReturn extends WorkflowState {
  loadWorkflows: (appId: string) => Promise<void>
  createWorkflow: (workflow: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'errorCount'>) => Promise<void>
  updateWorkflow: (workflowId: string, updates: Partial<Workflow>) => Promise<void>
  deleteWorkflow: (workflowId: string) => Promise<void>
  selectWorkflow: (workflowId: string) => void
  addNode: (node: Omit<WorkflowNode, 'id'>) => Promise<void>
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => Promise<void>
  deleteNode: (nodeId: string) => Promise<void>
  selectNode: (nodeId: string | null) => void
  addConnection: (connection: Omit<WorkflowConnection, 'id'>) => Promise<void>
  deleteConnection: (connectionId: string) => Promise<void>
  executeWorkflow: (workflowId: string, input?: any) => Promise<void>
  stopExecution: (executionId: string) => Promise<void>
  getExecutionLogs: (executionId: string) => Promise<void>
}

export const useWorkflow = (): UseWorkflowReturn => {
  const [state, setState] = useState<WorkflowState>({
    workflows: [],
    currentWorkflow: null,
    selectedNode: null,
    isLoading: false,
    error: null,
    executions: [],
    isExecuting: false,
  })

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const loadWorkflows = useCallback(async (appId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<Workflow[]>(`/apps/${appId}/workflows`)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          workflows: response.data,
        }))
      } else {
        throw new Error(response.error || 'Failed to load workflows')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const createWorkflow = useCallback(async (workflowData: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'runCount' | 'errorCount'>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<Workflow>('/workflows', workflowData)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          workflows: [...prev.workflows, response.data],
          currentWorkflow: response.data,
        }))
      } else {
        throw new Error(response.error || 'Failed to create workflow')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create workflow')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const updateWorkflow = useCallback(async (workflowId: string, updates: Partial<Workflow>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.put<Workflow>(`/workflows/${workflowId}`, updates)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w => w.id === workflowId ? response.data : w),
          currentWorkflow: prev.currentWorkflow?.id === workflowId ? response.data : prev.currentWorkflow,
        }))
      } else {
        throw new Error(response.error || 'Failed to update workflow')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update workflow')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const deleteWorkflow = useCallback(async (workflowId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.delete(`/workflows/${workflowId}`)
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          workflows: prev.workflows.filter(w => w.id !== workflowId),
          currentWorkflow: prev.currentWorkflow?.id === workflowId ? null : prev.currentWorkflow,
        }))
      } else {
        throw new Error(response.error || 'Failed to delete workflow')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete workflow')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const selectWorkflow = useCallback((workflowId: string) => {
    setState(prev => ({
      ...prev,
      currentWorkflow: prev.workflows.find(w => w.id === workflowId) || null,
      selectedNode: null,
    }))
  }, [])

  const addNode = useCallback(async (nodeData: Omit<WorkflowNode, 'id'>) => {
    if (!state.currentWorkflow) return

    const newNode: WorkflowNode = {
      ...nodeData,
      id: Math.random().toString(36),
    }

    setState(prev => ({
      ...prev,
      currentWorkflow: prev.currentWorkflow ? {
        ...prev.currentWorkflow,
        nodes: [...prev.currentWorkflow.nodes, newNode],
      } : null,
    }))
  }, [state.currentWorkflow])

  const updateNode = useCallback(async (nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!state.currentWorkflow) return

    setState(prev => ({
      ...prev,
      currentWorkflow: prev.currentWorkflow ? {
        ...prev.currentWorkflow,
        nodes: prev.currentWorkflow.nodes.map(node =>
          node.id === nodeId ? { ...node, ...updates } : node
        ),
      } : null,
      selectedNode: prev.selectedNode?.id === nodeId ? { ...prev.selectedNode, ...updates } : prev.selectedNode,
    }))
  }, [state.currentWorkflow])

  const deleteNode = useCallback(async (nodeId: string) => {
    if (!state.currentWorkflow) return

    setState(prev => ({
      ...prev,
      currentWorkflow: prev.currentWorkflow ? {
        ...prev.currentWorkflow,
        nodes: prev.currentWorkflow.nodes.filter(node => node.id !== nodeId),
        connections: prev.currentWorkflow.connections.filter(
          conn => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
        ),
      } : null,
      selectedNode: prev.selectedNode?.id === nodeId ? null : prev.selectedNode,
    }))
  }, [state.currentWorkflow])

  const selectNode = useCallback((nodeId: string | null) => {
    setState(prev => ({
      ...prev,
      selectedNode: nodeId && prev.currentWorkflow
        ? prev.currentWorkflow.nodes.find(n => n.id === nodeId) || null
        : null,
    }))
  }, [])

  const addConnection = useCallback(async (connectionData: Omit<WorkflowConnection, 'id'>) => {
    if (!state.currentWorkflow) return

    const newConnection: WorkflowConnection = {
      ...connectionData,
      id: Math.random().toString(36),
    }

    setState(prev => ({
      ...prev,
      currentWorkflow: prev.currentWorkflow ? {
        ...prev.currentWorkflow,
        connections: [...prev.currentWorkflow.connections, newConnection],
      } : null,
    }))
  }, [state.currentWorkflow])

  const deleteConnection = useCallback(async (connectionId: string) => {
    if (!state.currentWorkflow) return

    setState(prev => ({
      ...prev,
      currentWorkflow: prev.currentWorkflow ? {
        ...prev.currentWorkflow,
        connections: prev.currentWorkflow.connections.filter(conn => conn.id !== connectionId),
      } : null,
    }))
  }, [state.currentWorkflow])

  const executeWorkflow = useCallback(async (workflowId: string, input?: any) => {
    try {
      setState(prev => ({ ...prev, isExecuting: true }))
      setError(null)

      const response = await apiClient.post<WorkflowExecution>(`/workflows/${workflowId}/execute`, { input })
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          executions: [response.data, ...prev.executions],
        }))
      } else {
        throw new Error(response.error || 'Failed to execute workflow')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to execute workflow')
    } finally {
      setState(prev => ({ ...prev, isExecuting: false }))
    }
  }, [setError])

  const stopExecution = useCallback(async (executionId: string) => {
    try {
      const response = await apiClient.post(`/executions/${executionId}/stop`)
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          executions: prev.executions.map(exec =>
            exec.id === executionId ? { ...exec, status: 'cancelled' } : exec
          ),
        }))
      }
    } catch (error: any) {
      setError(error.message || 'Failed to stop execution')
    }
  }, [setError])

  const getExecutionLogs = useCallback(async (executionId: string) => {
    try {
      const response = await apiClient.get(`/executions/${executionId}/logs`)
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          executions: prev.executions.map(exec =>
            exec.id === executionId ? { ...exec, logs: response.data } : exec
          ),
        }))
      }
    } catch (error: any) {
      setError(error.message || 'Failed to get execution logs')
    }
  }, [setError])

  return {
    ...state,
    loadWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    selectWorkflow,
    addNode,
    updateNode,
    deleteNode,
    selectNode,
    addConnection,
    deleteConnection,
    executeWorkflow,
    stopExecution,
    getExecutionLogs,
  }
}