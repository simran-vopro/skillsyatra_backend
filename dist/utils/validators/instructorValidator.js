"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.instructorAddValidation = void 0;
const express_validator_1 = require("express-validator");
// Validation rules
exports.instructorAddValidation = [
    (0, express_validator_1.body)("firstName").notEmpty().withMessage("firstName is required"),
    (0, express_validator_1.body)("email").isEmail().withMessage("Valid email is required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
