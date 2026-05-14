import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const admin = await Admin.findById((session.user as any).id).select('-password')
  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(admin)
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { name, email, phone, avatar, currentPassword, newPassword } = await req.json()

  const admin = await Admin.findById((session.user as any).id)
  if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // If changing email, check it's not taken by someone else
  if (email && email.toLowerCase() !== admin.email) {
    const exists = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: admin._id } })
    if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    admin.email = email.toLowerCase()
  }

  if (name) admin.name = name
  if (phone !== undefined) admin.phone = phone
  if (avatar !== undefined) admin.avatar = avatar

  // Password change — requires current password verification
  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 })
    const valid = await bcrypt.compare(currentPassword, admin.password)
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    if (newPassword.length < 6) return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    admin.password = await bcrypt.hash(newPassword, 10)
  }

  await admin.save()
  const { password: _, ...result } = admin.toObject()
  return NextResponse.json(result)
}
