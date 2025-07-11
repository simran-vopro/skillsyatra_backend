import { body } from "express-validator";


// Validation rules
export const instructorAddValidation = [
    body("firstName").notEmpty().withMessage("firstName is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];