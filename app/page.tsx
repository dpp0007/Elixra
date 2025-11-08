'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Atom, Beaker, TestTube, Zap, Users, Shield, Sparkles, ArrowRight, Play, Check } from 'lucide-react'
import ModernNavbar from '@/components/ModernNavbar'
import AuthButton from '@/components/AuthButton'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-1/2 right-0 animate-pulse delay-1000"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse delay-2000"></div>
      </div>

      {/* Modern Navbar */}
      <ModernNavbar />

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full mb-6">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-gray-200">Powered by AI • Real-time Analysis</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Chemistry Lab
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                Experience chemistry like never before. AI-powered analysis, real-time collaboration,
                and interactive experiments—all in your browser.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/auth/signup"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/lab"
                  className="group px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-all duration-300 flex items-center space-x-2"
                >
                  <Play className="h-5 w-5" />
                  <span>Watch Demo</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-400">
              Professional-grade tools for modern chemistry education
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'AI-Powered Analysis',
                description: 'Get instant reaction analysis with balanced equations and detailed observations',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Users,
                title: 'Real-Time Collaboration',
                description: 'Work together with classmates in shared lab sessions with live updates',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Beaker,
                title: 'Interactive Experiments',
                description: 'Drag-and-drop interface with realistic chemical reactions and visual effects',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: TestTube,
                title: 'Advanced Equipment',
                description: 'Access professional lab equipment including spectroscopy tools',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Shield,
                title: '100% Safe',
                description: 'Learn chemistry without the risks of handling dangerous chemicals',
                gradient: 'from-red-500 to-rose-500'
              },
              {
                icon: Sparkles,
                title: 'Daily Challenges',
                description: 'Test your knowledge with AI-generated quizzes and earn rewards',
                gradient: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}></div>
                <div className="relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { value: '10K+', label: 'Active Users' },
                { value: '50K+', label: 'Experiments Run' },
                { value: '99.9%', label: 'Uptime' },
                { value: '4.9/5', label: 'User Rating' }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Chemistry Learning?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of students and educators using Elixra
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Infinite Scrolling Carousel */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="mb-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Trusted by Students Worldwide</h3>
          <p className="text-gray-400">Explore our comprehensive chemistry features</p>
        </div>

        {/* Scrolling Row 1 - Left to Right */}
        <div className="relative mb-6">
          <div className="flex animate-scroll-right">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex space-x-6 px-3">
                {[
                  { emoji: '🧪', text: 'Test Tubes', color: 'from-blue-500 to-cyan-500' },
                  { emoji: '⚗️', text: 'Beakers', color: 'from-purple-500 to-pink-500' },
                  { emoji: '🔬', text: 'Microscope', color: 'from-green-500 to-emerald-500' },
                  { emoji: '⚛️', text: 'Molecules', color: 'from-orange-500 to-red-500' },
                  { emoji: '🌡️', text: 'Temperature', color: 'from-yellow-500 to-orange-500' },
                  { emoji: '💧', text: 'Solutions', color: 'from-cyan-500 to-blue-500' },
                  { emoji: '🔥', text: 'Reactions', color: 'from-red-500 to-pink-500' },
                  { emoji: '⚡', text: 'Energy', color: 'from-yellow-400 to-orange-400' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-48 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className={`text-4xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      {item.emoji}
                    </div>
                    <div className={`text-lg font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Scrolling Row 2 - Right to Left */}
        <div className="relative">
          <div className="flex animate-scroll-left">
            {[...Array(2)].map((_, setIndex) => (
              <div key={setIndex} className="flex space-x-6 px-3">
                {[
                  { emoji: '📊', text: 'Analytics', color: 'from-indigo-500 to-purple-500' },
                  { emoji: '🎯', text: 'Precision', color: 'from-pink-500 to-rose-500' },
                  { emoji: '🧬', text: 'DNA Models', color: 'from-teal-500 to-cyan-500' },
                  { emoji: '💎', text: 'Crystals', color: 'from-blue-400 to-indigo-400' },
                  { emoji: '🌈', text: 'Spectrum', color: 'from-purple-400 to-pink-400' },
                  { emoji: '🔋', text: 'Batteries', color: 'from-green-400 to-emerald-400' },
                  { emoji: '🧲', text: 'Magnetism', color: 'from-red-400 to-orange-400' },
                  { emoji: '💫', text: 'Catalysts', color: 'from-yellow-300 to-orange-300' }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 w-48 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
                  >
                    <div className={`text-4xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                      {item.emoji}
                    </div>
                    <div className={`text-lg font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
