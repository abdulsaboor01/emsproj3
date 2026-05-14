'use client'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function HiringTrend({ data, bare }: { data: any[]; bare?: boolean }) {
  const formatted = data.map(d => ({ name: MONTHS[d._id.month - 1], hires: d.count }))
  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', color: '#1e293b', fontSize: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }} />
        <Area type="monotone" dataKey="hires" stroke="#6366f1" strokeWidth={2.5} fill="url(#grad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
  if (bare) return <div className="h-56">{chart}</div>
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 h-80" style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.06)' }}>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Hiring Trend</p>
      <div className="h-[85%]">{chart}</div>
    </div>
  )
}
