'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, MessageSquare, ArrowLeft, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_COLORS: Record<string, { gradient: string; light: string; text: string }> = {
  admin:    { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', text: '#6366f1' },
  hr:       { gradient: 'linear-gradient(135deg,#10b981,#059669)', light: '#ecfdf5', text: '#10b981' },
  engineer: { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fffbeb', text: '#f59e0b' },
}

function Avatar({ name, role, size = 'md' }: { name: string; role: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'
  const cfg = ROLE_COLORS[role] || ROLE_COLORS.engineer
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center flex-shrink-0 font-black text-white shadow-sm`}
      style={{ background: cfg.gradient }}>
      {initials}
    </div>
  )
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const myId = (session?.user as any)?.id
  const myRole = (session?.user as any)?.role
  const myName = session?.user?.name || ''
  const isAdmin = myRole === 'admin'

  const [users, setUsers] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout>()

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/messages')
    if (res.ok) setUsers(await res.json())
    setLoadingUsers(false)
  }, [])

  const fetchMessages = useCallback(async (userId: string) => {
    setLoadingMsgs(true)
    const res = await fetch(`/api/messages?with=${userId}`)
    if (res.ok) {
      setMessages(await res.json())
      fetchUsers()
    }
    setLoadingMsgs(false)
  }, [fetchUsers])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // Auto-select admin for non-admin users if only one contact
  useEffect(() => {
    if (!isAdmin && users.length === 1 && !selected) {
      setSelected(users[0])
    }
  }, [users, isAdmin, selected])

  useEffect(() => {
    if (!selected) return
    fetchMessages(selected._id)
    pollRef.current = setInterval(() => fetchMessages(selected._id), 3000)
    return () => clearInterval(pollRef.current)
  }, [selected, fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !selected) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receiverId: selected._id, content: text.trim() }),
    })
    setSending(false)
    if (res.ok) { setText(''); fetchMessages(selected._id) }
    else { const d = await res.json(); toast.error(d.error || 'Failed to send') }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = users.reduce((sum, u) => sum + (u.unread || 0), 0)

  const formatTime = (date: string) => {
    const d = new Date(date)
    const isToday = d.toDateString() === new Date().toDateString()
    return isToday
      ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex -m-6 overflow-hidden">

      {/* User list — hidden on mobile when chat is open */}
      <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-slate-100 bg-white ${selected ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-black text-gray-900">Messages</h1>
              {totalUnread > 0 && <p className="text-xs font-semibold text-indigo-600">{totalUnread} unread</p>}
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Non-admin notice */}
          {!isAdmin && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100 mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-xs text-amber-700 font-medium">You can only message Admin</p>
            </div>
          )}

          {isAdmin && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search people..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-slate-400 focus:outline-none focus:border-indigo-300 transition-all" />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <p className="text-sm">No contacts found</p>
            </div>
          ) : filtered.map(user => {
            const cfg = ROLE_COLORS[user.role] || ROLE_COLORS.engineer
            const isActive = selected?._id === user._id
            return (
              <motion.button key={user._id} onClick={() => setSelected(user)}
                whileHover={{ backgroundColor: '#f8faff' }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 transition-colors text-left ${isActive ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''}`}>
                <div className="relative">
                  <Avatar name={user.name} role={user.role} />
                  {user.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white text-xs font-black flex items-center justify-center">
                      {user.unread > 9 ? '9+' : user.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold truncate ${isActive ? 'text-indigo-700' : 'text-gray-900'}`}>{user.name}</p>
                    {user.lastAt && <p className="text-xs text-slate-400 flex-shrink-0 ml-2">{formatTime(user.lastAt)}</p>}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-slate-400 truncate">{user.lastMessage || user.email}</p>
                    <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0"
                      style={{ background: cfg.light, color: cfg.text }}>{user.role}</span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col bg-slate-50 ${selected ? 'flex' : 'hidden md:flex'}`}>
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400">
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <MessageSquare className="w-16 h-16 opacity-20" />
            </motion.div>
            <p className="font-bold text-gray-900">Select a conversation</p>
            <p className="text-sm text-center px-8">
              {isAdmin ? 'Choose someone from the list to start messaging' : 'Select Admin to view your messages'}
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-4 bg-white border-b border-slate-100 flex items-center gap-3 shadow-sm">
              <button onClick={() => setSelected(null)} className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <ArrowLeft className="w-4 h-4 text-slate-500" />
              </button>
              <Avatar name={selected.name} role={selected.role} />
              <div>
                <p className="font-black text-gray-900 text-sm">{selected.name}</p>
                <p className="text-xs text-slate-400 capitalize">{selected.role} · {selected.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-32">
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                  <MessageSquare className="w-10 h-10 opacity-20" />
                  <p className="text-sm">
                    {isAdmin ? `Start a conversation with ${selected.name}` : 'No messages from Admin yet'}
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId?.toString() === myId || msg.senderId === myId
                    const showDate = i === 0 || new Date(messages[i - 1].createdAt).toDateString() !== new Date(msg.createdAt).toDateString()
                    return (
                      <div key={msg._id}>
                        {showDate && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-xs text-slate-400 font-medium">
                              {new Date(msg.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                            <div className="flex-1 h-px bg-slate-200" />
                          </div>
                        )}
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isMe && <Avatar name={selected.name} role={selected.role} size="sm" />}
                          <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                              isMe ? 'text-white rounded-br-sm' : 'bg-white text-gray-900 border border-slate-100 rounded-bl-sm'
                            }`} style={isMe ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' } : {}}>
                              {msg.content}
                            </div>
                            <p className="text-xs text-slate-400 px-1">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    )
                  })}
                </AnimatePresence>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input — non-admin can only reply to admin */}
            <form onSubmit={handleSend} className="px-5 py-4 bg-white border-t border-slate-100">
              {!isAdmin && selected.role !== 'admin' ? (
                <div className="flex items-center justify-center gap-2 py-2 text-slate-400">
                  <Lock className="w-4 h-4" />
                  <p className="text-sm">You can only reply to Admin messages</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar name={myName} role={myRole || 'engineer'} size="sm" />
                  <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-indigo-300 transition-all">
                    <input type="text" value={text} onChange={e => setText(e.target.value)}
                      placeholder={`Message ${selected.name}...`}
                      className="flex-1 bg-transparent text-sm text-gray-900 placeholder-slate-400 focus:outline-none"
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e as any) } }} />
                  </div>
                  <motion.button type="submit" disabled={!text.trim() || sending}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {sending
                      ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <Send className="w-4 h-4" />}
                  </motion.button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  )
}
