import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Department from '@/models/Department'
import Employee from '@/models/Employee'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const departments = await Department.find().sort({ name: 1 }).lean()

  const counts = await Employee.aggregate([
    { $group: { _id: '$departmentId', count: { $sum: 1 } } }
  ])
  const countMap = Object.fromEntries(counts.map(c => [c._id.toString(), c.count]))

  const result = departments.map(d => {
    const id = String(d._id)
    return {
      ...d,
      _id: id,
      employeeCount: countMap[id] || 0,
    }
  })
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const data = await req.json()
  const department = await Department.create(data)
  return NextResponse.json(department, { status: 201 })
}
