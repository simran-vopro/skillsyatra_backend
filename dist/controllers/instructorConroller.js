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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const { validationResult } = require("express-validator");
const getAllInstructors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.trim()) || '';
        const skip = (Number(page) - 1) * Number(limit);
        const filter = { type: 'instructor' };
        if (search.trim()) {
            const keywordRegex = new RegExp(search, 'i');
            filter.$or = [
                { userId: { $regex: keywordRegex } },
                { firstName: { $regex: keywordRegex } },
                { email: { $regex: keywordRegex } },
                { address: { $regex: keywordRegex } }
            ];
        }
        const [instructors, total] = yield Promise.all([
            User_1.User.find(filter)
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 }), // Optional: sort by newest first
            User_1.User.countDocuments(filter)
        ]);
        res.json({
            data: instructors,
            page: Number(page),
            limit: Number(limit),
            total
        });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch instructors', error: err.message });
    }
});
const createInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, phone, firstName, lastName, password, address } = req.body;
        const userId = (function generateUniqueUserId() {
            return 'INS' + Date.now();
        })();
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }
        const existingInstructor = yield User_1.User.findOne({ userId });
        if (existingInstructor) {
            return res.status(400).json({ message: 'Instructor with this userId already exists' });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const instructor = new User_1.User({
            type: 'instructor',
            userId,
            email,
            phone,
            firstName,
            lastName,
            password: hashedPassword,
            address
        });
        yield instructor.save();
        //         // Prepare email content
        //         const mailHtml = `
        //   <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 16px; color: #333; max-width: 600px; margin: auto; border: 1px solid #eaeaea; padding: 30px; border-radius: 8px; background-color: #ffffff;">
        //     <h2 style="color: #2c3e50;">Welcome, ${firstName}!</h2>
        //     <p>We’re excited to have you on board as an instructor.</p>
        //     <p>Your login credentials are:</p>
        //     <table style="margin-top: 10px; margin-bottom: 20px;">
        //       <tr>
        //         <td style="font-weight: bold;">User ID:</td>
        //         <td style="padding-left: 10px;">${userId}</td>
        //       </tr>
        //       <tr>
        //         <td style="font-weight: bold;">Password:</td>
        //         <td style="padding-left: 10px;">${password}</td>
        //       </tr>
        //     </table>
        //     <p>You can log in to the admin panel using the button below:</p>
        //     <a href="${frontendUrl}/admin/signin"
        //        style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #4F46E5; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
        //       Log In to Admin Panel
        //     </a>
        //     <p style="margin-top: 30px;">If you have any questions or need help, feel free to reach out.</p>
        //     <p style="margin-top: 20px;">Best regards,<br><strong>The Admin Team</strong></p>
        //   </div>
        // `;
        //         await transporter.sendMail({
        //             from: process.env.SMTP_FROM_EMAIL,
        //             to: email,
        //             subject: `Your Instructor Login Credentials`,
        //             html: mailHtml,
        //         });
        res.status(201).json({ message: 'Instructor created and credentials sent via email.', data: instructor });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create instructor', error: err.message });
    }
});
const editInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        const updatedInstructor = yield User_1.User.findOneAndUpdate({ userId, type: 'instructor' }, updateData, { new: true });
        if (!updatedInstructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor updated successfully', data: updatedInstructor });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update instructor', error: err.message });
    }
});
const toggleInstructorStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;
        const updated = yield User_1.User.findOneAndUpdate({ userId, type: 'instructor' }, { isActive }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: `Instructor ${isActive ? 'enabled' : 'disabled'} successfully`, data: updated });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to update instructor status', error: err.message });
    }
});
const changeInstructorPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;
        console.log("instructor userId ==> ", userId, newPassword);
        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }
        const instructor = yield User_1.User.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        const updated = yield User_1.User.findOneAndUpdate({ userId, type: 'instructor' }, { password: hashedPassword }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor password updated successfully' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Failed to change password', error: err.message });
    }
});
const deleteInstructor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        console.log("deleteInstructor ===> ", req.params);
        const deletedUser = yield User_1.User.findOneAndDelete({ userId, type: 'instructor' });
        if (!deletedUser) {
            return res.status(404).json({ message: 'Instructor not found' });
        }
        res.json({ message: 'Instructor deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to delete instructor', error });
    }
});
exports.default = {
    getAllInstructors,
    createInstructor,
    editInstructor,
    toggleInstructorStatus,
    changeInstructorPassword,
    deleteInstructor
};
