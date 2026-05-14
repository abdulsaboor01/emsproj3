import mongoose, { Schema, Document } from 'mongoose'

export interface IAdmin extends Document {
  name: string
  email: string
  password: string
  role: 'admin' | 'hr' | 'engineer'
  phone?: string
  avatar?: string
  createdAt: Date
}

const AdminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'hr', 'engineer'], default: 'engineer' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
}, { timestamps: true })

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema)
