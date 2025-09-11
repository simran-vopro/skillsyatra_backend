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
const generateUserId_1 = __importDefault(require("../utils/generateUserId"));
const User_1 = require("../models/User");
const express_validator_1 = require("express-validator");
// require runtime modules:
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, password, email, phone, firstName, lastName, address, city, } = req.body;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg
            });
        }
        if (!type || !password || !phone) {
            return res.status(400).json({ message: "Type, email, and password are required." });
        }
        const existingUser = yield User_1.User.findOne({ phone });
        if (existingUser) {
            return res.status(400).json({ message: "User with this email already exists" });
        }
        const hashedPassword = yield bcrypt.hash(password, 10);
        const userId = yield (0, generateUserId_1.default)(type);
        const newUser = new User_1.User({
            userId,
            type,
            email,
            phone,
            firstName,
            lastName,
            address,
            city,
            password: hashedPassword,
        });
        yield newUser.save();
        return res.status(201).json({ message: "User registered successfully", data: newUser });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to register user" });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phone, password, type } = req.body;
        if (!phone || !password || !type) {
            return res.status(400).json({
                message: "Phone, password, and type are required",
            });
        }
        const user = yield User_1.User.findOne({ phone });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated by an administrator",
            });
        }
        if (type !== user.type) {
            return res.status(403).json({ message: `Access denied for user type: ${user.type}` });
        }
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const token = jwt.sign({
            userId: user.userId,
            email: user.email,
            type: user.type,
        }, JWT_SECRET, { expiresIn: "7d" });
        // remove sensitive fields before sending user data back
        const sanitizedUser = {
            _id: user._id,
            userId: user.userId,
            email: user.email,
            phone: user.phone,
            type: user.type,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
        };
        return res.status(200).json({
            message: "Login successful",
            data: { token, user: sanitizedUser },
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Login failed" });
    }
});
exports.default = {
    signUp,
    login
};
