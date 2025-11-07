'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Beaker, Zap } from 'lucide-react'

interface Notification {
  id: string
  message: string
  userName: string
  userColor: string
  timestamp: Date
}

interface CollaborationNotificationsProps {
  session: any
  userId: string
}

export default function CollaborationNotifications({ session, userId }: CollaborationNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [prevParticipantCount, setPrevParticipantCount] = useState(0)
  
  useEffect(() => {
    if (!session) return
    
    const currentCount = session.participants?.length || 0
    
    // Detect new participants
    if (currentCount > prevParticipantCount && prevParticipantCount > 0) {
      const newParticipant = session.participants[currentCount - 1]
      if (newParticipant.userId !== userId) {
        addNotification(
          `${newParticipant.name} joined the lab`,
          newParticipant.name,
          newParticipant.color
        )
      }
    }
    
    // Detect participants leaving
    if (currentCount < prevParticipantCount) {
      addNotification(
        'A participant left the lab',
        'System',
        '#6b7280'
      )
    }
    
    setPrevParticipantCount(currentCount)
  }, [session?.participants?.length])
  
  const addNotification = (message: string, userName: string, userColor: string) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      message,
      userName,
      userColor,
      timestamp: new Date()
    }
    
    setNotifications(prev => [notification, ...prev.slice(0, 4)])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
    }, 5000)
  }
  
  return (
    <div className="fixed top-20 right-6 z-30 space-y-2 max-w-sm">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-2xl border-2"
            style={{ borderColor: notif.userColor }}
          >
            <div className="flex items-start space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: notif.userColor }}
              >
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {notif.userName}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {notif.message}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
