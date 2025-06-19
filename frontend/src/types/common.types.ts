export interface Position {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Color {
  r: number
  g: number
  b: number
  a?: number
}

export interface Spacing {
  top: number
  right: number
  bottom: number
  left: number
}

export interface Border {
  width: number
  color: Color
  style: 'solid' | 'dashed' | 'dotted'
  radius: number
}

export interface Typography {
  fontFamily: string
  fontSize: number
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  lineHeight: number
  textAlign: 'left' | 'center' | 'right' | 'justify'
  color: Color
}

export interface Shadow {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: Color
}

export type Theme = 'light' | 'dark' | 'auto'

export type Platform = 'ios' | 'android' | 'both'

export type DeviceType = 'iphone' | 'android' | 'tablet'

export type DeviceOrientation = 'portrait' | 'landscape'

export interface Device {
  id: string
  name: string
  type: DeviceType
  width: number
  height: number
  statusBarHeight: number
  homeIndicatorHeight?: number
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: ValidationError[]
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FileUpload {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
}

export type SortDirection = 'asc' | 'desc'

export interface SortOption {
  field: string
  direction: SortDirection
}

export interface FilterOption {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith'
  value: any
}