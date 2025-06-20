import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, Square, RotateCcw, Download, ExternalLink, 
  Clock, CheckCircle, XCircle, AlertCircle, Loader2
} from 'lucide-react'
import { Deployment, DeploymentStatus as Status } from '@/types'
import { Button } from '@/components/common/Button'
import { useDeployment } from '@/hooks/useDeployment'

interface DeploymentStatusProps {
  deployment: Deployment
  onRetry?: () => void
  onCancel?: () => void
  onDownload?: () => void
}

export const DeploymentStatus: React.FC<DeploymentStatusProps> = ({
  deployment,
  onRetry,
  onCancel,
  onDownload,
}) => {
  const { getBuildLogs } = useDeployment()
  const [logs, setLogs] = useState<string[]>([])
  const [showLogs, setShowLogs] = useState(false)

  useEffect(() => {
    if (showLogs) {
      loadLogs()
    }
  }, [showLogs])

  const loadLogs = async () => {
    try {
      await getBuildLogs(deployment.id)
    } catch (error) {
      console.error('Failed to load logs:', error)
    }
  }

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />
      case 'building':
      case 'testing':
      case 'signing':
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'rolled_back':
        return <AlertCircle className="w-5 h-5 text-orange-500" />
    }
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'building':
      case 'testing':
      case 'signing':
      case 'uploading':
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'rolled_back':
        return 'bg-orange-100 text-orange-800'
    }
  }

  const getProgress = (status: Status) => {
    switch (status) {
      case 'pending':
        return 0
      case 'building':
        return 25
      case 'testing':
        return 50
      case 'signing':
        return 75
      case 'uploading':
      case 'processing':
        return 90
      case 'completed':
        return 100
      default:
        return 0
    }
  }

  const isInProgress = ['pending', 'building', 'testing', 'signing', 'uploading', 'processing'].includes(deployment.status)
  const canRetry = ['failed', 'cancelled'].includes(deployment.status)
  const canCancel = isInProgress
  const hasArtifacts = deployment.artifacts && deployment.artifacts.length > 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(deployment.status)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Deployment #{deployment.buildNumber}
            </h3>
            <p className="text-sm text-gray-600">
              Version {deployment.version} • {deployment.platform}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deployment.status)}`}>
            {deployment.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {isInProgress && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{getProgress(deployment.status)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getProgress(deployment.status)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Started</p>
          <p className="text-sm text-gray-900">
            {new Date(deployment.startedAt).toLocaleString()}
          </p>
        </div>
        
        {deployment.completedAt && (
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-sm text-gray-900">
              {new Date(deployment.completedAt).toLocaleString()}
            </p>
          </div>
        )}

        {deployment.duration && (
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-sm text-gray-900">
              {Math.round(deployment.duration / 1000)}s
            </p>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-500">Environment</p>
          <p className="text-sm text-gray-900 capitalize">
            {deployment.environment}
          </p>
        </div>
      </div>

      {hasArtifacts && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Build Artifacts</h4>
          <div className="space-y-2">
            {deployment.artifacts.map((artifact) => (
              <div key={artifact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{artifact.name}</p>
                  <p className="text-xs text-gray-500">
                    {artifact.type.toUpperCase()} • {(artifact.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Download}
                  onClick={() => window.open(artifact.downloadUrl, '_blank')}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowLogs(!showLogs)}
          >
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </Button>
          
          {deployment.status === 'completed' && (
            <Button
              variant="secondary"
              size="sm"
              icon={ExternalLink}
            >
              View in Store
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {canRetry && onRetry && (
            <Button
              variant="secondary"
              size="sm"
              icon={RotateCcw}
              onClick={onRetry}
            >
              Retry
            </Button>
          )}
          
          {canCancel && onCancel && (
            <Button
              variant="secondary"
              size="sm"
              icon={Square}
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          {hasArtifacts && onDownload && (
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={onDownload}
            >
              Download All
            </Button>
          )}
        </div>
      </div>

      {showLogs && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 border-t border-gray-200 pt-4"
        >
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Build Logs</h4>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono max-h-64 overflow-y-auto">
            {deployment.logs && deployment.logs.length > 0 ? (
              deployment.logs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`ml-2 ${
                    log.level === 'error' ? 'text-red-400' :
                    log.level === 'warn' ? 'text-yellow-400' :
                    log.level === 'info' ? 'text-blue-400' :
                    'text-green-400'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No logs available</div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}