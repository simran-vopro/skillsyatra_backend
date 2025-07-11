"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = __importDefault(require("../controllers/authController"));
const express = require("express");
const router = express.Router();
const { signupValidation } = require("../utils/validators/authValidator");
router.post("/signup", signupValidation, authController_1.default.signUp);
router.post("/login", authController_1.default.login);
module.exports = router;
