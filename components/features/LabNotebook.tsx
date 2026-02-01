'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Edit, Trash2, X, Save } from 'lucide-react'

interface NotebookEntry {
  _id?: string
  experimentId: string
  hypothesis: string
  observations: string[]
  conclusion: string
  timestamp: Date
  tags: string[]
}

export default function LabNotebook({ experimentId }: { experimentId?: string }) {
  const [entries, setEntries] = useState<NotebookEntry[]>([])
  const [showEditor, setShowEditor] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<Partial<NotebookEntry>>({
    hypothesis: '',
    observations: [''],
    conclusion: '',
    tags: []
  })
  const [isEditing, setIsEditing] = useState(false)
  
  useEffect(() => {
    fetchEntries()
  }, [experimentId])
  
  const fetchEntries = async () => {
    try {
      const url = experimentId 
        ? `/api/notebook?experimentId=${experimentId}`
        : '/api/notebook'
      const response = await fetch(url)
      const data = await response.json()
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Failed to fetch notebook entries:', error)
    }
  }
  
  const saveEntry = async () => {
    try {
      const method = isEditing ? 'PUT' : 'POST'
      const body = isEditing 
        ? { entryId: currentEntry._id, ...currentEntry }
        : { ...currentEntry, experimentId }
      
      const response = await fetch('/api/notebook', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (response.ok) {
        fetchEntries()
        setShowEditor(false)
        setCurrentEntry({
          hypothesis: '',
          observations: [''],
          conclusion: '',
          tags: []
        })
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to save entry:', error)
    }
  }
  
  const deleteEntry = async (entryId: string) => {
    if (!confirm('Delete this entry?')) return
    
    try {
      const response = await fetch(`/api/notebook?entryId=${entryId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        fetchEntries()
      }
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }
  
  const addObservation = () => {
    setCurrentEntry({
      ...currentEntry,
      observations: [...(currentEntry.observations || []), '']
    })
  }
  
  const updateObservation = (index: number, value: string) => {
    const newObservations = [...(currentEntry.observations || [])]
    newObservations[index] = value
    setCurrentEntry({ ...currentEntry, observations: newObservations })
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Lab Notebook
          </h2>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </button>
      </div>
      
      {/* Entries List */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No entries yet. Start documenting your experiments!
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Hypothesis
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {entry.hypothesis}
                  </p>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Observations
                  </h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {entry.observations.map((obs, i) => (
                      <li key={i}>{obs}</li>
                    ))}
                  </ul>
                  
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Conclusion
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {entry.conclusion}
                  </p>
                  
                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {entry.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setCurrentEntry(entry)
                      setIsEditing(true)
                      setShowEditor(true)
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteEntry(entry._id!)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Entry' : 'New Entry'}
                </h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hypothesis
                  </label>
                  <textarea
                    value={currentEntry.hypothesis}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, hypothesis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="What do you expect to happen?"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Observations
                    </label>
                    <button
                      onClick={addObservation}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add
                    </button>
                  </div>
                  {currentEntry.observations?.map((obs, i) => (
                    <input
                      key={i}
                      value={obs}
                      onChange={(e) => updateObservation(i, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white mb-2"
                      placeholder={`Observation ${i + 1}`}
                    />
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Conclusion
                  </label>
                  <textarea
                    value={currentEntry.conclusion}
                    onChange={(e) => setCurrentEntry({ ...currentEntry, conclusion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                    placeholder="What did you learn?"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEntry}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
