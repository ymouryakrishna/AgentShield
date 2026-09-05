const { db } = require('../config/database');

exports.getCatalog = (req, res) => {
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
    merchant: {
      id: 'demo-merchant',
      name: 'AgentShield Sports & Athletics',
      currency: 'INR',
    },
    count: uniqueProducts.length,
    products: uniqueProducts,
  });
};

exports.getAICatalog = (req, res) => {
  const uniqueProducts = [];
  const seen = new Set();
  for (const [id, prod] of db.products.entries()) {
    if (!seen.has(prod.id)) {
      seen.add(prod.id);
      uniqueProducts.push(prod);
    }
  }

  const aiCatalog = {
    version: '2026.1.0',
    merchant: {
      id: 'demo-merchant',
      name: 'AgentShield Sports & Athletics',
      currency: 'INR',
      protocol: 'AgentCommerce-v1',
      supportedActions: ['DISCOVERY', 'NEGOTIATE', 'COUNTER_OFFER', 'ACCEPT_OFFER', 'DIRECT_PURCHASE', 'PURCHASE'],
      firewallRulesEnforced: true,
    },
    negotiation: {
      supported: true,
      maxRounds: 3,
      dynamicConcessionEnabled: true,
    },
    products: uniqueProducts.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      listPrice: p.listPrice,
      price: p.listPrice,
      currency: 'INR',
      stock: p.stock,
      negotiable: p.negotiable,
      floorPrice: p.floorPrice,
      maxDiscountPercent: p.maxDiscountPercent,
      maxNegotiationRounds: p.maxNegotiationRounds,
      bundleRules: p.bundleRules,
      crossSellProducts: p.crossSellProducts,
      upsellProducts: p.upsellProducts,
      attributes: p.attributes,
    })),
  };

  res.setHeader('X-Agent-Commerce-Protocol', 'AgentCommerce-v1');
  res.setHeader('X-Agent-Shield-Protected', 'true');
  res.json(aiCatalog);
};
