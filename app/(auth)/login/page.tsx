'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', { ...form, redirect: false })
    setLoading(false)
    if (res?.ok) { toast.success('Welcome back!'); router.push('/dashboard') }
    else toast.error('Invalid credentials')
  }

  const inputBase = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    color: 'white',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    width: '100%',
    padding: '12px 16px 12px 44px',
  }

  return (
    <div className="rounded-3xl p-8 border" style={{
      background: 'rgba(255,255,255,0.04)',
      borderColor: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(24px)',
      boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
    }}>

      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', boxShadow: '0 4px 16px rgba(124,58,237,0.4)' }}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p className="text-white font-black text-lg">EMS</p>
          <p className="text-white/40 text-xs">Employee Management</p>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', boxShadow: '0 8px 24px rgba(124,58,237,0.4)' }}>
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight mb-1">Welcome back</h2>
        <p className="text-white/40 text-sm">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input type="email" required style={inputBase}
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
            <input type={showPass ? 'text' : 'password'} required
              style={{ ...inputBase, paddingRight: '44px' }}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onFocus={e => { e.target.style.borderColor = 'rgba(167,139,250,0.6)'; e.target.style.background = 'rgba(255,255,255,0.07)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
            />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}>
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 mt-2"
          style={{
            background: loading ? 'rgba(124,58,237,0.6)' : 'linear-gradient(135deg,#a78bfa,#7c3aed)',
            boxShadow: loading ? 'none' : '0 8px 24px rgba(124,58,237,0.4)',
          }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Footer note */}
      <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
        Access is granted by your Admin only
      </p>
    </div>
  )
}
