import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const courseAddValidator = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("language").notEmpty().withMessage("Language is required"),
  // body("thumbnail").notEmpty().withMessage("Thumbnail is required"),
  // body("promoVideo").notEmpty().withMessage("Promo video is required"),

  // body("pricingType")
  //   .notEmpty()
  //   .isIn(["free", "paid"])
  //   .withMessage("Pricing type must be 'free' or 'paid'"),

  body("pricing")
    .if(body("pricingType").equals("paid"))
    .notEmpty()
    .isNumeric()
    .withMessage("Pricing is required and must be a number for paid courses"),

  body("whatYouLearn")
    .notEmpty()
    .isString()
    .withMessage("whatYouLearn must be a string (HTML content)"),

  body("courseInclude")
    .notEmpty()
    .isString()
    .withMessage("courseInclude must be a string (HTML content)"),

  body("audience")
    .notEmpty()
    .isString()
    .withMessage("audience must be a string (HTML content)"),

  body("requirements")
    .notEmpty()
    .isString()
    .withMessage("requirements must be a string (HTML content)"),


  // body("category").notEmpty().withMessage("Category is required"),
  // body("instructor").notEmpty().withMessage("Instructor is required"),

  // body("createdBy")
  //   .notEmpty()
  //   .isIn(["admin", "instructor"])
  //   .withMessage("createdBy must be 'admin' or 'instructor'"),

  // body("modules")
  //   .notEmpty()
  //   .withMessage("Modules are required")
  //   .custom((value) => {
  //     if (typeof value === "string") {
  //       try {
  //         const parsed = JSON.parse(value);
  //         if (!Array.isArray(parsed)) throw new Error();
  //       } catch {
  //         throw new Error("Modules must be a valid JSON array if sent as string");
  //       }
  //     } else if (!Array.isArray(value)) {
  //       throw new Error("Modules must be an array");
  //     }
  //     return true;
  //   }),
];


export const validateAddCourse = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
};