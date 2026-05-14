'use client'
import { useEffect, useRef } from 'react'

const FEATURES = [
  { icon: '👥', title: 'Employee Management', desc: 'Add, update and manage your entire workforce in one place' },
  { icon: '💰', title: 'Payroll Tracking', desc: 'Track salaries, bonuses and deductions with ease' },
  { icon: '🏢', title: 'Department Control', desc: 'Organize teams and departments with budget visibility' },
  { icon: '💬', title: 'Team Messaging', desc: 'Communicate directly with your team members' },
]

const STATS = [
  { value: '1,200+', label: 'Employees' },
  { value: '$2.4M', label: 'Payroll' },
  { value: '99.9%', label: 'Uptime' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: { x: number; y: number; r: number; dx: number; dy: number; alpha: number }[] = []
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    let animId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
        ctx.fill()
      })
      // Draw connecting lines
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist / 100)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(animate)
    }
    animate()
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a1a' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[58%] flex-col justify-between p-14 relative overflow-hidden">

        {/* Deep gradient bg */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #6d28d9 75%, #7c3aed 100%)'
        }} />

        {/* Animated particle canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Glow orbs */}
        <div className="absolute top-[-120px] right-[-80px] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[-60px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }} />
        <div className="absolute top-[45%] right-[20%] w-[250px] h-[250px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)' }} />

        {/* Floating stat cards */}
        <div className="absolute top-20 right-14 backdrop-blur-xl rounded-2xl p-4 w-48 border"
          style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📈</span>
            <p className="text-white/60 text-xs font-medium">Active Employees</p>
          </div>
          <p className="text-white text-2xl font-black">1,247</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold">↑ 12% this month</span>
          </div>
        </div>

        <div className="absolute bottom-36 right-10 backdrop-blur-xl rounded-2xl p-4 w-48 border"
          style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💸</span>
            <p className="text-white/60 text-xs font-medium">Total Payroll</p>
          </div>
          <p className="text-white text-2xl font-black">$2.4M</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-violet-300 text-xs font-semibold">↑ 8.2% growth</span>
          </div>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl"
            style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-tight">EMS</p>
            <p className="text-white/50 text-xs">Employee Management System</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 border"
              style={{ background: 'rgba(167,139,250,0.15)', borderColor: 'rgba(167,139,250,0.3)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px #34d399' }} />
              <span className="text-white/80 text-xs font-semibold tracking-wide">Live & Operational</span>
            </div>

            <h1 className="text-[3.5rem] font-black text-white leading-[1.05] tracking-tight">
              Manage your<br />
              <span style={{ background: 'linear-gradient(135deg,#a78bfa,#f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                team smarter.
              </span>
            </h1>
            <p className="text-white/55 text-base leading-relaxed mt-4 max-w-md">
              A powerful, beautiful platform for employee management, payroll tracking, and organizational insights — all in one place.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(({ value, label }) => (
              <div key={label} className="rounded-2xl p-4 border text-center"
                style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}>
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-white/45 text-xs mt-1 uppercase tracking-wider font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="rounded-2xl p-4 border group hover:border-violet-500/40 transition-all duration-300"
                style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl">{icon}</span>
                  <p className="text-white text-xs font-bold">{title}</p>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/25 text-xs font-medium">© 2024 EMS · All rights reserved</div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f0f23 0%, #13111f 50%, #0d0d1a 100%)' }}>

        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }} />

        <div className="relative z-10 w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
