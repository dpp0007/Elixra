import { useState, useEffect, useCallback, useRef } from 'react'

interface Participant {
  userId: string
  name: string
  color: string
  cursor?: { x: number; y: number }
  isActive: boolean
}

interface CollaborationSession {
  roomCode: string
  hostId: string
  participants: Participant[]
  experiment: any
  isActive: boolean
}

export function useCollaboration(roomCode: string | null) {
  const [session, setSession] = useState<CollaborationSession | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const userIdRef = useRef<string>(`user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
  
  // Fetch session data
  const fetchSession = useCallback(async () => {
    if (!roomCode) return
    
    try {
      const response = await fetch(`/api/collaboration/session?roomCode=${roomCode}`)
      if (response.ok) {
        const data = await response.json()
        setSession(data)
        setIsConnected(true)
        setError(null)
      } else {
        setError('Session not found')
        setIsConnected(false)
      }
    } catch (err) {
      console.error('Failed to fetch session:', err)
      setError('Failed to connect')
      setIsConnected(false)
    }
  }, [roomCode])
  
  // Join session
  const joinSession = useCallback(async (userName: string = 'Guest') => {
    if (!roomCode) return
    
    try {
      const response = await fetch('/api/collaboration/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          action: 'join',
          data: {
            userId: userIdRef.current,
            name: userName,
            color: `#${Math.floor(Math.random()*16777215).toString(16)}`
          }
        })
      })
      
      if (response.ok) {
        await fetchSession()
      }
    } catch (err) {
      console.error('Failed to join session:', err)
    }
  }, [roomCode, fetchSession])
  
  // Update cursor position
  const updateCursor = useCallback(async (x: number, y: number) => {
    if (!roomCode) return
    
    try {
      await fetch('/api/collaboration/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          action: 'update-cursor',
          data: {
            userId: userIdRef.current,
            cursor: { x, y }
          }
        })
      })
    } catch (err) {
      console.error('Failed to update cursor:', err)
    }
  }, [roomCode])
  
  // Update experiment
  const updateExperiment = useCallback(async (experiment: any) => {
    if (!roomCode) return
    
    try {
      await fetch('/api/collaboration/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          action: 'update-experiment',
          data: { experiment }
        })
      })
      
      await fetchSession()
    } catch (err) {
      console.error('Failed to update experiment:', err)
    }
  }, [roomCode, fetchSession])
  
  // Leave session
  const leaveSession = useCallback(async () => {
    if (!roomCode) return
    
    try {
      await fetch('/api/collaboration/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          action: 'leave',
          data: { userId: userIdRef.current }
        })
      })
    } catch (err) {
      console.error('Failed to leave session:', err)
    }
  }, [roomCode])
  
  // Start polling for updates
  useEffect(() => {
    if (!roomCode) return
    
    // Initial fetch
    fetchSession()
    
    // Poll every 500ms for smoother updates
    intervalRef.current = setInterval(fetchSession, 500)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      leaveSession()
    }
  }, [roomCode, fetchSession, leaveSession])
  
  return {
    session,
    isConnected,
    error,
    userId: userIdRef.current,
    joinSession,
    updateCursor,
    updateExperiment,
    leaveSession
  }
}
