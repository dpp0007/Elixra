/**
 * API Configuration
 * Automatically detects and uses the correct backend URL
 * Works with both localhost and network IPs
 */

/**
 * Get the backend URL based on environment and current host
 * Priority:
 * 1. Environment variable (NEXT_PUBLIC_BACKEND_URL)
 * 2. Auto-detect based on current window location
 * 3. Fallback to localhost
 */
export function getBackendUrl(): string {
  // Server-side: use environment variable or localhost
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
  }

  // Client-side: auto-detect or use environment variable
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL
  
  // If environment variable is set and not localhost, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl
  }

  // Auto-detect: use same host as frontend but port 8000
  const currentHost = window.location.hostname
  
  // If accessing via network IP, use that IP for backend too
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:8000`
  }

  // Default to localhost
  return 'http://127.0.0.1:8000'
}

/**
 * Get WebSocket URL (ws:// instead of http://)
 */
export function getWebSocketUrl(): string {
  const httpUrl = getBackendUrl()
  return httpUrl.replace('http://', 'ws://').replace('https://', 'wss://')
}

/**
 * Test backend connection
 */
export async function testBackendConnection(): Promise<boolean> {
  try {
    const url = getBackendUrl()
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.ok
  } catch (error) {
    console.error('Backend connection test failed:', error)
    return false
  }
}

/**
 * Get backend info for debugging
 */
export function getBackendInfo() {
  return {
    httpUrl: getBackendUrl(),
    wsUrl: getWebSocketUrl(),
    envUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    currentHost: typeof window !== 'undefined' ? window.location.hostname : 'server',
    isNetworkAccess: typeof window !== 'undefined' && 
      window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1'
  }
}
