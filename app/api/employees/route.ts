import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Employee from '@/models/Employee'
import Admin from '@/models/Admin'
import Salary from '@/models/Salary'
import bcrypt from 'bcryptjs'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const department = searchParams.get('department') || ''
  const status = searchParams.get('status') || ''

  const query: any = {}
  if (search) query.$or = [
    { firstName: { $regex: search, $options: 'i' } },
    { lastName: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
    { employeeId: { $regex: search, $options: 'i' } },
  ]
  if (department) query.departmentId = department
  if (status) query.status = status

  const [employees, total] = await Promise.all([
    Employee.find(query).populate('departmentId', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Employee.countDocuments(query),
  ])

  return NextResponse.json({ employees, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const role = (session.user as any)?.role
  if (role === 'hr' || role === 'engineer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await connectDB()
    const data = await req.json()
    const { role: empRole, password, ...employeeData } = data

    // Check for duplicate email
    const emailExists = await Employee.findOne({ email: employeeData.email.toLowerCase() })
    if (emailExists) return NextResponse.json({ error: 'An employee with this email already exists' }, { status: 409 })

    // Also check if login account already exists
    const accountExists = await Admin.findOne({ email: employeeData.email.toLowerCase() })
    if (accountExists) return NextResponse.json({ error: 'A login account with this email already exists' }, { status: 409 })

    // Auto-generate unique employeeId
    let employeeId: string
    let counter = await Employee.countDocuments() + 1
    while (true) {
      employeeId = `EMP${String(counter).padStart(4, '0')}`
      const exists = await Employee.findOne({ employeeId })
      if (!exists) break
      counter++
    }
    employeeData.employeeId = employeeId

    const employee = await Employee.create(employeeData)

    // Always create login account (email uniqueness already checked above)
    const hashed = await bcrypt.hash(password || 'password123', 10)
    await Admin.create({
      name: `${employeeData.firstName} ${employeeData.lastName}`,
      email: employeeData.email.toLowerCase(),
      password: hashed,
      role: empRole || 'engineer',
    })

    // Auto-create salary record for current month
    const now = new Date()
    const baseSalary = Number(employeeData.salary) || 0
    await Salary.create({
      employeeId: employee._id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      baseSalary,
      bonus: 0,
      deductions: 0,
      netSalary: baseSalary,
      status: 'pending',
    })

    return NextResponse.json({
      ...employee.toObject(),
      loginEmail: employeeData.email.toLowerCase(),
      loginPassword: password || 'password123',
      role: empRole || 'engineer',
    }, { status: 201 })
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0]
      const msg = field === 'email' ? 'An employee with this email already exists'
        : field === 'employeeId' ? 'Employee ID already exists'
        : 'A duplicate entry already exists'
      return NextResponse.json({ error: msg }, { status: 409 })
    }
    return NextResponse.json({ error: error.message || 'Failed to create employee' }, { status: 500 })
  }
}
