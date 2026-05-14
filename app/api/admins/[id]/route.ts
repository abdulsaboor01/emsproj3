import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const { name, role } = await req.json()
  const admin = await Admin.findByIdAndUpdate(id, { name, role }, { new: true }).select('-password')
  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(admin)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const currentUserId = (session.user as any)?.id
  if (id === currentUserId) return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 })

  await connectDB()
  await Admin.findByIdAndDelete(id)
  return NextResponse.json({ message: 'Deleted' })
}
