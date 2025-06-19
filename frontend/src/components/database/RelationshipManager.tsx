import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, Plus, Trash2, Edit3, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { Relationship, RelationshipType, CascadeAction } from '@/types'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useDatabase } from '@/hooks/useDatabase'

export const RelationshipMapper: React.FC = () => {
  const { 
    schema, 
    createRelationship, 
    updateRelationship, 
    deleteRelationship 
  } = useDatabase()
  
  const [showNewRelationshipModal, setShowNewRelationshipModal] = useState(false)
  const [editingRelationship, setEditingRelationship] = useState<Relationship | null>(null)
  const [newRelationship, setNewRelationship] = useState({
    name: '',
    type: 'one-to-many' as RelationshipType,
    fromTable: '',
    toTable: '',
    fromField: '',
    toField: '',
    onDelete: 'RESTRICT' as CascadeAction,
    onUpdate: 'CASCADE' as CascadeAction,
    required: false,
    description: '',
  })

  const relationshipTypes = [
    { value: 'one-to-one', label: 'One to One', icon: ArrowRight },
    { value: 'one-to-many', label: 'One to Many', icon: ArrowRight },
    { value: 'many-to-one', label: 'Many to One', icon: ArrowRight },
    { value: 'many-to-many', label: 'Many to Many', icon: ArrowLeftRight },
  ]

  const cascadeActions = [
    { value: 'CASCADE', label: 'CASCADE', description: 'Delete/update related records' },
    { value: 'SET_NULL', label: 'SET NULL', description: 'Set foreign key to NULL' },
    { value: 'RESTRICT', label: 'RESTRICT', description: 'Prevent delete/update if related records exist' },
    { value: 'NO_ACTION', label: 'NO ACTION', description: 'No action taken' },
    { value: 'SET_DEFAULT', label: 'SET DEFAULT', description: 'Set to default value' },
  ]

  const handleCreateRelationship = async () => {
    if (!newRelationship.name.trim() || !newRelationship.fromTable || !newRelationship.toTable) return

    try {
      await createRelationship({
        name: newRelationship.name.trim(),
        type: newRelationship.type,
        fromTable: newRelationship.fromTable,
        toTable: newRelationship.toTable,
        fromField: newRelationship.fromField,
        toField: newRelationship.toField,
        onDelete: newRelationship.onDelete,
        onUpdate: newRelationship.onUpdate,
        required: newRelationship.required,
        description: newRelationship.description,
      })

      setNewRelationship({
        name: '',
        type: 'one-to-many',
        fromTable: '',
        toTable: '',
        fromField: '',
        toField: '',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        required: false,
        description: '',
      })
      setShowNewRelationshipModal(false)
    } catch (error) {
      console.error('Failed to create relationship:', error)
    }
  }

  const handleDeleteRelationship = async (relationshipId: string) => {
    if (confirm('Are you sure you want to delete this relationship?')) {
      await deleteRelationship(relationshipId)
    }
  }

  const getTableName = (tableId: string) => {
    const table = schema?.tables.find(t => t.id === tableId)
    return table?.displayName || tableId
  }

  const getFieldsForTable = (tableId: string) => {
    const table = schema?.tables.find(t => t.id === tableId)
    return table?.fields || []
  }

  const getRelationshipIcon = (type: RelationshipType) => {
    const typeConfig = relationshipTypes.find(t => t.value === type)
    return typeConfig?.icon || ArrowRight
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Relationships</h3>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewRelationshipModal(true)}
          >
            New Relationship
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          {schema?.relationships.length || 0} relationship{(schema?.relationships.length || 0) !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {schema?.relationships.map((relationship, index) => {
            const RelationIcon = getRelationshipIcon(relationship.type)
            
            return (
              <motion.div
                key={relationship.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Link className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{relationship.name}</h4>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {relationship.type.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit3}
                      onClick={() => setEditingRelationship(relationship)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteRelationship(relationship.id)}
                      className="text-red-600"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {getTableName(relationship.fromTable)}
                    </div>
                    <div className="text-gray-500">{relationship.fromField}</div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <RelationIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 uppercase">
                      {relationship.type}
                    </span>
                  </div>
                  
                  <div className="flex-1 text-right">
                    <div className="font-medium text-gray-900">
                      {getTableName(relationship.toTable)}
                    </div>
                    <div className="text-gray-500">{relationship.toField}</div>
                  </div>
                </div>

                {relationship.description && (
                  <p className="text-xs text-gray-500 mt-2">{relationship.description}</p>
                )}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>On Delete: {relationship.onDelete}</span>
                    <span>On Update: {relationship.onUpdate}</span>
                  </div>
                  {relationship.required && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Required
                    </span>
                  )}
                </div>
              </motion.div>
            )
          })}

          {(!schema?.relationships || schema.relationships.length === 0) && (
            <div className="text-center py-12">
              <Link className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No relationships yet</h3>
              <p className="text-gray-600 mb-6">
                Create relationships between tables to establish data connections.
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowNewRelationshipModal(true)}
              >
                Create first relationship
              </Button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showNewRelationshipModal}
        onClose={() => setShowNewRelationshipModal(false)}
        title="Create New Relationship"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Name
            </label>
            <input
              type="text"
              value={newRelationship.name}
              onChange={(e) => setNewRelationship({ ...newRelationship, name: e.target.value })}
              placeholder="e.g., user_posts, order_items"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {relationshipTypes.map((type) => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="relationshipType"
                    value={type.value}
                    checked={newRelationship.type === type.value}
                    onChange={(e) => setNewRelationship({ ...newRelationship, type: e.target.value as RelationshipType })}
                    className="sr-only"
                  />
                  <div className={`p-3 border rounded-lg transition-all ${
                    newRelationship.type === type.value
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-300'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <type.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">{type.label}</span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Table
              </label>
              <select
                value={newRelationship.fromTable}
                onChange={(e) => setNewRelationship({ 
                  ...newRelationship, 
                  fromTable: e.target.value,
                  fromField: '' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select table...</option>
                {schema?.tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Table
              </label>
              <select
                value={newRelationship.toTable}
                onChange={(e) => setNewRelationship({ 
                  ...newRelationship, 
                  toTable: e.target.value,
                  toField: '' 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select table...</option>
                {schema?.tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Field
              </label>
              <select
                value={newRelationship.fromField}
                onChange={(e) => setNewRelationship({ ...newRelationship, fromField: e.target.value })}
                disabled={!newRelationship.fromTable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select field...</option>
                {getFieldsForTable(newRelationship.fromTable).map((field) => (
                  <option key={field.id} value={field.name}>
                    {field.displayName} ({field.type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Field
              </label>
              <select
                value={newRelationship.toField}
                onChange={(e) => setNewRelationship({ ...newRelationship, toField: e.target.value })}
                disabled={!newRelationship.toTable}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select field...</option>
                {getFieldsForTable(newRelationship.toTable).map((field) => (
                  <option key={field.id} value={field.name}>
                    {field.displayName} ({field.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                On Delete
              </label>
              <select
                value={newRelationship.onDelete}
                onChange={(e) => setNewRelationship({ ...newRelationship, onDelete: e.target.value as CascadeAction })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cascadeActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {cascadeActions.find(a => a.value === newRelationship.onDelete)?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                On Update
              </label>
              <select
                value={newRelationship.onUpdate}
                onChange={(e) => setNewRelationship({ ...newRelationship, onUpdate: e.target.value as CascadeAction })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cascadeActions.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {cascadeActions.find(a => a.value === newRelationship.onUpdate)?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={newRelationship.required}
              onChange={(e) => setNewRelationship({ ...newRelationship, required: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Required relationship</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newRelationship.description}
              onChange={(e) => setNewRelationship({ ...newRelationship, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewRelationshipModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateRelationship}
              disabled={!newRelationship.name.trim() || !newRelationship.fromTable || !newRelationship.toTable}
            >
              Create Relationship
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}