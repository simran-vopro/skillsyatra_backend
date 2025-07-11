import { Response, Request } from "express";
import bcrypt from 'bcryptjs';
import { User } from "../models/User";
const { validationResult } = require("express-validator");


const getAllInstructors = async (req: Request, res: Response) => {
    try {

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = (req.query.search as string)?.trim() || '';


        const skip = (Number(page) - 1) * Number(limit);

        const filter: { [key: string]: any } = { type: 'instructor' };

        if (search.trim()) {
            const keywordRegex = new RegExp(search, 'i');
            filter.$or = [
                { userId: { $regex: keywordRegex } },
                { firstName: { $regex: keywordRegex } },
                { email: { $regex: keywordRegex } },
                { address: { $regex: keywordRegex } }
            ];
        }

        const [instructors, total] = await Promise.all([
            User.find(filter)
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 }), // Optional: sort by newest first
            User.countDocuments(filter)
        ]);

        res.json({
            data: instructors,
            page: Number(page),
            limit: Number(limit),
            total
        });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to fetch instructors', error: err.message });
    }
};

const createInstructor = async (req: Request, res: Response) => {
    try {
        const { email, phone, firstName, lastName, password, address } = req.body;

        const userId = function generateUniqueUserId(): string {
            return 'INS' + Date.now(); // or any smarter logic you use elsewhere
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const existingInstructor = await User.findOne({ userId });
        if (existingInstructor) {
            return res.status(400).json({ message: 'Instructor with this userId already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const instructor = new User({
            type: 'instructor',
            userId,
            email,
            phone,
            firstName,
            lastName,
            password: hashedPassword,
            address
        });

        await instructor.save();

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
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create instructor', error: err.message });
    }
};

const editInstructor = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        const updatedInstructor = await User.findOneAndUpdate(
            { userId, type: 'instructor' },
            updateData,
            { new: true }
        );

        if (!updatedInstructor) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        res.json({ message: 'Instructor updated successfully', data: updatedInstructor });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to update instructor', error: err.message });
    }
};

const toggleInstructorStatus = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const updated = await User.findOneAndUpdate(
            { userId, type: 'instructor' },
            { isActive },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        res.json({ message: `Instructor ${isActive ? 'enabled' : 'disabled'} successfully`, data: updated });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to update instructor status', error: err.message });
    }
};

const changeInstructorPassword = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { newPassword } = req.body;

        console.log("instructor userId ==> ", userId, newPassword);

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        const instructor = await User.findOne({ userId });
        if (!instructor) {
            return res.status(404).json({ message: "Instructor not found" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updated = await User.findOneAndUpdate(
            { userId, type: 'instructor' },
            { password: hashedPassword },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        res.json({ message: 'Instructor password updated successfully' });
    } catch (err: any) {
        console.log(err)
        res.status(500).json({ message: 'Failed to change password', error: err.message });
    }
};

const deleteInstructor = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        console.log("deleteInstructor ===> ", req.params)
        const deletedUser = await User.findOneAndDelete({ userId, type: 'instructor' });

        if (!deletedUser) {
            return res.status(404).json({ message: 'Instructor not found' });
        }

        res.json({ message: 'Instructor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete instructor', error });
    }
};

export default {
    getAllInstructors,
    createInstructor,
    editInstructor,
    toggleInstructorStatus,
    changeInstructorPassword,
    deleteInstructor
}