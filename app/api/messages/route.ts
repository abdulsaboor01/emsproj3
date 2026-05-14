import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Message from '@/models/Message'
import Admin from '@/models/Admin'
import mongoose from 'mongoose'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const myId = (session.user as any).id
  const myRole = (session.user as any).role
  const { searchParams } = new URL(req.url)
  const withUser = searchParams.get('with')

  if (withUser) {
    // Non-admin can only converse with admin
    if (myRole !== 'admin') {
      const otherUser = await Admin.findById(withUser).select('role')
      if (!otherUser || otherUser.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // Mark messages as read
    await Message.updateMany(
      { senderId: new mongoose.Types.ObjectId(withUser), receiverId: new mongoose.Types.ObjectId(myId), read: false },
      { read: true }
    )

    const messages = await Message.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(myId), receiverId: new mongoose.Types.ObjectId(withUser) },
        { senderId: new mongoose.Types.ObjectId(withUser), receiverId: new mongoose.Types.ObjectId(myId) },
      ]
    }).sort({ createdAt: 1 })

    return NextResponse.json(messages)
  }

  // Get user list
  // Admin sees everyone
  // Non-admin sees only admins
  const query = myRole === 'admin'
    ? { _id: { $ne: new mongoose.Types.ObjectId(myId) } }
    : { _id: { $ne: new mongoose.Types.ObjectId(myId) }, role: 'admin' }

  const users = await Admin.find(query).select('name email role').lean()

  // Unread counts
  const unreadCounts = await Message.aggregate([
    { $match: { receiverId: new mongoose.Types.ObjectId(myId), read: false } },
    { $group: { _id: '$senderId', count: { $sum: 1 } } },
  ])
  const unreadMap: Record<string, number> = {}
  unreadCounts.forEach((u: any) => { unreadMap[u._id.toString()] = u.count })

  // Last message with each user
  const lastMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(myId) },
          { receiverId: new mongoose.Types.ObjectId(myId) },
        ]
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ['$senderId', new mongoose.Types.ObjectId(myId)] },
            '$receiverId',
            '$senderId',
          ]
        },
        lastMessage: { $first: '$content' },
        lastAt: { $first: '$createdAt' },
      }
    }
  ])
  const lastMap: Record<string, any> = {}
  lastMessages.forEach((m: any) => { lastMap[m._id.toString()] = { lastMessage: m.lastMessage, lastAt: m.lastAt } })

  const result = (users as any[]).map(u => ({
    ...u,
    _id: u._id.toString(),
    unread: unreadMap[u._id.toString()] || 0,
    lastMessage: lastMap[u._id.toString()]?.lastMessage || '',
    lastAt: lastMap[u._id.toString()]?.lastAt || null,
  })).sort((a, b) => {
    if (a.lastAt && b.lastAt) return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    if (a.lastAt) return -1
    if (b.lastAt) return 1
    return 0
  })

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const myId = (session.user as any).id
  const myRole = (session.user as any).role
  const { receiverId, content } = await req.json()

  if (!receiverId || !content?.trim())
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Non-admin can only send to admin
  if (myRole !== 'admin') {
    const receiver = await Admin.findById(receiverId).select('role')
    if (!receiver || receiver.role !== 'admin')
      return NextResponse.json({ error: 'You can only reply to Admin messages' }, { status: 403 })
  }

  const message = await Message.create({
    senderId: new mongoose.Types.ObjectId(myId),
    receiverId: new mongoose.Types.ObjectId(receiverId),
    content: content.trim(),
  })

  return NextResponse.json(message, { status: 201 })
}
