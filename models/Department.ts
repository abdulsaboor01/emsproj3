import mongoose, { Schema, Document } from 'mongoose'

export interface IDepartment extends Document {
  name: string
  description: string
  managerId?: mongoose.Types.ObjectId
  budget: number
  createdAt: Date
}

const DepartmentSchema = new Schema<IDepartment>({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
  budget: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema)
