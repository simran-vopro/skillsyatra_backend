"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const router = express.Router();
const responseController_1 = __importDefault(require("../controllers/responseController"));
const auth_1 = require("../middlewares/auth");
router.post('/add', responseController_1.default.addResponse);
router.get('/', auth_1.authMiddleware, responseController_1.default.getResponse);
router.post('/chapterResponse', responseController_1.default.getChapterResponse);
router.get('/userCourseProgress', responseController_1.default.getUserCourseProgress);
module.exports = router;
