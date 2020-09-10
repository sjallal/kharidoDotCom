const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate('Category')
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: 'Product not found',
        });
      }
      req.product = product;
      next();
    });
};
exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

// Configuring multer...
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.filename + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});
exports.upload = multer({
  storage: storage,
});

exports.createProduct = (req, res) => {
  const { name, description, price, category, stock } = req.body;
  if (!name || !description || !price || !category || !stock) {
    return res.status(400).json({
      error: 'Please include all fields',
    });
  }

  let product = new Product(req.body);

  if (!req.file) return res.status(400).json({ error: 'problem with image' });
  product.photo.data = fs.readFileSync(req.file.path);
  product.photo.contentType = req.file.mimetype;

  product.save((err, product) => {
    if (err) {
      res.status(400).json({
        error: 'Saving the Product in DB failed',
      });
    }
    res.json(product);
  });
};

//middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set('Content-Type', req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};
