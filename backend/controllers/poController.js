import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';

// @desc    Get all purchase orders
// @route   GET /api/purchase-orders
// @access  Private
const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find({})
      .populate('supplier', 'name contactPerson')
      .populate('products.product', 'name sku price')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get purchase order by ID
// @route   GET /api/purchase-orders/:id
// @access  Private
const getPurchaseOrderById = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('supplier', 'name contactPerson email phone')
      .populate('products.product', 'name sku price stockQuantity');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Purchase order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new purchase order
// @route   POST /api/purchase-orders
// @access  Private
const createPurchaseOrder = async (req, res) => {
  const { supplier, products } = req.body;

  try {
    if (!supplier || !products || products.length === 0) {
      return res.status(400).json({ message: 'Supplier and at least one product is required' });
    }

    // Generate unique order number PO-YYYYMMDD-Random
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `PO-${dateStr}-${randSuffix}`;

    // Verify products exist and calculate total amount
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.product} not found` });
      }
      
      const itemPrice = item.price !== undefined ? item.price : product.price;
      totalAmount += itemPrice * item.quantity;
      
      orderProducts.push({
        product: item.product,
        quantity: item.quantity,
        price: itemPrice,
      });
    }

    const newOrder = await PurchaseOrder.create({
      orderNumber,
      supplier,
      products: orderProducts,
      status: 'Pending',
      totalAmount,
    });

    const populatedOrder = await PurchaseOrder.findById(newOrder._id)
      .populate('supplier', 'name')
      .populate('products.product', 'name sku');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update purchase order status (triggers smart stock update)
// @route   PUT /api/purchase-orders/:id/status
// @access  Private
const updatePOStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (order.status === 'Received') {
      return res.status(400).json({ message: 'Purchase order has already been received and cannot be updated.' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Cancelled purchase orders cannot be updated.' });
    }

    if (!['Pending', 'Received', 'Cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Smart Stock Update Logic:
    // If transitioning to 'Received', add the ordered quantity to the products' stock
    if (status === 'Received') {
      for (const item of order.products) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stockQuantity += item.quantity;
          await product.save();
        }
      }
      order.receivedDate = new Date();
    }

    order.status = status;
    const updatedOrder = await order.save();

    const populatedOrder = await PurchaseOrder.findById(updatedOrder._id)
      .populate('supplier', 'name')
      .populate('products.product', 'name sku');

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete purchase order (only if Pending or Cancelled)
// @route   DELETE /api/purchase-orders/:id
// @access  Private
const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    if (order.status === 'Received') {
      return res.status(400).json({ message: 'Cannot delete a received purchase order' });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);
    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePOStatus,
  deletePurchaseOrder,
};
