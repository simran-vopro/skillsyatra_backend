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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const course_1 = require("../models/course");
const Category_1 = require("../models/Category");
const User_1 = require("../models/User");
const mongoose_1 = __importStar(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sanitizeText = (str) => typeof str === "string" ? str.trim() : str;
// Helper to get file by field name
const getFileUrl = (files, fieldname) => {
    const file = files.find(f => f.fieldname === fieldname);
    return file ? `/uploads/${file.filename}` : undefined;
};
const addcourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { category, instructor, createdBy, title, description, language, promoVideo, pricingType, pricing, whatYouLearn, courseInclude, audience, requirements, modules, } = req.body;
    const files = req.files;
    try {
        // Parse instructor and category if they come as strings
        instructor = typeof instructor === 'string' ? JSON.parse(instructor) : instructor;
        category = typeof category === 'string' ? JSON.parse(category) : category;
        // Extract thumbnail from uploaded files
        const thumbnailPath = getFileUrl(files, "thumbnail");
        if (!thumbnailPath) {
            return res.status(400).json({ message: "Thumbnail file is missing" });
        }
        // Check for existing course with same title
        const existing = yield course_1.Course.findOne({ title });
        if (existing) {
            return res.status(409).json({ message: "Course with this title already exists" });
        }
        // Handle category (create or fetch existing)
        let finalCategory;
        if (category && !(category === null || category === void 0 ? void 0 : category._id)) {
            const isCategoryExist = yield Category_1.Category.findOne({ name: category === null || category === void 0 ? void 0 : category.name });
            if (isCategoryExist) {
                finalCategory = isCategoryExist;
            }
            else {
                const newCat = new Category_1.Category({ name: sanitizeText(category === null || category === void 0 ? void 0 : category.name) });
                finalCategory = yield newCat.save();
            }
        }
        else {
            const isCategoryExist = yield Category_1.Category.findById(category === null || category === void 0 ? void 0 : category._id);
            if (!isCategoryExist) {
                return res.status(400).json({ message: "Category not found" });
            }
            finalCategory = isCategoryExist;
        }
        // Handle instructor (create or fetch)
        let finalInstructor;
        if (instructor && !(instructor === null || instructor === void 0 ? void 0 : instructor._id)) {
            const generateUniqueUserId = () => 'INS' + Date.now();
            const hashedPassword = yield bcryptjs_1.default.hash(instructor.password, 10);
            const newInstructor = new User_1.User({
                userId: generateUniqueUserId(),
                type: "instructor",
                email: instructor.email,
                password: hashedPassword,
                phone: instructor.phone,
                firstName: instructor.firstName,
                lastName: instructor.lastName,
                address: instructor.address,
                city: instructor.city,
                isActive: true,
            });
            finalInstructor = yield newInstructor.save();
        }
        else {
            const isInstructorExist = yield User_1.User.findById(instructor === null || instructor === void 0 ? void 0 : instructor._id);
            if (!isInstructorExist) {
                return res.status(400).json({ message: "Instructor not found" });
            }
            finalInstructor = isInstructorExist;
        }
        // Parse modules and attach audio/image files
        const parsedModules = typeof modules === "string" ? JSON.parse(modules) : modules;
        parsedModules.forEach((mod, mIndex) => {
            mod.chapters.forEach((chap, cIndex) => {
                chap.audio = getFileUrl(files, `modules[${mIndex}][chapters][${cIndex}][audio]`);
                chap.image = getFileUrl(files, `modules[${mIndex}][chapters][${cIndex}][image]`);
            });
        });
        // Create the course
        const newCourse = new course_1.Course({
            category: finalCategory === null || finalCategory === void 0 ? void 0 : finalCategory._id,
            instructor: finalInstructor === null || finalInstructor === void 0 ? void 0 : finalInstructor._id,
            createdBy: sanitizeText(createdBy),
            title: sanitizeText(title),
            description: sanitizeText(description),
            language: sanitizeText(language),
            thumbnail: thumbnailPath,
            promoVideo,
            pricingType: sanitizeText(pricingType),
            pricing,
            whatYouLearn,
            courseInclude,
            audience,
            requirements,
            modules: parsedModules,
        });
        yield newCourse.save();
        return res.status(201).json({
            message: "Course added successfully",
            data: newCourse,
        });
    }
    catch (error) {
        console.error("Add course error:", error);
        return res.status(500).json({
            message: "Failed to add course",
            error: error.message,
        });
    }
});
const getCourses = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const matchStage = search
            ? {
                $match: {
                    $or: [
                        (0, mongoose_1.isValidObjectId)(search)
                            ? { category: new mongoose_1.default.Types.ObjectId(typeof search === 'string' ? search : '') } // match by category ID
                            : null,
                        { title: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } }
                    ].filter(Boolean) // remove null if not ObjectId
                }
            }
            : null;
        const pipeline = [];
        if (matchStage)
            pipeline.push(matchStage);
        pipeline.push({
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        }, { $unwind: "$category" }, {
            $lookup: {
                from: "users",
                localField: "instructor",
                foreignField: "_id",
                as: "instructor"
            }
        }, { $unwind: "$instructor" });
        const courses = yield course_1.Course.aggregate(pipeline);
        return res.status(200).json({ data: courses });
    }
    catch (error) {
        return res.status(500).json({ message: "error while getting courses" });
    }
});
// Delete course
const deleteCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield course_1.Course.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ message: 'Course not found' });
        res.json({ message: 'Course deleted Successfully' });
    }
    catch (error) {
        next(error);
    }
});
// get course details by id for admin
const getCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log("getCourse ==> ", id);
        const course = yield course_1.Course.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(id) } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor"
                }
            },
            {
                $unwind: "$instructor"
            },
        ]);
        if (!course.length) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json({ data: course[0] }); // return the single course object
    }
    catch (error) {
        next(error);
    }
});
// get course details by id
const getBeforeCourseDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const course = yield course_1.Course.aggregate([
            { $match: { _id: new mongoose_1.default.Types.ObjectId(id), status: true } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor"
                }
            },
            {
                $unwind: "$instructor"
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    language: 1,
                    thumbnail: 1,
                    promoVideo: 1,
                    pricingType: 1,
                    pricing: 1,
                    whatYouLearn: 1,
                    courseInclude: 1,
                    audience: 1,
                    requirements: 1,
                    category: {
                        _id: 1,
                        name: 1,
                        image: 1
                    },
                    instructor: {
                        _id: 1,
                        firstName: 1,
                        email: 1
                    },
                    modules: {
                        $map: {
                            input: "$modules",
                            as: "mod",
                            in: {
                                name: "$$mod.name",
                                chapters: {
                                    $map: {
                                        input: "$$mod.chapters",
                                        as: "chap",
                                        in: {
                                            title: "$$chap.title"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);
        if (!course.length) {
            return res.status(404).json({ message: "Course not found" });
        }
        res.json({ data: course[0] }); // return the single course object
    }
    catch (error) {
        next(error);
    }
});
const updateVisisbility = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = yield course_1.Course.findOneAndUpdate({ _id: id }, { status }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: `Course ${status ? 'enabled' : 'disabled'} successfully`, data: updated });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update Course status', error: err.message });
    }
});
const removeFile = (filePath) => {
    const fullPath = path_1.default.join(__dirname, "..", "../public", "uploads", filePath);
    fs_1.default.unlink(fullPath, (err) => {
        if (err)
            console.warn("Failed to remove file:", fullPath);
    });
};
const editCourse = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const courseId = req.params.id;
    let { category, instructor, title, description, language, promoVideo, pricingType, pricing, whatYouLearn, courseInclude, audience, requirements, modules, } = req.body;
    const files = req.files;
    try {
        instructor = typeof instructor === 'string' ? JSON.parse(instructor) : instructor;
        category = typeof category === 'string' ? JSON.parse(category) : category;
        const parsedModules = typeof modules === 'string' ? JSON.parse(modules) : modules;
        const course = yield course_1.Course.findById(courseId);
        if (!course)
            return res.status(404).json({ message: "Course not found" });
        const instructorDoc = yield User_1.User.findById(instructor === null || instructor === void 0 ? void 0 : instructor._id);
        if (!instructorDoc)
            return res.status(400).json({ message: "Instructor not found" });
        const categoryDoc = yield Category_1.Category.findById(category === null || category === void 0 ? void 0 : category._id);
        if (!categoryDoc)
            return res.status(400).json({ message: "Category not found" });
        // Handle thumbnail
        const newThumbnail = getFileUrl(files, "thumbnail");
        if (newThumbnail && course.thumbnail) {
            removeFile(course.thumbnail);
        }
        // Handle module media updates
        parsedModules.forEach((mod, mIndex) => {
            mod.chapters.forEach((chap, cIndex) => {
                const audioKey = `modules[${mIndex}][chapters][${cIndex}][audio]`;
                const imageKey = `modules[${mIndex}][chapters][${cIndex}][image]`;
                const newAudio = getFileUrl(files, audioKey);
                const newImage = getFileUrl(files, imageKey);
                const existingAudio = chap.audio;
                const existingImage = chap.image;
                if (newAudio) {
                    if (chap.audio)
                        removeFile(existingAudio);
                    chap.audio = newAudio;
                }
                if (newImage) {
                    if (chap.image)
                        removeFile(existingImage);
                    chap.image = newImage;
                }
            });
        });
        // Construct update object
        const updatedData = {
            title: sanitizeText(title),
            description: sanitizeText(description),
            language: sanitizeText(language),
            promoVideo,
            pricingType: sanitizeText(pricingType),
            pricing,
            whatYouLearn,
            courseInclude,
            audience,
            requirements,
            modules: parsedModules,
            instructor: instructorDoc._id,
            category: categoryDoc._id,
            thumbnail: newThumbnail || course.thumbnail,
        };
        const updatedCourse = yield course_1.Course.findByIdAndUpdate(courseId, updatedData, {
            new: true,
        });
        return res.status(200).json({
            message: "Course updated successfully",
            data: updatedCourse,
        });
    }
    catch (error) {
        console.error("Edit course error:", error);
        return res.status(500).json({
            message: "Failed to update course",
            error: error.message,
        });
    }
});
exports.default = {
    addcourse,
    getCourses,
    deleteCourse,
    getCourse,
    updateVisisbility,
    editCourse,
    getBeforeCourseDetails
};
// exports.getProducts = async (req, res, next) => {
//   try {
//     const {
//       page = 1,
//       limit = 50,
//       search,
//       category1,
//       category2,
//       category3,
//       brand,
//       topSelling
//     } = req.query;
//     const filter = { isActive: true };
//     if (search) {
//       const isNumber = !isNaN(Number(search));
//       filter.$or = [
//         { Style: { $regex: search, $options: "i" } },
//         { Description: { $regex: search, $options: "i" } },
//         { Code: { $regex: search, $options: "i" } },
//         ...(isNumber ? [{ ISPCCombined: Number(search) }] : [])
//       ];
//     }
//     if (topSelling === 'true') {
//       filter.topSelling = true;
//     }
//     const toObjectIdArray = (param) => {
//       if (!param) return undefined;
//       // Already an array (e.g., ?category1=A&category1=B)
//       if (Array.isArray(param)) {
//         return { $in: param.map(id => new mongoose.Types.ObjectId(id)) };
//       }
//       // Try to parse JSON (e.g. '["A","B"]')
//       try {
//         const parsed = JSON.parse(param);
//         if (Array.isArray(parsed)) {
//           return { $in: parsed.map(id => new mongoose.Types.ObjectId(id)) };
//         }
//         return mongoose.Types.ObjectId(parsed); // single string
//       } catch {
//         // Fallback: comma-separated string
//         const ids = param.split(',');
//         return { $in: ids.map(id => new mongoose.Types.ObjectId(id)) };
//       }
//     };
//     const parsedCategory1 = toObjectIdArray(category1);
//     if (parsedCategory1) filter.Category1 = parsedCategory1;
//     const parsedCategory2 = toObjectIdArray(category2);
//     if (parsedCategory2) filter.Category2 = parsedCategory2;
//     const parsedCategory3 = toObjectIdArray(category3);
//     if (parsedCategory3) filter.Category3 = parsedCategory3;
//     const parsedBrands = toObjectIdArray(brand);
//     if (parsedBrands) filter.Brand = parsedBrands;
//     const [products, total] = await Promise.all([
//       Product.find(filter)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit))
//         .lean()
//         .populate('Category1')
//         .populate('Category2')
//         .populate('Category3')
//         .populate('Brand'),
//       Product.countDocuments(filter)
//     ]);
//     res.status(200).json({
//       data: products,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit)
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// exports.getProductsCount = async (req, res, next) => {
//   try {
//     const count = await Product.countDocuments(); // or add a filter if needed
//     res.status(200).json({ data: count });
//   } catch (error) {
//     console.error("Error fetching product count:", error);
//     res.status(500).json({ message: "Something went wrong while counting products." });
//   }
// };
// exports.getAdminProducts = async (req, res, next) => {
//   try {
//     const {
//       page,
//       limit,
//       search,
//       category1,
//       category2,
//       category3,
//       brand
//     } = req.query;
//     console.log(req.query);
//     const filter = {};
//     if (search) {
//       const isNumber = !isNaN(Number(search));
//       filter.$or = [
//         { Style: { $regex: search, $options: "i" } },
//         { Description: { $regex: search, $options: "i" } },
//         { Code: { $regex: search, $options: "i" } },
//         ...(isNumber ? [{ ISPCCombined: Number(search) }] : [])
//       ];
//     }
//     const toObjectIdArray = (param) => {
//       if (!param) return undefined;
//       // Already an array (e.g., ?category1=A&category1=B)
//       if (Array.isArray(param)) {
//         return { $in: param.map(id => new mongoose.Types.ObjectId(id)) };
//       }
//       // Try to parse JSON (e.g. '["A","B"]')
//       try {
//         const parsed = JSON.parse(param);
//         if (Array.isArray(parsed)) {
//           return { $in: parsed.map(id => new mongoose.Types.ObjectId(id)) };
//         }
//         return mongoose.Types.ObjectId(parsed); // single string
//       } catch {
//         // Fallback: comma-separated string
//         const ids = param.split(',');
//         return { $in: ids.map(id => new mongoose.Types.ObjectId(id)) };
//       }
//     };
//     const parsedCategory1 = toObjectIdArray(category1);
//     if (parsedCategory1) filter.Category1 = parsedCategory1;
//     const parsedCategory2 = toObjectIdArray(category2);
//     if (parsedCategory2) filter.Category2 = parsedCategory2;
//     const parsedCategory3 = toObjectIdArray(category3);
//     if (parsedCategory3) filter.Category3 = parsedCategory3;
//     const parsedBrands = toObjectIdArray(brand);
//     if (parsedBrands) filter.Brand = parsedBrands;
//     const [products, total] = await Promise.all([
//       Product.find(filter)
//         .sort({ createdAt: -1 })
//         .skip((page - 1) * limit)
//         .limit(parseInt(limit))
//         .lean()
//         .populate('Category1')
//         .populate('Category2')
//         .populate('Category3')
//         .populate('Brand'),
//       Product.countDocuments(filter)
//     ]);
//     res.status(200).json({
//       data: products,
//       total,
//       page: parseInt(page),
//       limit: parseInt(limit)
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// exports.updateVisibility = async (req, res, next) => {
//   const { id } = req.params;
//   const { isActive } = req.body;
//   try {
//     const product = await Product.findByIdAndUpdate(
//       id,
//       { isActive },
//       { new: true }
//     );
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.status(200).json({ data: product, message: "Status updated successfully!" });
//   } catch (error) {
//     console.error("Update visibility error:", error);
//     res.status(500).json({
//       message: "Status update failed",
//       error: error.message
//     });
//   }
// };
// exports.editProduct = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const {
//       Code,
//       Description,
//       Pack,
//       rrp,
//       GrpSupplier,
//       GrpSupplierCode,
//       Manufacturer,
//       ManufacturerCode,
//       ISPCCombined,
//       VATCode,
//       Brand,
//       ExtendedCharacterDesc,
//       CatalogueCopy,
//       ImageRef,
//       Category1,
//       Category2,
//       Category3,
//       Style,
//     } = req.body;
//     console.log("edit product ==> ", req.body);
//     // Properly update the product
//     const product = await Product.findByIdAndUpdate(
//       id,
//       {
//         Code,
//         Description,
//         Pack,
//         rrp,
//         GrpSupplier,
//         GrpSupplierCode,
//         Manufacturer,
//         ManufacturerCode,
//         ISPCCombined,
//         VATCode,
//         Brand,
//         ExtendedCharacterDesc,
//         CatalogueCopy,
//         ImageRef,
//         Category1,
//         Category2,
//         Category3,
//         Style,
//       },
//       { new: true } // return updated document
//     );
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.status(200).json({ message: "Product updated successfully", data: product });
//   } catch (error) {
//     console.error("Edit product error:", error);
//     res.status(500).json({ message: "Failed to edit product", error: error.message });
//   }
// };
// exports.deleteProduct = async (req, res, next) => {
//   const { id } = req.params;
//   try {
//     const product = await Product.findByIdAndDelete(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res.status(200).json({ data: product, message: "Product Deleted Successfully!" });
//   } catch (error) {
//     console.error("Product delete error:", error);
//     res.status(500).json({
//       message: "Product delete failed",
//       error: error.message
//     });
//   }
// };
// exports.getSingleProduct = async (req, res, next) => {
//   const { productId } = req.params;
//   console.log("productId ==> ", productId);
//   if (!productId) {
//     return res.status(400).json({ error: "Missing productId" });
//   }
//   try {
//     const product = await Product.findById({ _id: productId }).populate([
//       { path: "Brand" },
//       { path: "Category1" },
//       { path: "Category2" },
//       { path: "Category3" }
//     ]);
//     if (!product) {
//       return res.status(404).json({ error: "product not found" });
//     }
//     return res.json({ data: product });
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     return res.status(500).json({ error: "Failed to fetch product" });
//   }
// }
// exports.topSelling = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { topSelling } = req.body;
//     console.log(req.body)
//     // Properly update the product
//     const product = await Product.findByIdAndUpdate(
//       id,
//       {
//         topSelling,
//       },
//       { new: true } // return updated document
//     );
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }
//     res
//       .status(200)
//       .json({ message: "Product updated successfully", data: product });
//   } catch (error) {
//     console.error("Edit product error:", error);
//     res
//       .status(500)
//       .json({ message: "Failed to edit product", error: error.message });
//   }
// };
