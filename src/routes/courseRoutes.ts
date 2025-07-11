const express = require("express");
const router = express.Router();

import courseController from "../controllers/courseController";
import { authMiddleware } from "../middlewares/auth";
import uploadAny from "../utils/uploads";
import { courseAddValidator, validateAddCourse } from "../utils/validators/courseAddValidator";

router.get('/', courseController.getCourses);
router.get('/detail/:id', authMiddleware, courseController.getCourse);
router.post('/add', authMiddleware, uploadAny.any(), courseAddValidator, validateAddCourse, courseController.addcourse);
router.delete('/delete/:id', authMiddleware, courseController.deleteCourse);
router.put('/status/:id', authMiddleware, courseController.updateVisisbility);
router.put('/edit/:id', uploadAny.any(), courseController.editCourse);

module.exports = router;