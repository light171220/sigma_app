import { Position } from './common.types'

export interface Workflow {
  id: string
  name: string
  description?: string
  trigger: WorkflowTrigger
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  variables: WorkflowVariable[]
  status: WorkflowStatus
  version: number
  createdAt: string
  updatedAt: string
  lastRunAt?: string
  runCount: number
  errorCount: number
}

export type WorkflowStatus = 'active' | 'inactive' | 'draft' | 'error'

export interface WorkflowTrigger {
  id: string
  type: TriggerType
  name: string
  config: TriggerConfig
  enabled: boolean
}

export type TriggerType = 
  | 'app_start'
  | 'button_click'
  | 'form_submit'
  | 'data_change'
  | 'timer'
  | 'screen_load'
  | 'user_login'
  | 'user_logout'
  | 'api_webhook'
  | 'file_upload'
  | 'notification_received'
  | 'location_change'
  | 'device_shake'
  | 'background_task'

export interface TriggerConfig {
  [key: string]: any
  componentId?: string
  eventType?: string
  interval?: number
  cron?: string
  condition?: string
  webhookUrl?: string
}

export interface WorkflowNode {
  id: string
  type: NodeType
  name: string
  description?: string
  position: Position
  config: NodeConfig
  inputs: NodePort[]
  outputs: NodePort[]
  timeout?: number
  retryConfig?: RetryConfig
  errorHandling: ErrorHandling
}

export type NodeType = 
  | 'action'
  | 'condition'
  | 'loop'
  | 'delay'
  | 'parallel'
  | 'merge'
  | 'api_call'
  | 'database_query'
  | 'send_email'
  | 'send_sms'
  | 'push_notification'
  | 'file_operation'
  | 'data_transform'
  | 'javascript'
  | 'webhook'
  | 'schedule'
  | 'approval'
  | 'user_input'
  | 'end'

export interface NodeConfig {
  [key: string]: any
}

export interface ActionNodeConfig extends NodeConfig {
  actionType: ActionType
  parameters: Record<string, any>
  successMessage?: string
  errorMessage?: string
}

export interface ConditionNodeConfig extends NodeConfig {
  condition: string
  trueLabel?: string
  falseLabel?: string
}

export interface LoopNodeConfig extends NodeConfig {
  loopType: 'for' | 'while' | 'forEach'
  condition?: string
  iterationVariable?: string
  maxIterations?: number
  collection?: string
}

export interface ApiCallNodeConfig extends NodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  headers: Record<string, string>
  body?: any
  authentication?: ApiAuthentication
  responseMapping?: ResponseMapping
}

export interface DatabaseQueryNodeConfig extends NodeConfig {
  operation: 'select' | 'insert' | 'update' | 'delete' | 'custom'
  table?: string
  query?: string
  parameters?: Record<string, any>
  resultMapping?: ResultMapping
}

export interface EmailNodeConfig extends NodeConfig {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  bodyType: 'text' | 'html'
  attachments?: FileAttachment[]
  template?: string
  templateData?: Record<string, any>
}

export interface NotificationNodeConfig extends NodeConfig {
  title: string
  body: string
  data?: Record<string, any>
  badge?: number
  sound?: string
  icon?: string
  image?: string
  actions?: NotificationAction[]
  scheduling?: NotificationScheduling
}

export interface FileOperationNodeConfig extends NodeConfig {
  operation: 'read' | 'write' | 'delete' | 'copy' | 'move' | 'upload' | 'download'
  path: string
  content?: string
  encoding?: string
  destination?: string
  overwrite?: boolean
}

export interface DataTransformNodeConfig extends NodeConfig {
  transformations: DataTransformation[]
  inputData: string
  outputVariable: string
}

export interface JavaScriptNodeConfig extends NodeConfig {
  code: string
  inputs: string[]
  outputs: string[]
  libraries?: string[]
}

export interface NodePort {
  id: string
  name: string
  type: 'input' | 'output'
  dataType: PortDataType
  required: boolean
  multiple: boolean
}

export type PortDataType = 
  | 'any'
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'file'
  | 'image'
  | 'date'

export interface WorkflowConnection {
  id: string
  sourceNodeId: string
  sourcePortId: string
  targetNodeId: string
  targetPortId: string
  condition?: string
  label?: string
}

export interface WorkflowVariable {
  id: string
  name: string
  type: VariableType
  value: any
  scope: VariableScope
  description?: string
  encrypted: boolean
}

export type VariableType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'date'
  | 'file'

export type VariableScope = 'global' | 'workflow' | 'node' | 'session'

export interface RetryConfig {
  enabled: boolean
  maxRetries: number
  retryDelay: number
  exponentialBackoff: boolean
  retryConditions: string[]
}

export interface ErrorHandling {
  onError: 'stop' | 'continue' | 'retry' | 'custom'
  errorWorkflow?: string
  logErrors: boolean
  notifyOnError: boolean
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: ExecutionStatus
  startedAt: string
  completedAt?: string
  duration?: number
  trigger: ExecutionTrigger
  context: ExecutionContext
  logs: ExecutionLog[]
  error?: ExecutionError
}

export type ExecutionStatus = 
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timeout'

export interface ExecutionTrigger {
  type: TriggerType
  data: any
  userId?: string
  source: string
}

export interface ExecutionContext {
  variables: Record<string, any>
  user?: any
  session?: any
  environment: 'development' | 'staging' | 'production'
}

export interface ExecutionLog {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  nodeId?: string
  message: string
  data?: any
  duration?: number
}

export interface ExecutionError {
  code: string
  message: string
  nodeId?: string
  stack?: string
  retryable: boolean
}

export type ActionType = 
  | 'navigate_screen'
  | 'go_back'
  | 'show_modal'
  | 'hide_modal'
  | 'show_toast'
  | 'set_variable'
  | 'get_variable'
  | 'save_data'
  | 'load_data'
  | 'delete_data'
  | 'api_request'
  | 'send_email'
  | 'make_phone_call'
  | 'open_url'
  | 'share_content'
  | 'take_photo'
  | 'choose_file'
  | 'show_notification'
  | 'play_sound'
  | 'vibrate'
  | 'calculate'
  | 'format_text'
  | 'validate_input'

export interface ApiAuthentication {
  type: 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth2'
  token?: string
  username?: string
  password?: string
  apiKey?: string
  apiKeyHeader?: string
}

export interface ResponseMapping {
  statusCode: string
  data: string
  headers: string
  errorPath?: string
}

export interface ResultMapping {
  success: string
  data: string
  count: string
  error?: string
}

export interface FileAttachment {
  name: string
  path: string
  contentType: string
  inline: boolean
}

export interface NotificationAction {
  id: string
  title: string
  action: string
  destructive: boolean
  authenticationRequired: boolean
}

export interface NotificationScheduling {
  delay?: number
  scheduleAt?: string
  repeatInterval?: number
  repeatCount?: number
}

export interface DataTransformation {
  type: 'map' | 'filter' | 'reduce' | 'sort' | 'group' | 'merge' | 'split' | 'format'
  field?: string
  expression: string
  parameters?: Record<string, any>
}