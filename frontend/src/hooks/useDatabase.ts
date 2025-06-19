import { useState, useCallback } from 'react'
import { DatabaseSchema, DatabaseTable, DatabaseField, Relationship } from '@/types'
import { apiClient } from '@/utils/apiClient'

interface DatabaseState {
  schema: DatabaseSchema | null
  selectedTable: DatabaseTable | null
  selectedField: DatabaseField | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
}

interface UseDatabaseReturn extends DatabaseState {
  loadSchema: (appId: string) => Promise<void>
  saveSchema: () => Promise<void>
  createTable: (table: Omit<DatabaseTable, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTable: (tableId: string, updates: Partial<DatabaseTable>) => Promise<void>
  deleteTable: (tableId: string) => Promise<void>
  selectTable: (tableId: string | null) => void
  createField: (tableId: string, field: Omit<DatabaseField, 'id'>) => Promise<void>
  updateField: (tableId: string, fieldId: string, updates: Partial<DatabaseField>) => Promise<void>
  deleteField: (tableId: string, fieldId: string) => Promise<void>
  selectField: (fieldId: string | null) => void
  createRelationship: (relationship: Omit<Relationship, 'id'>) => Promise<void>
  updateRelationship: (relationshipId: string, updates: Partial<Relationship>) => Promise<void>
  deleteRelationship: (relationshipId: string) => Promise<void>
  generateSQL: () => string
  exportSchema: () => string
  importSchema: (schemaData: string) => Promise<void>
}

export const useDatabase = (): UseDatabaseReturn => {
  const [state, setState] = useState<DatabaseState>({
    schema: null,
    selectedTable: null,
    selectedField: null,
    isLoading: false,
    error: null,
    isDirty: false,
  })

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  const loadSchema = useCallback(async (appId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get<DatabaseSchema>(`/apps/${appId}/database`)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          schema: response.data,
          selectedTable: null,
          selectedField: null,
          isDirty: false,
        }))
      } else {
        throw new Error(response.error || 'Failed to load database schema')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load database schema')
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError])

  const saveSchema = useCallback(async () => {
    if (!state.schema) return

    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.put(`/apps/${state.schema.id}/database`, state.schema)
      
      if (response.success) {
        setState(prev => ({ ...prev, isDirty: false }))
      } else {
        throw new Error(response.error || 'Failed to save database schema')
      }
    } catch (error: any) {
      setError(error.message || 'Failed to save database schema')
    } finally {
      setLoading(false)
    }
  }, [state.schema, setLoading, setError])

  const createTable = useCallback(async (tableData: Omit<DatabaseTable, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!state.schema) return

    const newTable: DatabaseTable = {
      ...tableData,
      id: Math.random().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        tables: [...prev.schema.tables, newTable],
        updatedAt: new Date().toISOString(),
      } : null,
      isDirty: true,
    }))
  }, [state.schema])

  const updateTable = useCallback(async (tableId: string, updates: Partial<DatabaseTable>) => {
    if (!state.schema) return

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        tables: prev.schema.tables.map(table =>
          table.id === tableId
            ? { ...table, ...updates, updatedAt: new Date().toISOString() }
            : table
        ),
        updatedAt: new Date().toISOString(),
      } : null,
      selectedTable: prev.selectedTable?.id === tableId
        ? { ...prev.selectedTable, ...updates, updatedAt: new Date().toISOString() }
        : prev.selectedTable,
      isDirty: true,
    }))
  }, [state.schema])

  const deleteTable = useCallback(async (tableId: string) => {
    if (!state.schema) return

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        tables: prev.schema.tables.filter(table => table.id !== tableId),
        relationships: prev.schema.relationships.filter(
          rel => rel.fromTable !== tableId && rel.toTable !== tableId
        ),
        updatedAt: new Date().toISOString(),
      } : null,
      selectedTable: prev.selectedTable?.id === tableId ? null : prev.selectedTable,
      selectedField: null,
      isDirty: true,
    }))
  }, [state.schema])

  const selectTable = useCallback((tableId: string | null) => {
    if (!state.schema) return

    const table = tableId ? state.schema.tables.find(t => t.id === tableId) : null
    setState(prev => ({
      ...prev,
      selectedTable: table || null,
      selectedField: null,
    }))
  }, [state.schema])

  const createField = useCallback(async (tableId: string, fieldData: Omit<DatabaseField, 'id'>) => {
    if (!state.schema) return

    const newField: DatabaseField = {
      ...fieldData,
      id: Math.random().toString(36),
    }

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        tables: prev.schema.tables.map(table =>
          table.id === tableId
            ? { ...table, fields: [...table.fields, newField] }
            : table
        ),
        updatedAt: new Date().toISOString(),
      } : null,
      selectedTable: prev.selectedTable?.id === tableId
        ? { ...prev.selectedTable, fields: [...prev.selectedTable.fields, newField] }
        : prev.selectedTable,
      isDirty: true,
    }))
  }, [state.schema])

  const updateField = useCallback(async (tableId: string, fieldId: string, updates: Partial<DatabaseField>) => {
    if (!state.schema) return

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        tables: prev.schema.tables.map(table =>
          table.id === tableId
            ? {
                ...table,
                fields: table.fields.map(field =>
                  field.id === fieldId ? { ...field, ...updates } : field
                ),
              }
            : table
        ),
        updatedAt: new Date().toISOString(),
      } : null,
      selectedTable: prev.selectedTable?.id === tableId
        ? {
            ...prev.selectedTable,
            fields: prev.selectedTable.fields.map(field =>
              field.id === fieldId ? { ...field, ...updates } : field
            ),
          }
        : prev.selectedTable,
      selectedField: prev.selectedField?.id === fieldId
        ? { ...prev.selectedField, ...updates }
        : prev.selectedField,
      isDirty: true,
    }))
  }, [state.schema])

  const deleteField = useCallback(async (tableId: string, fieldId: string) => {
    if (!state.schema) return

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        tables: prev.schema.tables.map(table =>
          table.id === tableId
            ? { ...table, fields: table.fields.filter(field => field.id !== fieldId) }
            : table
        ),
        updatedAt: new Date().toISOString(),
      } : null,
      selectedTable: prev.selectedTable?.id === tableId
        ? { ...prev.selectedTable, fields: prev.selectedTable.fields.filter(field => field.id !== fieldId) }
        : prev.selectedTable,
      selectedField: prev.selectedField?.id === fieldId ? null : prev.selectedField,
      isDirty: true,
    }))
  }, [state.schema])

  const selectField = useCallback((fieldId: string | null) => {
    if (!state.selectedTable || !fieldId) {
      setState(prev => ({ ...prev, selectedField: null }))
      return
    }

    const field = state.selectedTable.fields.find(f => f.id === fieldId)
    setState(prev => ({ ...prev, selectedField: field || null }))
  }, [state.selectedTable])

  const createRelationship = useCallback(async (relationshipData: Omit<Relationship, 'id'>) => {
    if (!state.schema) return

    const newRelationship: Relationship = {
      ...relationshipData,
      id: Math.random().toString(36),
    }

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        relationships: [...prev.schema.relationships, newRelationship],
        updatedAt: new Date().toISOString(),
      } : null,
      isDirty: true,
    }))
  }, [state.schema])

  const updateRelationship = useCallback(async (relationshipId: string, updates: Partial<Relationship>) => {
    if (!state.schema) return

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        relationships: prev.schema.relationships.map(rel =>
          rel.id === relationshipId ? { ...rel, ...updates } : rel
        ),
        updatedAt: new Date().toISOString(),
      } : null,
      isDirty: true,
    }))
  }, [state.schema])

  const deleteRelationship = useCallback(async (relationshipId: string) => {
    if (!state.schema) return

    setState(prev => ({
      ...prev,
      schema: prev.schema ? {
        ...prev.schema,
        relationships: prev.schema.relationships.filter(rel => rel.id !== relationshipId),
        updatedAt: new Date().toISOString(),
      } : null,
      isDirty: true,
    }))
  }, [state.schema])

  const generateSQL = useCallback((): string => {
    if (!state.schema) return ''

    const sqlStatements: string[] = []

    state.schema.tables.forEach(table => {
      const fields = table.fields.map(field => {
        let fieldDef = `  ${field.name} ${field.type.toUpperCase()}`
        
        if (field.required) fieldDef += ' NOT NULL'
        if (field.unique) fieldDef += ' UNIQUE'
        if (field.defaultValue !== undefined) {
          fieldDef += ` DEFAULT ${typeof field.defaultValue === 'string' ? `'${field.defaultValue}'` : field.defaultValue}`
        }
        
        return fieldDef
      })

      if (table.timestamps) {
        fields.push('  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP')
        fields.push('  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }

      const createTableSQL = `CREATE TABLE ${table.name} (\n${fields.join(',\n')}\n);`
      sqlStatements.push(createTableSQL)

      table.indexes.forEach(index => {
        const indexSQL = `CREATE ${index.unique ? 'UNIQUE ' : ''}INDEX ${index.name} ON ${table.name} (${index.fields.join(', ')});`
        sqlStatements.push(indexSQL)
      })
    })

    state.schema.relationships.forEach(rel => {
      const alterSQL = `ALTER TABLE ${rel.fromTable} ADD CONSTRAINT ${rel.name} FOREIGN KEY (${rel.fromField}) REFERENCES ${rel.toTable}(${rel.toField}) ON DELETE ${rel.onDelete} ON UPDATE ${rel.onUpdate};`
      sqlStatements.push(alterSQL)
    })

    return sqlStatements.join('\n\n')
  }, [state.schema])

  const exportSchema = useCallback((): string => {
    if (!state.schema) return ''
    return JSON.stringify(state.schema, null, 2)
  }, [state.schema])

  const importSchema = useCallback(async (schemaData: string) => {
    try {
      const importedSchema = JSON.parse(schemaData) as DatabaseSchema
      
      if (!importedSchema.tables || !Array.isArray(importedSchema.tables)) {
        throw new Error('Invalid schema format')
      }

      setState(prev => ({
        ...prev,
        schema: {
          ...importedSchema,
          updatedAt: new Date().toISOString(),
        },
        selectedTable: null,
        selectedField: null,
        isDirty: true,
      }))
    } catch (error: any) {
      throw new Error('Failed to import schema: ' + error.message)
    }
  }, [])

  return {
    ...state,
    loadSchema,
    saveSchema,
    createTable,
    updateTable,
    deleteTable,
    selectTable,
    createField,
    updateField,
    deleteField,
    selectField,
    createRelationship,
    updateRelationship,
    deleteRelationship,
    generateSQL,
    exportSchema,
    importSchema,
  }
}