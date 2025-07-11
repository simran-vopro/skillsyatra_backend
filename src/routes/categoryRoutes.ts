import categoryController from "../controllers/categoryController";
import { authMiddleware } from "../middlewares/auth";
import uploadAny from "../utils/uploads";

const express = require("express");
const router = express.Router();

// Category
router.get('/', categoryController.getCategories);
router.post('/category', authMiddleware, uploadAny.single("image"), categoryController.addCategory);
router.put('/category/:id', authMiddleware, uploadAny.single("image"), categoryController.updateCategory);
router.delete('/category/:id', authMiddleware, categoryController.deleteCategory);


module.exports = router;
