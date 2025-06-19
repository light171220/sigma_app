import { ValidationError } from '@/types'

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): boolean => {
  return password.length >= 8 && 
         /(?=.*[a-z])/.test(password) && 
         /(?=.*[A-Z])/.test(password) && 
         /(?=.*\d)/.test(password)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s-()]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

export const validateMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength
}

export const validateMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength
}

export const validateMin = (value: number, min: number): boolean => {
  return value >= min
}

export const validateMax = (value: number, max: number): boolean => {
  return value <= max
}

export const validatePattern = (value: string, pattern: string): boolean => {
  try {
    const regex = new RegExp(pattern)
    return regex.test(value)
  } catch {
    return false
  }
}

export const validateFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize
}

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type)
}

export const validateImageDimensions = (
  file: File,
  maxWidth?: number,
  maxHeight?: number
): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const valid = (!maxWidth || img.width <= maxWidth) && 
                   (!maxHeight || img.height <= maxHeight)
      resolve(valid)
    }
    img.onerror = () => resolve(false)
    img.src = URL.createObjectURL(file)
  })
}

export const validateBundleId = (bundleId: string): boolean => {
  const bundleIdRegex = /^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$/
  return bundleIdRegex.test(bundleId)
}

export const validateVersion = (version: string): boolean => {
  const versionRegex = /^\d+\.\d+\.\d+$/
  return versionRegex.test(version)
}

export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  return hexRegex.test(color)
}

export const validateJson = (jsonString: string): boolean => {
  try {
    JSON.parse(jsonString)
    return true
  } catch {
    return false
  }
}

export const sanitizeHtml = (html: string): string => {
  const div = document.createElement('div')
  div.textContent = html
  return div.innerHTML
}

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_')
}

export const validateComponentName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return nameRegex.test(name) && name.length <= 50
}

export const validateTableName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return nameRegex.test(name) && name.length <= 50 && !RESERVED_KEYWORDS.includes(name.toLowerCase())
}

export const validateFieldName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return nameRegex.test(name) && name.length <= 50 && !RESERVED_KEYWORDS.includes(name.toLowerCase())
}

export const validateWorkflowName = (name: string): boolean => {
  return name.length > 0 && name.length <= 100
}

export const validateExpression = (expression: string): boolean => {
  try {
    new Function('return ' + expression)
    return true
  } catch {
    return false
  }
}

export const validateCronExpression = (cron: string): boolean => {
  const cronRegex = /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/
  return cronRegex.test(cron)
}

export const createValidationError = (field: string, message: string, code: string): ValidationError => ({
  field,
  message,
  code,
})

export const formatValidationErrors = (errors: ValidationError[]): Record<string, string> => {
  return errors.reduce((acc, error) => {
    acc[error.field] = error.message
    return acc
  }, {} as Record<string, string>)
}

export const validatePasswordStrength = (password: string): {
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) {
    score += 1
  } else {
    feedback.push('Use at least 8 characters')
  }

  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include lowercase letters')
  }

  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include uppercase letters')
  }

  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push('Include numbers')
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1
  } else {
    feedback.push('Include special characters')
  }

  if (password.length >= 12) {
    score += 1
  }

  return { score, feedback }
}

export const debounceValidation = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

const RESERVED_KEYWORDS = [
  'select', 'insert', 'update', 'delete', 'from', 'where', 'join', 'inner', 'outer',
  'left', 'right', 'on', 'as', 'table', 'database', 'index', 'primary', 'key',
  'foreign', 'references', 'constraint', 'create', 'drop', 'alter', 'add', 'column',
  'null', 'not', 'default', 'auto_increment', 'unique', 'check', 'exists',
  'user', 'users', 'admin', 'root', 'system', 'config', 'settings', 'password',
  'token', 'session', 'auth', 'login', 'logout', 'register', 'email', 'username'
]

export const getPasswordStrengthColor = (score: number): string => {
  if (score <= 2) return 'bg-red-500'
  if (score <= 4) return 'bg-yellow-500'
  return 'bg-green-500'
}

export const getPasswordStrengthText = (score: number): string => {
  if (score <= 2) return 'Weak'
  if (score <= 4) return 'Medium'
  return 'Strong'
}