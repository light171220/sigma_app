import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Plus, Save, Download, Upload } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { TriggerNodes } from '@/components/logic/TriggerNodes'
import { ActionNodes } from '@/components/logic/ActionNodes'
import { WorkflowCanvas } from '@/components/logic/WorkflowCanvas'
import { useWorkflow } from '@/hooks/useWorkflow'
import { useAppBuilder } from '@/hooks/useAppBuilder'

const LogicBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentApp, loadApp } = useAppBuilder()
  const {
    workflows,
    currentWorkflow,
    selectedNode,
    isLoading,
    error,
    loadWorkflows,
    createWorkflow,
    selectWorkflow,
    executeWorkflow,
  } = useWorkflow()

  const [activeTab, setActiveTab] = useState<'triggers' | 'actions'>('triggers')
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false)

  useEffect(() => {
    if (id) {
      loadApp(id)
      loadWorkflows(id)
    }
  }, [id, loadApp, loadWorkflows])

  const handleCreateWorkflow = async () => {
    try {
      await createWorkflow({
        name: 'New Workflow',
        description: 'A new workflow',
        trigger: {
          id: 'trigger-1',
          type: 'button_click',
          name: 'Button Click Trigger',
          config: {},
          enabled: true,
        },
        nodes: [],
        connections: [],
        variables: [],
        status: 'draft',
        version: 1,
      })
      setShowNewWorkflowModal(false)
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  const handleExecuteWorkflow = async () => {
    if (currentWorkflow) {
      await executeWorkflow(currentWorkflow.id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load workflows</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(`/apps/${id}/builder`)}>
            Back to Builder
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
              <h1 className="text-lg font-semibold text-gray-900">Logic Builder</h1>
              <p className="text-sm text-gray-500">
                {currentWorkflow?.name || 'No workflow selected'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" icon={Upload}>
              Import
            </Button>
            <Button variant="secondary" size="sm" icon={Download}>
              Export
            </Button>
            <Button variant="secondary" size="sm" icon={Save}>
              Save
            </Button>
            <Button variant="primary" size="sm" icon={Play} onClick={handleExecuteWorkflow}>
              Run
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowNewWorkflowModal(true)}>
              New Workflow
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-white border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflows</h3>
            
            <div className="space-y-2">
              {workflows.map((workflow) => (
                <button
                  key={workflow.id}
                  onClick={() => selectWorkflow(workflow.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    currentWorkflow?.id === workflow.id
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{workflow.name}</div>
                  <div className="text-sm text-gray-500">
                    {workflow.nodes.length} nodes • {workflow.status}
                  </div>
                </button>
              ))}

              {workflows.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500 mb-3">No workflows yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setShowNewWorkflowModal(true)}
                  >
                    Create first workflow
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 p-4">
            <div className="flex border border-gray-200 rounded-lg p-1 mb-4">
              <button
                onClick={() => setActiveTab('triggers')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                  activeTab === 'triggers'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Triggers
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                  activeTab === 'actions'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Actions
              </button>
            </div>

            {activeTab === 'triggers' ? <TriggerNodes /> : <ActionNodes />}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {currentWorkflow ? (
            <WorkflowCanvas workflow={currentWorkflow} />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No workflow selected
                </h3>
                <p className="text-gray-600 mb-6">
                  Select a workflow from the sidebar or create a new one to get started.
                </p>
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => setShowNewWorkflowModal(true)}
                >
                  Create New Workflow
                </Button>
              </div>
            </div>
          )}
        </div>

        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Node Properties</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Name
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedNode.description || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Node Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value={selectedNode.type}>{selectedNode.type}</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Logic Builder</span>
            <span>•</span>
            <span>{workflows.length} workflow{workflows.length !== 1 ? 's' : ''}</span>
            {currentWorkflow && (
              <>
                <span>•</span>
                <span>{currentWorkflow.nodes.length} nodes</span>
              </>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Ready to build</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogicBuilder