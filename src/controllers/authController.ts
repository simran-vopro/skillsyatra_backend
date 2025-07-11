// import only the types:
import type { Request, Response } from "express";
import generateUserId from "../utils/generateUserId";
import { User } from "../models/User";
import { validationResult } from "express-validator";

// require runtime modules:
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const signUp = async (req: Request, res: Response) => {
  try {
    const {
      type,
      password,
      email,
      phone,
      firstName,
      lastName,
      address,
      city,
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg
      });
    }

    if (!type || !password || !phone) {
      return res.status(400).json({ message: "Type, email, and password are required." });
    }

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await generateUserId(type);

    const newUser = new User({
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

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully", data: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to register user" });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { phone, password, type } = req.body;

    console.log(req.body);

    if (!phone || !password || !type) {
      return res.status(400).json({
        message: "Phone, password, and type are required",
      });
    }

    const user = await User.findOne({ phone });
    console.log("user ==> ", user);

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated by an administrator",
      });
    }

    if (type !== user.type) {
      return res
        .status(403)
        .json({ message: `Access denied for user type: ${user.type}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        type: user.type,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // remove sensitive fields before sending user data back
    const sanitizedUser = {
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
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};


export default {
  signUp,
  login
}
