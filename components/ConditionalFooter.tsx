'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
    const pathname = usePathname()

    // Pages where footer should be shown
    const pagesWithFooter = ['/', '/features', '/collaborate', '/equipment']

    // Check if current path matches any of the allowed pages
    const shouldShowFooter = pagesWithFooter.includes(pathname)

    if (!shouldShowFooter) {
        return null
    }

    return <Footer />
}
