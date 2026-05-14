'use client'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp } from 'lucide-react'

interface Props {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'amber' | 'purple'
  trend?: string
  index?: number
}

const CONFIG = {
  blue:   { gradient: 'linear-gradient(135deg,#6366f1,#818cf8)', shadow: 'rgba(99,102,241,0.35)',  glow: 'rgba(99,102,241,0.08)' },
  green:  { gradient: 'linear-gradient(135deg,#10b981,#34d399)', shadow: 'rgba(16,185,129,0.35)',  glow: 'rgba(16,185,129,0.08)' },
  amber:  { gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)', shadow: 'rgba(245,158,11,0.35)',  glow: 'rgba(245,158,11,0.08)' },
  purple: { gradient: 'linear-gradient(135deg,#8b5cf6,#c084fc)', shadow: 'rgba(139,92,246,0.35)',  glow: 'rgba(139,92,246,0.08)' },
}

export default function StatsCard({ title, value, icon: Icon, color, trend, index = 0 }: Props) {
  const c = CONFIG[color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, boxShadow: `0 20px 50px ${c.shadow}, 0 4px 12px rgba(0,0,0,0.06)` }}
      className="bg-white rounded-3xl p-6 border border-slate-100 cursor-default"
      style={{ boxShadow: `0 4px 20px ${c.glow}, 0 1px 4px rgba(0,0,0,0.04)` }}
    >
      <div className="flex items-start justify-between mb-5">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
          transition={{ duration: 0.4 }}
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: c.gradient, boxShadow: `0 6px 20px ${c.shadow}` }}
        >
          <Icon className="w-5 h-5 text-white" />
        </motion.div>
        {trend && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 + 0.2 }}
            className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl flex items-center gap-1"
          >
            <TrendingUp className="w-3 h-3" /> {trend}
          </motion.span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.08 + 0.15 }}
        className="text-3xl font-black text-gray-900 tracking-tight"
      >
        {value.toLocaleString()}
      </motion.p>
    </motion.div>
  )
}
