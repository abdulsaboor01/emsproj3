import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const admins = await Admin.find().select('-password').sort({ createdAt: -1 })
  return NextResponse.json(admins)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any)?.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await connectDB()
  const { name, email, password, role } = await req.json()

  if (!name || !email || !password)
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const existing = await Admin.findOne({ email: email.toLowerCase() })
  if (existing) return NextResponse.json({ error: 'Email exists' }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)
  const admin = await Admin.create({ name, email: email.toLowerCase(), password: hashed, role: role || 'employee' })

  return NextResponse.json({ ...admin.toObject(), password: undefined }, { status: 201 })
}
