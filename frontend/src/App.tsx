import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

import Landing from '@/pages/Landing'
import Login from '@/pages/auth/Login'
import SignUp from '@/pages/auth/SignUp'
import ForgotPassword from '@/pages/auth/ForgotPassword'
import Dashboard from '@/pages/dashboard/Dashboard'
import AppBuilder from '@/pages/builder/AppBuilder'
import DatabaseBuilder from '@/pages/builder/DatabaseBuilder'
import LogicBuilder from '@/pages/builder/LogicBuilder'
import Preview from '@/pages/builder/Preview'
import Deployment from '@/pages/builder/Deployment'
import AppSettings from '@/pages/builder/AppSettings'
import Profile from '@/pages/Profile'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Landing />} />
            
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            
            <Route path="/signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
            } />
            
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/apps/:id/builder" element={
              <ProtectedRoute>
                <AppBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/apps/:id/database" element={
              <ProtectedRoute>
                <DatabaseBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/apps/:id/logic" element={
              <ProtectedRoute>
                <LogicBuilder />
              </ProtectedRoute>
            } />
            
            <Route path="/apps/:id/preview" element={
              <ProtectedRoute>
                <Preview />
              </ProtectedRoute>
            } />
            
            <Route path="/apps/:id/deployment" element={
              <ProtectedRoute>
                <Deployment />
              </ProtectedRoute>
            } />
            
            <Route path="/apps/:id/settings" element={
              <ProtectedRoute>
                <AppSettings />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </DndProvider>
  )
}

export default App