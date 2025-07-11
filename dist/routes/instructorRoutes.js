"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../middlewares/auth");
const instructorConroller_1 = __importDefault(require("../controllers/instructorConroller"));
const instructorValidator_1 = require("../utils/validators/instructorValidator");
const express = require('express');
const router = express.Router();
// Middleware to restrict access to admin users
const adminOnly = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.type) !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};
// Get all instructor
router.get('/', auth_1.authMiddleware, instructorConroller_1.default.getAllInstructors);
// Create new instructor
router.post('/add', auth_1.authMiddleware, adminOnly, instructorValidator_1.instructorAddValidation, instructorConroller_1.default.createInstructor);
// Edit instructor details
router.put('/:userId', auth_1.authMiddleware, adminOnly, instructorConroller_1.default.editInstructor);
// Enable/disable instructor
router.put('/:userId/status', auth_1.authMiddleware, adminOnly, instructorConroller_1.default.toggleInstructorStatus);
// Change instructor password
router.put('/:userId/password', auth_1.authMiddleware, adminOnly, instructorConroller_1.default.changeInstructorPassword);
// Delete instructor
router.delete('/:userId', auth_1.authMiddleware, adminOnly, instructorConroller_1.default.deleteInstructor);
module.exports = router;
