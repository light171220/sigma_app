import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Table, Key, Link, MoreVertical, Edit3, Trash2, Plus } from 'lucide-react'
import { DatabaseTable, Position } from '@/types'
import { Button } from '@/components/common/Button'
import { useDatabase } from '@/hooks/useDatabase'

interface TableNodeProps {
  table: DatabaseTable
  isSelected: boolean
  onSelect: () => void
  onMove: (position: Position) => void
}

const TableNode: React.FC<TableNodeProps> = ({ table, isSelected, onSelect, onMove }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState(table.position)
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    onSelect()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }
    setPosition(newPosition)
  }

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false)
      onMove(position)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart, position])

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'uuid':
      case 'integer':
        return <Key className="w-3 h-3 text-yellow-600" />
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-400" />
    }
  }

  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: isDragging ? 50 : isSelected ? 20 : 10,
      }}
      className={`
        w-64 bg-white rounded-lg shadow-lg border-2 cursor-move select-none
        ${isSelected ? 'border-blue-500' : 'border-gray-200'}
        ${isDragging ? 'shadow-2xl' : ''}
      `}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="px-4 py-3 rounded-t-lg flex items-center justify-between"
        style={{ backgroundColor: table.color + '20', borderBottom: `2px solid ${table.color}` }}
      >
        <div className="flex items-center space-x-2">
          <Table className="w-4 h-4" style={{ color: table.color }} />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{table.displayName}</h3>
            <p className="text-xs text-gray-500">{table.name}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" icon={MoreVertical} className="opacity-60 hover:opacity-100" />
      </div>

      <div className="max-h-48 overflow-y-auto">
        {table.fields.slice(0, 8).map((field) => (
          <div key={field.id} className="px-4 py-2 border-b border-gray-100 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getFieldIcon(field.type)}
                <span className="text-sm font-medium text-gray-900">{field.name}</span>
                {field.required && <span className="text-xs text-red-500">*</span>}
                {field.unique && <span className="text-xs text-blue-500">U</span>}
              </div>
              <span className="text-xs text-gray-500 uppercase">{field.type}</span>
            </div>
          </div>
        ))}
        
        {table.fields.length > 8 && (
          <div className="px-4 py-2 text-center text-xs text-gray-500">
            +{table.fields.length - 8} more fields
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{table.fields.length} fields</span>
          <div className="flex items-center space-x-2">
            {table.timestamps && <span className="px-1 bg-green-100 text-green-600 rounded">TS</span>}
            {table.softDelete && <span className="px-1 bg-orange-100 text-orange-600 rounded">SD</span>}
            {table.audit && <span className="px-1 bg-purple-100 text-purple-600 rounded">AU</span>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export const TableDesigner: React.FC = () => {
  const { schema, selectedTable, selectTable, updateTable } = useDatabase()
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleTableMove = (tableId: string, position: Position) => {
    updateTable(tableId, { position })
  }

  const renderRelationshipLine = (fromTable: DatabaseTable, toTable: DatabaseTable, relationship: any) => {
    const fromCenter = {
      x: fromTable.position.x + 128,
      y: fromTable.position.y + 40,
    }
    const toCenter = {
      x: toTable.position.x + 128,
      y: toTable.position.y + 40,
    }

    const deltaX = toCenter.x - fromCenter.x
    const deltaY = toCenter.y - fromCenter.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    if (distance < 10) return null

    const fromPoint = {
      x: fromCenter.x + (deltaX / distance) * 128,
      y: fromCenter.y + (deltaY / distance) * 20,
    }
    const toPoint = {
      x: toCenter.x - (deltaX / distance) * 128,
      y: toCenter.y - (deltaY / distance) * 20,
    }

    return (
      <line
        key={relationship.id}
        x1={fromPoint.x}
        y1={fromPoint.y}
        x2={toPoint.x}
        y2={toPoint.y}
        stroke="#6b7280"
        strokeWidth="2"
        strokeDasharray={relationship.type === 'one-to-many' ? '5,5' : '0'}
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
          
          {schema?.relationships.map(relationship => {
            const fromTable = schema.tables.find(t => t.id === relationship.fromTable)
            const toTable = schema.tables.find(t => t.id === relationship.toTable)
            
            if (!fromTable || !toTable) return null
            
            return renderRelationshipLine(fromTable, toTable, relationship)
          })}
        </svg>

        <div className="relative" style={{ minWidth: '200%', minHeight: '200%', zIndex: 10 }}>
          {schema?.tables.map((table) => (
            <TableNode
              key={table.id}
              table={table}
              isSelected={selectedTable?.id === table.id}
              onSelect={() => selectTable(table.id)}
              onMove={(position) => handleTableMove(table.id, position)}
            />
          ))}

          {(!schema?.tables || schema.tables.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-4">
                  <Table className="w-12 h-12 text-gray-300" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tables in your database
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  Start by creating your first table to define the data structure for your app.
                </p>
                <Button variant="primary" icon={Plus}>
                  Create Your First Table
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTable && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: selectedTable.color }}
            />
            <h4 className="font-semibold text-gray-900">{selectedTable.displayName}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">{selectedTable.description || 'No description'}</p>
          <div className="flex space-x-2">
            <Button variant="secondary" size="sm" icon={Edit3}>
              Edit
            </Button>
            <Button variant="secondary" size="sm" icon={Link}>
              Relations
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