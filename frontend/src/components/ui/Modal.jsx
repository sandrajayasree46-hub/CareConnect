import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Accessible modal/dialog overlay with Framer Motion animation.
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative w-full ${maxWidth} bg-white dark:bg-surface-800 rounded-3xl card-shadow-lg border border-surface-100 dark:border-surface-700 p-6 max-h-[90vh] overflow-y-auto z-10`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
