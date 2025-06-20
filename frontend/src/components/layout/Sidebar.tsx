import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home, Smartphone, Database, Zap, Settings, 
  BarChart3, Users, Play, Grid, Code, Layers
} from 'lucide-react'

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation()

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and statistics'
    },
    {
      name: 'Apps',
      href: '/apps',
      icon: Smartphone,
      description: 'Manage your applications'
    },
    {
      name: 'Templates',
      href: '/templates',
      icon: Grid,
      description: 'Pre-built app templates'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Usage and performance'
    },
  ]

  const builderItems = [
    {
      name: 'Components',
      href: '/components',
      icon: Layers,
      description: 'UI component library'
    },
    {
      name: 'Database',
      href: '/database',
      icon: Database,
      description: 'Data management'
    },
    {
      name: 'Logic',
      href: '/logic',
      icon: Zap,
      description: 'Workflows and automation'
    },
    {
      name: 'Code',
      href: '/code',
      icon: Code,
      description: 'Custom code editor'
    },
  ]

  const isActivePath = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  const SidebarItem: React.FC<{ item: any; section?: string }> = ({ item, section }) => (
    <Link
      to={item.href}
      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
        isActivePath(item.href)
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <item.icon className={`flex-shrink-0 w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <div className="font-medium">{item.name}</div>
          <div className="text-xs text-gray-500 group-hover:text-gray-600">
            {item.description}
          </div>
        </div>
      )}

      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {item.name}
        </div>
      )}
    </Link>
  )

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-white border-r border-gray-200 flex flex-col h-full"
    >
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-gray-900">Sigma</span>
          )}
        </div>
      </div>

      <div className="flex-1 px-3 space-y-6">
        <div>
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main
            </h3>
          )}
          <nav className="space-y-1">
            {navigationItems.map((item) => (
              <SidebarItem key={item.name} item={item} section="main" />
            ))}
          </nav>
        </div>

        <div>
          {!isCollapsed && (
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Builder Tools
            </h3>
          )}
          <nav className="space-y-1">
            {builderItems.map((item) => (
              <SidebarItem key={item.name} item={item} section="builder" />
            ))}
          </nav>
        </div>
      </div>

      <div className="p-3 border-t border-gray-200">
        <Link
          to="/settings"
          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
            isActivePath('/settings')
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Settings className={`flex-shrink-0 w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'}`} />
          
          {!isCollapsed && <span>Settings</span>}

          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              Settings
            </div>
          )}
        </Link>
      </div>
    </motion.div>
  )
}