import Category from '../models/Category.js';

export const listCategories = async (filters = {}) => {
  // For now just return all categories sorted by name
  return Category.find(filters).sort({ name: 1 }).lean();
};

export const createCategory = async (data) => {
  // ensure name exists
  if (!data.name || String(data.name).trim() === '') {
    throw new Error('Category name is required');
  }
  // create and save
  const cat = new Category({ ...data, name: data.name.trim() });
  await cat.save();
  return cat.toObject();
};

export const deleteCategory = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) throw new Error('Category not found');
  await cat.remove();
  return cat.toObject();
};

export const getCategoryById = async (id) => {
  return Category.findById(id).lean();
};

export default { listCategories, createCategory, deleteCategory, getCategoryById };