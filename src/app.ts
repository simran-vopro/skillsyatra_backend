const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const app = express();

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const responseRoutes = require('./routes/responseRoutes');

import type { Request, Response } from "express";

import { errorHandler } from './middlewares/errorHandler';


import dotenv from 'dotenv';
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("short"));

// Static assets
app.use('/static', express.static(path.join(__dirname, '../public')));
app.use('/static/topBanners', express.static(path.join(__dirname, '../public/topBanners')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/response', responseRoutes);

// Serve frontend and admin builds
const frontendPath = path.join(__dirname, '../frontend/dist');
const adminPath = path.join(__dirname, '../admin/dist');

app.use('/', express.static(frontendPath));
app.use('/admin', express.static(adminPath));

app.get('/admin', (_: Request, res: Response) => res.redirect('/admin/'));
app.get('/admin/*', (_: Request, res: Response) => res.sendFile(path.join(adminPath, 'index.html')));
app.get(/^\/(?!admin).*$/, (_: Request, res: Response) => res.sendFile(path.join(frontendPath, 'index.html')));

// global error handler
app.use(errorHandler);

export default app;
