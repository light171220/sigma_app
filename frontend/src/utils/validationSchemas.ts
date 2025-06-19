import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
})

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const AppCreateSchema = z.object({
  name: z.string().min(1, 'App name is required').max(50, 'App name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['business', 'productivity', 'finance', 'hr', 'service', 'education', 'healthcare', 'custom']),
  templateId: z.string().optional(),
})

export const AppUpdateSchema = z.object({
  name: z.string().min(1, 'App name is required').max(50, 'App name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  category: z.enum(['business', 'productivity', 'finance', 'hr', 'service', 'education', 'healthcare', 'custom']).optional(),
  icon: z.string().url('Invalid icon URL').optional(),
})

export const ScreenCreateSchema = z.object({
  name: z.string().min(1, 'Screen name is required').max(30, 'Screen name too long'),
  title: z.string().min(1, 'Screen title is required').max(50, 'Screen title too long'),
  isHome: z.boolean().default(false),
})

export const ComponentCreateSchema = z.object({
  type: z.string().min(1, 'Component type is required'),
  name: z.string().min(1, 'Component name is required').max(30, 'Component name too long'),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
  }),
  size: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
  }),
})

export const TableCreateSchema = z.object({
  name: z.string()
    .min(1, 'Table name is required')
    .max(50, 'Table name too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid table name format'),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  timestamps: z.boolean().default(true),
  softDelete: z.boolean().default(false),
  audit: z.boolean().default(false),
})

export const FieldCreateSchema = z.object({
  name: z.string()
    .min(1, 'Field name is required')
    .max(50, 'Field name too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid field name format'),
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  type: z.enum([
    'string', 'text', 'integer', 'decimal', 'boolean', 'date', 'datetime', 'time',
    'json', 'uuid', 'email', 'url', 'phone', 'enum', 'file', 'image', 'password',
    'currency', 'location'
  ]),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  indexed: z.boolean().default(false),
  defaultValue: z.any().optional(),
  description: z.string().max(500, 'Description too long').optional(),
})

export const RelationshipCreateSchema = z.object({
  name: z.string().min(1, 'Relationship name is required').max(50, 'Relationship name too long'),
  type: z.enum(['one-to-one', 'one-to-many', 'many-to-one', 'many-to-many']),
  fromTable: z.string().min(1, 'From table is required'),
  toTable: z.string().min(1, 'To table is required'),
  fromField: z.string().min(1, 'From field is required'),
  toField: z.string().min(1, 'To field is required'),
  onDelete: z.enum(['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION', 'SET_DEFAULT']).default('RESTRICT'),
  onUpdate: z.enum(['CASCADE', 'SET_NULL', 'RESTRICT', 'NO_ACTION', 'SET_DEFAULT']).default('NO_ACTION'),
  required: z.boolean().default(false),
  description: z.string().max(500, 'Description too long').optional(),
})

export const WorkflowCreateSchema = z.object({
  name: z.string().min(1, 'Workflow name is required').max(50, 'Workflow name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  trigger: z.object({
    type: z.enum([
      'app_start', 'button_click', 'form_submit', 'data_change', 'timer',
      'screen_load', 'user_login', 'user_logout', 'api_webhook', 'file_upload',
      'notification_received', 'location_change', 'device_shake', 'background_task'
    ]),
    config: z.record(z.any()),
  }),
})

export const UserProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const CollaboratorInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
  permissions: z.object({
    canEdit: z.boolean().default(true),
    canDelete: z.boolean().default(false),
    canDeploy: z.boolean().default(false),
    canInvite: z.boolean().default(false),
    canManageSettings: z.boolean().default(false),
  }),
})

export const DeploymentCreateSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  platforms: z.array(z.enum(['ios', 'android', 'both'])).min(1, 'At least one platform required'),
  environment: z.enum(['development', 'staging', 'production']),
  buildType: z.enum(['debug', 'release']),
})

export const AppIconUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'File is required')
    .refine((file) => file.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => ['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type), 'Invalid file type'),
})

export const FileUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'File is required')
    .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB'),
  category: z.enum(['image', 'document', 'media', 'other']).optional(),
})

export const SearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Query too long'),
  category: z.string().optional(),
  sortBy: z.enum(['name', 'created', 'updated', 'popularity']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export const ComponentStyleSchema = z.object({
  layout: z.object({
    display: z.enum(['flex', 'none']).default('flex'),
    position: z.enum(['relative', 'absolute', 'fixed']).default('relative'),
    flexDirection: z.enum(['row', 'column']).default('column'),
    justifyContent: z.enum(['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly']).default('flex-start'),
    alignItems: z.enum(['flex-start', 'flex-end', 'center', 'stretch', 'baseline']).default('stretch'),
    flexWrap: z.enum(['wrap', 'nowrap']).default('nowrap'),
    flex: z.number().optional(),
    width: z.union([z.number(), z.string()]).optional(),
    height: z.union([z.number(), z.string()]).optional(),
    minWidth: z.number().optional(),
    minHeight: z.number().optional(),
    maxWidth: z.number().optional(),
    maxHeight: z.number().optional(),
    aspectRatio: z.number().optional(),
    zIndex: z.number().optional(),
  }),
  appearance: z.object({
    backgroundColor: z.object({
      r: z.number().min(0).max(255),
      g: z.number().min(0).max(255),
      b: z.number().min(0).max(255),
      a: z.number().min(0).max(1).optional(),
    }).optional(),
    backgroundImage: z.string().url().optional(),
    backgroundSize: z.enum(['cover', 'contain', 'auto']).default('cover'),
    backgroundPosition: z.string().default('center'),
    backgroundRepeat: z.enum(['no-repeat', 'repeat', 'repeat-x', 'repeat-y']).default('no-repeat'),
    opacity: z.number().min(0).max(1).default(1),
    overflow: z.enum(['visible', 'hidden', 'scroll']).default('visible'),
  }),
  spacing: z.object({
    margin: z.object({
      top: z.number().min(0).default(0),
      right: z.number().min(0).default(0),
      bottom: z.number().min(0).default(0),
      left: z.number().min(0).default(0),
    }),
    padding: z.object({
      top: z.number().min(0).default(0),
      right: z.number().min(0).default(0),
      bottom: z.number().min(0).default(0),
      left: z.number().min(0).default(0),
    }),
  }),
})

export type LoginFormData = z.infer<typeof LoginSchema>
export type RegisterFormData = z.infer<typeof RegisterSchema>
export type ForgotPasswordFormData = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof ResetPasswordSchema>
export type AppCreateFormData = z.infer<typeof AppCreateSchema>
export type AppUpdateFormData = z.infer<typeof AppUpdateSchema>
export type ScreenCreateFormData = z.infer<typeof ScreenCreateSchema>
export type ComponentCreateFormData = z.infer<typeof ComponentCreateSchema>
export type TableCreateFormData = z.infer<typeof TableCreateSchema>
export type FieldCreateFormData = z.infer<typeof FieldCreateSchema>
export type RelationshipCreateFormData = z.infer<typeof RelationshipCreateSchema>
export type WorkflowCreateFormData = z.infer<typeof WorkflowCreateSchema>
export type UserProfileUpdateFormData = z.infer<typeof UserProfileUpdateSchema>
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>
export type CollaboratorInviteFormData = z.infer<typeof CollaboratorInviteSchema>
export type DeploymentCreateFormData = z.infer<typeof DeploymentCreateSchema>
export type SearchFormData = z.infer<typeof SearchSchema>