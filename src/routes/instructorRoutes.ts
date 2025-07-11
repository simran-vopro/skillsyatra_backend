import { NextFunction, Request, Response } from "express";
import { authMiddleware } from "../middlewares/auth";
import instructorConroller from "../controllers/instructorConroller";
import { instructorAddValidation } from "../utils/validators/instructorValidator";

const express = require('express');
const router = express.Router();

// Middleware to restrict access to admin users
const adminOnly = (req: Request & { user?: { type: string } }, res: Response, next: NextFunction) => {
    if (req.user?.type !== 'admin') {
        return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    next();
};

// Get all instructor
router.get('/', authMiddleware, instructorConroller.getAllInstructors);

// Create new instructor
router.post('/add', authMiddleware, adminOnly, instructorAddValidation, instructorConroller.createInstructor);

// Edit instructor details
router.put('/:userId', authMiddleware, adminOnly, instructorConroller.editInstructor);

// Enable/disable instructor
router.put('/:userId/status', authMiddleware, adminOnly, instructorConroller.toggleInstructorStatus);

// Change instructor password
router.put('/:userId/password', authMiddleware, adminOnly, instructorConroller.changeInstructorPassword);

// Delete instructor
router.delete('/:userId', authMiddleware, adminOnly, instructorConroller.deleteInstructor);


module.exports = router;
