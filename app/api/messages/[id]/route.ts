import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Message from '@/models/Message'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const myId = (session.user as any).id
  const count = await Message.countDocuments({ receiverId: myId, read: false })
  return NextResponse.json({ count })
}
