import mongoose, { Schema, Document } from 'mongoose'

export interface IEmployee extends Document {
  employeeId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string
  departmentId: mongoose.Types.ObjectId
  status: 'active' | 'inactive' | 'on-leave'
  joinDate: Date
  salary: number
  avatar?: string
  address?: string
  createdAt: Date
}

const EmployeeSchema = new Schema<IEmployee>({
  employeeId: { type: String, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, default: '' },
  position: { type: String, required: true },
  departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
  status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  joinDate: { type: Date, required: true },
  salary: { type: Number, required: true },
  avatar: { type: String },
  address: { type: String },
}, { timestamps: true })

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema)
