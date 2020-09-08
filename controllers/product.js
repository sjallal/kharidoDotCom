const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// exports.getProductById = async (req, res, next, id) => {
//   try {
//     const product = Product.findById(id);
//     if (!product) return res.status(400).json({ error: 'Product not found' });
//     req.product = product;
//     // console.log('Hello..............');
//     next();
//   } catch (error) {
//     console.error(error);
//     if (error.kind == 'ObjectId')
//       return res.status(400).json({ msg: 'Product not found!' });
//     res.status(500).send('Server Error');
//   }
// };
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

// delete controller
exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: 'Failed to delete the product',
      });
    }
    res.json({
      message: 'Deletion was a success',
      deletedProduct,
    });
  });
};

// update controllers
exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: 'problem with image',
      });
    }

    //updation code
    let product = req.product;
    product = _.extend(product, fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: 'File size too big!',
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }
    // console.log(product);

    //save to the DB
    product.save((err, product) => {
      if (err) {
        res.status(400).json({
          error: 'Updation of product failed',
        });
      }
      res.json(product);
    });
  });
};

//product listing

exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id';

  Product.find()
    .select('-photo')
    .populate('category')
    .sort([[sortBy, 'asc']])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: 'NO product FOUND',
        });
      }
      res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct('category', {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: 'NO category found',
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: 'Bulk operation failed',
      });
    }
    next();
  });
};
