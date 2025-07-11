"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAddCourse = exports.courseAddValidator = void 0;
const express_validator_1 = require("express-validator");
exports.courseAddValidator = [
    (0, express_validator_1.body)("title").notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("description").notEmpty().withMessage("Description is required"),
    (0, express_validator_1.body)("language").notEmpty().withMessage("Language is required"),
    // body("thumbnail").notEmpty().withMessage("Thumbnail is required"),
    // body("promoVideo").notEmpty().withMessage("Promo video is required"),
    // body("pricingType")
    //   .notEmpty()
    //   .isIn(["free", "paid"])
    //   .withMessage("Pricing type must be 'free' or 'paid'"),
    (0, express_validator_1.body)("pricing")
        .if((0, express_validator_1.body)("pricingType").equals("paid"))
        .notEmpty()
        .isNumeric()
        .withMessage("Pricing is required and must be a number for paid courses"),
    (0, express_validator_1.body)("whatYouLearn")
        .notEmpty()
        .isString()
        .withMessage("whatYouLearn must be a string (HTML content)"),
    (0, express_validator_1.body)("courseInclude")
        .notEmpty()
        .isString()
        .withMessage("courseInclude must be a string (HTML content)"),
    (0, express_validator_1.body)("audience")
        .notEmpty()
        .isString()
        .withMessage("audience must be a string (HTML content)"),
    (0, express_validator_1.body)("requirements")
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
const validateAddCourse = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};
exports.validateAddCourse = validateAddCourse;
