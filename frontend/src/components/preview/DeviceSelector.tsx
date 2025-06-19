import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Smartphone, Tablet } from 'lucide-react'
import { DEVICES } from '@/utils/constants'

interface DeviceSelectorProps {
  selectedDevice: string
  onDeviceChange: (deviceId: string) => void
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  selectedDevice,
  onDeviceChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const currentDevice = DEVICES.find(d => d.id === selectedDevice) || DEVICES[0]

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'tablet':
        return <Tablet className="w-4 h-4" />
      default:
        return <Smartphone className="w-4 h-4" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
      >
        {getDeviceIcon(currentDevice.type)}
        <span className="text-sm font-medium">{currentDevice.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full mt-2 right-0 w-64 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50"
            >
              <div className="py-2">
                {DEVICES.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => {
                      onDeviceChange(device.id)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-700 transition-colors ${
                      selectedDevice === device.id ? 'bg-gray-700 text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    {getDeviceIcon(device.type)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{device.name}</span>
                        <span className="text-xs text-gray-500">
                          {device.width} × {device.height}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}