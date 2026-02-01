import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface AutoScrollIndicatorProps {
  isVisible: boolean
}

export default function AutoScrollIndicator({ isVisible }: AutoScrollIndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="glass-panel bg-elixra-bunsen/20 backdrop-blur-md border border-elixra-bunsen/40 rounded-full px-4 py-2 flex items-center gap-2 text-elixra-bunsen-dark dark:text-elixra-bunsen font-medium shadow-lg shadow-elixra-bunsen/10">
            <motion.div
              animate={{ y: [0, 3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowDown className="h-4 w-4" />
            </motion.div>
            <span>Auto-scrolling</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
