import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Employee from '@/models/Employee'
import Salary from '@/models/Salary'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const employee = await Employee.findOne({ email: session.user?.email }).populate('departmentId', 'name')
  if (!employee) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  const salaries = await Salary.find({ employeeId: employee._id }).sort({ year: -1, month: -1 }).limit(6)

  return NextResponse.json({ employee, salaries })
}
