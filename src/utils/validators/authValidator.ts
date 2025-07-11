import { body } from "express-validator";

exports.signupValidation = [
    body("type")
        .notEmpty()
        .withMessage("User type is required"),

    body("email")
        .isEmail()
        .withMessage("Valid email is required"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    body("phone")
        .notEmpty()
        .withMessage("Phone is required"),

    body("firstName")
        .notEmpty()
        .withMessage("First name is required"),

    body("lastName")
        .notEmpty()
        .withMessage("Last name is required"),

    body("address")
        .notEmpty()
        .withMessage("Address is required"),

    body("city")
        .notEmpty()
        .withMessage("City is required"),
];

exports.loginValidation = [
    body("userIdOrEmail").notEmpty().withMessage("User ID or Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];