const { db } = require('../config/database');

exports.getProducts = (req, res) => {
  res.json({
    success: true,
    count: db.products.length,
    products: db.products,
  });
};

exports.getAICatalog = (req, res) => {
  const aiCatalog = {
    version: '2026.1.0',
    merchant: {
      name: 'AgentShield Athletic Goods',
      currency: 'INR',
      protocol: 'AgentCommerce-v1',
      supportedActions: ['DISCOVERY', 'NEGOTIATE', 'COUNTER_OFFER', 'ACCEPT_OFFER', 'DIRECT_PURCHASE'],
      firewallRulesEnforced: true,
    },
    catalog: db.products.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      description: p.description,
      price: p.price,
      currency: p.currency,
      stock: p.stock,
      negotiable: p.negotiable,
      negotiation: {
        floorPrice: p.negotiation.floorPrice,
        maxDiscountPercent: p.negotiation.maxDiscountPercent,
        maxRounds: p.negotiation.maxRounds,
        bundleEligibility: p.negotiation.allowBundles,
        bundleRule: p.negotiation.bundle ? {
          gift: p.negotiation.bundle.freeGift,
          thresholdPrice: p.negotiation.bundle.minimumPrice
        } : null,
        customerConfirmationRequired: p.negotiation.requireCustomerConfirmation,
      },
      crossSellIds: p.crossSellIds,
      upsellIds: p.upsellIds,
      attributes: p.attributes,
    }))
  };

  res.setHeader('X-Agent-Commerce-Protocol', 'AgentCommerce-v1');
  res.setHeader('X-Shield-Policy-Enforced', 'true');
  res.json(aiCatalog);
};

exports.getPolicies = (req, res) => {
  res.json({
    success: true,
    merchantName: 'AgentShield Athletic Goods',
    globalConstraints: {
      currency: 'INR',
      maxGlobalOrderValue: 100000,
      promptInjectionDefense: 'STRICT_DETERMINISTIC_V1',
      customerConfirmationMandatory: true,
      maxGlobalRounds: 5,
    },
    productEnvelopes: db.products.map(p => ({
      productId: p.id,
      productName: p.name,
      listedPrice: p.price,
      floorPrice: p.negotiation.floorPrice,
      maxDiscountPercent: p.negotiation.maxDiscountPercent,
      maxRounds: p.negotiation.maxRounds,
      allowBundles: p.negotiation.allowBundles,
      bundle: p.negotiation.bundle,
    })),
  });
};

exports.updatePolicy = (req, res) => {
  const { productId, floorPrice, maxDiscountPercent, maxRounds, bundleMinimumPrice } = req.body;
  const product = db.products.find(p => p.id === productId);

  if (!product) {
    return res.status(404).json({ success: false, code: 'PRODUCT_NOT_FOUND', message: 'Product not found' });
  }

  if (floorPrice !== undefined) product.negotiation.floorPrice = Number(floorPrice);
  if (maxDiscountPercent !== undefined) product.negotiation.maxDiscountPercent = Number(maxDiscountPercent);
  if (maxRounds !== undefined) product.negotiation.maxRounds = Number(maxRounds);
  if (bundleMinimumPrice !== undefined && product.bundle) {
    product.bundle.minimumPrice = Number(bundleMinimumPrice);
  }

  res.json({
    success: true,
    message: 'Policy envelope updated successfully.',
    product,
  });
};
