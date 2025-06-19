import { useState, useCallback } from 'react'
import { Deployment, DeploymentConfig, BuildArtifact, AppStoreMetadata } from '@/types'
import { apiClient } from '@/utils/apiClient'

interface DeploymentState {
  deployments: Deployment[]
  currentDeployment: Deployment | null
  isLoading: boolean
  error: string | null
  buildLogs: string[]
  artifacts: BuildArtifact[]
  storeMetadata: AppStoreMetadata | null
}

interface UseDeploymentReturn extends DeploymentState {
  loadDeployments: (appId: string) => Promise<void>
  createDeployment: (config: Partial<DeploymentConfig>) => Promise<void>
  getDeployment: (deploymentId: string) => Promise<void>
  cancelDeployment: (deploymentId: string) => Promise<void>
  retryDeployment: (deploymentId: string) => Promise<void>
  rollbackDeployment: (deploymentId: string, targetVersion: string) => Promise<void>
  downloadArtifact: (artifactId: string) => Promise<void>
  getBuildLogs: (deploymentId: string) => Promise<void>
  updateStoreMetadata: (metadata: Partial<AppStoreMetadata>) => Promise<void>
  submitToStore: (deploymentId: string, platform: 'ios' | 'android') => Promise<void>
}

export const useDeployment = (): UseDeploymentReturn => {
  const [state, setState] = useState<DeploymentState>({
    deployments: [],
    currentDeployment: null,
    isLoading: false,
    error: null,
    buildLogs: [],
    artifacts: [],
    storeMetadata: null,
  })

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const loadDeployments = useCallback(async (appId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<Deployment[]>(`/apps/${appId}/deployments`)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          deployments: response.data.sort((a, b) => 
            new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
          ),
        }))
      } else {
        throw new Error(response.error || 'Failed to load deployments')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load deployments')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const createDeployment = useCallback(async (config: Partial<DeploymentConfig>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<Deployment>('/deployments', config)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          deployments: [response.data, ...prev.deployments],
          currentDeployment: response.data,
        }))
      } else {
        throw new Error(response.error || 'Failed to create deployment')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create deployment')
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const getDeployment = useCallback(async (deploymentId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<Deployment>(`/deployments/${deploymentId}`)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          currentDeployment: response.data,
          deployments: prev.deployments.map(d => 
            d.id === deploymentId ? response.data : d
          ),
        }))
      } else {
        throw new Error(response.error || 'Failed to get deployment')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to get deployment')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const cancelDeployment = useCallback(async (deploymentId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post(`/deployments/${deploymentId}/cancel`)
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          deployments: prev.deployments.map(d =>
            d.id === deploymentId
              ? { ...d, status: 'cancelled' }
              : d
          ),
          currentDeployment: prev.currentDeployment?.id === deploymentId
            ? { ...prev.currentDeployment, status: 'cancelled' }
            : prev.currentDeployment,
        }))
      } else {
        throw new Error(response.error || 'Failed to cancel deployment')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to cancel deployment')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const retryDeployment = useCallback(async (deploymentId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<Deployment>(`/deployments/${deploymentId}/retry`)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          deployments: [response.data, ...prev.deployments.filter(d => d.id !== deploymentId)],
          currentDeployment: response.data,
        }))
      } else {
        throw new Error(response.error || 'Failed to retry deployment')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to retry deployment')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const rollbackDeployment = useCallback(async (deploymentId: string, targetVersion: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post<Deployment>(`/deployments/${deploymentId}/rollback`, {
        targetVersion,
      })
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          deployments: [response.data, ...prev.deployments],
          currentDeployment: response.data,
        }))
      } else {
        throw new Error(response.error || 'Failed to rollback deployment')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to rollback deployment')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const downloadArtifact = useCallback(async (artifactId: string) => {
    try {
      const response = await apiClient.get(`/artifacts/${artifactId}/download`)
      
      if (response.success && response.data) {
        const link = document.createElement('a')
        link.href = response.data.downloadUrl
        link.download = response.data.filename
        link.click()
      }
    } catch (error: any) {
      setError(error.message || 'Failed to download artifact')
    }
  }, [setError])

  const getBuildLogs = useCallback(async (deploymentId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<{ logs: string[] }>(`/deployments/${deploymentId}/logs`)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          buildLogs: response.data.logs,
        }))
      } else {
        throw new Error(response.error || 'Failed to get build logs')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to get build logs')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const updateStoreMetadata = useCallback(async (metadata: Partial<AppStoreMetadata>) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.put<AppStoreMetadata>('/store/metadata', metadata)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          storeMetadata: response.data,
        }))
      } else {
        throw new Error(response.error || 'Failed to update store metadata')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update store metadata')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const submitToStore = useCallback(async (deploymentId: string, platform: 'ios' | 'android') => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.post(`/deployments/${deploymentId}/submit`, {
        platform,
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to submit to store')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit to store')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  return {
    ...state,
    loadDeployments,
    createDeployment,
    getDeployment,
    cancelDeployment,
    retryDeployment,
    rollbackDeployment,
    downloadArtifact,
    getBuildLogs,
    updateStoreMetadata,
    submitToStore,
  }
}