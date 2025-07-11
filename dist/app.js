"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const errorHandler_1 = require("./middlewares/errorHandler");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = express();
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
// Serve frontend and admin builds
const frontendPath = path.join(__dirname, '../frontend/dist');
const adminPath = path.join(__dirname, '../admin/dist');
app.use('/', express.static(frontendPath));
app.use('/admin', express.static(adminPath));
app.get('/admin', (_, res) => res.redirect('/admin/'));
app.get('/admin/*', (_, res) => res.sendFile(path.join(adminPath, 'index.html')));
app.get(/^\/(?!admin).*$/, (_, res) => res.sendFile(path.join(frontendPath, 'index.html')));
// global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
