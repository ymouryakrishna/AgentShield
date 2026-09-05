const { db } = require('../config/database');
const { NotFoundError } = require('../utils/errors');

exports.getAllProducts = (req, res) => {
  const uniqueProducts = [];
  const seen = new Set();
  for (const [id, prod] of db.products.entries()) {
    if (!seen.has(prod.id)) {
      seen.add(prod.id);
      uniqueProducts.push(prod);
    }
  }

  res.json({
    success: true,
    count: uniqueProducts.length,
    products: uniqueProducts,
  });
};

exports.getProductById = (req, res, next) => {
  try {
    const product = db.products.get(req.params.id);
    if (!product) {
      throw new NotFoundError(`Product '${req.params.id}' not found in catalog.`);
    }
    res.json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};
