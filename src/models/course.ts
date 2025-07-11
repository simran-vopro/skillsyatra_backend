import mongoose, { Schema, Document, Types } from "mongoose";

// -------------------- Interfaces --------------------

interface IOption {
  name: string;
}

interface IQuiz {
  question: string;
  options: IOption[];
  answer: string;
}

interface IChapter {
  title: string;
  description: string;
  video?: string;
  audio?: string;
  image?: string;
  quiz: IQuiz[];
}

interface IModule {
  name: string;
  chapters: IChapter[];
}

export interface ICourse extends Document {
  category: Types.ObjectId;
  instructor: Types.ObjectId;
  createdBy: "admin" | "instructor";
  title: string;
  description: string;
  language: string;
  thumbnail: string;
  promoVideo: string;
  pricingType: "free" | "paid";
  pricing: number;
  whatYouLearn: string;
  courseInclude: string;
  audience: string;
  requirements: string;
  modules: IModule[];
  status: boolean;
}

// -------------------- Schemas --------------------

const OptionSchema = new Schema<IOption>({
  name: { type: String, required: true }
});

const QuizSchema = new Schema<IQuiz>({
  question: { type: String, required: true, },
  options: {
    type: [OptionSchema],
    validate: {
      validator: function (arr: IOption[]) {
        const names = arr.map(opt => opt.name);
        return arr.length === 4 && new Set(names).size === 4;
      },
      message: "Each quiz question must have exactly 4 unique options."
    }
  },
  answer: {
    type: String,
    required: true,
    validate: {
      validator: function (val: string) {
        const opts = (this as any).options as IOption[];
        return opts.map(opt => opt.name).includes(val);
      },
      message: "Answer must be one of the provided options"
    }
  }
});

const ChapterSchema = new Schema<IChapter>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  video: String,
  audio: String,
  image: String,
  quiz: [QuizSchema]
});

const ModuleSchema = new Schema<IModule>({
  name: { type: String, required: true },
  chapters: {
    type: [ChapterSchema],
    required: true,
    validate: [
      {
        validator: function (arr: IChapter[]) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "Each module must contain at least one chapter"
      },
      {
        validator: function (arr: IChapter[]) {
          const titles = arr.map(ch => ch.title);
          return new Set(titles).size === titles.length;
        },
        message: "Chapter titles must be unique within a module."
      }
    ]
  }
});

const CourseSchema = new Schema<ICourse>(
  {
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    instructor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: String, enum: ["admin", "instructor"], required: true },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    thumbnail: { type: String, required: true },
    promoVideo: { type: String },
    pricingType: { type: String, enum: ["free", "paid"], required: true },
    pricing: { type: Number, required: true },
    whatYouLearn: String,
    courseInclude: String,
    audience: String,
    requirements: String,
    modules: { type: [ModuleSchema], required: true },
    status: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
