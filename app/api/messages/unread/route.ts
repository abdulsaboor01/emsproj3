import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Message from '@/models/Message'
import mongoose from 'mongoose'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ count: 0 })
  await connectDB()
  const myId = (session.user as any).id
  const count = await Message.countDocuments({
    receiverId: new mongoose.Types.ObjectId(myId),
    read: false,
  })
  return NextResponse.json({ count })
}
