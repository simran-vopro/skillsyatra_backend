const express = require("express");
const router = express.Router();

import responseController from "../controllers/responseController";
import { authMiddleware } from "../middlewares/auth";

router.post('/add', responseController.addResponse);
router.get('/', authMiddleware, responseController.getResponse);
router.post('/chapterResponse', responseController.getChapterResponse);
router.get('/userCourseProgress', responseController.getUserCourseProgress);

module.exports = router;