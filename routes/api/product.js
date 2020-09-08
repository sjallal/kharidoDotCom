const express = require('express');
const router = express.Router();

const {
  getProductById,
  createProduct,
  getProduct,
  photo,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getAllUniqueCategories,
  upload,
} = require('../../controllers/product');

const isAdmin = require('../../middleware/isAdmin');

const { getUserById } = require('../../controllers/user');

//all of params
router.param('userId', getUserById);
router.param('productId', getProductById);

//all of actual routes
//create route
router.post('/create/:userId', isAdmin, upload.single('file'), createProduct);

// read routes
router.get('/:productId', getProduct);
router.get('/photo/:productId', photo);

//update route
router.put('/:productId/:userId', isAdmin, updateProduct);

//delete route
router.delete('/:productId/:userId', isAdmin, deleteProduct);

//listing route
router.get('/', getAllProducts);

router.get('/products/categories', getAllUniqueCategories);

module.exports = router;
