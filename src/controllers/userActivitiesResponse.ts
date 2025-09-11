import mongoose, { Schema, Document, Types } from "mongoose";

// -------------------- Interfaces --------------------

interface IRESULT {
  question: string;
  answer: string;
  userAnswer: string;
  isCorrect?: boolean;
}


interface IChapterResponse {
  chapter: string;
  completed?: boolean;
  response: {
    mcq: IRESULT[];
    yesno: IRESULT[];
    blank: IRESULT[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface IModuleResponse {
  module: string;
  moduleId?:string;
  completed?: boolean;
  chapters: IChapterResponse[];
}

export interface ICourseResponse extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  modules: IModuleResponse[];
  createdAt: Date;
  updatedAt: Date;
}

// -------------------- Schemas --------------------
const result = new Schema<IRESULT>({
  question: String,
  answer: String,
  userAnswer: String,
  isCorrect: Boolean
});


const ChapterResponseSchema = new Schema<IChapterResponse>({
  chapter: String,
  completed: Boolean,
  response: {
    mcq: [result],
    yesno: [result],
    blank: [result]
  }
}, {
  timestamps: true,
  _id: false
});

const ModuleResponseSchema = new Schema<IModuleResponse>({
  module: String,
  moduleId: String,
  completed: Boolean,
  chapters: [ChapterResponseSchema]
}, { _id: false });

const CourseResponseSchema = new Schema<ICourseResponse>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
  modules: [ModuleResponseSchema]
}, {
  timestamps: true
});

export const CourseResponse = mongoose.model<ICourseResponse>("CourseResponse", CourseResponseSchema);
