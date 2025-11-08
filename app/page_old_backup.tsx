'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Atom, Beaker, TestTube, Zap, Users, Shield, BookOpen, ArrowRight } from 'lucide-react'
import AuthButton from '@/components/AuthButton'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg sm:rounded-xl">
                <Atom className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                <span className="hidden sm:inline">Virtual Chemistry Lab</span>
                <span className="sm:hidden">ChemLab</span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 relative z-50">
              <Link
                href="/features"
                className="hidden md:flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
              >
                <span>Features</span>
              </Link>
              <Link
                href="/lab"
                className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
              >
                <span>Lab</span>
              </Link>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Virtual Chemistry
                <span className="text-blue-600"> Laboratory</span>
              </h1>
              <p className="text-base sm:text-xl text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
                Experience the power of chemistry through interactive experiments, AI-powered analysis, 
                and real-time reaction simulations. Perfect for students, educators, and chemistry enthusiasts.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4"
            >
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 shadow-lg touch-manipulation"
              >
                <span>Start Experimenting</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href="/auth/signin"
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 shadow-lg touch-manipulation"
              >
                <span>Sign In</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-10 text-blue-500 opacity-20"
          >
            <Beaker className="h-16 w-16" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, 20, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-40 right-20 text-purple-500 opacity-20"
          >
            <TestTube className="h-12 w-12" />
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, 10, 0]
            }}
            transition={{ 
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute bottom-20 left-20 text-green-500 opacity-20"
          >
            <Zap className="h-14 w-14" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Virtual Lab?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience chemistry like never before with cutting-edge technology and interactive learning.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl w-fit mb-6">
                <Atom className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Interactive Experiments
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Drag and drop chemicals, mix reactions, and observe real-time results with stunning visual effects and accurate chemical behavior.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl w-fit mb-6">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Analysis
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get instant analysis of your experiments with AI-generated balanced equations, reaction types, and detailed observations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl w-fit mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Safe Learning Environment
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Learn chemistry safely without the risks of handling dangerous chemicals. Perfect for remote learning and practice.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Start Your Chemistry Journey?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join thousands of students and educators already using our virtual chemistry lab.
            </p>
            <Link
              href="/auth/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <span>Create Free Account</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg sm:rounded-xl">
                <Atom className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                <span className="hidden sm:inline">Virtual Chemistry Lab</span>
                <span className="sm:hidden">ChemLab</span>
              </span>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">
              © 2024 Virtual Chemistry Lab. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}