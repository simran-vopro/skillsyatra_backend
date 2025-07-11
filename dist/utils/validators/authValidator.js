"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
exports.signupValidation = [
    (0, express_validator_1.body)("type")
        .notEmpty()
        .withMessage("User type is required"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Valid email is required"),
    (0, express_validator_1.body)("password")
        .notEmpty()
        .withMessage("Password is required"),
    (0, express_validator_1.body)("phone")
        .notEmpty()
        .withMessage("Phone is required"),
    (0, express_validator_1.body)("firstName")
        .notEmpty()
        .withMessage("First name is required"),
    (0, express_validator_1.body)("lastName")
        .notEmpty()
        .withMessage("Last name is required"),
    (0, express_validator_1.body)("address")
        .notEmpty()
        .withMessage("Address is required"),
    (0, express_validator_1.body)("city")
        .notEmpty()
        .withMessage("City is required"),
];
exports.loginValidation = [
    (0, express_validator_1.body)("userIdOrEmail").notEmpty().withMessage("User ID or Email is required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
