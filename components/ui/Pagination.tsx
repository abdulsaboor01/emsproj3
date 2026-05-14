'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

interface Props { page: number; pages: number; onChange: (p: number) => void }

export default function Pagination({ page, pages, onChange }: Props) {
  const nums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1
    if (page <= 4) return i + 1
    if (page >= pages - 3) return pages - 6 + i
    return page - 3 + i
  })

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6 pt-5 border-t border-slate-100">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <ChevronLeft className="w-4 h-4 text-slate-500" />
      </button>
      {nums.map(n => (
        <button key={n} onClick={() => onChange(n)}
          className={clsx('w-9 h-9 rounded-2xl text-sm font-bold transition-all border', n === page ? 'text-white border-transparent' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50')}
          style={n === page ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' } : { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {n}
        </button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === pages}
        className="w-9 h-9 flex items-center justify-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </button>
    </div>
  )
}
