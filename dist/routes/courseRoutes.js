"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const courseController_1 = __importDefault(require("../controllers/courseController"));
const auth_1 = require("../middlewares/auth");
const uploads_1 = __importDefault(require("../utils/uploads"));
const courseAddValidator_1 = require("../utils/validators/courseAddValidator");
router.get('/', courseController_1.default.getCourses);
router.get('/detail/:id', auth_1.authMiddleware, courseController_1.default.getCourse);
router.post('/add', auth_1.authMiddleware, uploads_1.default.any(), courseAddValidator_1.courseAddValidator, courseAddValidator_1.validateAddCourse, courseController_1.default.addcourse);
router.delete('/delete/:id', auth_1.authMiddleware, courseController_1.default.deleteCourse);
router.put('/status/:id', auth_1.authMiddleware, courseController_1.default.updateVisisbility);
router.put('/edit/:id', uploads_1.default.any(), courseController_1.default.editCourse);
module.exports = router;
