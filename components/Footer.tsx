'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative mt-auto bg-slate-950 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-transparent pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="relative h-10 w-32">
                <Image src="/Assets/Main Logo.svg" alt="Elixra" fill className="object-contain object-left" />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              Interactive virtual chemistry laboratory powered by AI. Learn, experiment, and discover chemistry in a safe environment.
            </p>
            <div className="flex space-x-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="mailto:contact@elixra.com" className="p-2.5 rounded-lg bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-all">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link href="/lab" className="text-gray-400 hover:text-white transition-colors text-sm">Virtual Lab</Link></li>
              <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</Link></li>
              <li><Link href="/quiz" className="text-gray-400 hover:text-white transition-colors text-sm">Quiz</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              <li><Link href="/molecules" className="text-gray-400 hover:text-white transition-colors text-sm">Molecules</Link></li>
              <li><Link href="/equipment" className="text-gray-400 hover:text-white transition-colors text-sm">Equipment</Link></li>
              <li><Link href="/spectroscopy" className="text-gray-400 hover:text-white transition-colors text-sm">Spectroscopy</Link></li>
              <li><Link href="/collaborate" className="text-gray-400 hover:text-white transition-colors text-sm">Collaborate</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-500 text-sm">© {currentYear} Elixra. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-sm">Terms of Service</Link>
              <Link href="/contact" className="text-gray-500 hover:text-white transition-colors text-sm">Contact Us</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
