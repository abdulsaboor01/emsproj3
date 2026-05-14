'use client'
import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Camera, Save, Loader2, Eye, EyeOff, User, Mail, Phone, Lock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_CONFIG: Record<string, { gradient: string; light: string; text: string; border: string; label: string }> = {
  admin:    { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', text: '#6366f1', border: '#c7d2fe', label: 'Admin' },
  hr:       { gradient: 'linear-gradient(135deg,#10b981,#059669)', light: '#ecfdf5', text: '#10b981', border: '#a7f3d0', label: 'HR' },
  employee: { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fffbeb', text: '#f59e0b', border: '#fde68a', label: 'Employee' },
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const role = (session?.user as any)?.role || 'employee'
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.employee
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatar: '' })
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [loading, setLoading] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState('')

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setProfile({ name: d.name || '', email: d.email || '', phone: d.phone || '', avatar: d.avatar || '' })
        setAvatarPreview(d.avatar || '')
        setLoading(false)
      })
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setAvatarPreview(base64)
      setProfile(p => ({ ...p, avatar: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: profile.name, email: profile.email, phone: profile.phone, avatar: profile.avatar }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      toast.success('Profile updated')
      await update({ name: data.name, email: data.email, phone: data.phone, avatar: data.avatar })
    } else {
      toast.error(data.error || 'Failed to update')
    }
  }

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return }
    setSavingPass(true)
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
    })
    const data = await res.json()
    setSavingPass(false)
    if (res.ok) {
      toast.success('Password changed')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } else {
      toast.error(data.error || 'Failed')
    }
  }

  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: cfg.gradient }} />
    </div>
  )

  const cardStyle = { background: 'white', border: `1px solid ${cfg.border}`, borderRadius: '20px', padding: '24px' }
  const labelCls = 'text-xs font-bold uppercase tracking-widest mb-2 block'
  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all text-sm'

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="pb-6" style={{ borderBottom: `2px solid ${cfg.border}` }}>
        <h1 className="text-3xl font-black tracking-tighter" style={{ color: '#0f172a' }}>My Profile</h1>
        <p className="text-xs mt-1 uppercase tracking-widest font-semibold" style={{ color: cfg.text }}>
          {cfg.label} — Manage your account
        </p>
      </div>

      {/* Avatar + identity card */}
      <div style={{ ...cardStyle, background: cfg.light }}>
        <div className="flex items-center gap-6">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg"
              style={{ background: cfg.gradient, boxShadow: `0 8px 24px ${cfg.text}30` }}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl font-black text-white">{initials}</span>
                  </div>
              }
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
              style={{ border: `2px solid ${cfg.border}` }}>
              <Camera className="w-3.5 h-3.5" style={{ color: cfg.text }} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <p className="text-xl font-black text-gray-900 tracking-tight">{profile.name || 'Your Name'}</p>
            <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
            {profile.phone && <p className="text-sm text-slate-400 mt-0.5">{profile.phone}</p>}
            <span className="inline-block mt-2 text-xs font-bold px-3 py-1 rounded-xl"
              style={{ background: cfg.gradient, color: 'white', boxShadow: `0 2px 8px ${cfg.text}40` }}>
              {cfg.label}
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">Click the camera icon to upload a new photo (max 2MB)</p>
      </div>

      {/* Personal info form */}
      <form onSubmit={handleSaveProfile} style={cardStyle}>
        <p className="text-xs font-bold uppercase tracking-widest pb-4 mb-5"
          style={{ color: cfg.text, borderBottom: `1px solid ${cfg.border}` }}>
          Personal Information
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls} style={{ color: cfg.text }}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" required className={inputCls} style={{ paddingLeft: '2.5rem' }}
                placeholder="John Doe" value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                onFocus={e => e.target.style.borderColor = cfg.text}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div>
            <label className={labelCls} style={{ color: cfg.text }}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="email" required className={inputCls} style={{ paddingLeft: '2.5rem' }}
                placeholder="you@company.com" value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                onFocus={e => e.target.style.borderColor = cfg.text}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls} style={{ color: cfg.text }}>Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="tel" className={inputCls} style={{ paddingLeft: '2.5rem' }}
                placeholder="+1-555-0000" value={profile.phone}
                onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                onFocus={e => e.target.style.borderColor = cfg.text}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: cfg.gradient, boxShadow: `0 4px 14px ${cfg.text}40` }}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Password change form */}
      <form onSubmit={handleSavePassword} style={cardStyle}>
        <p className="text-xs font-bold uppercase tracking-widest pb-4 mb-5"
          style={{ color: cfg.text, borderBottom: `1px solid ${cfg.border}` }}>
          Change Password
        </p>

        <div className="space-y-4">
          {([
            { label: 'Current Password', key: 'current',  showKey: 'current' },
            { label: 'New Password',     key: 'newPass',  showKey: 'newPass' },
            { label: 'Confirm New Password', key: 'confirm', showKey: 'confirm' },
          ] as const).map(({ label, key, showKey }) => (
            <div key={key}>
              <label className={labelCls} style={{ color: cfg.text }}>{label}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass[showKey] ? 'text' : 'password'}
                  className={inputCls} style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                  value={passwords[key]}
                  onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = cfg.text}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button"
                  onClick={() => setShowPass(p => ({ ...p, [showKey]: !p[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPass[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button type="submit"
            disabled={savingPass || !passwords.current || !passwords.newPass || !passwords.confirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50"
            style={{ background: cfg.gradient, boxShadow: `0 4px 14px ${cfg.text}40` }}>
            {savingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            {savingPass ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
