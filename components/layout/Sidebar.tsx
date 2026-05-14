'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, Building2, DollarSign, MessageSquare,
  X, Camera, Save, Loader2, Eye, EyeOff, User, Mail, Phone,
  Lock, CheckCircle, LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'

const NAV: Record<string, { href: string; label: string; icon: any }[]> = {
  admin: [
    { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/employees',   label: 'Employees',   icon: Users },
    { href: '/departments', label: 'Departments', icon: Building2 },
    { href: '/salary',      label: 'Salary',      icon: DollarSign },
    { href: '/messages',    label: 'Messages',    icon: MessageSquare },
  ],
  hr: [
    { href: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { href: '/employees',   label: 'Employees',   icon: Users },
    { href: '/departments', label: 'Departments', icon: Building2 },
    { href: '/salary',      label: 'Salary',      icon: DollarSign },
    { href: '/messages',    label: 'Messages',    icon: MessageSquare },
  ],
  engineer: [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/salary',    label: 'My Salary',  icon: DollarSign },
    { href: '/messages',  label: 'Messages',   icon: MessageSquare },
  ],
}

const ROLE_CONFIG: Record<string, { label: string; gradient: string; light: string; text: string; dot: string; border: string }> = {
  admin:    { label: 'Admin',    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', text: '#6366f1', dot: '#6366f1', border: '#c7d2fe' },
  hr:       { label: 'HR',       gradient: 'linear-gradient(135deg,#10b981,#059669)', light: '#ecfdf5', text: '#10b981', dot: '#10b981', border: '#a7f3d0' },
  engineer: { label: 'Engineer', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fffbeb', text: '#f59e0b', dot: '#f59e0b', border: '#fde68a' },
}

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || 'engineer'
  const links = NAV[role] || NAV.engineer
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.engineer
  const fileRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'info' | 'password'>('info')
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', avatar: '' })
  const [avatarPreview, setAvatarPreview] = useState('')
  // Local display state — updates immediately after save without needing session refresh
  const [displayName, setDisplayName] = useState('')
  const [displayAvatar, setDisplayAvatar] = useState('')
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false })
  const [saving, setSaving] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadProfile = (forPanel = false) => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(d => {
        setDisplayName(d.name || '')
        setDisplayAvatar(d.avatar || '')
        if (forPanel) {
          setProfile({ name: d.name || '', email: d.email || '', phone: d.phone || '', avatar: d.avatar || '' })
          setAvatarPreview(d.avatar || '')
        }
      })
      .catch(() => {})
  }

  useEffect(() => { loadProfile() }, []) // mount — load display name/avatar
  useEffect(() => { if (open) loadProfile(true) }, [open]) // panel open — load form data

  // Poll unread message count every 10 seconds
  useEffect(() => {
    const fetchUnread = () => {
      fetch('/api/messages/unread')
        .then(r => r.json())
        .then(d => setUnreadCount(d.count || 0))
        .catch(() => {})
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Max 2MB'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const b64 = reader.result as string
      setAvatarPreview(b64)
      setProfile(p => ({ ...p, avatar: b64 }))
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
      // Update local display state immediately — no session update needed
      setDisplayName(data.name || '')
      setDisplayAvatar(data.avatar || '')
      setAvatarPreview(data.avatar || '')
      setProfile(p => ({ ...p, name: data.name, email: data.email, phone: data.phone, avatar: data.avatar || '' }))
    } else {
      toast.error(data.error || 'Failed')
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
    if (res.ok) { toast.success('Password changed'); setPasswords({ current: '', newPass: '', confirm: '' }) }
    else toast.error(data.error || 'Failed')
  }

  const initials = (displayName || session?.user?.name || 'U')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const inputCls = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-gray-900 placeholder-slate-400 focus:outline-none text-sm transition-all'

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 border-r border-slate-100/80"
        style={{ background: 'linear-gradient(180deg,#ffffff 0%,#fafbff 100%)', boxShadow: '4px 0 24px rgba(99,102,241,0.06)' }}>

        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: cfg.gradient, boxShadow: `0 4px 14px ${cfg.dot}40` }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-900 tracking-tight">EMS</h1>
              <p className="text-xs font-semibold" style={{ color: cfg.text }}>{cfg.label}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest px-3 mb-3">Navigation</p>
          {links.map(link => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all duration-200 text-sm font-semibold relative group"
                  style={isActive ? { background: cfg.gradient, color: '#fff', boxShadow: `0 4px 16px ${cfg.dot}35` } : { color: '#94a3b8' }}
                  onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = cfg.light; (e.currentTarget as HTMLElement).style.color = cfg.text } }}
                  onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = '#94a3b8' } }}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {link.label}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
                  {link.href === '/messages' && unreadCount > 0 && !isActive && (
                    <span className="ml-auto text-xs font-black text-white px-1.5 py-0.5 rounded-full" style={{ background: '#6366f1', minWidth: '1.25rem', textAlign: 'center' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom profile card */}
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => setOpen(true)} className="w-full text-left">
            <div className="flex items-center gap-3 p-3 rounded-2xl hover:opacity-90 transition-opacity cursor-pointer" style={{ background: cfg.light }}>
              <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm" style={{ background: cfg.gradient }}>
                {displayAvatar
                  ? <img src={displayAvatar} alt={initials} className="w-full h-full object-cover" />
                  : <span className="text-white text-xs font-black">{initials}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{displayName || session?.user?.name || 'User'}</p>
                <p className="text-xs capitalize font-medium" style={{ color: cfg.text }}>{role}</p>
              </div>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#10b981', boxShadow: '0 0 6px #10b98180' }} />
            </div>
          </button>
        </div>
      </aside>

      {/* Profile panel */}
      {open && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-80 h-full flex flex-col shadow-2xl overflow-y-auto"
            style={{ background: 'white', borderRight: `1px solid ${cfg.border}` }}>

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: cfg.gradient }}>
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">My Profile</p>
                  <p className="text-xs font-medium" style={{ color: cfg.text }}>{cfg.label}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Avatar */}
            <div className="p-5 border-b border-slate-100" style={{ background: cfg.light }}>
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg" style={{ background: cfg.gradient }}>
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-black text-white">{initials}</span>
                        </div>
                    }
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
                    style={{ border: `2px solid ${cfg.border}` }}>
                    <Camera className="w-3 h-3" style={{ color: cfg.text }} />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{profile.name || displayName}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
                  <span className="inline-block mt-1.5 text-xs font-bold px-2 py-0.5 rounded-lg text-white"
                    style={{ background: cfg.gradient }}>{cfg.label}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {(['info', 'password'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all"
                  style={tab === t ? { color: cfg.text, borderBottom: `2px solid ${cfg.text}` } : { color: '#94a3b8' }}>
                  {t === 'info' ? 'Personal Info' : 'Password'}
                </button>
              ))}
            </div>

            {/* Personal Info tab */}
            {tab === 'info' && (
              <form onSubmit={handleSaveProfile} className="p-5 space-y-4 flex-1">
                {[
                  { label: 'Full Name',    key: 'name',  type: 'text',  Icon: User,  placeholder: 'John Doe' },
                  { label: 'Email',        key: 'email', type: 'email', Icon: Mail,  placeholder: 'you@company.com' },
                  { label: 'Phone Number', key: 'phone', type: 'tel',   Icon: Phone, placeholder: '+1-555-0000' },
                ].map(({ label, key, type, Icon, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: cfg.text }}>{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type={type} className={inputCls} style={{ paddingLeft: '2.25rem' }}
                        placeholder={placeholder} value={(profile as any)[key]}
                        onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = cfg.text}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={saving}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white mt-2 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: cfg.gradient, boxShadow: `0 4px 14px ${cfg.text}35` }}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* Password tab */}
            {tab === 'password' && (
              <form onSubmit={handleSavePassword} className="p-5 space-y-4 flex-1">
                {([
                  { label: 'Current Password',    key: 'current', showKey: 'current' },
                  { label: 'New Password',         key: 'newPass', showKey: 'newPass' },
                  { label: 'Confirm New Password', key: 'confirm', showKey: 'confirm' },
                ] as const).map(({ label, key, showKey }) => (
                  <div key={key}>
                    <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: cfg.text }}>{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input type={showPass[showKey] ? 'text' : 'password'} className={inputCls}
                        style={{ paddingLeft: '2.25rem', paddingRight: '2.25rem' }}
                        placeholder="••••••••" value={passwords[key]}
                        onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))}
                        onFocus={e => e.target.style.borderColor = cfg.text}
                        onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                      <button type="button"
                        onClick={() => setShowPass(p => ({ ...p, [showKey]: !p[showKey] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPass[showKey] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
                <button type="submit"
                  disabled={savingPass || !passwords.current || !passwords.newPass || !passwords.confirm}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white mt-2 transition-all active:scale-95 disabled:opacity-50"
                  style={{ background: cfg.gradient, boxShadow: `0 4px 14px ${cfg.text}35` }}>
                  {savingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {savingPass ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            {/* Sign out */}
            <div className="p-5 border-t border-slate-100 mt-auto">
              <button onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-red-500 border border-red-100 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
