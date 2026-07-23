import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Link as LinkIcon,
  Heart,
  Star,
  ToggleLeft,
  ToggleRight,
  BookOpen,
  Tag,
} from 'lucide-react';

import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── Animation helpers ────────────────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({ opacity: 1, y: 0, transition: { delay, type: 'spring', stiffness: 220, damping: 24 } }),
};

// ─── Profile Card ─────────────────────────────────────────────────────────────

/**
 * Read-only profile card showing avatar initial, user info, and role badge.
 * Includes an edit button to reveal the inline edit form.
 */
function ProfileCard({ user, onEditClick }) {
  const initial   = user?.name?.[0]?.toUpperCase() || '?';
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
      {/* Avatar circle — shows photo if avatarUrl provided, else initial */}
      {user?.avatar_url ? (
        <img
          src={user.avatar_url}
          alt={user.name}
          className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-md"
        />
      ) : (
        <div className="gradient-primary w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200 dark:shadow-blue-900/40">
          <span className="text-white font-extrabold text-3xl">{initial}</span>
        </div>
      )}

      {/* User details */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h2 className="text-xl font-extrabold text-surface-900 dark:text-white truncate">
            {user?.name || 'Unknown User'}
          </h2>
          <Badge
            type={user?.role === 'elder' ? 'accepted' : 'available'}
            label={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : '—'}
          />
        </div>

        <div className="flex flex-col gap-1.5 mt-2 text-sm text-surface-500 dark:text-surface-400">
          <span className="flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            {user?.email || '—'}
          </span>
          <span className="flex items-center justify-center sm:justify-start gap-2">
            <Phone className="w-4 h-4 shrink-0" />
            {user?.phone || 'No phone set'}
          </span>
          <span className="flex items-center justify-center sm:justify-start gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            Member since {memberSince}
          </span>
        </div>
      </div>

      {/* Edit button */}
      <Button variant="secondary" icon={Edit3} size="sm" onClick={onEditClick} className="shrink-0">
        Edit
      </Button>
    </Card>
  );
}

// ─── Edit Profile Form ────────────────────────────────────────────────────────

/**
 * Inline edit form for basic profile fields (name, phone, avatarUrl).
 * For volunteers, also shows availability toggle, bio, and skills.
 */
function EditProfileForm({ user, onSaved, onCancel }) {
  const [saving, setSaving]   = useState(false);
  const [fields, setFields]   = useState({
    name:         user?.name       || '',
    phone:        user?.phone      || '',
    avatar_url:   user?.avatar_url || '',
    // Volunteer-only fields
    available:    user?.available  ?? true,
    bio:          user?.bio        || '',
    skills:       (user?.skills || []).join(', '),
  });

  const set = (key, val) => setFields((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!fields.name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      // Build payload — parse skills CSV only for volunteers
      const payload = {
        name:       fields.name.trim(),
        phone:      fields.phone.trim() || null,
        avatar_url: fields.avatar_url.trim() || null,
      };
      if (user?.role === 'volunteer') {
        payload.available = fields.available;
        payload.bio       = fields.bio.trim() || null;
        payload.skills    = fields.skills.split(',').map((s) => s.trim()).filter(Boolean);
      }
      const res = await api.put('/profile', payload);
      onSaved(res.data.data || payload);
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
    >
      <Card>
        <CardHeader className="flex items-center justify-between !mb-5">
          <CardTitle>Edit Profile</CardTitle>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        <div className="space-y-4">
          <Input
            id="edit-name"
            label="Full Name"
            icon={User}
            value={fields.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Your full name"
          />
          <Input
            id="edit-phone"
            label="Phone Number"
            icon={Phone}
            type="tel"
            value={fields.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="+1 555-000-0000"
          />
          <Input
            id="edit-avatar"
            label="Avatar URL"
            icon={LinkIcon}
            value={fields.avatar_url}
            onChange={(e) => set('avatar_url', e.target.value)}
            placeholder="https://example.com/photo.jpg"
          />

          {/* Volunteer-only extras */}
          {user?.role === 'volunteer' && (
            <>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-sm text-surface-800 dark:text-surface-100">Available to Help</p>
                    <p className="text-xs text-surface-400 dark:text-surface-500">Toggle your availability status</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => set('available', !fields.available)}
                  className="transition-transform active:scale-90"
                >
                  {fields.available
                    ? <ToggleRight className="w-8 h-8 text-emerald-500" />
                    : <ToggleLeft  className="w-8 h-8 text-surface-400" />
                  }
                </button>
              </div>

              <Input
                id="edit-bio"
                label="Bio"
                icon={BookOpen}
                textarea
                rows={3}
                value={fields.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="Tell elders a little about yourself…"
              />

              <Input
                id="edit-skills"
                label="Skills (comma-separated)"
                icon={Tag}
                value={fields.skills}
                onChange={(e) => set('skills', e.target.value)}
                placeholder="Driving, First Aid, Cooking…"
              />
            </>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="primary" icon={Save} loading={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ─── Emergency Contacts ───────────────────────────────────────────────────────

/**
 * Manage emergency contacts: list, add new, and delete existing.
 * Data is saved to /profile endpoint as the `emergency_contacts` array.
 */
function EmergencyContactsSection({ initialContacts = [] }) {
  const [contacts, setContacts] = useState(initialContacts);
  const [showForm, setShowForm] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [saving, setSaving]         = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading]       = useState(false);

  // Fetch latest contacts on mount
  useEffect(() => {
    setLoading(true);
    api.get('/emergency-contacts')
      .then(res => {
        const list = res.data?.data?.contacts ?? res.data?.data ?? res.data ?? [];
        setContacts(Array.isArray(list) ? list : []);
      })
      .catch(() => {}) // silently ignore, fallback to initialContacts
      .finally(() => setLoading(false));
  }, []);

  const setField = (key, val) =>
    setNewContact((prev) => ({ ...prev, [key]: val }));

  const handleAdd = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      toast.error('Name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/emergency-contacts', {
        name:         newContact.name.trim(),
        phone:        newContact.phone.trim(),
        relationship: newContact.relationship.trim(),
      });
      const created = res.data?.data ?? res.data;
      setContacts(prev => [created, ...prev]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowForm(false);
      toast.success('Emergency contact added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/emergency-contacts/${id}`);
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success('Contact removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove contact.');
    } finally {
      setDeletingId(null);
    }
  };

  // Normalize: API may return name or contact_name
  const getContactName = (c) => c.name || c.contact_name || '?';

  return (
    <Card>
      <CardHeader className="flex items-center justify-between !mb-5">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" />
          <CardTitle>Emergency Contacts</CardTitle>
        </div>
        {!showForm && (
          <Button variant="secondary" icon={Plus} size="sm" onClick={() => setShowForm(true)}>
            Add
          </Button>
        )}
      </CardHeader>

      {/* Contact list */}
      <div className="space-y-3 mb-4">
        {contacts.length === 0 && !showForm && (
          <p className="text-sm text-surface-400 dark:text-surface-500 text-center py-4">
            No emergency contacts added yet.
          </p>
        )}
        <AnimatePresence initial={false}>
          {contacts.map((contact) => (
            <motion.div
              key={contact.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 25 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-100 dark:border-surface-700"
            >
              {/* Avatar initial */}
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <span className="text-red-600 dark:text-red-400 font-bold text-sm">
                  {getContactName(contact)?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-surface-800 dark:text-surface-100 truncate">
                  {getContactName(contact)}
                </p>
                <p className="text-xs text-surface-400 dark:text-surface-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3" /> {contact.phone}
                  {contact.relationship && (
                    <span className="ml-2 text-surface-300 dark:text-surface-600">· {contact.relationship}</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleDelete(contact.id)}
                disabled={deletingId === contact.id}
                className="p-2 rounded-xl text-surface-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add-contact inline form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-3 border-t border-surface-100 dark:border-surface-700">
              <p className="text-sm font-semibold text-surface-700 dark:text-surface-200">New Contact</p>
              <Input
                id="ec-name"
                label="Name"
                icon={User}
                value={newContact.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Jane Doe"
              />
              <Input
                id="ec-phone"
                label="Phone"
                icon={Phone}
                type="tel"
                value={newContact.phone}
                onChange={(e) => setField('phone', e.target.value)}
                placeholder="+1 555-000-0000"
              />
              <Input
                id="ec-rel"
                label="Relationship (optional)"
                icon={Heart}
                value={newContact.relationship}
                onChange={(e) => setField('relationship', e.target.value)}
                placeholder="Daughter, Neighbour…"
              />
              <div className="flex gap-3">
                <Button variant="success" icon={Plus} loading={saving} onClick={handleAdd} size="sm">
                  Add Contact
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)} size="sm" disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── Change Password ──────────────────────────────────────────────────────────

function ChangePasswordSection() {
  const [show, setShow]     = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });
  const [fields, setFields] = useState({ current: '', next: '', confirm: '' });
  const [errors, setErrors] = useState({});

  const toggleVis = (key) =>
    setShowPw((prev) => ({ ...prev, [key]: !prev[key] }));

  const setField = (key, val) => {
    setFields((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!fields.current) e.current = 'Current password is required.';
    if (!fields.next)    e.next    = 'New password is required.';
    else if (fields.next.length < 8) e.next = 'Password must be at least 8 characters.';
    if (!fields.confirm) e.confirm = 'Please confirm your new password.';
    else if (fields.next !== fields.confirm) e.confirm = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    const toastId = toast.loading('Updating password…');
    try {
      await api.post('/profile/change-password', {
        current_password: fields.current,
        new_password:     fields.next,
        confirm_password: fields.confirm,
      });
      toast.success('Password updated successfully! 🔐', { id: toastId });
      setFields({ current: '', next: '', confirm: '' });
      setErrors({});
      setShow(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update password.', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between !mb-0">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-surface-500" />
          <CardTitle>Change Password</CardTitle>
        </div>
        <button
          onClick={() => setShow((v) => !v)}
          className="p-1.5 rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
        >
          {show ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
        </button>
      </CardHeader>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 mt-5">
              {[
                { key: 'current', label: 'Current Password' },
                { key: 'next',    label: 'New Password'     },
                { key: 'confirm', label: 'Confirm Password' },
              ].map(({ key, label }) => (
                <div key={key} className="relative">
                  <Input
                    id={`pw-${key}`}
                    label={label}
                    icon={Lock}
                    type={showPw[key] ? 'text' : 'password'}
                    value={fields[key]}
                    onChange={(e) => setField(key, e.target.value)}
                    placeholder="••••••••"
                    error={errors[key]}
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => toggleVis(key)}
                    className="absolute right-4 top-[2.6rem] text-surface-400 hover:text-surface-600 transition-colors"
                  >
                    {showPw[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              ))}

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  icon={Lock}
                  loading={saving}
                  onClick={handleSubmit}
                >
                  {saving ? 'Updating…' : 'Update Password'}
                </Button>
                <Button variant="ghost" onClick={() => { setShow(false); setErrors({}); }} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}


// ─── Main Page Component ──────────────────────────────────────────────────────

/**
 * ProfilePage — full profile management page for CareConnect.
 *
 * Sections:
 *  1. Profile card (avatar, name, email, role, phone, member since)
 *  2. Edit Profile form (name, phone, avatar URL + volunteer extras)
 *  3. Emergency Contacts (list, add, delete)
 *  4. Change Password (UI only — toasts feature-coming-soon)
 */
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);

  // Sync emergency contacts from user object when it changes
  const [emergencyContacts, setEmergencyContacts] = useState(
    user?.emergency_contacts || []
  );

  useEffect(() => {
    setEmergencyContacts(user?.emergency_contacts || []);
  }, [user?.emergency_contacts]);

  /** Called when EditProfileForm successfully saves. */
  const handleProfileSaved = (updated) => {
    updateUser(updated);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">My Profile</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1 text-sm">
          Manage your personal details, contacts, and account settings.
        </p>
      </div>

      {/* ── Section 1: Profile Card or Edit Form ── */}
      <AnimatePresence mode="wait">
        {editing ? (
          <motion.div
            key="edit-form"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
          >
            <EditProfileForm
              user={user}
              onSaved={handleProfileSaved}
              onCancel={() => setEditing(false)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="profile-card"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -8 }}
          >
            <ProfileCard user={user} onEditClick={() => setEditing(true)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Volunteer-only: Skills & Availability summary (read-only) ── */}
      {user?.role === 'volunteer' && !editing && (user?.bio || user?.skills?.length > 0) && (
        <motion.div
          custom={0.05}
          variants={sectionVariants}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <CardHeader className="!mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <CardTitle>Volunteer Profile</CardTitle>
              </div>
            </CardHeader>

            {user?.bio && (
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-4">
                {user.bio}
              </p>
            )}

            {user?.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-700/40"
                  >
                    <Tag className="w-3 h-3" />
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ── Section 2: Emergency Contacts ── */}
      <motion.div
        custom={0.1}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <EmergencyContactsSection initialContacts={emergencyContacts} />
      </motion.div>

      {/* ── Section 3: Change Password ── */}
      <motion.div
        custom={0.15}
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <ChangePasswordSection />
      </motion.div>
    </motion.div>
  );
}
