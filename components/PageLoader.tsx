'use client'

import { useState, useEffect } from 'react'
import LoadingAnimation from './LoadingAnimation'

export default function PageLoader({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Show loading only on first visit - reduced time
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 600) // Reduced from 2000ms to 600ms for faster initial load

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <LoadingAnimation />
    }

    return <>{children}</>
}
