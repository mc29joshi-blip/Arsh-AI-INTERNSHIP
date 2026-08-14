import Product from '../models/Product.js';

// @desc    Get all products (with search & filtering)
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  const { search, category, lowStock } = req.query;

  let query = {};

  // Text search on name or SKU
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  try {
    let products = await Product.find(query)
      .populate('supplier', 'name')
      .sort({ createdAt: -1 });

    // Filter by low stock if specified
    if (lowStock === 'true') {
      products = products.filter(
        (product) => product.stockQuantity <= product.reorderLevel
      );
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('supplier', 'name');
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  const { name, sku, description, category, price, stockQuantity, reorderLevel, supplier } = req.body;

  try {
    if (!name || !sku || !category || price === undefined) {
      return res.status(400).json({ message: 'Please fill in all required fields: name, sku, category, price' });
    }

    // Check SKU uniqueness
    const skuExists = await Product.findOne({ sku });
    if (skuExists) {
      return res.status(400).json({ message: 'A product with this SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku,
      description,
      category,
      price,
      stockQuantity: stockQuantity || 0,
      reorderLevel: reorderLevel || 10,
      supplier: supplier || null,
    });

    const populatedProduct = await Product.findById(product._id).populate('supplier', 'name');
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  const { name, sku, description, category, price, stockQuantity, reorderLevel, supplier } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check SKU uniqueness if SKU changes
    if (sku && sku !== product.sku) {
      const skuExists = await Product.findOne({ sku });
      if (skuExists) {
        return res.status(400).json({ message: 'A product with this SKU already exists' });
      }
      product.sku = sku;
    }

    product.name = name || product.name;
    product.description = description !== undefined ? description : product.description;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.stockQuantity = stockQuantity !== undefined ? stockQuantity : product.stockQuantity;
    product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;
    product.supplier = supplier !== undefined ? (supplier || null) : product.supplier;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id).populate('supplier', 'name');
    res.json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
