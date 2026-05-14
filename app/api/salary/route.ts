import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Salary from '@/models/Salary'
import '@/models/Employee'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const [salaries, total] = await Promise.all([
      Salary.find().populate('employeeId', 'firstName lastName employeeId').sort({ year: -1, month: -1 }).skip((page - 1) * limit).limit(limit),
      Salary.countDocuments(),
    ])

    return NextResponse.json({ salaries, total, page, pages: Math.ceil(total / limit) })
  } catch (error: any) {
    console.error('❌ Salary GET error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch salaries' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any)?.role === 'hr' || (session.user as any)?.role === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const data = await req.json()
  const salary = await Salary.create(data)
  return NextResponse.json(salary, { status: 201 })
}
