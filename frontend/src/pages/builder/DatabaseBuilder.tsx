import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Database, Plus, Save, ArrowLeft, Table, Link, Settings, 
  Download, Upload, Key,
  Columns, Search
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { TableDesigner } from '@/components/database/TableDesigner'
import { FieldEditor } from '@/components/database/FieldEditor'
import { useDatabase } from '@/hooks/useDatabase'

const DatabaseBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    schema,
    selectedTable,
    isLoading,
    error,
    loadSchema,
    saveSchema,
    createTable,
    selectTable,
  } = useDatabase()

  const [showNewTableModal, setShowNewTableModal] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [newTableDisplayName, setNewTableDisplayName] = useState('')
  const [viewMode, setViewMode] = useState<'visual' | 'sql'>('visual')

  useEffect(() => {
    if (id) {
      loadSchema(id)
    }
  }, [id, loadSchema])

  const handleCreateTable = async () => {
    if (!newTableName.trim() || !newTableDisplayName.trim()) return

    try {
      await createTable({
        name: newTableName.trim(),
        displayName: newTableDisplayName.trim(),
        description: '',
        fields: [
          {
            id: 'id-field',
            name: 'id',
            displayName: 'ID',
            type: 'uuid',
            required: true,
            unique: true,
            indexed: true,
            validation: {},
            order: 1,
          }
        ],
        position: { x: 100 + (schema?.tables.length || 0) * 50, y: 100 },
        color: '#3B82F6',
        timestamps: true,
        softDelete: false,
        audit: false,
        permissions: {
          create: ['authenticated'],
          read: ['authenticated'],
          update: ['authenticated'],
          delete: ['authenticated'],
        },
        indexes: [],
        constraints: [],
      })

      setNewTableName('')
      setNewTableDisplayName('')
      setShowNewTableModal(false)
    } catch (error) {
      console.error('Failed to create table:', error)
    }
  }

  const handleExportSchema = () => {
    if (!schema) return

    const dataStr = JSON.stringify(schema, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${schema.name}-schema.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const stats = [
    {
      label: 'Tables',
      value: schema?.tables.length || 0,
      icon: Table,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Fields',
      value: schema?.tables.reduce((total, table) => total + table.fields.length, 0) || 0,
      icon: Columns,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Relationships',
      value: schema?.relationships.length || 0,
      icon: Link,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Indexes',
      value: schema?.tables.reduce((total, table) => total + table.indexes.length, 0) || 0,
      icon: Key,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to load database</h2>
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
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Database Designer</h1>
                <p className="text-sm text-gray-500">{schema?.name || 'Loading...'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('visual')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  viewMode === 'visual'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setViewMode('sql')}
                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                  viewMode === 'sql'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                SQL
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            <Button variant="secondary" size="sm" icon={Upload}>
              Import
            </Button>
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExportSchema}>
              Export
            </Button>
            <Button variant="secondary" size="sm" icon={Save} onClick={saveSchema}>
              Save
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowNewTableModal(true)}>
              New Table
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Overview</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {stats.map((stat, _index) => (
                <div key={stat.label} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                      <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tables..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {schema?.tables.map((table) => (
                <motion.div
                  key={table.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => selectTable(table.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedTable?.id === table.id
                      ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{table.displayName}</h4>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: table.color }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{table.name}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{table.fields.length} fields</span>
                    <span>{schema.relationships.filter(r => r.fromTable === table.id || r.toTable === table.id).length} relations</span>
                  </div>
                </motion.div>
              ))}

              {(!schema?.tables || schema.tables.length === 0) && (
                <div className="text-center py-8">
                  <Table className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">No tables yet</p>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setShowNewTableModal(true)}
                  >
                    Create first table
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {viewMode === 'visual' ? (
            <TableDesigner />
          ) : (
            <div className="flex-1 p-6">
              <div className="bg-white rounded-lg border border-gray-200 h-full">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Generated SQL</h3>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto text-sm">
                    {schema?.tables.map(table => `
CREATE TABLE ${table.name} (
${table.fields.map(field => `  ${field.name} ${field.type.toUpperCase()}${field.required ? ' NOT NULL' : ''}${field.unique ? ' UNIQUE' : ''}`).join(',\n')}${table.timestamps ? ',\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' : ''}
);`).join('\n\n')}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-80 bg-white border-l border-gray-200">
          {selectedTable ? (
            <FieldEditor table={selectedTable} />
          ) : (
            <div className="p-4">
              <div className="text-center py-8">
                <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  Select a table to edit its structure
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showNewTableModal}
        onClose={() => setShowNewTableModal(false)}
        title="Create New Table"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Table Name
            </label>
            <input
              type="text"
              value={newTableName}
              onChange={(e) => setNewTableName(e.target.value)}
              placeholder="e.g., users, products"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Used in database queries (lowercase, no spaces)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={newTableDisplayName}
              onChange={(e) => setNewTableDisplayName(e.target.value)}
              placeholder="e.g., Users, Products"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Human-readable name shown in the interface
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewTableModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateTable}
              disabled={!newTableName.trim() || !newTableDisplayName.trim()}
            >
              Create Table
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DatabaseBuilder