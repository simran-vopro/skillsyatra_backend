"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    userId: { type: String, unique: true },
    type: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    isActive: { type: Boolean, default: true }
});
exports.User = (0, mongoose_1.model)('User', userSchema);
