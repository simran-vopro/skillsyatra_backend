import { Request, Response, NextFunction } from "express";
import bcrypt from 'bcryptjs';

import { Course } from "../models/course";
import { Category } from "../models/Category";
import { User } from "../models/User";
import mongoose, { isValidObjectId } from "mongoose";

import fs from "fs";
import path from "path";

const sanitizeText = (str: string) => typeof str === "string" ? str.trim() : str;

// Helper to get file by field name
const getFileUrl = (files: Express.Multer.File[], fieldname: string) => {
  const file = files.find(f => f.fieldname === fieldname);
  return file ? `/uploads/${file.filename}` : undefined;
};

const addcourse = async (req: Request, res: Response, next: NextFunction) => {
  let {
    category,
    instructor,
    createdBy,
    title,
    description,
    language,
    promoVideo,
    pricingType,
    pricing,
    whatYouLearn,
    courseInclude,
    audience,
    requirements,
    modules,
  } = req.body;

  const files = req.files as Express.Multer.File[];

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
    const existing = await Course.findOne({ title });
    if (existing) {
      return res.status(409).json({ message: "Course with this title already exists" });
    }

    // Handle category (create or fetch existing)
    let finalCategory;
    if (category && !category?._id) {
      const isCategoryExist = await Category.findOne({ name: category?.name });
      if (isCategoryExist) {
        finalCategory = isCategoryExist;
      } else {
        const newCat = new Category({ name: sanitizeText(category?.name) });
        finalCategory = await newCat.save();
      }
    } else {
      const isCategoryExist = await Category.findById(category?._id);
      if (!isCategoryExist) {
        return res.status(400).json({ message: "Category not found" });
      }
      finalCategory = isCategoryExist;
    }

    // Handle instructor (create or fetch)
    let finalInstructor;
    if (instructor && !instructor?._id) {
      const generateUniqueUserId = (): string => 'INS' + Date.now();
      const hashedPassword = await bcrypt.hash(instructor.password, 10);

      const newInstructor = new User({
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

      finalInstructor = await newInstructor.save();
    } else {
      const isInstructorExist = await User.findById(instructor?._id);
      if (!isInstructorExist) {
        return res.status(400).json({ message: "Instructor not found" });
      }
      finalInstructor = isInstructorExist;
    }

    // Parse modules and attach audio/image files
    const parsedModules = typeof modules === "string" ? JSON.parse(modules) : modules;

    parsedModules.forEach((mod: any, mIndex: number) => {
      mod.chapters.forEach((chap: any, cIndex: number) => {
        chap.audio = getFileUrl(files, `modules[${mIndex}][chapters][${cIndex}][audio]`);
        chap.image = getFileUrl(files, `modules[${mIndex}][chapters][${cIndex}][image]`);
      });
    });

    // Create the course
    const newCourse = new Course({
      category: finalCategory?._id,
      instructor: finalInstructor?._id,
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

    await newCourse.save();

    return res.status(201).json({
      message: "Course added successfully",
      data: newCourse,
    });

  } catch (error: any) {
    console.error("Add course error:", error);
    return res.status(500).json({
      message: "Failed to add course",
      error: error.message,
    });
  }
};

const getCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search } = req.query;

    const matchStage = search
      ? {
        $match: {
          $or: [
            isValidObjectId(search)
              ? { category: new mongoose.Types.ObjectId(typeof search === 'string' ? search : '') } // match by category ID
              : null,
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
          ].filter(Boolean) // remove null if not ObjectId
        }
      }
      : null;

    const pipeline: any[] = [];

    if (matchStage) pipeline.push(matchStage);

    pipeline.push(
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "users",
          localField: "instructor",
          foreignField: "_id",
          as: "instructor"
        }
      },
      { $unwind: "$instructor" }
    );

    const courses = await Course.aggregate(pipeline);

    return res.status(200).json({ data: courses });
  } catch (error: any) {
    return res.status(500).json({ message: "error while getting courses" });
  }
};

// Delete course
const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted Successfully' });
  } catch (error) {
    next(error);
  }
};

// get course details by id for admin
const getCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;


    console.log("getCourse ==> ", id)

    const course = await Course.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
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
  } catch (error) {
    next(error);
  }
};


// get course details by id
const getBeforeCourseDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const course = await Course.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), status: true } },
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
  } catch (error) {
    next(error);
  }
};

const updateVisisbility = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Course.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json({ message: `Course ${status ? 'enabled' : 'disabled'} successfully`, data: updated });
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to update Course status', error: err.message });
  }
};

const removeFile = (filePath: string) => {
  const fullPath = path.join(__dirname, "..", "../public", "uploads", filePath);
  fs.unlink(fullPath, (err) => {
    if (err) console.warn("Failed to remove file:", fullPath);
  });
};

const editCourse = async (req: Request, res: Response, next: NextFunction) => {
  const courseId = req.params.id;
  let {
    category,
    instructor,
    title,
    description,
    language,
    promoVideo,
    pricingType,
    pricing,
    whatYouLearn,
    courseInclude,
    audience,
    requirements,
    modules,
  } = req.body;

  const files = req.files as Express.Multer.File[];

  try {
    instructor = typeof instructor === 'string' ? JSON.parse(instructor) : instructor;
    category = typeof category === 'string' ? JSON.parse(category) : category;
    const parsedModules = typeof modules === 'string' ? JSON.parse(modules) : modules;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const instructorDoc = await User.findById(instructor?._id);
    if (!instructorDoc) return res.status(400).json({ message: "Instructor not found" });

    const categoryDoc = await Category.findById(category?._id);
    if (!categoryDoc) return res.status(400).json({ message: "Category not found" });

    // Handle thumbnail
    const newThumbnail = getFileUrl(files, "thumbnail");
    if (newThumbnail && course.thumbnail) {
      removeFile(course.thumbnail);
    }

    // Handle module media updates
    parsedModules.forEach((mod: any, mIndex: number) => {
      mod.chapters.forEach((chap: any, cIndex: number) => {
        const audioKey = `modules[${mIndex}][chapters][${cIndex}][audio]`;
        const imageKey = `modules[${mIndex}][chapters][${cIndex}][image]`;

        const newAudio = getFileUrl(files, audioKey);
        const newImage = getFileUrl(files, imageKey);


        const existingAudio = chap.audio;
        const existingImage = chap.image;

        if (newAudio) {
          if (chap.audio) removeFile(existingAudio);
          chap.audio = newAudio;
        }

        if (newImage) {
          if (chap.image) removeFile(existingImage);
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

    const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedData, {
      new: true,
    });

    return res.status(200).json({
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error: any) {
    console.error("Edit course error:", error);
    return res.status(500).json({
      message: "Failed to update course",
      error: error.message,
    });
  }
};

export default {
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
