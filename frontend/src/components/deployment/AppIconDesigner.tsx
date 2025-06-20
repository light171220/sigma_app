import React, { useState, useRef } from 'react'
import { Upload, Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { HexColorPicker } from 'react-colorful'

interface IconSize {
  name: string
  size: number
  platform: 'ios' | 'android' | 'both'
}

export const AppIconDesigner: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [backgroundColor, setBackgroundColor] = useState('#3B82F6')
  const [cornerRadius, setCornerRadius] = useState(16)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const iconSizes: IconSize[] = [
    { name: 'iPhone App Icon', size: 180, platform: 'ios' },
    { name: 'iPhone Settings', size: 87, platform: 'ios' },
    { name: 'iPhone Spotlight', size: 120, platform: 'ios' },
    { name: 'iPad App Icon', size: 167, platform: 'ios' },
    { name: 'iPad Settings', size: 58, platform: 'ios' },
    { name: 'Android Launcher', size: 192, platform: 'android' },
    { name: 'Android Legacy', size: 96, platform: 'android' },
    { name: 'Play Store', size: 512, platform: 'android' },
    { name: 'App Store', size: 1024, platform: 'ios' },
  ]

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateIcon = (size: number) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    canvas.width = size
    canvas.height = size

    ctx.fillStyle = backgroundColor
    
    if (cornerRadius > 0) {
      const radius = (cornerRadius / 16) * (size / 8)
      ctx.beginPath()
      ctx.roundRect(0, 0, size, size, radius)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, size, size)
    }

    if (selectedImage) {
      const img = new Image()
      img.onload = () => {
        const padding = size * 0.1
        ctx.drawImage(img, padding, padding, size - 2 * padding, size - 2 * padding)
      }
      img.src = selectedImage
    }

    return canvas.toDataURL('image/png')
  }

  const downloadIcon = (size: number, _name: string) => {
    const dataUrl = generateIcon(size)
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `app-icon-${size}x${size}.png`
      link.href = dataUrl
      link.click()
    }
  }

  const downloadAllIcons = () => {
    iconSizes.forEach((icon) => {
      setTimeout(() => {
        downloadIcon(icon.size, icon.name)
      }, iconSizes.indexOf(icon) * 100)
    })
  }

  const resetDesign = () => {
    setSelectedImage(null)
    setBackgroundColor('#3B82F6')
    setCornerRadius(16)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Design Your App Icon</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                  <Button
                    variant="secondary"
                    icon={Upload}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    Choose Image
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 1024x1024px PNG or SVG
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Color
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="w-10 h-10 rounded border border-gray-300"
                    style={{ backgroundColor }}
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="#3B82F6"
                  />
                </div>
                
                {showColorPicker && (
                  <div className="mt-2 p-3 border border-gray-200 rounded-lg">
                    <HexColorPicker
                      color={backgroundColor}
                      onChange={setBackgroundColor}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Corner Radius: {cornerRadius}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={cornerRadius}
                  onChange={(e) => setCornerRadius(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  icon={RotateCcw}
                  onClick={resetDesign}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  icon={Download}
                  onClick={downloadAllIcons}
                  disabled={!selectedImage}
                >
                  Download All
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Preview</h4>
            
            <div className="grid grid-cols-3 gap-4">
              {[180, 120, 87].map((size) => (
                <div key={size} className="text-center">
                  <div 
                    className="mx-auto mb-2 shadow-lg"
                    style={{
                      width: size / 3,
                      height: size / 3,
                      backgroundColor,
                      borderRadius: cornerRadius / 3,
                      backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
                      backgroundSize: '80%',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <p className="text-xs text-gray-600">{size}px</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">All Sizes</h4>
            
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {iconSizes.map((icon) => (
                <div key={`${icon.name}-${icon.size}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-8 h-8 shadow-sm"
                      style={{
                        backgroundColor,
                        borderRadius: cornerRadius / 4,
                        backgroundImage: selectedImage ? `url(${selectedImage})` : 'none',
                        backgroundSize: '80%',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{icon.name}</p>
                      <p className="text-xs text-gray-500">
                        {icon.size}x{icon.size}px • {icon.platform}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Download}
                    onClick={() => downloadIcon(icon.size, icon.name)}
                    disabled={!selectedImage} children={undefined}                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}