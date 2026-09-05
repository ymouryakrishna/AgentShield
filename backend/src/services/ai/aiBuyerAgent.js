const { db } = require('../../config/database');

class AIBuyerAgent {
  static parseUserShoppingIntent(promptText) {
    const text = (promptText || '').toLowerCase();
    
    // Find matched product
    let matchedProduct = db.products.find(p => text.includes(p.name.toLowerCase()) || text.includes(p.category.toLowerCase()));
    
    if (!matchedProduct) {
      if (text.includes('shoe') || text.includes('running') || text.includes('sneaker')) {
        matchedProduct = db.products.find(p => p.id === 'shoe-001');
      } else if (text.includes('tshirt') || text.includes('shirt') || text.includes('tee')) {
        matchedProduct = db.products.find(p => p.id === 'tshirt-002');
      } else if (text.includes('bag') || text.includes('gym')) {
        matchedProduct = db.products.find(p => p.id === 'bag-003');
      } else if (text.includes('sock')) {
        matchedProduct = db.products.find(p => p.id === 'socks-004');
      } else if (text.includes('bottle') || text.includes('water')) {
        matchedProduct = db.products.find(p => p.id === 'bottle-005');
      } else {
        matchedProduct = db.products[0];
      }
    }

    // Determine target price
    let targetPrice = matchedProduct.negotiation.floorPrice;
    const priceMatch = text.match(/₹?\s*(\d{3,5})/);
    if (priceMatch) {
      targetPrice = parseInt(priceMatch[1], 10);
    }

    return {
      product: matchedProduct,
      targetPrice,
      strategy: 'BOUNDED_CONCESSION',
      agentId: 'agent-a-legitimate',
      agentName: 'Agent A (Smart Shopper AI)',
      message: `I found ${matchedProduct.name} (Listed: ₹${matchedProduct.price.toLocaleString('en-IN')}). I can negotiate within the merchant's bounded policy envelope.`,
    };
  }
}

module.exports = AIBuyerAgent;
