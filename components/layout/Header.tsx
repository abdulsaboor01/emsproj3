'use client'
import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

const ROLE_CONFIG: Record<string, { gradient: string; badge: string; badgeText: string; text: string }> = {
  admin:    { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', badge: 'bg-indigo-50 text-indigo-600 border border-indigo-100',  badgeText: 'Admin',    text: '#6366f1' },
  hr:       { gradient: 'linear-gradient(135deg,#10b981,#059669)', badge: 'bg-emerald-50 text-emerald-600 border border-emerald-100', badgeText: 'HR',       text: '#10b981' },
  employee: { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', badge: 'bg-amber-50 text-amber-600 border border-amber-100',      badgeText: 'Employee', text: '#f59e0b' },
}

export default function Header() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role || 'employee'
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.employee
  const avatar = (session?.user as any)?.avatar || ''
  const initials = session?.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <header className="h-16 flex items-center justify-between px-6 sticky top-0 z-40 border-b border-slate-100/80"
      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', boxShadow: '0 1px 12px rgba(99,102,241,0.06)' }}>

      <div>
        <h2 className="text-sm font-bold text-gray-900">
          {greeting}, <span style={{ color: cfg.text }}>{session?.user?.name?.split(' ')[0] || 'User'}</span> 👋
        </h2>
        <p className="text-xs text-slate-400">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Profile display only — editing is in sidebar popover */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ background: cfg.gradient }}>
            {avatar
              ? <img src={avatar} alt={initials} className="w-full h-full object-cover" />
              : <span className="text-white text-xs font-black">{initials}</span>
            }
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-gray-900 leading-tight">{session?.user?.name}</p>
            <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded-md border ${cfg.badge}`}>
              {cfg.badgeText}
            </span>
          </div>
        </div>

        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-9 h-9 flex items-center justify-center rounded-2xl border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all group"
          style={{ background: 'white' }} title="Sign Out">
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </header>
  )
}
