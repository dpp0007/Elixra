'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowLeft, User, Mail, Calendar, FlaskConical, 
  Save, Clock, Edit2, Camera, LogOut, Trash2, Search,
  X, Loader2, Check
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ExperimentDetailsModal from '@/components/ExperimentDetailsModal'
import { ExperimentLog } from '@/types/chemistry'
import { PerspectiveGrid, StaticGrid } from '@/components/GridBackground'

export default function ProfilePage() {
  const { user, experiments, deleteExperiment, toggleSaveExperiment, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'history' | 'saved'>('saved')
  const [isEditing, setIsEditing] = useState(false)
  const [selectedExperiment, setSelectedExperiment] = useState<ExperimentLog | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Edit form state
  const [editName, setEditName] = useState('')
  const [editImage, setEditImage] = useState('')
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        if (!isAuthenticated) router.push('/auth/signin')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, router])

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditName(user.name || '')
      setEditImage(user.image || '')
    }
  }, [user])

  if (!user) return null

  // Filter experiments based on tab and search
  const filteredExperiments = experiments.filter(exp => {
    // Search filter
    const matchesSearch = 
      exp.experimentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.chemicals.some(c => c.chemical.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Tab filter
    const matchesTab = activeTab === 'saved' ? exp.isSaved : true

    return matchesSearch && matchesTab
  })

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          image: editImage || null
        })
      })

      if (response.ok) {
        // Reload page to refresh session/user data
        router.refresh()
        setIsEditing(false)
      } else {
        console.error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSavingProfile(false)
    }
  }

  return (
    <div className="min-h-screen bg-elixra-cream dark:bg-elixra-charcoal relative overflow-hidden transition-colors duration-300">
      <PerspectiveGrid />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Link 
          href="/"
          className="inline-flex items-center space-x-2 text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 relative">
            <div className="sticky top-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                  <StaticGrid className="opacity-30" />
                  
                  <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {user.image ? (
                    <img 
                      src={user.image} 
                      alt={user.name || 'User'} 
                      className="w-32 h-32 rounded-full border-4 border-white/50 dark:border-white/10 shadow-xl object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-elixra-bunsen to-blue-600 flex items-center justify-center border-4 border-white/50 dark:border-white/10 shadow-xl">
                      <User className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="absolute bottom-0 right-0 p-2.5 bg-elixra-bunsen hover:bg-elixra-bunsen-dark text-white rounded-full shadow-lg transition-all hover:scale-110 border border-white/20"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>

                <h1 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-1">
                  {user.name || 'User'}
                </h1>
                {user.username && (
                  <p className="text-elixra-bunsen font-medium mb-3">@{user.username}</p>
                )}
                <div className="flex items-center text-elixra-secondary text-sm mb-6 bg-white/50 dark:bg-white/5 px-4 py-1.5 rounded-full border border-elixra-border-subtle">
                  <Mail className="h-3.5 w-3.5 mr-2" />
                  {user.email}
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                  <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-elixra-border-subtle text-center">
                    <div className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-1">{experiments.length}</div>
                    <div className="text-xs text-elixra-secondary uppercase tracking-wider">Experiments</div>
                  </div>
                  <div className="bg-white/50 dark:bg-white/5 rounded-2xl p-4 border border-elixra-border-subtle text-center">
                    <div className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-1">
                      {new Date().getFullYear()}
                    </div>
                    <div className="text-xs text-elixra-secondary uppercase tracking-wider">Member Since</div>
                  </div>
                </div>

                <button 
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-elixra-error/10 hover:bg-elixra-error/20 text-elixra-error hover:text-red-400 rounded-xl transition-all border border-elixra-error/20 group"
                >
                  <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Storage Usage Card */}
            <div className="mt-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-elixra-border-subtle rounded-3xl p-6 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-elixra-bunsen/20 rounded-lg">
                  <Save className="h-5 w-5 text-elixra-bunsen" />
                </div>
                <h3 className="font-bold text-elixra-charcoal dark:text-elixra-cream">Storage Usage</h3>
              </div>
              
              <div className="w-full bg-elixra-charcoal/10 dark:bg-white/5 rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-elixra-bunsen to-elixra-copper h-2 rounded-full" 
                  style={{ width: `${Math.min((experiments.filter(e => e.isSaved).length / 20) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-elixra-secondary">
                <span>{experiments.filter(e => e.isSaved).length} / 20 Saved Experiments</span>
                <span>{Math.round((experiments.filter(e => e.isSaved).length / 20) * 100)}%</span>
              </div>
              
              <p className="mt-4 text-xs text-elixra-secondary leading-relaxed border-t border-elixra-border-subtle pt-4">
                Unsaved experiments are automatically deleted after 30 days. Save your important work to keep it forever.
              </p>
            </div>
            </motion.div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="glass-panel bg-white/40 dark:bg-white/5 backdrop-blur-2xl border border-elixra-border-subtle rounded-3xl shadow-2xl min-h-[600px] flex flex-col">
              {/* Tabs & Search Header */}
              <div className="p-6 border-b border-elixra-border-subtle bg-white/40 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-20 rounded-t-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex bg-elixra-charcoal/5 dark:bg-black/20 p-1 rounded-xl backdrop-blur-md border border-elixra-border-subtle w-fit">
                    <button
                      onClick={() => setActiveTab('saved')}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'saved' 
                          ? 'bg-elixra-bunsen text-white shadow-lg' 
                          : 'text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Save className="h-4 w-4" />
                      <span>Saved</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === 'history' 
                          ? 'bg-elixra-bunsen text-white shadow-lg' 
                          : 'text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      <span>History</span>
                    </button>
                  </div>

                  <div className="relative flex-1 sm:max-w-xs group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-elixra-secondary group-focus-within:text-elixra-bunsen transition-colors" />
                    <input
                      type="text"
                      placeholder="Search experiments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-elixra-charcoal/5 dark:bg-black/20 border border-elixra-border-subtle rounded-xl text-elixra-charcoal dark:text-elixra-cream placeholder-elixra-secondary focus:outline-none focus:ring-2 focus:ring-elixra-bunsen/50 focus:border-elixra-bunsen/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Experiment List */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredExperiments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredExperiments.map((exp) => (
                        <motion.div
                          key={exp._id || exp.timestamp.toString()}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setSelectedExperiment(exp)}
                          className="group bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-elixra-border-subtle hover:border-elixra-bunsen/30 rounded-2xl p-5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className="p-3 bg-elixra-bunsen/10 rounded-xl border border-elixra-bunsen/20 group-hover:scale-105 transition-transform duration-300">
                                <FlaskConical className="h-6 w-6 text-elixra-bunsen" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-elixra-charcoal dark:text-elixra-cream mb-1 group-hover:text-elixra-bunsen transition-colors">
                                  {exp.experimentName}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-xs text-elixra-secondary mb-3">
                                  <span className="flex items-center bg-elixra-charcoal/5 dark:bg-black/20 px-2 py-1 rounded-md">
                                    <Calendar className="h-3 w-3 mr-1.5" />
                                    {formatDate(exp.timestamp)}
                                  </span>
                                  <span className="flex items-center bg-elixra-charcoal/5 dark:bg-black/20 px-2 py-1 rounded-md">
                                    {exp.chemicals.length} Chemicals
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {exp.chemicals.slice(0, 3).map((c, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-white/5 text-elixra-secondary border border-elixra-border-subtle">
                                      {c.chemical.name}
                                    </span>
                                  ))}
                                  {exp.chemicals.length > 3 && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-white/5 text-elixra-secondary border border-elixra-border-subtle">
                                      +{exp.chemicals.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              <button
                                onClick={() => toggleSaveExperiment(exp._id!, !exp.isSaved)}
                                className={`p-2 rounded-lg transition-colors ${
                                  exp.isSaved 
                                    ? 'bg-elixra-bunsen/20 text-elixra-bunsen hover:bg-elixra-bunsen/30' 
                                    : 'bg-white/50 dark:bg-white/5 text-elixra-secondary hover:bg-white/80 dark:hover:bg-white/10 hover:text-elixra-charcoal dark:hover:text-white'
                                }`}
                                title={exp.isSaved ? "Unsave" : "Save"}
                              >
                                <Save className={`h-4 w-4 ${exp.isSaved ? 'fill-current' : ''}`} />
                              </button>
                              <button
                                onClick={() => deleteExperiment(exp._id!)}
                                className="p-2 rounded-lg bg-elixra-error/10 text-elixra-error hover:bg-elixra-error/20 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full text-center py-20"
                    >
                      <div className="w-24 h-24 rounded-full bg-elixra-charcoal/5 dark:bg-white/5 flex items-center justify-center mb-6 animate-pulse">
                        <FlaskConical className="h-10 w-10 text-elixra-secondary" />
                      </div>
                      <h3 className="text-xl font-bold text-elixra-charcoal dark:text-elixra-cream mb-2">No experiments found</h3>
                      <p className="text-elixra-secondary max-w-sm mb-8">
                        {searchQuery 
                          ? "We couldn't find any experiments matching your search." 
                          : activeTab === 'saved' 
                            ? "You haven't saved any experiments yet. Star your best discoveries!" 
                            : "Your lab notebook is empty. Start experimenting!"}
                      </p>
                      <Link 
                        href="/lab"
                        className="px-8 py-3 btn-primary flex items-center shadow-lg hover:scale-105 transition-all"
                      >
                        <FlaskConical className="h-5 w-5 mr-2" />
                        Go to Lab
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experiment Details Modal */}
      <AnimatePresence>
        {selectedExperiment && (
          <ExperimentDetailsModal 
            experiment={selectedExperiment} 
            onClose={() => setSelectedExperiment(null)} 
          />
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-elixra-cream dark:bg-elixra-charcoal border border-elixra-border-subtle w-full max-w-md rounded-3xl p-8 relative overflow-hidden shadow-2xl"
            >
              {/* Modal Gradients */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-elixra-bunsen/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-elixra-copper/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white">Edit Profile</h2>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 rounded-full text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="flex justify-center mb-8">
                    <div className="relative group cursor-pointer">
                      {editImage ? (
                        <img 
                          src={editImage} 
                          alt="Preview" 
                          className="w-28 h-28 rounded-full border-4 border-white/50 dark:border-white/10 object-cover group-hover:opacity-50 transition-opacity"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-elixra-bunsen to-blue-600 flex items-center justify-center border-4 border-white/50 dark:border-white/10 group-hover:opacity-50 transition-opacity">
                          <User className="h-12 w-12 text-white" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Avatar Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-elixra-secondary ml-1">Choose Avatar</label>
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        '/Assets/Profile/Female 2.svg',
                        '/Assets/Profile/Female1.svg',
                        '/Assets/Profile/Male1.svg',
                        '/Assets/Profile/Male2.svg'
                      ].map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setEditImage(avatar)}
                          className={`relative aspect-square rounded-full p-1 transition-all ${
                            editImage === avatar 
                              ? 'ring-2 ring-elixra-bunsen scale-110 bg-white/20' 
                              : 'hover:bg-white/10 hover:scale-105 border border-transparent hover:border-white/20'
                          }`}
                        >
                          <img 
                            src={avatar} 
                            alt="Avatar option" 
                            className="w-full h-full rounded-full object-contain"
                          />
                          {editImage === avatar && (
                            <div className="absolute -bottom-1 -right-1 bg-elixra-bunsen rounded-full p-1 shadow-lg">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-elixra-secondary ml-1">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-4 py-3 bg-elixra-charcoal/5 dark:bg-black/30 border border-elixra-border-subtle rounded-xl text-elixra-charcoal dark:text-elixra-cream placeholder-elixra-secondary focus:outline-none focus:ring-2 focus:ring-elixra-bunsen/50 focus:border-elixra-bunsen/50 transition-all"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="pt-4 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-6 py-3 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 text-elixra-charcoal dark:text-white rounded-xl font-medium transition-colors border border-elixra-border-subtle"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="flex-1 px-6 py-3 btn-primary text-white rounded-xl font-bold shadow-lg shadow-elixra-bunsen/25 hover:shadow-elixra-bunsen/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSavingProfile ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
