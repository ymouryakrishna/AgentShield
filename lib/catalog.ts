import { Product } from './types';

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'shoe-001',
    name: 'AeroStride Pro Running Shoes',
    category: 'Footwear',
    description: 'Ultra-lightweight breathable engineered mesh running shoes with responsive foam cushioning and carbon-plate stability.',
    price: 2499,
    currency: 'INR',
    stock: 24,
    negotiable: true,
    negotiation: {
      floorPrice: 2200,
      maxDiscountPercent: 12,
      maxRounds: 3,
      allowBundles: true,
      bundle: {
        freeGift: 'Pro Cushion Sports Socks (Pair)',
        freeGiftProductId: 'socks-004',
        minimumPrice: 2299,
        description: 'Complimentary high-traction sports socks when settling at or above ₹2,299',
      },
      requireCustomerConfirmation: true,
      maxOrderValue: 50000,
    },
    bundle: {
      freeGift: 'Pro Cushion Sports Socks (Pair)',
      freeGiftProductId: 'socks-004',
      minimumPrice: 2299,
      description: 'Complimentary high-traction sports socks when settling at or above ₹2,299',
    },
    crossSellIds: ['socks-004', 'bottle-005'],
    upsellIds: ['bag-003'],
    attributes: {
      brand: 'AeroStride',
      sizesAvailable: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
      color: 'Phantom Black / Neon Shield',
      weightGrams: 240,
      intendedUse: 'Road Running / Marathon / Gym',
    },
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'tshirt-002',
    name: 'DryFit Velocity Sports T-Shirt',
    category: 'Apparel',
    description: 'Anti-odor quick-drying athletic performance tee with ergonomic seam placement for friction-free movement.',
    price: 899,
    currency: 'INR',
    stock: 45,
    negotiable: true,
    negotiation: {
      floorPrice: 799,
      maxDiscountPercent: 11.2,
      maxRounds: 3,
      allowBundles: false,
      requireCustomerConfirmation: true,
      maxOrderValue: 25000,
    },
    crossSellIds: ['socks-004', 'bottle-005'],
    upsellIds: ['shoe-001'],
    attributes: {
      brand: 'ShieldAthletics',
      sizesAvailable: ['S', 'M', 'L', 'XL', 'XXL'],
      material: '100% Recycled Poly-Spandex',
      color: 'Midnight Slate',
    },
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bag-003',
    name: 'Shield Armour Waterproof Gym Bag',
    category: 'Accessories',
    description: '45L tactical gym duffel bag featuring dedicated ventilated shoe compartment and waterproof wet pouch.',
    price: 1299,
    currency: 'INR',
    stock: 18,
    negotiable: true,
    negotiation: {
      floorPrice: 1149,
      maxDiscountPercent: 12,
      maxRounds: 3,
      allowBundles: true,
      bundle: {
        freeGift: 'Thermal Gym Shaker / Bottle',
        freeGiftProductId: 'bottle-005',
        minimumPrice: 1249,
        description: 'Complimentary 750ml water bottle when closing at or above ₹1,249',
      },
      requireCustomerConfirmation: true,
      maxOrderValue: 30000,
    },
    bundle: {
      freeGift: 'Thermal Gym Shaker / Bottle',
      freeGiftProductId: 'bottle-005',
      minimumPrice: 1249,
      description: 'Complimentary 750ml water bottle when closing at or above ₹1,249',
    },
    crossSellIds: ['bottle-005', 'socks-004'],
    upsellIds: ['shoe-001'],
    attributes: {
      capacityLiters: 45,
      material: '900D Ballistic Nylon',
      waterproof: true,
      compartments: 6,
    },
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'socks-004',
    name: 'Pro Cushion Sports Socks (3-Pack)',
    category: 'Apparel',
    description: 'Arch-support anti-blister sports socks with moisture-wicking technology and reinforced heel cushion.',
    price: 299,
    currency: 'INR',
    stock: 90,
    negotiable: true,
    negotiation: {
      floorPrice: 249,
      maxDiscountPercent: 16.7,
      maxRounds: 2,
      allowBundles: false,
      requireCustomerConfirmation: true,
      maxOrderValue: 15000,
    },
    crossSellIds: ['shoe-001', 'tshirt-002'],
    upsellIds: ['shoe-001'],
    attributes: {
      packCount: 3,
      material: 'Organic Cotton + Elastane',
      fit: 'Crew Length',
    },
    imageUrl: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'bottle-005',
    name: 'HydroShield Insulated Stainless Bottle (750ml)',
    category: 'Accessories',
    description: 'Double-wall vacuum insulated flask keeping drinks cold for 24h or piping hot for 12h. BPA-free lid.',
    price: 499,
    currency: 'INR',
    stock: 35,
    negotiable: true,
    negotiation: {
      floorPrice: 449,
      maxDiscountPercent: 10,
      maxRounds: 2,
      allowBundles: false,
      requireCustomerConfirmation: true,
      maxOrderValue: 20000,
    },
    crossSellIds: ['bag-003', 'tshirt-002'],
    upsellIds: ['bag-003'],
    attributes: {
      capacityMl: 750,
      insulationHoursCold: 24,
      insulationHoursHot: 12,
      material: '18/8 Food-Grade Stainless Steel',
    },
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
  }
];

export function getProductById(id: string): Product | undefined {
  return SEED_PRODUCTS.find(p => p.id === id);
}

export function getAllProducts(): Product[] {
  return SEED_PRODUCTS;
}

export function getAICatalogRepresentation() {
  return {
    version: '2026.1.0',
    merchant: {
      name: 'AgentShield Athletic Goods',
      currency: 'INR',
      protocol: 'AgentCommerce-v1',
      supportedActions: ['DISCOVERY', 'NEGOTIATE', 'COUNTER_OFFER', 'ACCEPT_OFFER', 'DIRECT_PURCHASE'],
      firewallRulesEnforced: true,
    },
    catalog: SEED_PRODUCTS.map(p => ({
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
}
