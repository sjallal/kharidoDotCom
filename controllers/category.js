const Category = require('../models/category');

exports.getCategoryById = async (req, res, next, id) => {
  try {
    const category = await Category.findById(id);
    if (!category)
      return res.status(400).json({ msg: 'Category not found here.' });
    req.category = category;
    next();
  } catch (error) {
    console.error(error);
    if (error.kind == 'ObjectId')
      return res.status(400).json({ msg: 'Category not found!' });
    res.status(500).send('Server Error');
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.json({ category });
  } catch (err) {
    console.log(err);
    res.status(500).send('NOT able to save category in DB');
  }
};

exports.getCategory = (req, res) => {
  return res.json(req.category);
};

exports.getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log(categories);
    res.json(categories);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('NO categories found');
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const newCategory = req.category;
    newCategory.name = req.body.name;
    category = await Category.findOneAndUpdate(
      { _id: req.category.id },
      { $set: newCategory },
      { new: true }
    );
    return res.json(category);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Failed to update category');
  }
};

exports.removeCategory = async (req, res) => {
  try {
    const category = req.category;
    await category.remove();
    res.json({
      message: `Successfully deleted ${category.name}`,
    });
  } catch (error) {
    return res.status(400).json({
      error: `Failed to delete ${category.name} category`,
    });
  }
};
