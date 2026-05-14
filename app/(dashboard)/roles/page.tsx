'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, ShieldCheck, Edit, Trash2, X, Save, Loader2, Shield, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = ['admin', 'hr', 'engineer'] as const
type Role = typeof ROLES[number]

const ROLE_CONFIG: Record<Role, { label: string; gradient: string; light: string; text: string; border: string; icon: any; perms: string[] }> = {
  admin: {
    label: 'Admin', icon: ShieldCheck,
    gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', text: '#6366f1', border: '#c7d2fe',
    perms: ['View Dashboard', 'Manage Employees', 'Manage Departments', 'Manage Salary', 'Manage Roles & Users'],
  },
  hr: {
    label: 'HR', icon: Shield,
    gradient: 'linear-gradient(135deg,#10b981,#059669)', light: '#ecfdf5', text: '#10b981', border: '#a7f3d0',
    perms: ['View Dashboard', 'View Employees', 'View Departments', 'View Salary'],
  },
  engineer: {
    label: 'Engineer', icon: User,
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fffbeb', text: '#f59e0b', border: '#fde68a',
    perms: ['View Dashboard', 'View Own Salary'],
  },
}

export default function RolesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; user?: any }>({ open: false })
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'hr' as Role })
  const [showPass, setShowPass] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.role !== 'admin') router.push('/dashboard')
  }, [session, status, router])

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admins')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', role: 'hr' })
    setShowPass(false)
    setModal({ open: true })
  }

  const openEdit = (user: any) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role })
    setShowPass(false)
    setModal({ open: true, user })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const isEdit = !!modal.user
    const body = isEdit ? { name: form.name, role: form.role } : form
    const res = await fetch(isEdit ? `/api/admins/${modal.user._id}` : '/api/admins', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (res.ok) {
      toast.success(isEdit ? 'User updated' : 'User created')
      setModal({ open: false })
      fetchUsers()
    } else {
      const d = await res.json()
      toast.error(d.error || 'Failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this user?')) return
    const res = await fetch(`/api/admins/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Deleted'); fetchUsers() }
    else { const d = await res.json(); toast.error(d.error || 'Failed') }
  }

  if (status === 'loading' || loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 rounded-2xl animate-pulse" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
    </div>
  )

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between pb-6" style={{ borderBottom: '2px solid #c7d2fe' }}>
        <div>
          <h1 className="text-3xl font-black tracking-tighter" style={{ color: '#0f172a' }}>Role Management</h1>
          <p className="text-xs mt-1 uppercase tracking-widest font-semibold" style={{ color: '#6366f1' }}>
            {users.length} total users
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px #6366f140' }}>
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Role permission cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map(role => {
          const cfg = ROLE_CONFIG[role]
          const Icon = cfg.icon
          const count = users.filter(u => u.role === role).length
          return (
            <div key={role} className="rounded-2xl p-6 border"
              style={{ background: cfg.light, borderColor: cfg.border }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: cfg.gradient, boxShadow: `0 4px 12px ${cfg.text}30` }}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-black text-sm tracking-tight" style={{ color: '#0f172a' }}>{cfg.label}</p>
                  <p className="text-xs font-medium" style={{ color: cfg.text }}>{count} user{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {cfg.perms.map(p => (
                  <li key={p} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.text }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden" style={{ background: 'white' }}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">All Users</p>
          <p className="text-xs font-semibold text-slate-400">{users.length} records</p>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-300">
            <User className="w-8 h-8 mb-2" />
            <p className="text-xs uppercase tracking-widest">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['User', 'Role', 'Permissions', 'Joined', ''].map((h, i) => (
                    <th key={i} className={`py-3 px-5 text-xs font-bold text-slate-400 uppercase tracking-widest ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const cfg = ROLE_CONFIG[user.role as Role] || ROLE_CONFIG.engineer
                  const Icon = cfg.icon
                  const isSelf = user._id === (session?.user as any)?.id
                  const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  return (
                    <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                            style={{ background: cfg.gradient }}>
                            <span className="text-white text-xs font-black">{initials}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {user.name}
                              {isSelf && <span className="ml-1.5 text-xs font-medium text-slate-400">(you)</span>}
                            </p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border"
                          style={{ background: cfg.light, color: cfg.text, borderColor: cfg.border }}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <p className="text-xs font-medium text-slate-400">{cfg.perms.length} permissions</p>
                      </td>
                      <td className="py-4 px-5 text-xs text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(user)}
                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                            <Edit className="w-3.5 h-3.5 text-slate-400" />
                          </button>
                          {!isSelf && (
                            <button onClick={() => handleDelete(user._id)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-50 transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setModal({ open: false })}>
            <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'white' }}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-black text-gray-900">{modal.user ? 'Edit User' : 'New User'}</p>
                </div>
                <button onClick={() => setModal({ open: false })}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6366f1' }}>Full Name</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all"
                    placeholder="John Doe" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>

                {/* Email + Password — only on create */}
                {!modal.user && (
                  <>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6366f1' }}>Email</label>
                      <input type="email" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all"
                        placeholder="user@company.com" value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6366f1' }}>Password</label>
                      <div className="relative">
                        <input type={showPass ? 'text' : 'password'} required minLength={6}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-900 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-all"
                          placeholder="Min. 6 characters" value={form.password}
                          onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                        <button type="button" onClick={() => setShowPass(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Role */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block" style={{ color: '#6366f1' }}>Role</label>
                  <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-indigo-400 transition-all"
                    value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as Role }))}>
                    <option value="engineer">Engineer — View own salary only</option>
                    <option value="hr">HR — View all records</option>
                    <option value="admin">Admin — Full access + Role management</option>
                  </select>
                </div>

                {/* Permission preview */}
                <div className="rounded-xl p-4 border" style={{ background: ROLE_CONFIG[form.role].light, borderColor: ROLE_CONFIG[form.role].border }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ROLE_CONFIG[form.role].text }}>Permissions</p>
                  <ul className="space-y-1">
                    {ROLE_CONFIG[form.role].perms.map(p => (
                      <li key={p} className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ROLE_CONFIG[form.role].text }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModal({ open: false })}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px #6366f140' }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : modal.user ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
