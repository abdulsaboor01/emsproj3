'use client'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4']

export default function DepartmentChart({ data, bare }: { data: any[]; bare?: boolean }) {
  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={52} paddingAngle={4}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
        <Legend formatter={(v) => <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600 }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
  if (bare) return <div className="h-56">{chart}</div>
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 h-80" style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.06)' }}>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">By Department</p>
      <div className="h-[85%]">{chart}</div>
    </div>
  )
}
