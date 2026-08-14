import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from './models/User.js';
import Product from './models/Product.js';
import Supplier from './models/Supplier.js';
import PurchaseOrder from './models/PurchaseOrder.js';
import Sale from './models/Sale.js';

dotenv.config();

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart_inventory';
    await mongoose.connect(mongoUri);
    console.log('Connected to database for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Supplier.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await Sale.deleteMany({});
    console.log('Cleared existing collections.');

    // 1. Seed Users
    const admin = await User.create({
      username: 'Administrator',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin'
    });

    const manager = await User.create({
      username: 'WarehouseManager',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager'
    });

    console.log('Seeded Users: admin@company.com (admin123), manager@company.com (manager123)');

    // 2. Seed Suppliers
    const supplier1 = await Supplier.create({
      name: 'Global Tech Supplies',
      contactPerson: 'Sarah Connor',
      email: 'sarah@globaltech.com',
      phone: '+1 (555) 123-4567',
      address: '742 Evergreen Terrace, Springfield'
    });

    const supplier2 = await Supplier.create({
      name: 'Apex Electronics',
      contactPerson: 'Bruce Wayne',
      email: 'bruce@apex.com',
      phone: '+1 (555) 987-6543',
      address: '1007 Mountain Drive, Gotham City'
    });

    const supplier3 = await Supplier.create({
      name: 'Horizon Warehouse',
      contactPerson: 'Tony Stark',
      email: 'tony@horizon.com',
      phone: '+1 (555) 246-8101',
      address: '10880 Malibu Point, Malibu'
    });

    const supplier4 = await Supplier.create({
      name: 'Summit Logistical',
      contactPerson: 'Diana Prince',
      email: 'diana@summit.com',
      phone: '+1 (555) 135-7924',
      address: 'Themyscira Embassy, Boston'
    });

    console.log('Seeded Suppliers.');

    // 3. Seed Products
    const p1 = await Product.create({
      name: 'Core CPU i9 14th Gen',
      sku: 'EL-CPU-I9',
      description: 'High-performance 24-core desktop processor.',
      category: 'Electronics',
      price: 499.99,
      stockQuantity: 15,
      reorderLevel: 5,
      supplier: supplier1._id
    });

    const p2 = await Product.create({
      name: 'Nvidia RTX 4080 Super',
      sku: 'EL-GPU-4080',
      description: '16GB GDDR6X ray-tracing graphics card.',
      category: 'Electronics',
      price: 1199.99,
      stockQuantity: 3, // LOW STOCK
      reorderLevel: 5,
      supplier: supplier1._id
    });

    const p3 = await Product.create({
      name: 'Wireless Router Pro WiFi 7',
      sku: 'NET-RTR-09',
      description: 'Tri-band gigabit high speed router.',
      category: 'Networking',
      price: 189.99,
      stockQuantity: 40,
      reorderLevel: 10,
      supplier: supplier2._id
    });

    const p4 = await Product.create({
      name: 'Cat6 Ethernet Cable 10m',
      sku: 'NET-CAB-10',
      description: 'High durability shielded RJ45 cable.',
      category: 'Networking',
      price: 12.50,
      stockQuantity: 8, // LOW STOCK
      reorderLevel: 15,
      supplier: supplier2._id
    });

    const p5 = await Product.create({
      name: 'Mechanical Gaming Keyboard',
      sku: 'ACC-KEY-MECH',
      description: 'RGB mechanical keyboard with brown switches.',
      category: 'Accessories',
      price: 110.00,
      stockQuantity: 25,
      reorderLevel: 10,
      supplier: supplier3._id
    });

    const p6 = await Product.create({
      name: 'Ergonomic Office Chair',
      sku: 'ACC-CHR-ERGO',
      description: 'Adjustable mesh office chair with lumbar support.',
      category: 'Accessories',
      price: 299.00,
      stockQuantity: 12,
      reorderLevel: 4,
      supplier: supplier4._id
    });

    console.log('Seeded Products.');

    // 4. Seed Sales
    const d1 = new Date(); d1.setDate(d1.getDate() - 3);
    const d2 = new Date(); d2.setDate(d2.getDate() - 2);
    const d3 = new Date(); d3.setDate(d3.getDate() - 1);
    const d4 = new Date(); // Today

    await Sale.create({
      saleNumber: 'SALE-20260723-8199',
      products: [
        { product: p3._id, quantity: 2, price: 189.99 },
        { product: p5._id, quantity: 1, price: 110.00 }
      ],
      totalAmount: 489.98,
      saleDate: d1
    });

    await Sale.create({
      saleNumber: 'SALE-20260724-1022',
      products: [
        { product: p1._id, quantity: 1, price: 499.99 },
        { product: p5._id, quantity: 2, price: 110.00 }
      ],
      totalAmount: 719.99,
      saleDate: d2
    });

    await Sale.create({
      saleNumber: 'SALE-20260725-4560',
      products: [
        { product: p6._id, quantity: 2, price: 299.00 }
      ],
      totalAmount: 598.00,
      saleDate: d3
    });

    await Sale.create({
      saleNumber: 'SALE-20260726-2911',
      products: [
        { product: p2._id, quantity: 1, price: 1199.99 },
        { product: p4._id, quantity: 3, price: 12.50 }
      ],
      totalAmount: 1237.49,
      saleDate: d4
    });

    console.log('Seeded Sales History.');

    // 5. Seed Purchase Orders
    await PurchaseOrder.create({
      orderNumber: 'PO-20260721-3990',
      supplier: supplier1._id,
      products: [
        { product: p1._id, quantity: 10, price: 450.00 },
        { product: p2._id, quantity: 5, price: 1100.00 }
      ],
      status: 'Received',
      totalAmount: 10000.00,
      orderDate: d1,
      receivedDate: d2
    });

    await PurchaseOrder.create({
      orderNumber: 'PO-20260724-5100',
      supplier: supplier4._id,
      products: [
        { product: p6._id, quantity: 5, price: 250.00 }
      ],
      status: 'Pending',
      totalAmount: 1250.00,
      orderDate: d2
    });

    await PurchaseOrder.create({
      orderNumber: 'PO-20260726-9021',
      supplier: supplier2._id,
      products: [
        { product: p4._id, quantity: 20, price: 10.00 }
      ],
      status: 'Cancelled',
      totalAmount: 200.00,
      orderDate: d4
    });

    console.log('Seeded Purchase Orders.');
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
