import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Supplier from '../models/Supplier.js';

// @desc    Get dashboard metrics and analysis
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // 1. Core counters
    const totalProducts = await Product.countDocuments({});
    const totalSuppliers = await Supplier.countDocuments({});
    const totalSalesCount = await Sale.countDocuments({});
    const totalPOCount = await PurchaseOrder.countDocuments({});

    // 2. Evaluate Stock Quantity Value and Low Stock counts
    const allProducts = await Product.find({});
    let totalStockValue = 0;
    let lowStockCount = 0;
    const lowStockAlerts = [];

    allProducts.forEach((product) => {
      totalStockValue += product.price * product.stockQuantity;
      if (product.stockQuantity <= product.reorderLevel) {
        lowStockCount++;
        lowStockAlerts.push({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          stockQuantity: product.stockQuantity,
          reorderLevel: product.reorderLevel,
        });
      }
    });

    // 3. Sales total revenue
    const allSales = await Sale.find({});
    const totalSalesRevenue = allSales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    // 4. Sales Trends (last 7 days aggregate)
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const dailySales = await Sale.find({
        saleDate: { $gte: startOfDay, $lte: endOfDay },
      });

      const dayTotal = dailySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
      const dayName = startOfDay.toLocaleDateString('en-US', { weekday: 'short' });
      salesTrend.push({
        date: dayName,
        sales: dayTotal,
      });
    }

    // 5. Category Distribution (Quantities in stock by category)
    const categoryCounts = {};
    allProducts.forEach((product) => {
      if (categoryCounts[product.category]) {
        categoryCounts[product.category] += product.stockQuantity;
      } else {
        categoryCounts[product.category] = product.stockQuantity;
      }
    });

    const categoryDistribution = Object.keys(categoryCounts).map((cat) => ({
      name: cat,
      value: categoryCounts[cat],
    }));

    // 6. Recent items list
    const recentSales = await Sale.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('products.product', 'name');

    const recentPOs = await PurchaseOrder.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('supplier', 'name')
      .populate('products.product', 'name');

    res.json({
      counters: {
        totalProducts,
        totalSuppliers,
        totalSalesCount,
        totalPOCount,
        lowStockCount,
        totalStockValue: Math.round(totalStockValue * 100) / 100,
        totalSalesRevenue: Math.round(totalSalesRevenue * 100) / 100,
      },
      lowStockAlerts: lowStockAlerts.slice(0, 5),
      salesTrend,
      categoryDistribution,
      recentSales,
      recentPOs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getDashboardStats };
