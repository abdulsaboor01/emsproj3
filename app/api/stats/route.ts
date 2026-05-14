import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Employee from '@/models/Employee'
import Department from '@/models/Department'
import Salary from '@/models/Salary'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const [totalEmployees, activeEmployees, onLeave, totalDepts, salaries] = await Promise.all([
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'active' }),
    Employee.countDocuments({ status: 'on-leave' }),
    Department.countDocuments(),
    Salary.find({ status: 'paid' }).select('netSalary'),
  ])

  const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0)

  const deptStats = await Employee.aggregate([
    { $group: { _id: '$departmentId', count: { $sum: 1 } } },
    { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
    { $unwind: '$dept' },
    { $project: { name: '$dept.name', count: 1 } },
    { $sort: { count: -1 } },
  ])

  const monthlyHires = await Employee.aggregate([
    { $group: { _id: { month: { $month: '$joinDate' }, year: { $year: '$joinDate' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ])

  return NextResponse.json({
    totalEmployees, activeEmployees, onLeave,
    inactive: totalEmployees - activeEmployees - onLeave,
    totalDepts, totalPayroll, deptStats, monthlyHires,
  })
}
