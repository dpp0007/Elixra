'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function TopLoadingBar() {
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => {
            setLoading(false)
        }, 500)

        return () => clearTimeout(timer)
    }, [pathname])

    if (!loading) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500">
            <div className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse"></div>
        </div>
    )
}
