import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Palette, Code, Eye, EyeOff, Lock, Unlock, Trash2 } from 'lucide-react'
import { HexColorPicker } from 'react-colorful'
import { Component, Color } from '@/types'
import { Button } from '@/components/common/Button'
import { useAppBuilder } from '@/hooks/useAppBuilder'

interface PropertiesPanelProps {
  component: Component
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ component }) => {
  const { updateComponent, deleteComponent, duplicateComponent } = useAppBuilder()
  const [activeTab, setActiveTab] = useState<'properties' | 'style' | 'events'>('properties')
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)

  const tabs = [
    { id: 'properties', label: 'Properties', icon: Settings },
    { id: 'style', label: 'Style', icon: Palette },
    { id: 'events', label: 'Events', icon: Code },
  ]

  const colorToHex = (color: Color): string => {
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16)
      return hex.length === 1 ? '0' + hex : hex
    }
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
  }

  const hexToColor = (hex: string): Color => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1,
    } : { r: 0, g: 0, b: 0, a: 1 }
  }

  const updateProperty = (path: string, value: any) => {
    const pathArray = path.split('.')
    const updates: any = {}
    
    let current = updates
    for (let i = 0; i < pathArray.length - 1; i++) {
      current[pathArray[i]] = current[pathArray[i]] || {}
      current = current[pathArray[i]]
    }
    current[pathArray[pathArray.length - 1]] = value

    updateComponent(component.id, updates)
  }

  const ColorInput: React.FC<{ label: string; value?: Color; onChange: (color: Color) => void; path: string }> = ({ 
    label, 
    value, 
    onChange, 
    path 
  }) => {
    const currentColor = value || { r: 0, g: 0, b: 0, a: 1 }
    const hexValue = colorToHex(currentColor)

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowColorPicker(showColorPicker === path ? null : path)}
            className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: `rgba(${currentColor.r}, ${currentColor.g}, ${currentColor.b}, ${currentColor.a})` }}
          />
          <input
            type="text"
            value={hexValue}
            onChange={(e) => onChange(hexToColor(e.target.value))}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            placeholder="#000000"
          />
        </div>
        
        {showColorPicker === path && (
          <div className="relative">
            <div className="absolute top-0 left-0 z-50 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
              <HexColorPicker
                color={hexValue}
                onChange={(hex) => onChange(hexToColor(hex))}
              />
              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowColorPicker(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const NumberInput: React.FC<{ label: string; value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number }> = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 1 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )

  const TextInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder?: string }> = ({ 
    label, 
    value, 
    onChange, 
    placeholder 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
      />
    </div>
  )

  const SelectInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }> = ({ 
    label, 
    value, 
    onChange, 
    options 
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const renderPropertiesTab = () => {
    switch (component.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <TextInput
              label="Text Content"
              value={component.properties.text || ''}
              onChange={(value) => updateProperty('properties.text', value)}
              placeholder="Enter text..."
            />
            <NumberInput
              label="Max Length"
              value={component.properties.maxLength || 0}
              onChange={(value) => updateProperty('properties.maxLength', value)}
              min={0}
            />
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Multiline</label>
              <input
                type="checkbox"
                checked={component.properties.multiline || false}
                onChange={(e) => updateProperty('properties.multiline', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        )

      case 'button':
        return (
          <div className="space-y-4">
            <TextInput
              label="Button Text"
              value={component.properties.title || ''}
              onChange={(value) => updateProperty('properties.title', value)}
              placeholder="Button"
            />
            <SelectInput
              label="Button Type"
              value={component.properties.type || 'primary'}
              onChange={(value) => updateProperty('properties.type', value)}
              options={[
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'outline', label: 'Outline' },
                { value: 'ghost', label: 'Ghost' },
                { value: 'danger', label: 'Danger' },
              ]}
            />
            <SelectInput
              label="Size"
              value={component.properties.size || 'medium'}
              onChange={(value) => updateProperty('properties.size', value)}
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' },
              ]}
            />
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Disabled</label>
              <input
                type="checkbox"
                checked={component.properties.disabled || false}
                onChange={(e) => updateProperty('properties.disabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        )

      case 'textInput':
        return (
          <div className="space-y-4">
            <TextInput
              label="Placeholder"
              value={component.properties.placeholder || ''}
              onChange={(value) => updateProperty('properties.placeholder', value)}
              placeholder="Enter placeholder..."
            />
            <SelectInput
              label="Input Type"
              value={component.properties.type || 'text'}
              onChange={(value) => updateProperty('properties.type', value)}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'email', label: 'Email' },
                { value: 'password', label: 'Password' },
                { value: 'number', label: 'Number' },
                { value: 'phone', label: 'Phone' },
                { value: 'url', label: 'URL' },
              ]}
            />
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Required</label>
              <input
                type="checkbox"
                checked={component.properties.required || false}
                onChange={(e) => updateProperty('properties.required', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <TextInput
              label="Image URL"
              value={component.properties.source || ''}
              onChange={(value) => updateProperty('properties.source', value)}
              placeholder="https://example.com/image.jpg"
            />
            <TextInput
              label="Alt Text"
              value={component.properties.alt || ''}
              onChange={(value) => updateProperty('properties.alt', value)}
              placeholder="Image description"
            />
            <SelectInput
              label="Resize Mode"
              value={component.properties.resizeMode || 'cover'}
              onChange={(value) => updateProperty('properties.resizeMode', value)}
              options={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'stretch', label: 'Stretch' },
                { value: 'repeat', label: 'Repeat' },
                { value: 'center', label: 'Center' },
              ]}
            />
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <Settings className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              No properties available for this component
            </p>
          </div>
        )
    }
  }

  const renderStyleTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Layout</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Width"
              value={component.size.width}
              onChange={(value) => updateProperty('size.width', value)}
              min={1}
            />
            <NumberInput
              label="Height"
              value={component.size.height}
              onChange={(value) => updateProperty('size.height', value)}
              min={1}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="X Position"
              value={component.position.x}
              onChange={(value) => updateProperty('position.x', value)}
              min={0}
            />
            <NumberInput
              label="Y Position"
              value={component.position.y}
              onChange={(value) => updateProperty('position.y', value)}
              min={0}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Appearance</h4>
        <div className="space-y-3">
          <ColorInput
            label="Background Color"
            value={component.style.appearance.backgroundColor}
            onChange={(color) => updateProperty('style.appearance.backgroundColor', color)}
            path="backgroundColor"
          />
          <NumberInput
            label="Opacity"
            value={component.style.appearance.opacity}
            onChange={(value) => updateProperty('style.appearance.opacity', value)}
            min={0}
            max={1}
            step={0.1}
          />
          <NumberInput
            label="Border Radius"
            value={component.style.appearance.border?.radius || 0}
            onChange={(value) => updateProperty('style.appearance.border.radius', value)}
            min={0}
          />
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Spacing</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Padding Top"
              value={component.style.spacing.padding.top}
              onChange={(value) => updateProperty('style.spacing.padding.top', value)}
              min={0}
            />
            <NumberInput
              label="Padding Right"
              value={component.style.spacing.padding.right}
              onChange={(value) => updateProperty('style.spacing.padding.right', value)}
              min={0}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Padding Bottom"
              value={component.style.spacing.padding.bottom}
              onChange={(value) => updateProperty('style.spacing.padding.bottom', value)}
              min={0}
            />
            <NumberInput
              label="Padding Left"
              value={component.style.spacing.padding.left}
              onChange={(value) => updateProperty('style.spacing.padding.left', value)}
              min={0}
            />
          </div>
        </div>
      </div>

      {component.style.typography && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Typography</h4>
          <div className="space-y-3">
            <NumberInput
              label="Font Size"
              value={component.style.typography.fontSize}
              onChange={(value) => updateProperty('style.typography.fontSize', value)}
              min={8}
              max={72}
            />
            <SelectInput
              label="Font Weight"
              value={component.style.typography.fontWeight}
              onChange={(value) => updateProperty('style.typography.fontWeight', value)}
              options={[
                { value: '100', label: 'Thin' },
                { value: '200', label: 'Extra Light' },
                { value: '300', label: 'Light' },
                { value: '400', label: 'Normal' },
                { value: '500', label: 'Medium' },
                { value: '600', label: 'Semi Bold' },
                { value: '700', label: 'Bold' },
                { value: '800', label: 'Extra Bold' },
                { value: '900', label: 'Black' },
              ]}
            />
            <ColorInput
              label="Text Color"
              value={component.style.typography.color}
              onChange={(color) => updateProperty('style.typography.color', color)}
              path="textColor"
            />
          </div>
        </div>
      )}
    </div>
  )

  const renderEventsTab = () => (
    <div className="text-center py-8">
      <Code className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-500 mb-4">
        Events will be available in a future update
      </p>
      <p className="text-xs text-gray-400">
        Add interactions like onClick, onSubmit, etc.
      </p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            icon={component.visible ? Eye : EyeOff}
            onClick={() => updateProperty('visible', !component.visible)} children={undefined}          />
          <Button
            variant="ghost"
            size="sm"
            icon={component.locked ? Lock : Unlock}
            onClick={() => updateProperty('locked', !component.locked)} children={undefined}          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={() => deleteComponent(component.id)}
            className="text-red-600 hover:text-red-700" children={undefined}          />
        </div>
      </div>

      <div className="flex border border-gray-200 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium rounded transition-colors
              ${activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-h-96 overflow-y-auto scrollbar-thin"
      >
        {activeTab === 'properties' && renderPropertiesTab()}
        {activeTab === 'style' && renderStyleTab()}
        {activeTab === 'events' && renderEventsTab()}
      </motion.div>

      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => duplicateComponent(component.id)}
          >
            Duplicate
          </Button>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => deleteComponent(component.id)}
            className="text-red-600 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}