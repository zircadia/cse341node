const Product = require('../models/product');

const { validationResult } = require('express-validator');

exports.getAddProduct = (req, res, next) => {
  const cartLength = req.user.cart.items.reduce(function(a,b) {
    return parseInt(`${a}`) + parseInt(`${b.quantity}`);
  }, 0);
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    cartLength: cartLength,
    product: [],
    validationErrors: []
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const cartLength = req.user.cart.items.reduce(function(a,b) {
    return parseInt(`${a}`) + parseInt(`${b.quantity}`);
  }, 0);
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            path: '/admin/add-product',
            pageTitle: 'Add Product',
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            product: {
                title: title,
                imageUrl: imageUrl,
                description: description
            },
            cartLength: cartLength,
            validationErrors: errors.array()
        });
    }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    // Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      const cartLength = req.user.cart.items.reduce(function(a,b) {
        return parseInt(`${a}`) + parseInt(`${b.quantity}`);
      }, 0);
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: true,
        hasError: false,
        errorMessage: null,
        product: product,
        cartLength: cartLength,
        validationErrors: []
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const cartLength = req.user.cart.items.reduce(function(a,b) {
      return parseInt(`${a}`) + parseInt(`${b.quantity}`);
    }, 0);
      return res.status(422).render('admin/edit-product', {
          path: '/admin/edit-product',
          pageTitle: 'Edit Product',
          editing: true,
          hasError: true,
          cartLength: cartLength,
          errorMessage: errors.array()[0].msg,
          product: {
              title: updatedTitle,
              imageUrl: updatedImageUrl,
              description: updatedDesc,
              _id: prodId
          },
          validationErrors: errors.array()
      });
  }

  Product.findById(prodId).then(product => {
    if(product.userId.toString() !== req.user._id.toString()) {
      return res.redirect('/');
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDesc;
    product.imageUrl = updatedImageUrl;
    return product.save()
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  })
    
};

exports.getProducts = (req, res, next) => {
  Product.find({userId: req.user._id})
    .then(products => {
      const cartLength = req.user.cart.items.reduce(function(a,b) {
        return parseInt(`${a}`) + parseInt(`${b.quantity}`);
      }, 0);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        cartLength: cartLength
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({ _id: prodId, userId: req.user._id })
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
