import { ComponentLibraryItem, ComponentType } from '@/types'

export const getMobileComponentDefaults = (type: ComponentType) => {
  const baseStyle = {
    layout: {
      display: 'flex' as const,
      position: 'relative' as const,
      flexDirection: 'column' as const,
      justifyContent: 'flex-start' as const,
      alignItems: 'stretch' as const,
      flexWrap: 'nowrap' as const,
    },
    appearance: {
      backgroundColor: undefined,
      backgroundSize: 'cover' as const,
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat' as const,
      opacity: 1,
      overflow: 'visible' as const,
    },
    spacing: {
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      padding: { top: 8, right: 8, bottom: 8, left: 8 },
    },
    effects: {
      transform: {
        translateX: 0,
        translateY: 0,
        scaleX: 1,
        scaleY: 1,
        rotate: 0,
        skewX: 0,
        skewY: 0,
      },
    },
  }

  const baseTypography = {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
    textAlign: 'left' as const,
    color: { r: 0, g: 0, b: 0, a: 1 },
    textTransform: 'none' as const,
    textDecoration: 'none' as const,
    letterSpacing: 0,
    wordSpacing: 0,
  }

  switch (type) {
    case 'text':
      return {
        properties: {
          text: 'Sample Text',
          multiline: false,
          editable: false,
          selectable: true,
        },
        style: {
          ...baseStyle,
          typography: baseTypography,
        },
      }

    case 'button':
      return {
        properties: {
          title: 'Button',
          type: 'primary',
          size: 'medium',
          disabled: false,
          loading: false,
        },
        style: {
          ...baseStyle,
          layout: {
            ...baseStyle.layout,
            flexDirection: 'row' as const,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
          },
          appearance: {
            ...baseStyle.appearance,
            backgroundColor: { r: 59, g: 130, b: 246, a: 1 },
            border: {
              width: 0,
              color: { r: 0, g: 0, b: 0, a: 1 },
              style: 'solid' as const,
              radius: 8,
            },
          },
          spacing: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 12, right: 24, bottom: 12, left: 24 },
          },
          typography: {
            ...baseTypography,
            fontWeight: '600' as const,
            textAlign: 'center' as const,
            color: { r: 255, g: 255, b: 255, a: 1 },
          },
        },
      }

    case 'textInput':
      return {
        properties: {
          placeholder: 'Enter text...',
          value: '',
          type: 'text',
          required: false,
          disabled: false,
        },
        style: {
          ...baseStyle,
          appearance: {
            ...baseStyle.appearance,
            backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
            border: {
              width: 1,
              color: { r: 209, g: 213, b: 219, a: 1 },
              style: 'solid' as const,
              radius: 8,
            },
          },
          spacing: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 12, right: 16, bottom: 12, left: 16 },
          },
          typography: baseTypography,
        },
      }

    case 'image':
      return {
        properties: {
          source: 'https://via.placeholder.com/200x150',
          alt: 'Image',
          resizeMode: 'cover',
        },
        style: {
          ...baseStyle,
          layout: {
            ...baseStyle.layout,
            justifyContent: 'center' as const,
            alignItems: 'center' as const,
          },
          appearance: {
            ...baseStyle.appearance,
            backgroundColor: { r: 243, g: 244, b: 246, a: 1 },
            overflow: 'hidden' as const,
            border: {
              width: 0,
              color: { r: 0, g: 0, b: 0, a: 1 },
              style: 'solid' as const,
              radius: 8,
            },
          },
          spacing: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
      }

    case 'container':
      return {
        properties: {},
        style: {
          ...baseStyle,
          appearance: {
            ...baseStyle.appearance,
            backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
            border: {
              width: 1,
              color: { r: 229, g: 231, b: 235, a: 1 },
              style: 'solid' as const,
              radius: 8,
            },
          },
          spacing: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
          },
        },
      }

    case 'list':
      return {
        properties: {
          data: [],
          itemTemplate: 'default',
          horizontal: false,
          numColumns: 1,
          showScrollIndicator: true,
          emptyMessage: 'No items',
        },
        style: baseStyle,
      }

    case 'card':
      return {
        properties: {},
        style: {
          ...baseStyle,
          appearance: {
            ...baseStyle.appearance,
            backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
            border: {
              width: 1,
              color: { r: 229, g: 231, b: 235, a: 1 },
              style: 'solid' as const,
              radius: 12,
            },
          },
          spacing: {
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
            padding: { top: 16, right: 16, bottom: 16, left: 16 },
          },
        },
      }

    default:
      return {
        properties: {},
        style: baseStyle,
      }
  }
}

export const getComponentIcon = (type: ComponentType): string => {
  switch (type) {
    case 'text':
      return 'Type'
    case 'button':
      return 'MousePointer'
    case 'textInput':
    case 'textArea':
      return 'Edit3'
    case 'image':
      return 'Image'
    case 'list':
      return 'List'
    case 'card':
      return 'Square'
    case 'container':
    case 'row':
    case 'column':
      return 'Grid'
    case 'dropdown':
      return 'ChevronDown'
    case 'checkbox':
      return 'CheckSquare'
    case 'switch':
      return 'ToggleLeft'
    case 'slider':
      return 'Sliders'
    case 'datePicker':
      return 'Calendar'
    case 'timePicker':
      return 'Clock'
    case 'camera':
      return 'Camera'
    case 'fileUpload':
      return 'Upload'
    case 'qrScanner':
      return 'QrCode'
    case 'webView':
      return 'Globe'
    case 'map':
      return 'Map'
    case 'chart':
      return 'BarChart3'
    case 'progressBar':
      return 'Progress'
    case 'badge':
      return 'Award'
    case 'avatar':
      return 'User'
    case 'divider':
      return 'Minus'
    case 'spacer':
      return 'Space'
    case 'floatingButton':
      return 'Plus'
    case 'appBar':
      return 'Menu'
    case 'tabBar':
      return 'Tabs'
    case 'drawer':
      return 'PanelLeft'
    case 'bottomSheet':
      return 'Sheet'
    case 'modal':
      return 'Square'
    case 'toast':
      return 'MessageSquare'
    case 'loading':
      return 'Loader2'
    default:
      return 'Box'
  }
}

export const getComponentCategory = (type: ComponentType): string => {
  switch (type) {
    case 'container':
    case 'row':
    case 'column':
    case 'card':
    case 'divider':
    case 'spacer':
      return 'layout'
    case 'text':
    case 'image':
    case 'progressBar':
    case 'badge':
    case 'avatar':
    case 'chart':
      return 'display'
    case 'textInput':
    case 'textArea':
    case 'button':
    case 'dropdown':
    case 'checkbox':
    case 'switch':
    case 'slider':
    case 'datePicker':
    case 'timePicker':
    case 'fileUpload':
      return 'input'
    case 'appBar':
    case 'tabBar':
    case 'drawer':
    case 'floatingButton':
      return 'navigation'
    case 'camera':
    case 'qrScanner':
    case 'webView':
    case 'map':
      return 'media'
    case 'list':
    case 'modal':
    case 'bottomSheet':
    case 'toast':
    case 'loading':
      return 'advanced'
    default:
      return 'business'
  }
}

export const createComponentFromLibraryItem = (item: ComponentLibraryItem, position: { x: number; y: number }, size: { width: number; height: number }) => {
  return {
    type: item.type,
    name: item.name,
    position,
    size,
    properties: { ...item.defaultProperties },
    style: { ...item.defaultStyle },
    events: {},
    conditions: {},
    children: [],
    locked: false,
    visible: true,
  }
}

export const validateComponentProperties = (type: ComponentType, properties: any): boolean => {
  switch (type) {
    case 'text':
      return typeof properties.text === 'string'
    case 'button':
      return typeof properties.title === 'string'
    case 'textInput':
      return typeof properties.placeholder === 'string'
    case 'image':
      return typeof properties.source === 'string'
    default:
      return true
  }
}

export const getComponentSize = (type: ComponentType): { width: number; height: number } => {
  switch (type) {
    case 'text':
      return { width: 150, height: 40 }
    case 'button':
      return { width: 120, height: 44 }
    case 'textInput':
      return { width: 200, height: 44 }
    case 'image':
      return { width: 200, height: 150 }
    case 'container':
    case 'card':
      return { width: 300, height: 200 }
    case 'list':
      return { width: 300, height: 400 }
    case 'progressBar':
      return { width: 200, height: 8 }
    case 'slider':
      return { width: 200, height: 44 }
    case 'divider':
      return { width: 200, height: 1 }
    case 'spacer':
      return { width: 20, height: 20 }
    default:
      return { width: 150, height: 100 }
  }
}