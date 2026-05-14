import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json()

  if (!name || !email || !password)
    return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })

  if (password.length < 6)
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

  await connectDB()

  const existing = await Admin.findOne({ email: email.toLowerCase() })
  if (existing)
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

  const validRoles = ['admin', 'hr', 'engineer']
  const assignedRole = validRoles.includes(role) ? role : 'engineer'

  const hashed = await bcrypt.hash(password, 10)
  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: assignedRole,
  })

  return NextResponse.json({ message: 'Account created', id: admin._id }, { status: 201 })
}
