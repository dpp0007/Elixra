'use client'

import { useState, useEffect } from 'react'
import LoadingAnimation from './LoadingAnimation'

export default function PageLoader({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Show loading animation for a bit longer to showcase the new design
        const timer = setTimeout(() => {
            setIsLoading(false)
        }, 2500)

        return () => clearTimeout(timer)
    }, [])

    if (isLoading) {
        return <LoadingAnimation />
    }

    return <>{children}</>
}
