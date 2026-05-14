import mongoose, { Schema, Document } from 'mongoose'

export interface ISalary extends Document {
  employeeId: mongoose.Types.ObjectId
  month: number
  year: number
  baseSalary: number
  bonus: number
  deductions: number
  netSalary: number
  status: 'pending' | 'paid' | 'cancelled'
  paidAt?: Date
}

const SalarySchema = new Schema<ISalary>({
  employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  baseSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  paidAt: { type: Date },
}, { timestamps: true })

export default mongoose.models.Salary || mongoose.model<ISalary>('Salary', SalarySchema)
