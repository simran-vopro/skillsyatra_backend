"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = require("../models/Category");
const getCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield Category_1.Category.find().sort({ createdAt: -1 });
        res.status(200).json({
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
});
// Add a new Category
const addCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'category name is required and must be a non-empty string.' });
        }
        const newCategory = new Category_1.Category({ name: name.trim() });
        yield newCategory.save();
        res.status(201).json({ message: 'Category added successfully', data: newCategory });
    }
    catch (error) {
        console.log(error);
        // Handle duplicate key error gracefully
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Category already exists.' });
        }
        next(error);
    }
});
// Update Category
const updateCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateCategory = yield Category_1.Category.findByIdAndUpdate(id, req.body, { new: true });
        if (!updateCategory)
            return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category updated', data: updateCategory });
    }
    catch (error) {
        next(error);
    }
});
// Delete Category
const deleteCategory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deleted = yield Category_1.Category.findByIdAndDelete(id);
        if (!deleted)
            return res.status(404).json({ message: 'Category not found' });
        res.json({ message: 'Category deleted' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory
};
