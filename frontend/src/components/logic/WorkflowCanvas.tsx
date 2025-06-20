import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Play, MoreVertical, Trash2, Copy, Edit3 } from 'lucide-react'
import { Workflow, WorkflowNode, WorkflowConnection, Position } from '@/types'
import { Button } from '@/components/common/Button'
import { useWorkflow } from '@/hooks/useWorkflow'

interface WorkflowCanvasProps {
  workflow: Workflow
}

interface NodeComponentProps {
  node: WorkflowNode
  isSelected: boolean
  onSelect: () => void
  onMove: (position: Position) => void
  onDelete: () => void
}

const NodeComponent: React.FC<NodeComponentProps> = ({ node, isSelected, onSelect, onMove }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState(node.position)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    onSelect()
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }
    setPosition(newPosition)
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      onMove(position)
    }
  }, [isDragging, position, onMove])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'action': return 'bg-blue-500'
      case 'condition': return 'bg-yellow-500'
      case 'loop': return 'bg-purple-500'
      case 'api_call': return 'bg-green-500'
      case 'database_query': return 'bg-indigo-500'
      case 'send_email': return 'bg-red-500'
      case 'delay': return 'bg-gray-500'
      default: return 'bg-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 50 : isSelected ? 20 : 10,
      }}
      className={`w-48 bg-white rounded-lg shadow-lg border-2 cursor-move select-none ${
        isSelected ? 'border-blue-500' : 'border-gray-200'
      } ${isDragging ? 'shadow-2xl' : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div className={`px-4 py-3 rounded-t-lg text-white ${getNodeColor(node.type)}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">{node.name}</h3>
          <Button variant="ghost" size="sm" icon={MoreVertical} className="text-white opacity-70 hover:opacity-100" />
        </div>
        <p className="text-xs opacity-80 capitalize">{node.type.replace('_', ' ')}</p>
      </div>

      <div className="p-3">
        {node.description && (
          <p className="text-xs text-gray-600 mb-2">{node.description}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{node.inputs.length} inputs</span>
          <span>{node.outputs.length} outputs</span>
        </div>
      </div>

      {node.inputs.map((input, index) => (
        <div
          key={input.id}
          className="absolute left-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white transform -translate-x-1/2"
          style={{ top: 40 + index * 20 }}
        />
      ))}

      {node.outputs.map((output, index) => (
        <div
          key={output.id}
          className="absolute right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white transform translate-x-1/2"
          style={{ top: 40 + index * 20 }}
        />
      ))}

      {isSelected && (
        <div className="absolute -top-8 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          {node.name}
        </div>
      )}
    </motion.div>
  )
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({ workflow }) => {
  const { selectedNode, selectNode, updateNode, deleteNode } = useWorkflow()
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleNodeMove = (nodeId: string, position: Position) => {
    updateNode(nodeId, { position })
  }

  const handleNodeDelete = (nodeId: string) => {
    if (confirm('Are you sure you want to delete this node?')) {
      deleteNode(nodeId)
    }
  }

  const renderConnection = (connection: WorkflowConnection) => {
    const fromNode = workflow.nodes.find(n => n.id === connection.sourceNodeId)
    const toNode = workflow.nodes.find(n => n.id === connection.targetNodeId)
    
    if (!fromNode || !toNode) return null

    const fromPoint = {
      x: fromNode.position.x + 192,
      y: fromNode.position.y + 40,
    }
    const toPoint = {
      x: toNode.position.x,
      y: toNode.position.y + 40,
    }

    const deltaX = toPoint.x - fromPoint.x
    const deltaY = toPoint.y - fromPoint.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance < 10) return null

    return (
      <line
        key={connection.id}
        x1={fromPoint.x}
        y1={fromPoint.y}
        x2={toPoint.x}
        y2={toPoint.y}
        stroke="#6b7280"
        strokeWidth="2"
        markerEnd="url(#arrowhead)"
      />
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        className="w-full h-full relative overflow-auto"
        style={{
          backgroundImage: `
            linear-gradient(rgba(156, 163, 175, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 163, 175, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="10"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
          
          {workflow.connections.map(renderConnection)}
        </svg>

        <div className="relative" style={{ minWidth: '200%', minHeight: '200%', zIndex: 10 }}>
          {workflow.nodes.map((node) => (
            <NodeComponent
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onSelect={() => selectNode(node.id)}
              onMove={(position) => handleNodeMove(node.id, position)}
              onDelete={() => handleNodeDelete(node.id)}
            />
          ))}

          {workflow.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No workflow nodes yet
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Start building your workflow by adding nodes from the library.
                </p>
                <Button variant="primary" icon={Plus}>
                  Add Your First Node
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedNode && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-4 h-4 rounded ${
              selectedNode.type === 'action' ? 'bg-blue-500' :
              selectedNode.type === 'condition' ? 'bg-yellow-500' :
              selectedNode.type === 'loop' ? 'bg-purple-500' : 'bg-gray-400'
            }`} />
            <h4 className="font-semibold text-gray-900">{selectedNode.name}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3 capitalize">
            {selectedNode.type.replace('_', ' ')} node
          </p>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" icon={Edit3}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" icon={Copy}>
              Duplicate
            </Button>
            <Button variant="ghost" size="sm" icon={Trash2} className="text-red-600">
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}