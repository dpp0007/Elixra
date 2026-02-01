'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { PerspectiveGrid } from '@/components/GridBackground'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login, loginWithGoogle, isLoading, isAuthenticated } = useAuth()
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      const success = await login(email, password)
      if (success) {
        // Replace current page in history to prevent back navigation to login
        router.replace('/')
      } else {
        setError('Invalid email or password')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-elixra-cream dark:bg-elixra-charcoal overflow-hidden relative transition-colors duration-300">
      <PerspectiveGrid />
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-elixra-bunsen/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-elixra-copper/20 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-8 left-8 z-20">
        <Link 
          href="/"
          className="flex items-center space-x-2 text-elixra-secondary hover:text-elixra-charcoal dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-3">
              <img src="/Assets/Main Logo.svg" alt="Elixra Logo" className="h-24 w-24" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-elixra-charcoal dark:text-white mb-2">Welcome Back</h2>
          <p className="text-elixra-secondary">Sign in to continue your research</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl bg-white/40 dark:bg-white/5 border border-elixra-border-subtle shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-elixra-charcoal dark:text-white ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-elixra-secondary group-focus-within:text-elixra-bunsen transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-elixra-charcoal/5 dark:bg-black/20 border border-elixra-border-subtle rounded-xl text-elixra-charcoal dark:text-white placeholder-elixra-secondary focus:outline-none focus:ring-2 focus:ring-elixra-bunsen/50 focus:border-elixra-bunsen/50 transition-all"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-elixra-charcoal dark:text-white ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-elixra-secondary group-focus-within:text-elixra-bunsen transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-elixra-charcoal/5 dark:bg-black/20 border border-elixra-border-subtle rounded-xl text-elixra-charcoal dark:text-white placeholder-elixra-secondary focus:outline-none focus:ring-2 focus:ring-elixra-bunsen/50 focus:border-elixra-bunsen/50 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-elixra-secondary hover:text-elixra-bunsen transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-elixra-error text-sm text-center bg-elixra-error/10 py-2 rounded-lg border border-elixra-error/20"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-elixra-border-subtle"></div>
            <span className="text-sm text-elixra-secondary">Or continue with</span>
            <div className="h-px flex-1 bg-elixra-border-subtle"></div>
          </div>

          <div className="mt-6">
              <button
                onClick={() => loginWithGoogle()}
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-3 py-3 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl transition-all duration-300 font-medium disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="h-5 w-5" />
                <span>Sign in with Google</span>
              </button>
            </div>

          <p className="mt-8 text-center text-sm text-elixra-secondary">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-elixra-bunsen hover:text-elixra-bunsen-dark transition-colors">
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
