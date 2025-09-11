const express = require("express");
const router = express.Router();

import courseController from "../controllers/courseController";
import { authMiddleware } from "../middlewares/auth";
import uploadAny from "../utils/uploads";
import { courseAddValidator, validateAddCourse } from "../utils/validators/courseAddValidator";

router.get('/', authMiddleware, courseController.getCourses);
router.get('/PublishedCourses', courseController.getPublishedCourses);
router.get('/detail/:id', authMiddleware, courseController.getCourse);
router.get('/beforeDetail/:id', courseController.getBeforeCourseDetails);

router.get('/myCourses', authMiddleware, courseController.myCourses);
router.get('/fullDetail/:id', authMiddleware, courseController.getFullCourseDetails);

router.post('/add', authMiddleware, uploadAny.any(), courseController.addcourse);
router.put('/edit/:id', authMiddleware, uploadAny.any(), courseAddValidator, validateAddCourse, courseController.editCourse);

router.delete('/delete/:id', authMiddleware, courseController.deleteCourse);
router.put('/status/:id', authMiddleware, courseController.updateVisisbility);


module.exports = router;