import { NextFunction, Request, Response } from "express";
import { Category } from "../models/Category";

const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 })
    res.status(200).json({
      data: categories,
    });
  } catch (error) {
    next(error);
  }
}

// Add a new Category
const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'category name is required and must be a non-empty string.' });
    }

    const newCategory = new Category({ name: name.trim() });
    await newCategory.save();

    res.status(201).json({ message: 'Category added successfully', data: newCategory });
  } catch (error: any) {

    console.log(error)
    // Handle duplicate key error gracefully
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Category already exists.' });
    }
    next(error);
  }
};

// Update Category
const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const updateCategory = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!updateCategory) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category updated', data: updateCategory });
  } catch (error) {
    next(error);
  }
};

// Delete Category
const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

export default {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory
};