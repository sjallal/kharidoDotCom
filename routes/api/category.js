const express = require('express');
const router = express.Router();

const {
  getCategoryById,
  createCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  removeCategory,
} = require('../../controllers/category');

const isAdmin = require('../../middleware/isAdmin');

const { getUserById } = require('../../controllers/user');

//params
router.param('userId', getUserById);
router.param('categoryId', getCategoryById);

//actual routers goes here

//create
router.post('/create/:userId', isAdmin, createCategory);

//read
router.get('/:categoryId', getCategory);
router.get('/', getAllCategory);

//update
router.put('/:categoryId/:userId', isAdmin, updateCategory);

//delete

router.delete('/:categoryId/:userId', isAdmin, removeCategory);

module.exports = router;
