import mongoose, { Schema, Document, Types } from "mongoose";

// -------------------- Interfaces --------------------

interface IOption {
  name: string;
}

interface IMCQ {
  question: string;
  options: IOption[];
  answer: string;
}

interface IYesNo {
  question: string;
  answer: "Yes" | "No";
}

interface IBlank {
  question: string;
  answer: string;
}

interface IActivity {
  mcq: IMCQ[];
  yesno: IYesNo[];
  blank: IBlank[];
}

interface IChapter {
  title: string;
  description: string;
  video?: string;
  audio?: string;
  image?: string;
  activities: IActivity[];
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
  courseStatus: string;
  certificate: boolean
}

// -------------------- Schemas --------------------

const OptionSchema = new Schema<IOption>({
  name: { type: String, }
});

const MCQSchema = new Schema<IMCQ>({
  question: { type: String, },
  options: {
    type: [OptionSchema],
    validate: {
      validator: function (arr: IOption[]) {
        const names = arr.map(opt => opt.name);
        return arr.length === 4 && new Set(names).size === 4;
      },
      message: "Each MCQ must have exactly 4 unique options."
    }
  },
  answer: {
    type: String,

    validate: {
      validator: function (val: string) {
        const opts = (this as any).options as IOption[];
        return opts.map(opt => opt.name).includes(val);
      },
      message: "Answer must be one of the provided options"
    }
  }
});

const YesNoSchema = new Schema<IYesNo>({
  question: { type: String, },
  answer: {
    type: String,
    enum: ["Yes", "No"],

  }
});

const BlankSchema = new Schema<IBlank>({
  question: { type: String, },
  answer: { type: String, }
});

const ActivitySchema = new Schema<IActivity>({
  mcq: [MCQSchema],
  yesno: [YesNoSchema],
  blank: [BlankSchema]
});

const ChapterSchema = new Schema<IChapter>({
  title: { type: String, },
  description: { type: String, },
  video: String,
  audio: String,
  image: String,
  activities: [ActivitySchema]
});

const ModuleSchema = new Schema<IModule>({
  name: { type: String, },
  chapters: {
    type: [ChapterSchema],

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
    category: { type: Schema.Types.ObjectId, ref: "Category", },
    instructor: { type: Schema.Types.ObjectId, ref: "User", },
    createdBy: { type: String, enum: ["admin", "instructor"], },
    title: { type: String, unique: true },
    description: { type: String, },
    language: { type: String, },
    thumbnail: { type: String, },
    promoVideo: { type: String },
    pricingType: { type: String, enum: ["free", "paid"], },
    pricing: { type: Number, },
    whatYouLearn: String,
    courseInclude: String,
    audience: String,
    requirements: String,
    modules: { type: [ModuleSchema], },
    status: { type: Boolean, default: true },
    certificate: { type: Boolean, default: true },
    courseStatus: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
