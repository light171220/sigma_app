import { Position } from './common.types'

export interface DatabaseSchema {
  id: string
  name: string
  tables: DatabaseTable[]
  relationships: Relationship[]
  version: number
  createdAt: string
  updatedAt: string
}

export interface DatabaseTable {
  id: string
  name: string
  displayName: string
  description?: string
  fields: DatabaseField[]
  position: Position
  color: string
  icon?: string
  timestamps: boolean
  softDelete: boolean
  audit: boolean
  permissions: TablePermissions
  indexes: TableIndex[]
  constraints: TableConstraint[]
}

export interface DatabaseField {
  id: string
  name: string
  displayName: string
  type: FieldType
  required: boolean
  unique: boolean
  indexed: boolean
  defaultValue?: any
  validation: FieldValidation
  options?: FieldOptions
  description?: string
  order: number
}

export type FieldType = 
  | 'string'
  | 'text'
  | 'integer'
  | 'decimal'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'json'
  | 'uuid'
  | 'email'
  | 'url'
  | 'phone'
  | 'enum'
  | 'file'
  | 'image'
  | 'password'
  | 'currency'
  | 'location'

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  customValidation?: string
  errorMessage?: string
}

export interface FieldOptions {
  enumValues?: string[]
  precision?: number
  scale?: number
  fileTypes?: string[]
  maxFileSize?: number
  multiple?: boolean
  encryption?: boolean
}

export interface Relationship {
  id: string
  name: string
  type: RelationshipType
  fromTable: string
  toTable: string
  fromField: string
  toField: string
  onDelete: CascadeAction
  onUpdate: CascadeAction
  required: boolean
  description?: string
}

export type RelationshipType = 
  | 'one-to-one'
  | 'one-to-many'
  | 'many-to-one'
  | 'many-to-many'

export type CascadeAction = 
  | 'CASCADE'
  | 'SET_NULL'
  | 'RESTRICT'
  | 'NO_ACTION'
  | 'SET_DEFAULT'

export interface TablePermissions {
  create: PermissionLevel[]
  read: PermissionLevel[]
  update: PermissionLevel[]
  delete: PermissionLevel[]
}

export type PermissionLevel = 
  | 'public'
  | 'authenticated'
  | 'owner'
  | 'admin'
  | 'custom'

export interface TableIndex {
  id: string
  name: string
  fields: string[]
  unique: boolean
  type: 'btree' | 'hash' | 'gin' | 'gist'
}

export interface TableConstraint {
  id: string
  name: string
  type: 'check' | 'exclusion' | 'foreign_key' | 'primary_key' | 'unique'
  definition: string
  fields: string[]
}

export interface DatabaseQuery {
  id: string
  name: string
  description?: string
  sql: string
  parameters: QueryParameter[]
  returnType: 'single' | 'multiple' | 'count' | 'boolean'
  cacheable: boolean
  cacheTimeout?: number
}

export interface QueryParameter {
  name: string
  type: FieldType
  required: boolean
  defaultValue?: any
  description?: string
}

export interface DatabaseMigration {
  id: string
  version: number
  name: string
  description: string
  up: string
  down: string
  appliedAt?: string
  rolledBackAt?: string
}

export interface DataRecord {
  id: string
  [key: string]: any
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}

export interface DatabaseConnection {
  id: string
  name: string
  type: 'sqlite' | 'postgresql' | 'mysql' | 'mongodb'
  host?: string
  port?: number
  database: string
  username?: string
  password?: string
  ssl?: boolean
  connectionString?: string
}

export interface DatabaseBackup {
  id: string
  name: string
  description?: string
  size: number
  createdAt: string
  downloadUrl: string
  status: 'creating' | 'completed' | 'failed'
}