import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Bell, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const settingGroups = [
  {
    title: 'Appearance',
    items: [
      { label: 'Dark Mode', description: 'Switch between light and dark themes', action: 'theme' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { label: 'Email Notifications', description: 'Receive request updates via email', action: 'coming_soon' },
      { label: 'SMS Alerts', description: 'Get text messages for urgent requests', action: 'coming_soon' },
    ],
  },
  {
    title: 'Privacy & Security',
    items: [
      { label: 'Change Password', description: 'Update your account password', action: 'coming_soon' },
      { label: 'Two-Factor Auth', description: 'Add an extra layer of security', action: 'coming_soon' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help Center', description: 'Browse FAQs and guides', action: 'coming_soon' },
      { label: 'Contact Support', description: 'Reach our support team', action: 'coming_soon' },
    ],
  },
];

export default function SettingsPage() {
  const { dark, toggle } = useTheme();

  const handleAction = (action) => {
    if (action === 'theme') {
      toggle();
    } else {
      toast('This feature is coming soon!', { icon: '🚧' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white">Settings</h2>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your account preferences.</p>
      </div>

      {settingGroups.map((group) => (
        <Card key={group.title} className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 dark:border-surface-700">
            <h3 className="font-bold text-surface-700 dark:text-surface-200 text-sm uppercase tracking-wider">
              {group.title}
            </h3>
          </div>
          <div className="divide-y divide-surface-100 dark:divide-surface-700">
            {group.items.map((item) => (
              <button
                key={item.label}
                onClick={() => handleAction(item.action)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors text-left group"
              >
                <div>
                  <p className="font-semibold text-surface-800 dark:text-surface-100 text-sm">{item.label}</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{item.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {item.action === 'theme' && (
                    <div className={`w-12 h-6 rounded-full transition-colors ${dark ? 'bg-primary-500' : 'bg-surface-300'} relative`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${dark ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                  )}
                  <ChevronRight className="w-4 h-4 text-surface-300 group-hover:text-surface-500 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      ))}

      <Card className="border border-red-100 dark:border-red-900/30">
        <h3 className="font-bold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider mb-4">Danger Zone</h3>
        <Button
          variant="danger"
          size="md"
          onClick={() => toast('Please contact support to delete your account.', { icon: '⚠️' })}
        >
          Delete Account
        </Button>
      </Card>
    </motion.div>
  );
}
