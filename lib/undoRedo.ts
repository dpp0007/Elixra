import { Atom, Bond } from '@/types/molecule'

export interface MoleculeState {
  atoms: Atom[]
  bonds: Bond[]
  timestamp: number
  action: string
  description: string
}

export interface HistoryEntry extends MoleculeState {
  id: string
  previousState?: MoleculeState
}

export class UndoRedoManager {
  private history: HistoryEntry[] = []
  private currentIndex: number = -1
  private maxHistorySize: number = 100
  private listeners: Set<(state: HistoryEntry) => void> = new Set()

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize
  }

  // Record a new state in history
  recordState(atoms: Atom[], bonds: Bond[], action: string, description: string): void {
    // Remove any states after current index (when user has undone some actions)
    this.history = this.history.slice(0, this.currentIndex + 1)

    // Create new state
    const newState: MoleculeState = {
      atoms: [...atoms],
      bonds: [...bonds],
      timestamp: Date.now(),
      action,
      description
    }

    const historyEntry: HistoryEntry = {
      ...newState,
      id: `history-${Date.now()}-${Math.random()}`,
      previousState: this.currentIndex >= 0 ? this.history[this.currentIndex] : undefined
    }

    // Add to history
    this.history.push(historyEntry)
    this.currentIndex++

    // Maintain max history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }

    // Notify listeners
    this.notifyListeners(historyEntry)
  }

  // Undo last action
  undo(): MoleculeState | null {
    if (this.canUndo()) {
      this.currentIndex--
      const state = this.history[this.currentIndex]
      this.notifyListeners(state)
      return state
    }
    return null
  }

  // Redo last undone action
  redo(): MoleculeState | null {
    if (this.canRedo()) {
      this.currentIndex++
      const state = this.history[this.currentIndex]
      this.notifyListeners(state)
      return state
    }
    return null
  }

  // Check if undo is possible
  canUndo(): boolean {
    return this.currentIndex > 0
  }

  // Check if redo is possible
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }

  // Get current state
  getCurrentState(): MoleculeState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex]
    }
    return null
  }

  // Get history entries (for UI display)
  getHistory(): HistoryEntry[] {
    return [...this.history]
  }

  // Get recent history entries (last n entries)
  getRecentHistory(limit: number = 20): HistoryEntry[] {
    const startIndex = Math.max(0, this.history.length - limit)
    return this.history.slice(startIndex)
  }

  // Jump to specific history entry
  jumpToHistoryEntry(entryId: string): MoleculeState | null {
    const index = this.history.findIndex(entry => entry.id === entryId)
    if (index !== -1) {
      this.currentIndex = index
      const state = this.history[this.currentIndex]
      this.notifyListeners(state)
      return state
    }
    return null
  }

  // Clear history
  clearHistory(): void {
    this.history = []
    this.currentIndex = -1
  }

  // Add listener for state changes
  addListener(callback: (state: HistoryEntry) => void): () => void {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  // Notify all listeners
  private notifyListeners(state: HistoryEntry): void {
    this.listeners.forEach(callback => callback(state))
  }

  // Get statistics
  getStats(): {
    totalActions: number
    currentPosition: number
    canUndo: boolean
    canRedo: boolean
    oldestTimestamp: number | null
    newestTimestamp: number | null
  } {
    const oldest = this.history.length > 0 ? this.history[0].timestamp : null
    const newest = this.history.length > 0 ? this.history[this.history.length - 1].timestamp : null

    return {
      totalActions: this.history.length,
      currentPosition: this.currentIndex + 1,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      oldestTimestamp: oldest,
      newestTimestamp: newest
    }
  }

  // Get action types summary
  getActionSummary(): { [action: string]: number } {
    const summary: { [action: string]: number } = {}
    this.history.forEach(entry => {
      summary[entry.action] = (summary[entry.action] || 0) + 1
    })
    return summary
  }
}

// Action types for consistent recording
export const ACTION_TYPES = {
  ADD_ATOM: 'ADD_ATOM',
  REMOVE_ATOM: 'REMOVE_ATOM',
  MOVE_ATOM: 'MOVE_ATOM',
  ADD_BOND: 'ADD_BOND',
  REMOVE_BOND: 'REMOVE_BOND',
  CHANGE_BOND_TYPE: 'CHANGE_BOND_TYPE',
  LOAD_TEMPLATE: 'LOAD_TEMPLATE',
  CLEAR_SCENE: 'CLEAR_SCENE',
  UNDO: 'UNDO',
  REDO: 'REDO',
  AUTO_COMPLETE: 'AUTO_COMPLETE',
  VOICE_COMMAND: 'VOICE_COMMAND'
} as const

// Utility functions for creating action descriptions
export function createActionDescription(action: string, data?: any): string {
  switch (action) {
    case ACTION_TYPES.ADD_ATOM:
      return `Added ${data?.element || 'atom'}`
    case ACTION_TYPES.REMOVE_ATOM:
      return `Removed ${data?.element || 'atom'}`
    case ACTION_TYPES.MOVE_ATOM:
      return `Moved ${data?.element || 'atom'}`
    case ACTION_TYPES.ADD_BOND:
      return `Added ${data?.bondType || 'bond'}`
    case ACTION_TYPES.REMOVE_BOND:
      return 'Removed bond'
    case ACTION_TYPES.CHANGE_BOND_TYPE:
      return `Changed to ${data?.bondType || 'bond'}`
    case ACTION_TYPES.LOAD_TEMPLATE:
      return `Loaded ${data?.templateName || 'template'}`
    case ACTION_TYPES.CLEAR_SCENE:
      return 'Cleared scene'
    case ACTION_TYPES.UNDO:
      return 'Undid last action'
    case ACTION_TYPES.REDO:
      return 'Redid last action'
    case ACTION_TYPES.AUTO_COMPLETE:
      return 'Auto-completed with hydrogen'
    case ACTION_TYPES.VOICE_COMMAND:
      return `Voice: ${data?.command || 'command'}`
    default:
      return 'Unknown action'
  }
}

// Time formatting utilities
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffSeconds < 5) return 'Just now'
  if (diffSeconds < 60) return `${diffSeconds}s ago`
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  
  return date.toLocaleTimeString()
}

export function formatTimeAgo(timestamp: number): string {
  return formatTimestamp(timestamp)
}

// Keyboard shortcut manager
export class KeyboardShortcutManager {
  private shortcuts: Map<string, () => void> = new Map()
  private enabled: boolean = true

  constructor() {
    this.setupGlobalListeners()
  }

  registerShortcut(keys: string, callback: () => void): void {
    this.shortcuts.set(keys.toLowerCase(), callback)
  }

  unregisterShortcut(keys: string): void {
    this.shortcuts.delete(keys.toLowerCase())
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  private setupGlobalListeners(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('keydown', (event) => {
      if (!this.enabled) return

      const keyString = this.buildKeyString(event)
      const callback = this.shortcuts.get(keyString.toLowerCase())
      
      if (callback) {
        event.preventDefault()
        callback()
      }
    })
  }

  private buildKeyString(event: KeyboardEvent): string {
    const parts: string[] = []
    
    if (event.ctrlKey) parts.push('ctrl')
    if (event.altKey) parts.push('alt')
    if (event.shiftKey) parts.push('shift')
    if (event.metaKey) parts.push('meta')
    
    parts.push(event.key.toLowerCase())
    
    return parts.join('+')
  }
}