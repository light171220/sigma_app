import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, Play, Settings, Download, Upload, 
  Smartphone, Globe, Package, AlertCircle, CheckCircle,
  Clock, X, RefreshCcw, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Modal } from '@/components/common/Modal'
import { DeploymentStatus } from '@/components/deployment/DeploymentStatus'
import { AppVersionManager } from '@/components/deployment/AppVersionManager'
import { AppIconDesigner } from '@/components/deployment/AppIconDesigner'
import { useDeployment } from '@/hooks/useDeployment'
import { useAppBuilder } from '@/hooks/useAppBuilder'

const Deployment: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentApp, loadApp } = useAppBuilder()
  const {
    deployments,
    currentDeployment,
    isLoading,
    error,
    loadDeployments,
    createDeployment,
    cancelDeployment,
    retryDeployment,
  } = useDeployment()

  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'icons' | 'store'>('overview')
  const [showNewDeploymentModal, setShowNewDeploymentModal] = useState(false)
  const [deploymentForm, setDeploymentForm] = useState({
    platforms: ['both'] as ('ios' | 'android' | 'both')[],
    environment: 'development' as 'development' | 'staging' | 'production',
    buildType: 'debug' as 'debug' | 'release',
    version: '1.0.0',
  })

  useEffect(() => {
    if (id) {
      loadApp(id)
      loadDeployments(id)
    }
  }, [id, loadApp, loadDeployments])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'versions', label: 'Versions', icon: Clock },
    { id: 'icons', label: 'App Icons', icon: Smartphone },
    { id: 'store', label: 'Store Listing', icon: Globe },
  ]

  const handleCreateDeployment = async () => {
    try {
      await createDeployment({
        platforms: deploymentForm.platforms,
        environment: deploymentForm.environment,
        buildType: deploymentForm.buildType,
        optimization: {
          minifyCode: true,
          optimizeImages: true,
          compressAssets: true,
          generateSourceMaps: false,
          treeshaking: true,
          bundleSplitting: true,
          caching: {
            enabled: true,
            strategy: 'aggressive',
            maxAge: 86400,
            staticAssets: true,
            apiResponses: false,
          },
        },
        signing: {
          ios: {
            teamId: '',
            certificateId: '',
            provisioningProfileId: '',
            bundleId: currentApp?.settings.general.bundleId || '',
            automaticSigning: true,
          },
          android: {
            keystorePath: '',
            keystorePassword: '',
            keyAlias: '',
            keyPassword: '',
          },
        },
        store: {
          appStore: {
            enabled: false,
            autoSubmit: false,
            releaseType: 'manual',
            skipWaitingForReview: false,
          },
          playStore: {
            enabled: false,
            track: 'internal',
            autoPromote: false,
          },
          testFlight: {
            enabled: false,
            groups: [],
            autoNotify: false,
          },
          googlePlayConsole: {
            enabled: false,
            track: 'internal',
            packageName: '',
            serviceAccountPath: '',
          },
        },
        notification: {
          slack: {
            enabled: false,
            webhookUrl: '',
            channel: '',
            username: 'Sigma Deploy',
            onSuccess: true,
            onFailure: true,
          },
          email: {
            enabled: true,
            recipients: [],
            onSuccess: true,
            onFailure: true,
            includeAttachments: false,
          },
          webhook: {
            enabled: false,
            url: '',
            headers: {},
            onSuccess: true,
            onFailure: true,
          },
        },
      })
      setShowNewDeploymentModal(false)
    } catch (error) {
      console.error('Failed to create deployment:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
      case 'cancelled':
        return <X className="w-5 h-5 text-red-600" />
      case 'pending':
      case 'building':
        return <Clock className="w-5 h-5 text-blue-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
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
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate(`/apps/${id}/builder`)}
            />
            
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Deployment</h1>
              <p className="text-sm text-gray-500">{currentApp.name}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" icon={Settings}>
              Settings
            </Button>
            <Button variant="primary" size="sm" icon={Play} onClick={() => setShowNewDeploymentModal(true)}>
              New Deployment
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200">
          <nav className="p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Deployment Overview</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Deployments</p>
                          <p className="text-2xl font-bold text-gray-900">{deployments.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Success Rate</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {deployments.length > 0 
                              ? Math.round((deployments.filter(d => d.status === 'completed').length / deployments.length) * 100)
                              : 0
                            }%
                          </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Latest Version</p>
                          <p className="text-2xl font-bold text-gray-900">{currentApp.version}</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Deployments</h3>
                  
                  <div className="space-y-4">
                    {deployments.slice(0, 5).map((deployment) => (
                      <div key={deployment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(deployment.status)}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Build #{deployment.buildNumber}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {deployment.platform} • {deployment.environment}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              deployment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              deployment.status === 'failed' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {deployment.status}
                            </span>
                            
                            {deployment.status === 'failed' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                icon={RefreshCcw}
                                onClick={() => retryDeployment(deployment.id)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {deployments.length === 0 && (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No deployments yet</h3>
                        <p className="text-gray-600 mb-6">
                          Deploy your app to start distributing to users.
                        </p>
                        <Button
                          variant="primary"
                          icon={Play}
                          onClick={() => setShowNewDeploymentModal(true)}
                        >
                          Create First Deployment
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'versions' && <AppVersionManager />}
            {activeTab === 'icons' && <AppIconDesigner />}
            {activeTab === 'store' && (
              <div className="text-center py-12">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Store Listing Editor</h3>
                <p className="text-gray-600">Coming soon - Manage your app store listings</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Modal
        isOpen={showNewDeploymentModal}
        onClose={() => setShowNewDeploymentModal(false)}
        title="Create New Deployment"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'ios', label: 'iOS Only', icon: '🍎' },
                { value: 'android', label: 'Android Only', icon: '🤖' },
                { value: 'both', label: 'Both Platforms', icon: '📱' },
              ].map((platform) => (
                <label key={platform.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="platform"
                    value={platform.value}
                    checked={deploymentForm.platforms.includes(platform.value as any)}
                    onChange={(e) => setDeploymentForm({ ...deploymentForm, platforms: [e.target.value as any] })}
                    className="sr-only"
                  />
                  <div className="p-3 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                    <div className="text-center">
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <span className="text-sm font-medium text-gray-900">{platform.label}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Environment
              </label>
              <select
                value={deploymentForm.environment}
                onChange={(e) => setDeploymentForm({ ...deploymentForm, environment: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Build Type
              </label>
              <select
                value={deploymentForm.buildType}
                onChange={(e) => setDeploymentForm({ ...deploymentForm, buildType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="debug">Debug</option>
                <option value="release">Release</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version
            </label>
            <input
              type="text"
              value={deploymentForm.version}
              onChange={(e) => setDeploymentForm({ ...deploymentForm, version: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1.0.0"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewDeploymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateDeployment}
            >
              Start Deployment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Deployment