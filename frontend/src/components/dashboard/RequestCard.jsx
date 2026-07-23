import { motion } from 'framer-motion';
import { MapPin, Clock, ChevronRight, AlertCircle, User } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const typeIcons = {
  medical: '🏥',
  grocery: '🛒',
  transport: '🚗',
  companionship: '🤝',
  home_repair: '🔧',
  other: '📋',
};

const typeLabels = {
  medical: 'Medical',
  grocery: 'Grocery',
  transport: 'Transport',
  companionship: 'Companionship',
  home_repair: 'Home Repair',
  other: 'Other',
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

/**
 * Request card used in Elder and Volunteer dashboards.
 */
export function RequestCard({ request, role, onAccept, onComplete, onCancel, onView, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 200, damping: 22 }}
      className="bg-white dark:bg-surface-800 rounded-3xl p-5 card-shadow border border-surface-100 dark:border-surface-700 hover:card-shadow-lg transition-all duration-300 group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{typeIcons[request.assistance_type] || '📋'}</span>
          <div>
            <h4 className="font-bold text-surface-900 dark:text-white text-sm">
              {typeLabels[request.assistance_type] || request.assistance_type}
            </h4>
            {request.requester && (
              <p className="text-xs text-surface-400 dark:text-surface-500 flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" /> {request.requester.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge type={request.status} label={request.status.replace('_', ' ')} />
          {request.priority === 'emergency' || request.priority === 'high' ? (
            <Badge type={request.priority} label={request.priority} />
          ) : null}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-3 line-clamp-2">
        {request.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-surface-400 dark:text-surface-500 mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(request.created_at)}
        </span>
        {request.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {request.location}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {onView && (
          <Button variant="ghost" size="sm" onClick={() => onView(request)} className="text-xs">
            View Details <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        )}
        {role === 'volunteer' && request.status === 'pending' && onAccept && (
          <Button variant="primary" size="sm" onClick={() => onAccept(request)} className="text-xs">
            Accept
          </Button>
        )}
        {role === 'volunteer' && request.status === 'accepted' && onComplete && (
          <Button variant="success" size="sm" onClick={() => onComplete(request)} className="text-xs">
            Mark Complete
          </Button>
        )}
        {role === 'elder' && request.status === 'pending' && onCancel && (
          <Button variant="danger" size="sm" onClick={() => onCancel(request)} className="text-xs">
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}
