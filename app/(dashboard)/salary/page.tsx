'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Trash2, CheckCircle, Clock, Pencil, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Pagination from '@/components/ui/Pagination'
import clsx from 'clsx'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function SalaryPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || 'employee'
  const isAdmin = role === 'admin'
  const isHR = role === 'hr'
  const isEmployee = role === 'engineer'

  const [salaries, setSalaries] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchSalaries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/salary?page=${page}&limit=10`)
      if (!res.ok) { toast.error('Failed to load salaries'); setLoading(false); return }
      const data = await res.json()
      setSalaries(data.salaries); setTotal(data.total); setPages(data.pages)
    } catch (err) {
      toast.error('Error loading salaries')
    }
    setLoading(false)
  }, [page])

  useEffect(() => { fetchSalaries() }, [fetchSalaries])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return
    if ((await fetch(`/api/salary/${id}`, { method: 'DELETE' })).ok) { toast.success('Deleted'); fetchSalaries() }
  }

  const handleMarkPaid = async (id: string) => {
    const res = await fetch(`/api/salary/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paid', paidAt: new Date() }),
    })
    if (res.ok) { toast.success('Marked as paid!'); fetchSalaries() }
  }

  const [editRecord, setEditRecord] = useState<any>(null)
  const [editForm, setEditForm] = useState({ bonus: 0, deductions: 0 })

  const openEdit = (s: any) => { setEditRecord(s); setEditForm({ bonus: s.bonus, deductions: s.deductions }) }

  const handleEditSave = async () => {
    const res = await fetch(`/api/salary/${editRecord._id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bonus: Number(editForm.bonus), deductions: Number(editForm.deductions) }),
    })
    if (res.ok) { toast.success('Salary updated!'); setEditRecord(null); fetchSalaries() }
    else toast.error('Failed to update')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          {isEmployee ? 'My Salary' : 'Salary Records'}
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {isEmployee ? 'Your salary history' : isHR ? `Read-only · ${total} records` : `${total} records`}
        </p>
      </motion.div>

      <AnimatePresence>
        {isHR && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">Read-only access. Contact an Admin to modify salary records.</p>
          </motion.div>
        )}
        {isEmployee && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl border border-amber-200 bg-amber-50 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <p className="text-sm text-amber-700 font-medium">Showing your salary records. Contact HR or Admin for queries.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Loading records...</p>
            </motion.div>
          ) : salaries.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <DollarSign className="w-12 h-12 opacity-30" />
              </motion.div>
              <p className="text-sm font-medium">No salary records found</p>
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Employee', 'Period', 'Base', 'Bonus', 'Deductions', 'Net', 'Status', ...(isAdmin ? [''] : [])].map((h, i) => (
                      <th key={i} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salaries.map((s, i) => (
                    <motion.tr key={s._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 group"
                      whileHover={{ backgroundColor: 'rgba(238,242,255,0.5)' }}
                    >
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900 text-sm">{s.employeeId?.firstName} {s.employeeId?.lastName}</p>
                        <p className="text-xs text-slate-400">{s.employeeId?.employeeId}</p>
                      </td>
                      <td className="py-3.5 px-4 text-sm text-slate-600 font-medium">{MONTHS[s.month - 1]} {s.year}</td>
                      <td className="py-3.5 px-4 text-sm text-slate-700">${s.baseSalary.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-sm text-emerald-600 font-semibold">+${s.bonus.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-sm text-red-500 font-semibold">-${s.deductions.toLocaleString()}</td>
                      <td className="py-3.5 px-4 text-sm font-black text-gray-900">${s.netSalary.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                          s.status === 'paid'    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          s.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                   'bg-slate-100 text-slate-500 border-slate-200')}>
                          {s.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {s.status}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.button whileHover={{ scale: 1.15, backgroundColor: '#eef2ff' }} whileTap={{ scale: 0.9 }}
                              onClick={() => openEdit(s)} className="p-2 rounded-xl transition-colors" title="Edit Bonus/Deductions">
                              <Pencil className="w-4 h-4 text-indigo-500" />
                            </motion.button>
                            {s.status === 'pending' && (
                              <motion.button whileHover={{ scale: 1.15, backgroundColor: '#ecfdf5' }} whileTap={{ scale: 0.9 }}
                                onClick={() => handleMarkPaid(s._id)} className="p-2 rounded-xl transition-colors" title="Mark Paid">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              </motion.button>
                            )}
                            <motion.button whileHover={{ scale: 1.15, backgroundColor: '#fef2f2' }} whileTap={{ scale: 0.9 }}
                              onClick={() => handleDelete(s._id)} className="p-2 rounded-xl transition-colors">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </motion.button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
        {pages > 1 && <Pagination page={page} pages={pages} onChange={setPage} />}
      </motion.div>

      {/* Edit Bonus/Deductions Modal */}
      <AnimatePresence>
        {editRecord && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setEditRecord(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-gray-900">Edit Salary</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{editRecord.employeeId?.firstName} {editRecord.employeeId?.lastName}</p>
                </div>
                <button onClick={() => setEditRecord(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Base Salary</label>
                  <p className="input bg-slate-50 text-slate-400 cursor-not-allowed">${editRecord.baseSalary.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Bonus ($)</label>
                  <input type="number" min="0" className="input" value={editForm.bonus}
                    onChange={e => setEditForm(p => ({ ...p, bonus: Number(e.target.value) }))} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Deductions ($)</label>
                  <input type="number" min="0" className="input" value={editForm.deductions}
                    onChange={e => setEditForm(p => ({ ...p, deductions: Number(e.target.value) }))} />
                </div>
                <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <p className="text-xs text-indigo-500 font-semibold">Net Salary</p>
                  <p className="text-xl font-black text-indigo-700">
                    ${(editRecord.baseSalary + Number(editForm.bonus) - Number(editForm.deductions)).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setEditRecord(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                <button onClick={handleEditSave} className="btn-primary flex-1 py-2.5 text-sm">Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
