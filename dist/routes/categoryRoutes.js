"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categoryController_1 = __importDefault(require("../controllers/categoryController"));
const auth_1 = require("../middlewares/auth");
const uploads_1 = __importDefault(require("../utils/uploads"));
const express = require("express");
const router = express.Router();
// Category
router.get('/', categoryController_1.default.getCategories);
router.post('/category', auth_1.authMiddleware, uploads_1.default.single("image"), categoryController_1.default.addCategory);
router.put('/category/:id', auth_1.authMiddleware, uploads_1.default.single("image"), categoryController_1.default.updateCategory);
router.delete('/category/:id', auth_1.authMiddleware, categoryController_1.default.deleteCategory);
module.exports = router;
