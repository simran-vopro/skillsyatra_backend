"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// -------------------- Schemas --------------------
const OptionSchema = new mongoose_1.Schema({
    name: { type: String, required: true }
});
const QuizSchema = new mongoose_1.Schema({
    question: { type: String, required: true, },
    options: {
        type: [OptionSchema],
        validate: {
            validator: function (arr) {
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
            validator: function (val) {
                const opts = this.options;
                return opts.map(opt => opt.name).includes(val);
            },
            message: "Answer must be one of the provided options"
        }
    }
});
const ChapterSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    video: String,
    audio: String,
    image: String,
    quiz: [QuizSchema]
});
const ModuleSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    chapters: {
        type: [ChapterSchema],
        required: true,
        validate: [
            {
                validator: function (arr) {
                    return Array.isArray(arr) && arr.length > 0;
                },
                message: "Each module must contain at least one chapter"
            },
            {
                validator: function (arr) {
                    const titles = arr.map(ch => ch.title);
                    return new Set(titles).size === titles.length;
                },
                message: "Chapter titles must be unique within a module."
            }
        ]
    }
});
const CourseSchema = new mongoose_1.Schema({
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: "Category", required: true },
    instructor: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
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
}, { timestamps: true });
exports.Course = mongoose_1.default.model("Course", CourseSchema);
