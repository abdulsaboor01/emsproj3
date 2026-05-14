'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Save, ArrowLeft, Eye, EyeOff, CheckCircle, Mail, Lock, Copy } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

interface Props { employee?: any; isEdit?: boolean }

export default function EmployeeForm({ employee, isEdit }: Props) {
  const router = useRouter()
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [credentials, setCredentials] = useState<{ email: string; password: string; role: string } | null>(null)
  const [form, setForm] = useState({
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '', email: employee?.email || '',
    phone: employee?.phone || '', position: employee?.position || '',
    departmentId: employee?.departmentId?._id || employee?.departmentId || '',
    status: employee?.status || 'active',
    joinDate: employee?.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : '',
    salary: employee?.salary || '', address: employee?.address || '',
    role: employee?.role || 'engineer',
    password: '',
  })

  useEffect(() => {
    fetch('/api/departments').then(r => r.json()).then(data => { if (Array.isArray(data)) setDepartments(data) }).catch(() => {})
  }, [])

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const res = await fetch(isEdit ? `/api/employees/${employee._id}` : '/api/employees', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      const d = await res.json()
      if (!isEdit) {
        setCredentials({ email: d.loginEmail, password: d.loginPassword, role: d.role })
      } else {
        toast.success('Employee updated!')
        router.push('/employees')
      }
    } else {
      const d = await res.json()
      toast.error(d.error || d.message || 'Failed')
    }
  }

  const fields = [
    { label: 'First Name', key: 'firstName', type: 'text' },
    { label: 'Last Name', key: 'lastName', type: 'text' },
    { label: 'Email', key: 'email', type: 'email' },
    { label: 'Phone', key: 'phone', type: 'text' },
    { label: 'Position', key: 'position', type: 'text' },
    { label: 'Join Date', key: 'joinDate', type: 'date' },
    { label: 'Salary ($)', key: 'salary', type: 'number' },
  ]

  // test

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employees">
          <motion.button whileHover={{ x: -3, scale: 1.02 }} whileTap={{ scale: 0.96 }} className="btn-secondary flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{isEdit ? 'Edit Employee' : 'Add Employee'}</h1>
          <p className="text-slate-400 text-xs mt-0.5">{isEdit ? 'Update employee record' : 'Create a new employee record'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 pb-4 border-b border-slate-100">Personal Information</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.map((f, i) => (
              <motion.div key={f.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04 }}>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">{f.label}</label>
                <input type={f.type} required className="input"
                  value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} />
              </motion.div>
            ))}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Department</label>
              <select className="input" value={form.departmentId} onChange={e => set('departmentId', e.target.value)} required>
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.49 }}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
              <select className="input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.53 }}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">System Role</label>
              <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="engineer">Engineer — View own salary</option>
                <option value="hr">HR — View all records</option>
                <option value="admin">Admin — Full access</option>
              </select>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.53 }} className="md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Address</label>
              <input type="text" className="input" value={form.address} onChange={e => set('address', e.target.value)} />
            </motion.div>
            {!isEdit && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.57 }} className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Login Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required minLength={6} className="input pr-11"
                    value={form.password} onChange={e => set('password', e.target.value)} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">Employee will use this to log in. Min. 6 characters.</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex justify-end mt-5">
          <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="btn-primary flex items-center gap-2 px-8 py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : isEdit ? 'Update Employee' : 'Create Employee'}
          </motion.button>
        </motion.div>
      </form>

      {/* Login Credentials Modal */}
      <AnimatePresence>
        {credentials && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              style={{ boxShadow: '0 25px 60px rgba(99,102,241,0.2)' }}>

              {/* Header */}
              <div className="p-6 text-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-xl font-black text-white">Employee Created!</h2>
                <p className="text-white/70 text-sm mt-1">Share these login credentials with the employee</p>
              </div>

              {/* Credentials */}
              <div className="p-6 space-y-4">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Login Credentials</p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">Email</p>
                          <p className="text-sm font-bold text-gray-900 truncate">{credentials.email}</p>
                        </div>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(credentials.email); toast.success('Copied!') }}
                        className="p-2 rounded-xl hover:bg-slate-200 transition-colors flex-shrink-0">
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Lock className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-400">Password</p>
                          <p className="text-sm font-bold text-gray-900">{credentials.password}</p>
                        </div>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(credentials.password); toast.success('Copied!') }}
                        className="p-2 rounded-xl hover:bg-slate-200 transition-colors flex-shrink-0">
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Role</p>
                        <p className="text-sm font-bold text-gray-900 capitalize">{credentials.role}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 text-center">The employee can change their password after logging in from the profile panel.</p>

                <button onClick={() => router.push('/employees')}
                  className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px #6366f140' }}>
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
