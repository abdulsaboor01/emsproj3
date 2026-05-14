import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Salary from '@/models/Salary'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (role === 'hr' || role === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await connectDB()
  const data = await req.json()
  const existing = await Salary.findById(id)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const bonus = data.bonus ?? existing.bonus
  const deductions = data.deductions ?? existing.deductions
  const baseSalary = data.baseSalary ?? existing.baseSalary
  const netSalary = baseSalary + bonus - deductions

  const salary = await Salary.findByIdAndUpdate(id, { ...data, netSalary }, { new: true })
  if (!salary) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(salary)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (role === 'hr' || role === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id: delId } = await params
  await connectDB()
  await Salary.findByIdAndDelete(delId)
  return NextResponse.json({ message: 'Deleted' })
}
