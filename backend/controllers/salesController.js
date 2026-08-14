import Sale from '../models/Sale.js';
import Product from '../models/Product.js';

// @desc    Get all sales
// @route   GET /api/sales
// @access  Private
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({})
      .populate('products.product', 'name sku price')
      .sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sale by ID
// @route   GET /api/sales/:id
// @access  Private
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('products.product', 'name sku price');

    if (sale) {
      res.json(sale);
    } else {
      res.status(404).json({ message: 'Sale record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new sale (triggers smart stock deduction and check)
// @route   POST /api/sales
// @access  Private
const createSale = async (req, res) => {
  const { products } = req.body;

  try {
    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Please add at least one product to the sale' });
    }

    // Step 1: Pre-validation. Check stock availability for all products in cart
    for (const item of products) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product '${product.name}'. Current stock: ${product.stockQuantity}, requested: ${item.quantity}.` 
        });
      }
    }

    // Step 2: Deduct stock and compile final sales line items
    let totalAmount = 0;
    const saleProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      
      // Deduct stock
      product.stockQuantity -= item.quantity;
      await product.save();

      const itemPrice = item.price !== undefined ? item.price : product.price;
      totalAmount += itemPrice * item.quantity;

      saleProducts.push({
        product: item.product,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    // Step 3: Generate unique sale number SALE-YYYYMMDD-Random
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const saleNumber = `SALE-${dateStr}-${randSuffix}`;

    const newSale = await Sale.create({
      saleNumber,
      products: saleProducts,
      totalAmount,
    });

    const populatedSale = await Sale.findById(newSale._id)
      .populate('products.product', 'name sku');

    res.status(201).json(populatedSale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getSales,
  getSaleById,
  createSale,
};
