import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit3, Trash2, Key, Database } from 'lucide-react'
import { DatabaseTable, DatabaseField, FieldType } from '@/types'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'
import { useDatabase } from '@/hooks/useDatabase'

interface FieldEditorProps {
  table: DatabaseTable
}

export const FieldEditor: React.FC<FieldEditorProps> = ({ table }) => {
  const { createField, updateField, deleteField, selectField, selectedField } = useDatabase()
  const [showNewFieldModal, setShowNewFieldModal] = useState(false)
  const [_editingField, setEditingField] = useState<DatabaseField | null>(null)
  const [newField, setNewField] = useState({
    name: '',
    displayName: '',
    type: 'string' as FieldType,
    required: false,
    unique: false,
    indexed: false,
    defaultValue: '',
    description: '',
  })

  const fieldTypes = [
    { value: 'string', label: 'String', description: 'Text up to 255 characters' },
    { value: 'text', label: 'Text', description: 'Long text content' },
    { value: 'integer', label: 'Integer', description: 'Whole numbers' },
    { value: 'decimal', label: 'Decimal', description: 'Numbers with decimal places' },
    { value: 'boolean', label: 'Boolean', description: 'True/false values' },
    { value: 'date', label: 'Date', description: 'Date without time' },
    { value: 'datetime', label: 'DateTime', description: 'Date and time' },
    { value: 'time', label: 'Time', description: 'Time without date' },
    { value: 'json', label: 'JSON', description: 'Structured data' },
    { value: 'uuid', label: 'UUID', description: 'Unique identifier' },
    { value: 'email', label: 'Email', description: 'Email address' },
    { value: 'url', label: 'URL', description: 'Web address' },
    { value: 'phone', label: 'Phone', description: 'Phone number' },
    { value: 'enum', label: 'Enum', description: 'Select from options' },
    { value: 'file', label: 'File', description: 'File upload' },
    { value: 'image', label: 'Image', description: 'Image upload' },
    { value: 'password', label: 'Password', description: 'Encrypted password' },
    { value: 'currency', label: 'Currency', description: 'Money amount' },
    { value: 'location', label: 'Location', description: 'Geographic coordinates' },
  ]

  const handleCreateField = async () => {
    if (!newField.name.trim() || !newField.displayName.trim()) return

    try {
      await createField(table.id, {
        name: newField.name.trim(),
        displayName: newField.displayName.trim(),
        type: newField.type,
        required: newField.required,
        unique: newField.unique,
        indexed: newField.indexed,
        defaultValue: newField.defaultValue || undefined,
        description: newField.description,
        validation: {},
        order: table.fields.length + 1,
      })

      setNewField({
        name: '',
        displayName: '',
        type: 'string',
        required: false,
        unique: false,
        indexed: false,
        defaultValue: '',
        description: '',
      })
      setShowNewFieldModal(false)
    } catch (error) {
      console.error('Failed to create field:', error)
    }
  }

  const handleUpdateField = async (field: DatabaseField, updates: Partial<DatabaseField>) => {
    await updateField(table.id, field.id, updates)
  }

  const handleDeleteField = async (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      await deleteField(table.id, fieldId)
    }
  }

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'uuid':
      case 'integer':
        return <Key className="w-4 h-4 text-yellow-600" />
      case 'string':
      case 'text':
        return <div className="w-4 h-4 bg-blue-500 rounded" />
      case 'boolean':
        return <div className="w-4 h-4 bg-green-500 rounded" />
      case 'date':
      case 'datetime':
      case 'time':
        return <div className="w-4 h-4 bg-purple-500 rounded" />
      case 'json':
        return <div className="w-4 h-4 bg-orange-500 rounded" />
      default:
        return <div className="w-4 h-4 bg-gray-400 rounded" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Table Structure</h3>
          <Button
            variant="ghost"
            size="sm"
            icon={Plus}
            onClick={() => setShowNewFieldModal(true)} children={undefined} />
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div
            className="w-3 h-3 rounded"
            style={{ backgroundColor: table.color }}
          />
          <span>{table.displayName}</span>
          <span>•</span>
          <span>{table.fields.length} fields</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-2">
          {table.fields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => selectField(field.id)}
              className={`
                p-3 rounded-lg border cursor-pointer transition-all
                ${selectedField?.id === field.id
                  ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getFieldIcon(field.type)}
                  <span className="font-medium text-gray-900">{field.displayName}</span>
                  <span className="text-xs text-gray-500">({field.name})</span>
                </div>

                <div className="flex items-center space-x-1">
                  {field.required && (
                    <span className="px-1 text-xs bg-red-100 text-red-600 rounded">Required</span>
                  )}
                  {field.unique && (
                    <span className="px-1 text-xs bg-blue-100 text-blue-600 rounded">Unique</span>
                  )}
                  {field.indexed && (
                    <span className="px-1 text-xs bg-green-100 text-green-600 rounded">Indexed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 uppercase">{field.type}</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit3}
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingField(field)
                    }}
                    className="opacity-0 group-hover:opacity-100"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteField(field.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-600"
                  />
                </div>
              </div>

              {field.description && (
                <p className="text-xs text-gray-500 mt-1">{field.description}</p>
              )}
            </motion.div>
          ))}

          {table.fields.length === 0 && (
            <div className="text-center py-8">
              <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">No fields in this table</p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setShowNewFieldModal(true)}
              >
                Add first field
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedField && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Field Properties</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={selectedField.displayName}
                onChange={(e) => handleUpdateField(selectedField, { displayName: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Type
              </label>
              <select
                value={selectedField.type}
                onChange={(e) => handleUpdateField(selectedField, { type: e.target.value as FieldType })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
              >
                {fieldTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedField.required}
                  onChange={(e) => handleUpdateField(selectedField, { required: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Required</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedField.unique}
                  onChange={(e) => handleUpdateField(selectedField, { unique: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Unique</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedField.indexed}
                  onChange={(e) => handleUpdateField(selectedField, { indexed: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Indexed</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              <input
                type="text"
                value={selectedField.defaultValue || ''}
                onChange={(e) => handleUpdateField(selectedField, { defaultValue: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                placeholder="Optional default value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={selectedField.description || ''}
                onChange={(e) => handleUpdateField(selectedField, { description: e.target.value })}
                rows={2}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                placeholder="Field description..."
              />
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showNewFieldModal}
        onClose={() => setShowNewFieldModal(false)}
        title="Add New Field"
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={newField.name}
                onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                placeholder="e.g., email, age"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={newField.displayName}
                onChange={(e) => setNewField({ ...newField, displayName: e.target.value })}
                placeholder="e.g., Email Address, Age"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field Type
            </label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value as FieldType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {fieldTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Required</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newField.unique}
                onChange={(e) => setNewField({ ...newField, unique: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Unique</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newField.indexed}
                onChange={(e) => setNewField({ ...newField, indexed: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Indexed</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={newField.description}
              onChange={(e) => setNewField({ ...newField, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional field description..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowNewFieldModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateField}
              disabled={!newField.name.trim() || !newField.displayName.trim()}
            >
              Add Field
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}