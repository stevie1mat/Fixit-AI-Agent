'use client'

import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface NavbarProps {
  onOpenLogin?: () => void
}

export function Navbar({ onOpenLogin }: NavbarProps) {
  return (
    <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <span className="text-lg font-urbanist font-light text-gray-900">/ hello@fixit.ai</span>
      </div>
      
      <nav className="hidden md:flex items-center space-x-20">
        <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
        <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
        <a href="#support" className="text-gray-600 hover:text-gray-900">Support</a>
      </nav>
      
      <div className="flex items-center space-x-10">
        <Button 
          className="bg-black hover:bg-gray-800"
          onClick={onOpenLogin}
        >
          Get Started
        </Button>
        <button className="md:hidden">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  )
}
