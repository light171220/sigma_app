import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Tag, GitBranch, Download, ExternalLink, MoreVertical } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'

interface Version {
  id: string
  version: string
  buildNumber: number
  releaseNotes: string
  status: 'draft' | 'testing' | 'released' | 'deprecated'
  platform: 'ios' | 'android' | 'both'
  createdAt: string
  releasedAt?: string
  downloadCount: number
  storeUrl?: string
}

export const AppVersionManager: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>([
    {
      id: '1',
      version: '2.1.0',
      buildNumber: 15,
      releaseNotes: 'Added new dashboard features and improved performance',
      status: 'released',
      platform: 'both',
      createdAt: '2024-01-15T10:00:00Z',
      releasedAt: '2024-01-20T14:30:00Z',
      downloadCount: 1250,
      storeUrl: 'https://apps.apple.com/app/myapp'
    },
    {
      id: '2',
      version: '2.0.5',
      buildNumber: 12,
      releaseNotes: 'Bug fixes and stability improvements',
      status: 'released',
      platform: 'both',
      createdAt: '2024-01-10T09:00:00Z',
      releasedAt: '2024-01-12T16:15:00Z',
      downloadCount: 3400,
      storeUrl: 'https://apps.apple.com/app/myapp'
    },
    {
      id: '3',
      version: '2.2.0',
      buildNumber: 18,
      releaseNotes: 'New features in development',
      status: 'testing',
      platform: 'both',
      createdAt: '2024-01-25T11:00:00Z',
      downloadCount: 0
    }
  ])

  const [showNewVersionModal, setShowNewVersionModal] = useState(false)
  const [newVersion, setNewVersion] = useState({
    version: '',
    releaseNotes: '',
    platform: 'both' as 'ios' | 'android' | 'both'
  })

  const getStatusColor = (status: Version['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'testing':
        return 'bg-blue-100 text-blue-800'
      case 'released':
        return 'bg-green-100 text-green-800'
      case 'deprecated':
        return 'bg-red-100 text-red-800'
    }
  }

  const getPlatformIcon = (platform: Version['platform']) => {
    switch (platform) {
      case 'ios':
        return '🍎'
      case 'android':
        return '🤖'
      case 'both':
        return '📱'
    }
  }

  const handleCreateVersion = () => {
    const newVer: Version = {
      id: Date.now().toString(),
      version: newVersion.version,
      buildNumber: Math.max(...versions.map(v => v.buildNumber)) + 1,
      releaseNotes: newVersion.releaseNotes,
      status: 'draft',
      platform: newVersion.platform,
      createdAt: new Date().toISOString(),
      downloadCount: 0
    }

    setVersions([newVer, ...versions])
    setNewVersion({ version: '', releaseNotes: '', platform: 'both' })
    setShowNewVersionModal(false)
  }

  const sortedVersions = [...versions].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">App Versions</h3>
          <p className="text-sm text-gray-600">Manage your app releases and versions</p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setShowNewVersionModal(true)}
        >
          New Version
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Released Versions</p>
              <p className="text-2xl font-bold text-gray-900">
                {versions.filter(v => v.status === 'released').length}
              </p>
            </div>
            <Tag className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">
                {versions.reduce((sum, v) => sum + v.downloadCount, 0).toLocaleString()}
              </p>
            </div>
            <Download className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Latest Version</p>
              <p className="text-2xl font-bold text-gray-900">
                {versions.find(v => v.status === 'released')?.version || 'N/A'}
              </p>
            </div>
            <GitBranch className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedVersions.map((version, index) => (
          <motion.div
            key={version.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Version {version.version}
                  </h4>
                  <span className="text-sm text-gray-500">
                    Build {version.buildNumber}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(version.status)}`}>
                    {version.status}
                  </span>
                  <span className="text-lg">{getPlatformIcon(version.platform)}</span>
                </div>

                <p className="text-gray-600 mb-4">{version.releaseNotes}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {version.releasedAt && (
                    <div>
                      <p className="font-medium text-gray-500">Released</p>
                      <p className="text-gray-900">
                        {new Date(version.releasedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium text-gray-500">Downloads</p>
                    <p className="text-gray-900">{version.downloadCount.toLocaleString()}</p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-500">Platform</p>
                    <p className="text-gray-900 capitalize">{version.platform}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {version.storeUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => window.open(version.storeUrl, '_blank')}
                  >
                    View in Store
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  icon={MoreVertical} children={undefined} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={showNewVersionModal}
        onClose={() => setShowNewVersionModal(false)}
        title="Create New Version"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version Number
            </label>
            <input
              type="text"
              value={newVersion.version}
              onChange={(e) => setNewVersion({ ...newVersion, version: e.target.value })}
              placeholder="e.g., 2.1.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={newVersion.platform}
              onChange={(e) => setNewVersion({ ...newVersion, platform: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="both">Both (iOS & Android)</option>
              <option value="ios">iOS Only</option>
              <option value="android">Android Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Release Notes
            </label>
            <textarea
              value={newVersion.releaseNotes}
              onChange={(e) => setNewVersion({ ...newVersion, releaseNotes: e.target.value })}
              rows={4}
              placeholder="What's new in this version..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewVersionModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateVersion}
              disabled={!newVersion.version || !newVersion.releaseNotes}
            >
              Create Version
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}