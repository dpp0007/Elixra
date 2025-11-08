'use client'

import { useState, useEffect } from 'react'
import LoadingAnimation from './LoadingAnimation'

export default function PageLoader({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Show loading for 2 seconds on initial load
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2000)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <LoadingAnimation />
    }

    return <>{children}</>
}
