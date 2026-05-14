import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId
  receiverId: mongoose.Types.ObjectId
  content: string
  read: boolean
  createdAt: Date
}

const MessageSchema = new Schema<IMessage>({
  senderId:   { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  receiverId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  content:    { type: String, required: true, trim: true },
  read:       { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)
