'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Users, Filter, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, CheckCircle, Clock, Building2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import EmployeeTable from '@/components/dashboard/EmployeeTable'
import Pagination from '@/components/ui/Pagination'
import clsx from 'clsx'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function EmployeeProfile() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch('/api/employees/me').then(r => r.json()).then(d => {
      if (d.error === 'not_found') setNotFound(true)
      else setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
      <p className="text-xs text-slate-400 font-medium">Loading your profile...</p>
    </div>
  )

  if (notFound) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-96 gap-3 text-slate-400">
      <Users className="w-12 h-12 opacity-30" />
      <p className="font-bold text-gray-900">No employee record found</p>
      <p className="text-sm">Your account is not linked to an employee record. Contact Admin.</p>
    </motion.div>
  )

  const { employee: e, salaries } = data
  const initials = `${e.firstName[0]}${e.lastName[0]}`.toUpperCase()
  const statusColors: any = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-100 text-slate-500 border-slate-200',
    'on-leave': 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Your employee details</p>
      </motion.div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 30px rgba(99,102,241,0.25)' }}>
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-3xl font-black text-white">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-black">{e.firstName} {e.lastName}</p>
            <p className="text-white/70 text-sm">{e.position}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 border border-white/30">{e.employeeId}</span>
              <span className={clsx('px-2.5 py-0.5 rounded-full text-xs font-semibold border', statusColors[e.status])}>{e.status}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 pb-4 border-b border-slate-100">Personal Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { icon: Mail, label: 'Email', value: e.email },
            { icon: Phone, label: 'Phone', value: e.phone || '—' },
            { icon: Building2, label: 'Department', value: e.departmentId?.name || '—' },
            { icon: Briefcase, label: 'Position', value: e.position },
            { icon: Calendar, label: 'Join Date', value: new Date(e.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
            { icon: MapPin, label: 'Address', value: e.address || '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Salary History */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 pb-4 border-b border-slate-100">Recent Salary Records</p>
        {salaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 text-slate-400 gap-2">
            <DollarSign className="w-8 h-8 opacity-30" />
            <p className="text-sm">No salary records yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Period', 'Base', 'Bonus', 'Deductions', 'Net', 'Status'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salaries.map((s: any, i: number) => (
                  <motion.tr key={s._id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-slate-50">
                    <td className="py-3 px-3 text-sm font-medium text-slate-600">{MONTHS[s.month - 1]} {s.year}</td>
                    <td className="py-3 px-3 text-sm text-slate-700">${s.baseSalary.toLocaleString()}</td>
                    <td className="py-3 px-3 text-sm text-emerald-600 font-semibold">+${s.bonus.toLocaleString()}</td>
                    <td className="py-3 px-3 text-sm text-red-500 font-semibold">-${s.deductions.toLocaleString()}</td>
                    <td className="py-3 px-3 text-sm font-black text-gray-900">${s.netSalary.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={clsx('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
                        s.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        s.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-500 border-slate-200')}>
                        {s.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {s.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const isAdmin = role === 'admin'
  const isHR = role === 'hr'

  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [departments, setDepartments] = useState<any[]>([])
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '10' })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    if (department) params.set('department', department)
    const res = await fetch(`/api/employees?${params}`)
    const data = await res.json()
    setEmployees(data.employees); setTotal(data.total); setPages(data.pages); setLoading(false)
  }, [page, search, status, department])

  useEffect(() => { fetchEmployees() }, [fetchEmployees])
  useEffect(() => { fetch('/api/departments').then(r => r.json()).then(setDepartments) }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this employee?')) return
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Employee deleted'); fetchEmployees() } else toast.error('Failed')
  }

  if (role === 'engineer') return <EmployeeProfile />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Employees</h1>
          <p className="text-slate-400 text-sm mt-1">{isHR ? 'Read-only · ' : ''}{total} total records</p>
        </div>
        {isAdmin && (
          <Link href="/employees/new">
            <motion.button whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Employee
            </motion.button>
          </Link>
        )}
      </motion.div>

      <AnimatePresence>
        {isHR && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-sm text-emerald-700 font-medium">Read-only access. Contact an Admin to add or modify employees.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, email, ID..." className="input pl-11"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <select className="input pl-9 w-36" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on-leave">On Leave</option>
              </select>
            </div>
            <select className="input w-44" value={department} onChange={e => { setDepartment(e.target.value); setPage(1) }}>
              <option value="">All Departments</option>
              {departments.map((d: any) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Loading employees...</p>
            </motion.div>
          ) : employees.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                <Users className="w-12 h-12 opacity-30" />
              </motion.div>
              <p className="text-sm font-medium">No employees found</p>
            </motion.div>
          ) : (
            <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EmployeeTable employees={employees} onDelete={handleDelete} canWrite={isAdmin} />
            </motion.div>
          )}
        </AnimatePresence>

        {pages > 1 && <Pagination page={page} pages={pages} onChange={setPage} />}
      </motion.div>
    </motion.div>
  )
}
