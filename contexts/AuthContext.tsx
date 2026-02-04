'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import { ExperimentLog } from '@/types/chemistry'

interface AuthContextType {
  isAuthenticated: boolean
  user: any
  experiments: ExperimentLog[]
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data?: any) => Promise<any>
  syncExperiments: () => Promise<void>
  saveExperiment: (experiment: any) => Promise<void>
  deleteExperiment: (id: string) => Promise<void>
  toggleSaveExperiment: (id: string, isSaved: boolean) => Promise<void>
  getLocalExperiments: () => ExperimentLog[]
  clearLocalExperiments: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const [experiments, setExperiments] = useState<ExperimentLog[]>([])
  
  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'
  const user = session?.user || null

  // Get experiments from localStorage
  const getLocalExperiments = useCallback((): ExperimentLog[] => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('savedExperiments')
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('Failed to get local experiments:', error)
      return []
    }
  }, [])

  // Sync experiments with backend
  const syncExperiments = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetch('/api/experiments')
      if (response.ok) {
        const data = await response.json()
        setExperiments(data.experiments)
      } else {
        console.error('Failed to fetch experiments')
      }
    } catch (error) {
      console.error('Error syncing experiments:', error)
    }
  }, [isAuthenticated])

  // Initial load and sync
  useEffect(() => {
    if (isAuthenticated) {
      syncExperiments()
    } else {
      setExperiments(getLocalExperiments())
    }
  }, [isAuthenticated, syncExperiments, getLocalExperiments])

  // Save experiment to localStorage
  const saveToLocalStorage = (experiment: ExperimentLog) => {
    try {
      const existing = getLocalExperiments()
      const updated = [experiment, ...existing.slice(0, 19)] // Keep only 20 most recent
      localStorage.setItem('savedExperiments', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
    }
  }

  // Clear localStorage experiments
  const clearLocalExperiments = () => {
    try {
      localStorage.removeItem('savedExperiments')
    } catch (error) {
      console.error('Failed to clear local experiments:', error)
    }
  }

  // Save experiment
  const saveExperiment = async (experimentData: any) => {
    const experiment: ExperimentLog = {
      userId: user?.email || 'anonymous',
      experimentName: experimentData.name || `Experiment ${new Date().toLocaleString()}`,
      chemicals: experimentData.chemicals,
      reactionDetails: experimentData.reactionDetails,
      timestamp: new Date(),
      isSaved: experimentData.isSaved || false
    }

    if (isAuthenticated) {
      try {
        const response = await fetch('/api/experiments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(experiment),
        })
        
        if (response.ok) {
          const data = await response.json()
          // Update local state with the new experiment from backend (which includes _id)
          setExperiments(prev => [data.experiment, ...prev])
        }
      } catch (error) {
        console.error('Failed to save experiment to backend:', error)
      }
    } else {
      // Save to localStorage
      saveToLocalStorage(experiment)
      setExperiments(getLocalExperiments())
    }
  }

  // Delete experiment
  const deleteExperiment = async (id: string) => {
    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/experiments?id=${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setExperiments(prev => prev.filter(exp => exp._id !== id))
        }
      } catch (error) {
        console.error('Failed to delete experiment from backend:', error)
      }
    } else {
      // Handle local deletion (using index as ID for local)
      const localExperiments = getLocalExperiments()
      // If id is numeric (index), filter by index. If it looks like a timestamp/string, filter by that? 
      // Local storage implementation usually needs a better ID system.
      // For now, assuming index passed as string for local.
      const updated = localExperiments.filter((_, index) => index.toString() !== id)
      localStorage.setItem('savedExperiments', JSON.stringify(updated))
      setExperiments(updated)
    }
  }

  // Toggle Save Status
  const toggleSaveExperiment = async (id: string, isSaved: boolean) => {
    if (isAuthenticated) {
      try {
        const response = await fetch('/api/experiments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, isSaved }),
        })
        
        if (response.ok) {
          setExperiments(prev => prev.map(exp => 
            exp._id === id ? { ...exp, isSaved } : exp
          ))
        }
      } catch (error) {
        console.error('Failed to update experiment status:', error)
      }
    } else {
       // Local storage toggle (if we want to support saving in local storage?)
       // Current local storage impl doesn't support persistent ID well, but let's try
       const localExperiments = getLocalExperiments()
       // Assuming id is index for local
       const index = parseInt(id)
       if (!isNaN(index) && localExperiments[index]) {
         localExperiments[index].isSaved = isSaved
         localStorage.setItem('savedExperiments', JSON.stringify(localExperiments))
         setExperiments(localExperiments)
       }
    }
  }

  // Login function (Credentials)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      })
      
      if (result?.error) {
        console.error('Login failed:', result.error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    await signIn('google', { callbackUrl: '/' })
  }

  // Logout function
  const logout = async () => {
    await signOut({ callbackUrl: '/' })
    setExperiments([])
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        experiments,
        isLoading,
        login,
        loginWithGoogle,
        logout,
        updateProfile: update,
        syncExperiments,
        saveExperiment,
        deleteExperiment,
        toggleSaveExperiment,
        getLocalExperiments,
        clearLocalExperiments,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
