import mongoose, { Schema, Document, Types } from 'mongoose';

interface IEnrollment extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  progress: {
    completedChapters: Types.ObjectId[]; // You can also track per module if needed
    percentage: number;
  };
  enrolledAt: Date;
  completedAt?: Date;
  isCompleted: boolean;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    progress: {
      completedChapters: [{ type: Schema.Types.ObjectId }],
      percentage: { type: Number, default: 0 },
    },
    enrolledAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Enrollment = mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
