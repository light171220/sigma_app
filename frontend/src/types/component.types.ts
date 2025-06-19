import { Position, Size, Color, Spacing, Border, Typography, Shadow } from './common.types'

export interface Component {
  id: string
  type: ComponentType
  name: string
  position: Position
  size: Size
  properties: ComponentProperties
  style: ComponentStyle
  events: ComponentEvents
  conditions: ComponentConditions
  children?: string[]
  parentId?: string
  locked: boolean
  visible: boolean
  createdAt: string
  updatedAt: string
}

export type ComponentType = 
  | 'text'
  | 'textInput'
  | 'textArea'
  | 'button'
  | 'image'
  | 'list'
  | 'card'
  | 'container'
  | 'row'
  | 'column'
  | 'dropdown'
  | 'checkbox'
  | 'switch'
  | 'slider'
  | 'datePicker'
  | 'timePicker'
  | 'camera'
  | 'fileUpload'
  | 'qrScanner'
  | 'webView'
  | 'map'
  | 'chart'
  | 'progressBar'
  | 'badge'
  | 'avatar'
  | 'divider'
  | 'spacer'
  | 'floatingButton'
  | 'appBar'
  | 'tabBar'
  | 'drawer'
  | 'bottomSheet'
  | 'modal'
  | 'toast'
  | 'loading'

export interface ComponentProperties {
  [key: string]: any
}

export interface TextProperties extends ComponentProperties {
  text: string
  placeholder?: string
  maxLength?: number
  multiline: boolean
  editable: boolean
  selectable: boolean
  numberOfLines?: number
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip'
}

export interface ButtonProperties extends ComponentProperties {
  title: string
  type: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size: 'small' | 'medium' | 'large'
  disabled: boolean
  loading: boolean
  icon?: string
  iconPosition: 'left' | 'right'
}

export interface ImageProperties extends ComponentProperties {
  source: string
  alt: string
  resizeMode: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
  aspectRatio?: number
  placeholder?: string
  lazy: boolean
}

export interface ListProperties extends ComponentProperties {
  data: any[]
  itemTemplate: string
  keyExtractor: string
  horizontal: boolean
  numColumns: number
  showScrollIndicator: boolean
  refreshing: boolean
  loadMore: boolean
  emptyMessage: string
}

export interface InputProperties extends ComponentProperties {
  placeholder: string
  value: string
  type: 'text' | 'email' | 'password' | 'number' | 'phone' | 'url'
  required: boolean
  maxLength?: number
  minLength?: number
  pattern?: string
  validation: ValidationRule[]
  autoComplete: boolean
  autoFocus: boolean
  disabled: boolean
  readOnly: boolean
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

export interface ComponentStyle {
  layout: LayoutStyle
  appearance: AppearanceStyle
  spacing: SpacingStyle
  typography?: TypographyStyle
  effects: EffectStyle
}

export interface LayoutStyle {
  display: 'flex' | 'none'
  position: 'relative' | 'absolute' | 'fixed'
  flexDirection: 'row' | 'column'
  justifyContent: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  flexWrap: 'wrap' | 'nowrap'
  flex?: number
  width?: number | string
  height?: number | string
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number
  zIndex?: number
}

export interface AppearanceStyle {
  backgroundColor?: Color
  backgroundImage?: string
  backgroundSize: 'cover' | 'contain' | 'auto'
  backgroundPosition: string
  backgroundRepeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y'
  opacity: number
  overflow: 'visible' | 'hidden' | 'scroll'
  border?: Border
}

export interface SpacingStyle {
  margin: Spacing
  padding: Spacing
}

export interface TypographyStyle extends Typography {
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration: 'none' | 'underline' | 'line-through'
  letterSpacing: number
  wordSpacing: number
}

export interface EffectStyle {
  shadow?: Shadow
  transform: TransformStyle
  animation?: AnimationStyle
}

export interface TransformStyle {
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  rotate: number
  skewX: number
  skewY: number
}

export interface AnimationStyle {
  name: string
  duration: number
  delay: number
  iterationCount: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode: 'none' | 'forwards' | 'backwards' | 'both'
  timingFunction: 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

export interface ComponentEvents {
  [eventType: string]: ComponentEvent[]
}

export interface ComponentEvent {
  id: string
  type: EventType
  action: EventAction
  conditions?: EventCondition[]
  parameters?: Record<string, any>
}

export type EventType = 
  | 'onPress'
  | 'onLongPress'
  | 'onFocus'
  | 'onBlur'
  | 'onChange'
  | 'onSubmit'
  | 'onLoad'
  | 'onError'
  | 'onScroll'
  | 'onRefresh'
  | 'onLoadMore'
  | 'onSwipeLeft'
  | 'onSwipeRight'
  | 'onSwipeUp'
  | 'onSwipeDown'

export interface EventAction {
  type: ActionType
  parameters: Record<string, any>
}

export type ActionType = 
  | 'navigate'
  | 'goBack'
  | 'showModal'
  | 'hideModal'
  | 'showToast'
  | 'saveData'
  | 'loadData'
  | 'deleteData'
  | 'apiCall'
  | 'sendEmail'
  | 'makePhoneCall'
  | 'openUrl'
  | 'shareContent'
  | 'takePhoto'
  | 'chooseFile'
  | 'showNotification'
  | 'playSound'
  | 'vibrate'
  | 'setVariable'
  | 'runWorkflow'

export interface EventCondition {
  field: string
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'isEmpty' | 'isNotEmpty'
  value: any
  logicalOperator?: 'and' | 'or'
}

export interface ComponentConditions {
  visibility?: ConditionRule[]
  enabled?: ConditionRule[]
  style?: ConditionalStyle[]
}

export interface ConditionRule {
  id: string
  condition: string
  result: boolean | string | number
}

export interface ConditionalStyle {
  condition: string
  style: Partial<ComponentStyle>
}

export interface ComponentLibraryItem {
  id: string
  name: string
  type: ComponentType
  category: ComponentCategory
  icon: string
  description: string
  defaultProperties: ComponentProperties
  defaultStyle: ComponentStyle
  previewImage?: string
  premium: boolean
}

export type ComponentCategory = 
  | 'layout'
  | 'input'
  | 'display'
  | 'navigation'
  | 'media'
  | 'business'
  | 'advanced'

export interface DragDropResult {
  draggedId: string
  targetId: string | null
  position: Position
  type: 'component' | 'screen'
}