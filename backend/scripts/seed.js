import axios from 'axios';
import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { roundCurrency } from '../utils/crypto.js';
import { slugify } from '../utils/slugify.js';
import {
  customerBlueprints,
  resolveVendorIndex,
  reviewBlueprints,
  vendorBlueprints,
} from './data/seedData.js';
import { normalizeDummyJsonProduct, normalizeFakeStoreProduct } from './lib/normalizers.js';

const SOURCES = [
  {
    name: 'FakeStore API',
    url: 'https://fakestoreapi.com/products',
    extract: (data) => (Array.isArray(data) ? data : []),
    normalize: normalizeFakeStoreProduct,
  },
  {
    name: 'DummyJSON',
    url: 'https://dummyjson.com/products?limit=100&skip=0',
    extract: (data) => (Array.isArray(data?.products) ? data.products : []),
    normalize: normalizeDummyJsonProduct,
  },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchJson = async (url, attempts = 3) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const { data } = await axios.get(url, {
        timeout: 20_000,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'NexviaSeedBot/1.0',
        },
      });

      return data;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(750 * attempt);
    }
  }

  throw lastError;
};

const fetchProducts = async () => {
  const settled = await Promise.allSettled(SOURCES.map((source) => fetchJson(source.url)));
  const normalized = [];

  settled.forEach((result, index) => {
    const source = SOURCES[index];

    if (result.status === 'rejected') {
      console.warn(`[seed] ${source.name} unavailable: ${result.reason?.message || result.reason}`);
      return;
    }

    const rows = source.extract(result.value);
    if (rows.length === 0) {
      console.warn(`[seed] ${source.name} returned no products.`);
      return;
    }

    const mapped = rows.map((row, rowIndex) => source.normalize(row, rowIndex));
    normalized.push(...mapped);
    console.log(`[seed] Fetched ${mapped.length} products from ${source.name}.`);
  });

  if (normalized.length === 0) {
    throw new Error('No products could be fetched. Check your network connection and try again.');
  }

  const seen = new Set();
  return normalized.filter((product) => {
    const key = `${product.source.provider}:${product.source.externalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const clearDatabase = async () => {
  console.log('[seed] Clearing existing marketplace collections…');

  await Order.deleteMany({});
  await Review.deleteMany({});
  await Product.deleteMany({});
  await Store.deleteMany({});
  await User.deleteMany({});

  await Promise.all([
    User.syncIndexes(),
    Store.syncIndexes(),
    Product.syncIndexes(),
    Review.syncIndexes(),
    Order.syncIndexes(),
  ]);
};

const createAccounts = async () => {
  const admin = await User.create({
    name: 'Nexvia Admin',
    email: 'admin@nexvia.dev',
    password: env.seed.adminPassword,
    role: 'admin',
    isEmailVerified: true,
    isActive: true,
    avatar: 'https://picsum.photos/seed/nexvia-admin/200/200',
  });

  const vendors = [];

  for (const blueprint of vendorBlueprints) {
    const user = await User.create({
      name: blueprint.ownerName,
      email: blueprint.email,
      password: env.seed.vendorPassword,
      role: 'vendor',
      phone: blueprint.phone,
      isEmailVerified: true,
      avatar: `https://picsum.photos/seed/${blueprint.slug}-owner/200/200`,
    });

    const store = await Store.create({
      owner: user._id,
      name: blueprint.name,
      slug: blueprint.slug,
      description: blueprint.description,
      logo: blueprint.logo,
      banner: blueprint.banner,
      email: blueprint.email,
      phone: blueprint.phone,
      address: blueprint.address,
      settings: blueprint.settings,
      socials: blueprint.socials,
      policies: blueprint.policies,
      status: 'active',
      isVerified: true,
    });

    vendors.push({ user, store, blueprint });
  }

  const customers = [];

  for (const blueprint of customerBlueprints) {
    const user = await User.create({
      name: blueprint.name,
      email: blueprint.email,
      password: env.seed.customerPassword,
      role: 'customer',
      phone: blueprint.phone,
      isEmailVerified: true,
      avatar: `https://picsum.photos/seed/${slugify(blueprint.name)}/200/200`,
      addresses: [{ ...blueprint.address, label: 'Home', isDefault: true }],
    });

    customers.push({ user, blueprint });
  }

  return { admin, vendors, customers };
};

const createProducts = async (fetchedProducts, vendors) => {
  const docs = fetchedProducts.map((product, index) => {
    const vendor = vendors[resolveVendorIndex(product.category)];

    return {
      ...product,
      slug: `${slugify(product.title) || 'product'}-${product.source.provider}-${product.source.externalId}`,
      vendorId: vendor.user._id,
      storeId: vendor.store._id,
      soldCount: (index * 7) % 140,
      status: 'active',
    };
  });

  const products = await Product.insertMany(docs);
  console.log(`[seed] Inserted ${products.length} products across ${vendors.length} stores.`);

  return products;
};

const createReviews = async (products, customers) => {
  const docs = [];

  products.forEach((product, productIndex) => {
    const reviewCount = 2 + (productIndex % 3);

    for (let offset = 0; offset < reviewCount; offset += 1) {
      const customer = customers[(productIndex + offset) % customers.length];
      const template = reviewBlueprints[(productIndex + offset) % reviewBlueprints.length];
      const rating = 3 + ((productIndex + offset) % 3);

      docs.push({
        product: product._id,
        user: customer.user._id,
        rating,
        title: template.title,
        comment: template.comment.replaceAll('{product}', product.title),
        isVerifiedPurchase: rating > 3,
        helpfulCount: (productIndex * 3 + offset) % 24,
        status: 'approved',
      });
    }
  });

  const reviews = await Review.insertMany(docs);
  console.log(`[seed] Inserted ${reviews.length} product reviews.`);

  return reviews;
};

const refreshAggregateRatings = async (products) => {
  const ratingStats = await Review.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: '$product',
        rate: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (ratingStats.length > 0) {
    await Product.bulkWrite(
      ratingStats.map(({ _id, rate, count }) => ({
        updateOne: {
          filter: { _id },
          update: {
            $set: {
              'rating.rate': Math.round(rate * 10) / 10,
              'rating.count': count,
            },
          },
        },
      })),
    );
  }

  const productById = new Map(products.map((product) => [String(product._id), product]));
  const storeTotals = new Map();

  for (const stat of ratingStats) {
    const product = productById.get(String(stat._id));
    if (!product) continue;

    const key = String(product.storeId);
    const current = storeTotals.get(key) || { weighted: 0, count: 0 };
    current.weighted += stat.rate * stat.count;
    current.count += stat.count;
    storeTotals.set(key, current);
  }

  if (storeTotals.size > 0) {
    await Store.bulkWrite(
      [...storeTotals.entries()].map(([storeId, totals]) => ({
        updateOne: {
          filter: { _id: storeId },
          update: {
            $set: {
              'rating.average': Math.round((totals.weighted / totals.count) * 10) / 10,
              'rating.count': totals.count,
            },
          },
        },
      })),
    );
  }
};

const createOrders = async (products, vendors, customers) => {
  const storeById = new Map(vendors.map((vendor) => [String(vendor.store._id), vendor.store]));
  const statuses = ['delivered', 'shipped', 'processing', 'confirmed', 'delivered'];
  const itemStatusByOrder = { delivered: 'delivered', shipped: 'shipped', processing: 'confirmed', confirmed: 'confirmed' };
  const daysAgoByOrder = [20, 4, 2, 1, 12];
  const statusNotes = {
    pending: 'Order created and awaiting payment confirmation.',
    confirmed: 'Payment confirmed and order accepted.',
    processing: 'Store is packing your items.',
    shipped: 'Package handed to the delivery partner.',
    delivered: 'Delivered successfully.',
  };
  const soldByProduct = new Map();
  let orderCount = 0;

  for (let index = 0; index < statuses.length; index += 1) {
    const customer = customers[index];
    const status = statuses[index];
    const placedAt = new Date(Date.now() - daysAgoByOrder[index] * 24 * 60 * 60 * 1000);
    const customerProducts = [
      products[(index * 9 + 3) % products.length],
      products[(index * 9 + 20) % products.length],
    ];

    const items = customerProducts.map((product, itemIndex) => {
      const quantity = (index + itemIndex) % 3 === 0 ? 2 : 1;
      const store = storeById.get(String(product.storeId));

      soldByProduct.set(
        String(product._id),
        (soldByProduct.get(String(product._id)) || 0) + quantity,
      );

      return {
        product: product._id,
        title: product.title,
        image: product.thumbnail || product.images[0] || '',
        sku: product.sku,
        price: product.price,
        quantity,
        vendorId: product.vendorId,
        storeId: product.storeId,
        commissionRate: store?.settings?.commissionRate ?? 12,
        status: itemStatusByOrder[status] || 'pending',
      };
    });

    const itemsTotal = roundCurrency(
      items.reduce((total, item) => total + item.price * item.quantity, 0),
    );
    const discount = index === 0 ? roundCurrency(itemsTotal * 0.1) : 0;
    const shippingFee = itemsTotal >= 100 ? 0 : 8.99;
    const tax = roundCurrency(itemsTotal * 0.06);

    const transferTotals = new Map();
    for (const item of items) {
      const lineTotal = roundCurrency(item.price * item.quantity);
      const platformFee = roundCurrency((lineTotal * item.commissionRate) / 100);
      const payout = roundCurrency(lineTotal - platformFee);
      const key = String(item.vendorId);
      transferTotals.set(key, roundCurrency((transferTotals.get(key) || 0) + payout));
    }

    const statusFlow = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const targetIndex = statusFlow.indexOf(status);
    const statusHistory = statusFlow.slice(0, targetIndex + 1).map((step, stepIndex) => ({
      status: step,
      note: statusNotes[step],
      at: new Date(placedAt.getTime() + stepIndex * 6 * 60 * 60 * 1000),
    }));

    await Order.create({
      customer: customer.user._id,
      items,
      shippingAddress: customer.blueprint.address,
      totals: {
        discount,
        shippingFee,
        tax,
        currency: 'USD',
      },
      payment: {
        provider: 'stripe',
        method: 'card',
        status: 'paid',
        paymentIntentId: `pi_seed_${index + 1}_${Date.now()}`,
        paidAt: new Date(placedAt.getTime() + 5 * 60 * 1000),
        transfers: [...transferTotals.entries()].map(([vendorId, amount]) => ({
          vendorId,
          amount,
          status: 'paid',
          transferId: `tr_seed_${index + 1}_${vendorId.slice(-6)}`,
          transferredAt: new Date(placedAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        })),
      },
      status,
      statusHistory,
      placedAt,
      deliveredAt: status === 'delivered' ? statusHistory.at(-1).at : undefined,
      notes: {
        customer: index === 1 ? 'Please leave the package at the front desk.' : '',
      },
    });

    orderCount += 1;
  }

  if (soldByProduct.size > 0) {
    await Product.bulkWrite(
      [...soldByProduct.entries()].map(([productId, quantity]) => ({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { soldCount: quantity } },
        },
      })),
    );
  }

  console.log(`[seed] Inserted ${orderCount} sample orders with split-payment transfers.`);

  return orderCount;
};

const printSummary = ({ vendors, customers }, products, reviews, orders, admin) => {
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log(' Nexvia Marketplace seed complete');
  console.log('──────────────────────────────────────────────────────────────');
  console.log(` Users: ${1 + vendors.length + customers.length}  |  Stores: ${vendors.length}`);
  console.log(` Products: ${products.length}  |  Reviews: ${reviews.length}  |  Orders: ${orders}`);
  console.log('\n Demo accounts');
  console.log(` Admin     admin@nexvia.dev / ${env.seed.adminPassword}`);
  console.log(` Vendor    ${vendors[0].blueprint.email} / ${env.seed.vendorPassword}`);
  console.log(` Customer  ${customers[0].blueprint.email} / ${env.seed.customerPassword}`);
  console.log(`\n Admin ID: ${admin._id}`);
  console.log('──────────────────────────────────────────────────────────────\n');
};

const run = async () => {
  if (env.isProduction && process.env.FORCE_SEED !== 'true') {
    throw new Error('Seeding is disabled in production. Set FORCE_SEED=true only on a disposable database.');
  }

  await connectDB();

  const fetchedProducts = await fetchProducts();
  await clearDatabase();

  const accounts = await createAccounts();
  const products = await createProducts(fetchedProducts, accounts.vendors);
  const reviews = await createReviews(products, accounts.customers);

  await refreshAggregateRatings(products);
  const orderCount = await createOrders(products, accounts.vendors, accounts.customers);

  printSummary(accounts, products, reviews, orderCount, accounts.admin);
};

run()
  .catch((error) => {
    console.error('[seed] Failed:', error.message);
    if (error.errors) {
      console.error('[seed] Validation details:', error.errors);
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
  });
