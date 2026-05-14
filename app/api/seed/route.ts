import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'
import Department from '@/models/Department'
import Employee from '@/models/Employee'
import Salary from '@/models/Salary'

export async function POST() {
  await connectDB()

  const existing = await Admin.findOne({ email: 'admin@company.com' })
  if (!existing) {
    const hashed = await bcrypt.hash('admin123', 10)
    await Admin.create({ name: 'Admin', email: 'admin@company.com', password: hashed, role: 'admin' })
  }

  return NextResponse.json({ message: 'Admin account ready. admin@company.com / admin123' })
}

export async function DELETE() {
  await connectDB()
  await Employee.deleteMany({})
  await Salary.deleteMany({})
  return NextResponse.json({ message: 'Employee and salary data cleared. User accounts are never deleted.' })
}

export async function PUT() {
  await connectDB()
  const deptNames = [
    { name: 'Engineering', description: 'Software & infrastructure team', budget: 500000 },
    { name: 'Marketing', description: 'Brand & growth team', budget: 200000 },
    { name: 'HR', description: 'People & culture team', budget: 150000 },
    { name: 'Finance', description: 'Accounting & finance team', budget: 300000 },
    { name: 'Operations', description: 'Business operations team', budget: 250000 },
  ]
  for (const dept of deptNames) {
    await Department.findOneAndUpdate(
      { name: dept.name },
      dept,
      { upsert: true, new: true }
    )
  }
  return NextResponse.json({ message: 'Departments restored.' })
}
