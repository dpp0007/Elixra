
import React from 'react'

export function PerspectiveGrid({ className = '', children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={`grid-perspective absolute inset-0 w-full h-full pointer-events-none ${className}`}>
      {children}
    </div>
  )
}

export function StaticGrid({ className = '', children }: { className?: string, children?: React.ReactNode }) {
  return (
    <div className={`grid-static absolute inset-0 w-full h-full pointer-events-none ${className}`}>
      {children}
    </div>
  )
}
