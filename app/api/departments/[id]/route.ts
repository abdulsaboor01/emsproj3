import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Department from '@/models/Department'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (role === 'hr' || role === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const data = await req.json()
  const dept = await Department.findByIdAndUpdate(id, data, { new: true })
  if (!dept) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(dept)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (role === 'hr' || role === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: deptId } = await params
  await connectDB()
  await Department.findByIdAndDelete(deptId)
  return NextResponse.json({ message: 'Deleted' })
}
