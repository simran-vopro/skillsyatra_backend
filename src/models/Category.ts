import mongoose, { Schema, Document, Types } from "mongoose";

interface ICategory {
  name: string;
  image: string;
  top?: boolean;
}


const categorySchema = new Schema<ICategory>({
  name: String,
  image: String,
  top: { type: Boolean, default: false }
}, {
  timestamps: true
});


export const Category = mongoose.model<ICategory>("Category", categorySchema);
