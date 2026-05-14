'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Users, UserCheck, Clock, Building2, DollarSign, TrendingUp, Phone } from 'lucide-react'
import StatsCard from '@/components/dashboard/StatsCard'
import DepartmentChart from '@/components/dashboard/DepartmentChart'
import HiringTrend from '@/components/dashboard/HiringTrend'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
})

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard({ stats }: { stats: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Full organization overview & controls</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Employees" value={stats?.totalEmployees || 0} icon={Users} color="blue" trend="+12%" index={0} />
        <StatsCard title="Active" value={stats?.activeEmployees || 0} icon={UserCheck} color="green" trend="+5%" index={1} />
        <StatsCard title="On Leave" value={stats?.onLeave || 0} icon={Clock} color="amber" index={2} />
        <StatsCard title="Departments" value={stats?.totalDepts || 0} icon={Building2} color="purple" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeUp(0.35)}><DepartmentChart data={stats?.deptStats || []} /></motion.div>
        <motion.div {...fadeUp(0.45)}><HiringTrend data={stats?.monthlyHires || []} /></motion.div>
      </div>

      <motion.div
        {...fadeUp(0.55)}
        whileHover={{ y: -4, boxShadow: '0 24px 60px rgba(99,102,241,0.4)' }}
        className="rounded-3xl p-6 text-white cursor-default"
        style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 8px 30px rgba(99,102,241,0.25)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ rotate: 15, scale: 1.1 }} className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <p className="text-sm font-semibold text-white/80">Total Payroll</p>
              <p className="text-xs text-white/50">Paid this period</p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-white/20 border border-white/30 px-2.5 py-1 rounded-xl flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8.2%
          </span>
        </div>
        <p className="text-5xl font-black mt-4 tracking-tight">${((stats?.totalPayroll || 0) / 1000).toFixed(1)}K</p>
      </motion.div>
    </motion.div>
  )
}

// ─── HR Dashboard ─────────────────────────────────────────────────────────────
function HRDashboard({ stats }: { stats: any }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">HR Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">People & workforce overview — read only</p>
      </motion.div>

      <motion.div {...fadeUp(0.05)} className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
        <p className="text-sm text-emerald-700 font-medium">You have <span className="font-bold">read-only</span> access. Contact an Admin to make changes.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Employees" value={stats?.totalEmployees || 0} icon={Users} color="blue" index={0} />
        <StatsCard title="Active" value={stats?.activeEmployees || 0} icon={UserCheck} color="green" index={1} />
        <StatsCard title="On Leave" value={stats?.onLeave || 0} icon={Clock} color="amber" index={2} />
        <StatsCard title="Departments" value={stats?.totalDepts || 0} icon={Building2} color="purple" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div {...fadeUp(0.35)}><DepartmentChart data={stats?.deptStats || []} /></motion.div>
        <motion.div {...fadeUp(0.45)}><HiringTrend data={stats?.monthlyHires || []} /></motion.div>
      </div>
    </motion.div>
  )
}

// ─── Employee Dashboard ───────────────────────────────────────────────────────
function EmployeeDashboard({ session }: { session: any }) {
  const name = session?.user?.name || 'Employee'
  const email = session?.user?.email || ''
  const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <motion.div {...fadeUp(0)}>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your personal workspace</p>
      </motion.div>

      <motion.div
        {...fadeUp(0.1)}
        whileHover={{ y: -4, boxShadow: '0 24px 60px rgba(245,158,11,0.35)' }}
        className="rounded-3xl p-6 text-white cursor-default"
        style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 30px rgba(245,158,11,0.25)' }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0"
          >
            <span className="text-2xl font-black text-white">{initials}</span>
          </motion.div>
          <div>
            <p className="text-xl font-black text-white">{name}</p>
            <p className="text-white/70 text-sm">{email}</p>
            <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30">
              Employee
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: DollarSign, color: 'amber', title: 'Salary Records', text: 'View your salary history from the', link: 'My Salary', linkColor: 'text-amber-600', suffix: ' section in the sidebar.' },
          { icon: Phone, color: 'blue', title: 'Need Help?', text: 'Contact your ', link: 'HR or Admin', linkColor: 'text-indigo-600', suffix: ' for any profile or salary queries.' },
        ].map(({ icon: Icon, color, title, text, link, linkColor, suffix }, i) => (
          <motion.div
            key={title}
            {...fadeUp(0.2 + i * 0.1)}
            whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(99,102,241,0.1)' }}
            className="card cursor-default"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl bg-${color}-50 border border-${color}-100 flex items-center justify-center`}>
                <Icon className={`w-4 h-4 text-${color}-600`} />
              </div>
              <p className="text-sm font-bold text-gray-900">{title}</p>
            </div>
            <p className="text-sm text-slate-500">{text}<span className={`font-semibold ${linkColor}`}>{link}</span>{suffix}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (role === 'engineer') { setLoading(false); return }
    fetch('/api/stats').then(r => r.json()).then(d => { setStats(d); setLoading(false) })
  }, [role])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-2 border-indigo-100 border-t-indigo-500"
      />
      <p className="text-xs text-slate-400 font-medium">Loading dashboard...</p>
    </div>
  )

  if (role === 'engineer') return <EmployeeDashboard session={session} />
  if (role === 'hr') return <HRDashboard stats={stats} />
  return <AdminDashboard stats={stats} />
}
