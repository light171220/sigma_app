import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Upload, Trash2, Eye, Globe, DollarSign, Calendar } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { Modal } from '@/components/common/Modal'

interface Screenshot {
  id: string
  url: string
  deviceType: 'phone' | 'tablet'
  order: number
}

interface Localization {
  locale: string
  name: string
  subtitle?: string
  description: string
  keywords: string[]
  screenshots: Screenshot[]
}

export const StoreListingEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metadata' | 'screenshots' | 'pricing' | 'availability'>('metadata')
  const [selectedLocale, setSelectedLocale] = useState('en-US')
  const [showAddLocaleModal, setShowAddLocaleModal] = useState(false)
  
  const [metadata, setMetadata] = useState({
    name: '',
    subtitle: '',
    description: '',
    keywords: [] as string[],
    supportUrl: '',
    marketingUrl: '',
    privacyPolicyUrl: '',
    category: {
      primary: '',
      secondary: '',
    },
    contentRating: {
      rating: 'everyone',
      descriptors: [] as string[],
      advisories: [] as string[],
    },
  })

  const [pricing, setPricing] = useState({
    type: 'free' as 'free' | 'paid' | 'freemium',
    price: 0,
    currency: 'USD',
    inAppPurchases: false,
    subscriptions: false,
  })

  const [availability, setAvailability] = useState({
    territories: ['US', 'CA', 'GB', 'AU'],
    releaseDate: '',
    preOrder: false,
    earliestReleaseDate: '',
  })

  const [localizations, setLocalizations] = useState<Localization[]>([
    {
      locale: 'en-US',
      name: 'My Amazing App',
      subtitle: 'The best app ever created',
      description: 'This is an amazing app that will change your life. Download it now and experience the future.',
      keywords: ['amazing', 'app', 'productivity', 'lifestyle'],
      screenshots: [],
    },
  ])

  const tabs = [
    { id: 'metadata', label: 'App Information', icon: Globe },
    { id: 'screenshots', label: 'Screenshots', icon: Eye },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'availability', label: 'Availability', icon: Calendar },
  ]

  const locales = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  ]

  const categories = [
    'Business', 'Developer Tools', 'Education', 'Entertainment', 'Finance',
    'Food & Drink', 'Games', 'Health & Fitness', 'Lifestyle', 'Medical',
    'Music', 'Navigation', 'News', 'Photo & Video', 'Productivity',
    'Reference', 'Shopping', 'Social Networking', 'Sports', 'Travel',
    'Utilities', 'Weather'
  ]

  const contentRatings = [
    { value: 'everyone', label: '4+', description: 'Ages 4 and up' },
    { value: 'everyone_10+', label: '9+', description: 'Ages 9 and up' },
    { value: 'teen', label: '12+', description: 'Ages 12 and up' },
    { value: 'mature', label: '17+', description: 'Ages 17 and up' },
  ]

  const territories = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CN', name: 'China', flag: '🇨🇳' },
  ]

  const currentLocalization = localizations.find(l => l.locale === selectedLocale) || localizations[0]

  const updateLocalization = (updates: Partial<Localization>) => {
    setLocalizations(prev =>
      prev.map(loc =>
        loc.locale === selectedLocale ? { ...loc, ...updates } : loc
      )
    )
  }

  const addKeyword = (keyword: string) => {
    if (keyword.trim() && !currentLocalization.keywords.includes(keyword.trim())) {
      updateLocalization({
        keywords: [...currentLocalization.keywords, keyword.trim()]
      })
    }
  }

  const removeKeyword = (keyword: string) => {
    updateLocalization({
      keywords: currentLocalization.keywords.filter(k => k !== keyword)
    })
  }

  const addScreenshot = (file: File) => {
    const newScreenshot: Screenshot = {
      id: Date.now().toString(),
      url: URL.createObjectURL(file),
      deviceType: 'phone',
      order: currentLocalization.screenshots.length,
    }

    updateLocalization({
      screenshots: [...currentLocalization.screenshots, newScreenshot]
    })
  }

  const addLocalization = (locale: string) => {
    const localeInfo = locales.find(l => l.code === locale)
    if (localeInfo && !localizations.find(l => l.locale === locale)) {
      setLocalizations(prev => [...prev, {
        locale: locale,
        name: '',
        subtitle: '',
        description: '',
        keywords: [],
        screenshots: [],
      }])
      setSelectedLocale(locale)
    }
    setShowAddLocaleModal(false)
  }

  const removeLocalization = (locale: string) => {
    if (localizations.length > 1) {
      setLocalizations(prev => prev.filter(l => l.locale !== locale))
      if (selectedLocale === locale) {
        setSelectedLocale(localizations[0].locale)
      }
    }
  }

  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          addScreenshot(file)
        }
      })
    }
  }

  const removeScreenshot = (screenshotId: string) => {
    updateLocalization({
      screenshots: currentLocalization.screenshots.filter(s => s.id !== screenshotId)
    })
  }

  const reorderScreenshots = (dragIndex: number, hoverIndex: number) => {
    const dragScreenshot = currentLocalization.screenshots[dragIndex]
    const newScreenshots = [...currentLocalization.screenshots]
    newScreenshots.splice(dragIndex, 1)
    newScreenshots.splice(hoverIndex, 0, dragScreenshot)
    
    updateLocalization({
      screenshots: newScreenshots.map((screenshot, index) => ({
        ...screenshot,
        order: index
      }))
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Store Listing</h3>
          <p className="text-sm text-gray-600">Manage your app's presence in app stores</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {localizations.map((loc) => {
              const localeInfo = locales.find(l => l.code === loc.locale)
              return (
                <option key={loc.locale} value={loc.locale}>
                  {localeInfo?.flag} {localeInfo?.name}
                </option>
              )
            })}
          </select>
          
          <Button
            variant="secondary"
            size="sm"
            icon={Plus}
            onClick={() => setShowAddLocaleModal(true)}
          >
            Add Language
          </Button>
        </div>
      </div>

      <div className="flex border border-gray-200 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  value={currentLocalization.name}
                  onChange={(e) => updateLocalization({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">30 characters max</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={currentLocalization.subtitle || ''}
                  onChange={(e) => updateLocalization({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">30 characters max</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={currentLocalization.description}
                onChange={(e) => updateLocalization({ description: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={4000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {currentLocalization.description.length}/4000 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keywords
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentLocalization.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="inline-flex items-center px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add keywords..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addKeyword(e.currentTarget.value)
                    e.currentTarget.value = ''
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter to add keywords</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Category
                </label>
                <select
                  value={metadata.category.primary}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    category: { ...prev.category, primary: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Secondary Category
                </label>
                <select
                  value={metadata.category.secondary}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    category: { ...prev.category, secondary: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category (optional)</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Rating
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {contentRatings.map((rating) => (
                  <button
                    key={rating.value}
                    onClick={() => setMetadata(prev => ({
                      ...prev,
                      contentRating: { ...prev.contentRating, rating: rating.value }
                    }))}
                    className={`p-3 border rounded-lg text-center transition-colors ${
                      metadata.contentRating.rating === rating.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{rating.label}</div>
                    <div className="text-xs text-gray-600">{rating.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Support URL
                </label>
                <input
                  type="url"
                  value={metadata.supportUrl}
                  onChange={(e) => setMetadata(prev => ({ ...prev, supportUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/support"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marketing URL
                </label>
                <input
                  type="url"
                  value={metadata.marketingUrl}
                  onChange={(e) => setMetadata(prev => ({ ...prev, marketingUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Privacy Policy URL
                </label>
                <input
                  type="url"
                  value={metadata.privacyPolicyUrl}
                  onChange={(e) => setMetadata(prev => ({ ...prev, privacyPolicyUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/privacy"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'screenshots' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-medium text-gray-900">Screenshots</h4>
                <p className="text-sm text-gray-600">Add screenshots for the selected language</p>
              </div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Screenshots
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  className="hidden"
                />
              </label>
            </div>

            {currentLocalization.screenshots.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No screenshots yet</h4>
                <p className="text-gray-600 mb-4">Upload screenshots to showcase your app</p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentLocalization.screenshots.map((screenshot, index) => (
                  <div key={screenshot.id} className="relative group">
                    <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={screenshot.url}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => removeScreenshot(screenshot.id)}
                        className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <select
                        value={screenshot.deviceType}
                        onChange={(e) => {
                          const updatedScreenshots = currentLocalization.screenshots.map(s =>
                            s.id === screenshot.id
                              ? { ...s, deviceType: e.target.value as 'phone' | 'tablet' }
                              : s
                          )
                          updateLocalization({ screenshots: updatedScreenshots })
                        }}
                        className="text-xs px-2 py-1 bg-white border border-gray-300 rounded"
                      >
                        <option value="phone">Phone</option>
                        <option value="tablet">Tablet</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Pricing Model</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { value: 'free', label: 'Free', description: 'No cost to download' },
                  { value: 'paid', label: 'Paid', description: 'One-time purchase' },
                  { value: 'freemium', label: 'Freemium', description: 'Free with paid features' },
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setPricing(prev => ({ ...prev, type: type.value as any }))}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      pricing.type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {pricing.type === 'paid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <div className="flex">
                    <select
                      value={pricing.currency}
                      onChange={(e) => setPricing(prev => ({ ...prev, currency: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                    <input
                      type="number"
                      value={pricing.price}
                      onChange={(e) => setPricing(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inAppPurchases"
                  checked={pricing.inAppPurchases}
                  onChange={(e) => setPricing(prev => ({ ...prev, inAppPurchases: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="inAppPurchases" className="ml-2 text-sm text-gray-700">
                  Contains in-app purchases
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="subscriptions"
                  checked={pricing.subscriptions}
                  onChange={(e) => setPricing(prev => ({ ...prev, subscriptions: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="subscriptions" className="ml-2 text-sm text-gray-700">
                  Offers subscriptions
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Territories
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {territories.map((territory) => (
                  <label key={territory.code} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={availability.territories.includes(territory.code)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAvailability(prev => ({
                            ...prev,
                            territories: [...prev.territories, territory.code]
                          }))
                        } else {
                          setAvailability(prev => ({
                            ...prev,
                            territories: prev.territories.filter(t => t !== territory.code)
                          }))
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {territory.flag} {territory.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Date
                </label>
                <input
                  type="date"
                  value={availability.releaseDate}
                  onChange={(e) => setAvailability(prev => ({ ...prev, releaseDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {availability.preOrder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Earliest Release Date
                  </label>
                  <input
                    type="date"
                    value={availability.earliestReleaseDate}
                    onChange={(e) => setAvailability(prev => ({ ...prev, earliestReleaseDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="preOrder"
                checked={availability.preOrder}
                onChange={(e) => setAvailability(prev => ({ ...prev, preOrder: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="preOrder" className="ml-2 text-sm text-gray-700">
                Make available for pre-order
              </label>
            </div>
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={showAddLocaleModal}
        onClose={() => setShowAddLocaleModal(false)}
        title="Add Language"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select a language to add localization for:
          </p>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {locales
              .filter(locale => !localizations.find(l => l.locale === locale.code))
              .map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => addLocalization(locale.code)}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg"
                >
                  <span className="text-2xl">{locale.flag}</span>
                  <span className="font-medium">{locale.name}</span>
                </button>
              ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}