import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Employee from '@/models/Employee'
import Admin from '@/models/Admin'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await connectDB()
  const employee = await Employee.findById(id).populate('departmentId')
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Attach role from Admin account
  const account = await Admin.findOne({ email: employee.email }).select('role')
  return NextResponse.json({ ...employee.toObject(), role: account?.role || 'engineer' })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sessionRole = (session.user as any)?.role
  if (sessionRole === 'hr' || sessionRole === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const { role, ...employeeData } = await req.json()
  const employee = await Employee.findByIdAndUpdate(id, employeeData, { new: true })
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Sync role to Admin account
  if (role) await Admin.findOneAndUpdate({ email: employee.email }, { role })

  return NextResponse.json(employee)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (role === 'hr' || role === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const employee = await Employee.findByIdAndDelete(id)
  if (!employee) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ message: 'Deleted' })
}
