import { roundCurrency } from '../../utils/crypto.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const safeNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const safeImages = (values, fallback) => {
  const list = (Array.isArray(values) ? values : [values])
    .filter((value) => typeof value === 'string' && value.trim())
    .map((value) => value.trim())
    .slice(0, 12);

  if (list.length > 0) return list;
  return fallback ? [fallback] : [];
};

const stockFor = (index) => ((index + 1) % 19 === 0 ? 0 : 6 + ((index * 13) % 95));

export const normalizeCategory = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const categoryLabel = (value = '') =>
  String(value)
    .trim()
    .replace(/\b[a-z]/g, (character) => character.toUpperCase());

const baseAttributes = (product, category) =>
  Object.fromEntries(
    Object.entries({
      originalCategory: category,
      weight: product.weight,
      dimensions: product.dimensions
        ? `${product.dimensions.width} × ${product.dimensions.height} × ${product.dimensions.depth} cm`
        : undefined,
      barcode: product.meta?.barcode || product.barcode,
      availabilityStatus: product.availabilityStatus,
      minimumOrderQuantity: product.minimumOrderQuantity,
      sku: product.sku,
      sourceProductId: product.id,
    }).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );

export const normalizeFakeStoreProduct = (product, index) => {
  const category = normalizeCategory(product.category);
  const image = safeImages(product.image)[0] || '';

  return {
    title: String(product.title || 'Untitled product').slice(0, 200),
    description: String(product.description || 'No description available.').slice(0, 5000),
    price: roundCurrency(Math.max(0, safeNumber(product.price))),
    currency: 'USD',
    category,
    categoryLabel: categoryLabel(product.category),
    brand: product.brand || 'Unbranded',
    images: safeImages(product.image, image),
    thumbnail: image,
    rating: {
      rate: Math.round(clamp(safeNumber(product.rating?.rate), 0, 5) * 10) / 10,
      count: Math.max(0, safeNumber(product.rating?.count)),
    },
    stock: stockFor(index),
    sku: `FS-${product.id}`,
    discountPercentage: index % 4 === 0 ? 10 : 0,
    tags: [...new Set([category, ...(product.tags || [])])],
    attributes: baseAttributes(product, product.category),
    warrantyInformation: '1-year limited warranty',
    shippingInformation: 'Ships in 2–4 business days',
    returnPolicy: '30-day returns on unused items',
    isFeatured: index % 9 === 0,
    source: {
      provider: 'fakestore',
      externalId: String(product.id),
      url: `https://fakestoreapi.com/products/${product.id}`,
      fetchedAt: new Date(),
    },
  };
};

export const normalizeDummyJsonProduct = (product, index) => {
  const category = normalizeCategory(product.category);
  const images = safeImages(product.images, product.thumbnail);
  const reviewCount = Array.isArray(product.reviews) ? product.reviews.length : 0;

  return {
    title: String(product.title || 'Untitled product').slice(0, 200),
    description: String(product.description || 'No description available.').slice(0, 5000),
    price: roundCurrency(Math.max(0, safeNumber(product.price))),
    currency: 'USD',
    category,
    categoryLabel: categoryLabel(product.category),
    brand: product.brand || 'Unbranded',
    images,
    thumbnail: product.thumbnail || images[0] || '',
    rating: {
      rate: Math.round(clamp(safeNumber(product.rating), 0, 5) * 10) / 10,
      count: Math.max(reviewCount, safeNumber(product.stock) > 0 ? 8 : 0),
    },
    stock: Math.max(0, Math.floor(safeNumber(product.stock, stockFor(index)))),
    sku: `DJ-${product.id}`,
    discountPercentage: clamp(safeNumber(product.discountPercentage), 0, 100),
    tags: [...new Set([category, ...(product.tags || [])].filter(Boolean))],
    attributes: baseAttributes(product, product.category),
    warrantyInformation: product.warrantyInformation || '',
    shippingInformation: product.shippingInformation || 'Ships within 3 business days',
    returnPolicy: product.returnPolicy || '30-day returns',
    isFeatured: index % 11 === 0,
    source: {
      provider: 'dummyjson',
      externalId: String(product.id),
      url: `https://dummyjson.com/products/${product.id}`,
      fetchedAt: new Date(),
    },
  };
};
