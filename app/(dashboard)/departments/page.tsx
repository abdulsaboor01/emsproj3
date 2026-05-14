'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Building2, Edit, Trash2, DollarSign, Users, X, Save, Loader2, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = [
  { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', text: '#6366f1', border: '#c7d2fe' },
  { gradient: 'linear-gradient(135deg,#10b981,#059669)', light: '#ecfdf5', text: '#10b981', border: '#a7f3d0' },
  { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fffbeb', text: '#f59e0b', border: '#fde68a' },
  { gradient: 'linear-gradient(135deg,#ec4899,#db2777)', light: '#fdf2f8', text: '#ec4899', border: '#fbcfe8' },
  { gradient: 'linear-gradient(135deg,#06b6d4,#0891b2)', light: '#ecfeff', text: '#06b6d4', border: '#a5f3fc' },
]

export default function DepartmentsPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const isAdmin = role === 'admin'
  const isHR = role === 'hr'

  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; dept?: any }>({ open: false })
  const [form, setForm] = useState({ name: '', description: '', budget: '' })
  const [saving, setSaving] = useState(false)

  const fetchDepts = async () => {
    setDepartments(await fetch('/api/departments').then(r => r.json()))
    setLoading(false)
  }
  useEffect(() => { fetchDepts() }, [])

  const openModal = (dept?: any) => {
    setForm(dept ? { name: dept.name, description: dept.description, budget: dept.budget } : { name: '', description: '', budget: '' })
    setModal({ open: true, dept })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const res = await fetch(modal.dept ? `/api/departments/${modal.dept._id}` : '/api/departments', {
      method: modal.dept ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { toast.success(modal.dept ? 'Updated!' : 'Created!'); setModal({ open: false }); fetchDepts() }
    else toast.error('Failed')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this department?')) return
    if ((await fetch(`/api/departments/${id}`, { method: 'DELETE' })).ok) { toast.success('Deleted'); fetchDepts() }
    else toast.error('Failed')
  }

  if (role === 'engineer') return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-96 gap-4">
      <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 3 }}
        className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
        <Lock className="w-7 h-7 text-slate-400" />
      </motion.div>
      <p className="text-lg font-black text-gray-900">Access Restricted</p>
      <p className="text-sm text-slate-500">You don't have permission to view this page.</p>
    </motion.div>
  )

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Departments</h1>
          <p className="text-slate-400 text-sm mt-1">{isHR ? 'Read-only · ' : ''}{departments.length} departments</p>
        </div>
        {isAdmin && (
          <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}
            onClick={() => openModal()} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Add Department
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {isHR && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">Read-only access. Contact an Admin to modify departments.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept, i) => {
            const c = COLORS[i % COLORS.length]
            return (
              <motion.div
                key={dept._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -6, boxShadow: `0 20px 50px ${c.text}25` }}
                className="bg-white rounded-3xl p-6 border border-slate-100 group cursor-default"
                style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.06)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div whileHover={{ rotate: 10, scale: 1.1 }} transition={{ type: 'spring', stiffness: 400 }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: c.gradient, boxShadow: `0 6px 20px ${c.text}40` }}>
                    <Building2 className="w-5 h-5 text-white" />
                  </motion.div>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <motion.button whileHover={{ scale: 1.15, backgroundColor: '#eef2ff' }} whileTap={{ scale: 0.9 }}
                        onClick={() => openModal(dept)} className="p-2 rounded-xl transition-colors">
                        <Edit className="w-3.5 h-3.5 text-indigo-500" />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.15, backgroundColor: '#fef2f2' }} whileTap={{ scale: 0.9 }}
                        onClick={() => handleDelete(dept._id)} className="p-2 rounded-xl transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </motion.button>
                    </div>
                  )}
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">{dept.name}</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">{dept.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl" style={{ background: c.light, color: c.text }}>
                    <DollarSign className="w-3.5 h-3.5" />${(dept.budget / 1000).toFixed(0)}K
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Users className="w-3.5 h-3.5" />{dept.employeeCount || 0} employees
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <AnimatePresence>
        {modal.open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={e => e.target === e.currentTarget && setModal({ open: false })}>
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden"
              style={{ boxShadow: '0 25px 60px rgba(99,102,241,0.2)' }}
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between"
                style={{ background: 'linear-gradient(135deg,#fafbff,#f5f3ff)' }}>
                <h2 className="text-base font-black text-gray-900">{modal.dept ? 'Edit Department' : 'New Department'}</h2>
                <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => setModal({ open: false })} className="p-2 hover:bg-white rounded-xl transition-colors">
                  <X className="w-4 h-4 text-slate-500" />
                </motion.button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                {[['Name', 'name', 'Engineering'], ['Description', 'description', 'Department description']].map(([label, key, ph], i) => (
                  <motion.div key={key} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{label}</label>
                    <input type="text" required={key === 'name'} className="input" placeholder={ph}
                      value={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                  </motion.div>
                ))}
                <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Budget ($)</label>
                  <input type="number" className="input" placeholder="100000" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
                </motion.div>
                <div className="flex gap-3 pt-2">
                  <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setModal({ open: false })} className="btn-secondary flex-1">Cancel</motion.button>
                  <motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="btn-primary flex-1 flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : 'Save'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
