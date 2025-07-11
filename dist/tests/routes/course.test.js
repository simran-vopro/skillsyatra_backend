"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("../../app"));
const jwt = require("jsonwebtoken");
// Load environment variables
dotenv_1.default.config();
// Sample course body
const sampleCourse = {
    createdBy: "admin",
    title: "Test Course",
    thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEzp3_bSDLMDsJvjgPIU8YYFBeSU9sDBnKRg&s",
    promoVideo: "file:///C:/Users/Admin/Downloads/13619613_1920_1080_25fps.mp4",
    description: "A test course",
    language: "English",
    pricingType: "paid",
    pricing: 100,
    category: { name: "Test Category" },
    instructor: {
        email: "sktech@vopro.in",
        password: "Simran@123#",
        phone: "+911234567897",
        firstName: "Simran",
        lastName: "Kaur",
        address: "1st floor, abs building",
        city: "Phagwara"
    },
    whatYouLearn: "<p>Learn X</p>",
    courseInclude: "<ul><li>Video</li></ul>",
    audience: "<p>Beginners</p>",
    requirements: "<p>None</p>",
    modules: [
        {
            name: "Module 1",
            chapters: [
                {
                    title: "Chapter 1",
                    description: "Chapter 1 description",
                    videoUrl: "file:///C:/Users/Admin/Downloads/13619613_1920_1080_25fps.mp4",
                    quiz: [
                        {
                            question: "quiz question 1",
                            options: [{
                                    name: "option A"
                                },
                                {
                                    name: "option B"
                                },
                                {
                                    name: "option C"
                                },
                                {
                                    name: "option D"
                                }],
                            answer: "option B"
                        },
                        {
                            question: "quiz question 2",
                            options: [{
                                    name: "option A"
                                },
                                {
                                    name: "option B"
                                },
                                {
                                    name: "option C"
                                },
                                {
                                    name: "option D"
                                }],
                            answer: "option C"
                        }
                    ]
                }
            ]
        }
    ]
};
describe('POST /api/course/add', () => {
    let token;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined in environment variables.");
        }
        yield mongoose_1.default.connect(mongoUri);
        token = jwt.sign({
            userId: "ADM001",
            email: "vopro@example.com",
            type: "admin",
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.dropDatabase();
        yield mongoose_1.default.disconnect();
    }));
    it('should create a new course successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.default)
            .post('/api/course/add')
            .set('Authorization', `Bearer ${token}`)
            .field('title', sampleCourse.title)
            .field('description', sampleCourse.description)
            .field('language', sampleCourse.language)
            .field('pricingType', sampleCourse.pricingType)
            .field('pricing', sampleCourse.pricing.toString())
            .field('createdBy', sampleCourse.createdBy)
            .field('category', JSON.stringify(sampleCourse.category))
            .field('instructor', JSON.stringify(sampleCourse.instructor))
            .field('whatYouLearn', sampleCourse.whatYouLearn)
            .field('courseInclude', sampleCourse.courseInclude)
            .field('audience', sampleCourse.audience)
            .field('requirements', sampleCourse.requirements)
            .field('modules', JSON.stringify(sampleCourse.modules))
            .field('thumbnail', sampleCourse.thumbnail)
            .field('promoVideo', sampleCourse.promoVideo);
        console.log("🔥 RESPONSE STATUS:", res.status);
        console.log("📦 RESPONSE BODY:", res.body);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message', 'Course added successfully');
    }));
});
