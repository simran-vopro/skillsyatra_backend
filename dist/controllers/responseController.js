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
exports.getUserCourseProgress = void 0;
const User_1 = require("../models/User");
const course_1 = require("../models/course");
const userActivitiesResponse_1 = require("./userActivitiesResponse");
const mongoose_1 = __importDefault(require("mongoose"));
const addResponse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { userId, courseId, modules } = req.body;
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        const isUserExisting = yield User_1.User.findById(userId);
        if (!isUserExisting) {
            return res.status(404).json({ message: "User not found" });
        }
        const isCourseExisting = yield course_1.Course.findById(courseId);
        if (!isCourseExisting) {
            return res.status(404).json({ message: "Course not found" });
        }
        // 1. Get the existing response
        let courseResponse = yield userActivitiesResponse_1.CourseResponse.findOne({
            user: userId,
            course: courseId,
        });
        const newModule = modules[0]; // Assuming one module is submitted at a time
        const newChapter = newModule.chapters[0]; // Assuming one chapter at a time
        const actualModule = isCourseExisting.modules.find((m) => m.name === newModule.module);
        const totalChaptersInCourse = ((_a = actualModule === null || actualModule === void 0 ? void 0 : actualModule.chapters) === null || _a === void 0 ? void 0 : _a.length) || 0;
        if (courseResponse) {
            const moduleIndex = courseResponse.modules.findIndex(m => m.module === newModule.module);
            if (moduleIndex > -1) {
                const module = courseResponse.modules[moduleIndex];
                const chapterIndex = module.chapters.findIndex(c => c.chapter === newChapter.chapter);
                if (chapterIndex > -1) {
                    // 2. Update existing chapter
                    module.chapters[chapterIndex] = Object.assign(Object.assign({}, newChapter), { completed: true });
                }
                else {
                    // 3. Add new chapter
                    module.chapters.push(Object.assign(Object.assign({}, newChapter), { completed: true }));
                }
                // ✅ 4. Recalculate if all chapters are complete
                const completedChaptersInResponse = module.chapters.filter((ch) => ch.completed).length;
                console.log("completedChaptersInResponse ==> ", completedChaptersInResponse);
                console.log("totalChaptersInCourse ==> ", totalChaptersInCourse);
                // ✅ Only mark module as completed if all chapters are completed
                module.completed = completedChaptersInResponse === totalChaptersInCourse;
                courseResponse.modules[moduleIndex] = module;
            }
            else {
                // 5. Add a new module with completion check
                const isModuleComplete = totalChaptersInCourse === 1;
                courseResponse.modules.push({
                    module: newModule.module,
                    moduleId: newModule.moduleId,
                    chapters: [Object.assign(Object.assign({}, newChapter), { completed: true })],
                    completed: isModuleComplete,
                });
            }
            // 6. Save updated data
            const updated = yield userActivitiesResponse_1.CourseResponse.findByIdAndUpdate(courseResponse._id, { modules: courseResponse.modules }, { new: true });
            return res.status(200).json({
                message: "Activity response updated successfully",
                data: updated,
            });
        }
        else {
            // 7. Create a new CourseResponse with completed module flag if needed
            const newCourseResponse = new userActivitiesResponse_1.CourseResponse({
                user: userId,
                course: courseId,
                modules: [
                    Object.assign(Object.assign({}, newModule), { completed: newModule.chapters.every((ch) => ch.completed) }),
                ],
            });
            yield newCourseResponse.save();
            return res.status(201).json({
                message: "Activity response submitted successfully",
                data: newCourseResponse,
            });
        }
    }
    catch (error) {
        console.error("Add Activity Response error:", error);
        return res.status(500).json({
            message: "Failed to add Activity Response",
            error: error.message,
        });
    }
});
const getResponse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { courseId } = req.params;
    try {
        const responses = yield userActivitiesResponse_1.CourseResponse.find({ course: courseId })
            .populate("course", "title thumbnail")
            .populate("user", "userId name email phone")
            .lean();
        if (!responses || responses.length === 0) {
            return res.status(404).json({ message: "No responses found for this course" });
        }
        return res.status(200).json({
            message: "Responses fetched successfully",
            data: responses,
        });
    }
    catch (error) {
        console.error("Get Activity Responses error:", error);
        return res.status(500).json({
            message: "Failed to fetch responses",
            error: error.message,
        });
    }
});
const getChapterResponse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId, module, chapter } = req.body;
    console.log("getChapterResponse ==> ", { userId, courseId, module, chapter });
    try {
        const response = yield userActivitiesResponse_1.CourseResponse.findOne({
            course: courseId,
            user: userId,
            "modules.module": module,
            "modules.chapters.chapter": chapter
        })
            .populate("course", "title thumbnail")
            .populate("user", "userId name email phone")
            .lean();
        const moduleData = response === null || response === void 0 ? void 0 : response.modules.find(m => m.module === module);
        const chapterData = moduleData === null || moduleData === void 0 ? void 0 : moduleData.chapters.find(ch => ch.chapter === chapter);
        const moduleCompleted = moduleData === null || moduleData === void 0 ? void 0 : moduleData.completed;
        // 🟡 If not found, return default response instead of error
        if (!chapterData) {
            return res.status(200).json({
                message: "No previous response found",
                data: {
                    chapter,
                    completed: false,
                    response: {
                        mcq: [],
                        yesno: [],
                        blank: []
                    }
                }
            });
        }
        // ✅ If found, return it
        return res.status(200).json({
            message: "Response fetched successfully",
            moduleCompleted: moduleCompleted,
            data: chapterData,
        });
    }
    catch (error) {
        console.error("Get Activity response error:", error);
        return res.status(500).json({
            message: "Failed to fetch response",
            error: error.message,
        });
    }
});
const getUserCourseProgress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, courseId } = req.query;
    try {
        const course = yield course_1.Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        const userProgress = yield userActivitiesResponse_1.CourseResponse.findOne({
            user: userId,
            course: courseId,
        });
        let totalChapters = 0;
        let completedChapters = 0;
        const progressModules = course.modules.map((mod) => {
            const userMod = userProgress === null || userProgress === void 0 ? void 0 : userProgress.modules.find((um) => um.module === mod.name);
            const totalModChapters = mod.chapters.length;
            const completedModChapters = userMod
                ? userMod.chapters.filter((ch) => ch.completed).length
                : 0;
            totalChapters += totalModChapters;
            completedChapters += completedModChapters;
            const chapterProgress = mod.chapters.map((chapter) => {
                const userChapter = userMod === null || userMod === void 0 ? void 0 : userMod.chapters.find((uc) => uc.chapter === chapter.title);
                return {
                    title: chapter.title,
                    completed: (userChapter === null || userChapter === void 0 ? void 0 : userChapter.completed) || false,
                };
            });
            return {
                moduleName: mod.name,
                totalChapters: totalModChapters,
                completedChapters: completedModChapters,
                progressPercent: totalModChapters === 0
                    ? 0
                    : Math.round((completedModChapters / totalModChapters) * 100),
                completed: completedModChapters === totalModChapters,
                chapters: chapterProgress,
            };
        });
        const courseProgressPercent = totalChapters === 0
            ? 0
            : Math.round((completedChapters / totalChapters) * 100);
        return res.status(200).json({
            data: {
                courseProgressPercent,
                totalModules: course.modules.length,
                totalChapters,
                completedChapters,
                modules: progressModules,
            }
        });
    }
    catch (err) {
        console.error("Error calculating course progress:", err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
exports.getUserCourseProgress = getUserCourseProgress;
exports.default = {
    addResponse,
    getResponse,
    getChapterResponse,
    getUserCourseProgress: exports.getUserCourseProgress
};
