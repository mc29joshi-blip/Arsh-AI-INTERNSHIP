import React, { useState, useEffect } from 'react';
import api from '../api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [lowStock, setLowStock] = useState(false);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: 0,
    stockQuantity: 0,
    reorderLevel: 10,
    supplier: '',
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (lowStock) params.lowStock = 'true';

      const { data } = await api.get('/products', { params });
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [search, category, lowStock]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'stockQuantity' || name === 'reorderLevel' ? Number(value) : value,
    });
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: '',
      price: 0,
      stockQuantity: 0,
      reorderLevel: 10,
      supplier: '',
    });
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setEditId(product._id);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
      reorderLevel: product.reorderLevel,
      supplier: product.supplier?._id || product.supplier || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const submissionData = { ...formData };
      if (!submissionData.supplier) delete submissionData.supplier; // clean empty values

      if (editId) {
        const { data } = await api.put(`/products/${editId}`, submissionData);
        setProducts(products.map((p) => (p._id === editId ? data : p)));
      } else {
        const { data } = await api.post('/products', submissionData);
        setProducts([data, ...products]);
      }
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product records.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setError('');

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting product.');
    }
  };

  const uniqueCategories = [...new Set(products.map((p) => p.category))];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Product Inventory</h2>
          <p className="text-secondary mb-0">Monitor catalog items, stock limits, and suppliers</p>
        </div>
        <button className="btn btn-cyan d-flex align-items-center gap-2" onClick={handleOpenCreate}>
          <i className="bi bi-plus-lg"></i>
          <span>Add Product</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger border-0 text-danger bg-opacity-10 bg-danger rounded-3 p-3 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <i className="bi bi-exclamation-octagon-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Filters Control bar */}
      <div className="glass-panel p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-transparent border-end-0 border-color text-muted" style={{ border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control glass-input border-start-0 ps-0"
                placeholder="Search by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <select
              className="form-select glass-input glass-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" style={{ background: '#0b0f19' }}>All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat} style={{ background: '#0b0f19' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <div className="form-check form-switch ps-4">
              <input
                className="form-check-input glass-input"
                type="checkbox"
                role="switch"
                id="lowStockFilter"
                checked={lowStock}
                onChange={(e) => setLowStock(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <label className="form-check-label text-secondary small ms-2" htmlFor="lowStockFilter" style={{ cursor: 'pointer' }}>
                Low Stock Warnings Only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main product management block */}
      {showForm ? (
        <div className="glass-panel p-4 mb-4">
          <h4 className="fw-bold text-white mb-4">{editId ? 'Modify Product Details' : 'Create New Product'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Product Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control glass-input"
                  placeholder="e.g. Wireless Router"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">SKU Code (Unique ID)</label>
                <input
                  type="text"
                  name="sku"
                  className="form-control glass-input"
                  placeholder="e.g. NET-RTR-09"
                  value={formData.sku}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-control glass-input"
                  placeholder="e.g. Networking"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Supplier / Vendor</label>
                <select
                  name="supplier"
                  className="form-select glass-input glass-select"
                  value={formData.supplier}
                  onChange={handleInputChange}
                >
                  <option value="" style={{ background: '#0b0f19' }}>No Supplier Assigned</option>
                  {suppliers.map((sup) => (
                    <option key={sup._id} value={sup._id} style={{ background: '#0b0f19' }}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Unit Price ($)</label>
                <input
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  className="form-control glass-input"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Starting Stock</label>
                <input
                  type="number"
                  name="stockQuantity"
                  min="0"
                  className="form-control glass-input"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label text-secondary small">Reorder Threshold Level</label>
                <input
                  type="number"
                  name="reorderLevel"
                  min="0"
                  className="form-control glass-input"
                  value={formData.reorderLevel}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label text-secondary small">Product Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className="form-control glass-input"
                  placeholder="Write description notes..."
                  value={formData.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button type="button" className="btn btn-outline-cyan" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-cyan">
                {editId ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Products Table list */}
      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-cyan" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="glass-table-container">
            <table className="table glass-table">
              <thead>
                <tr>
                  <th>Product SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock Quantity</th>
                  <th>Supplier</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const isOutOfStock = product.stockQuantity <= 0;
                  const isLowStock = product.stockQuantity <= product.reorderLevel;

                  return (
                    <tr key={product._id}>
                      <td className="fw-bold text-white">{product.sku}</td>
                      <td>
                        <div>
                          <span className="fw-semibold text-white d-block">{product.name}</span>
                          {product.description && <span className="text-muted small text-truncate d-inline-block" style={{ maxWidth: '200px' }}>{product.description}</span>}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{product.category}</span>
                      </td>
                      <td className="fw-semibold">${product.price.toFixed(2)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge ${
                            isOutOfStock ? 'badge-glass-danger' : 
                            isLowStock ? 'badge-glass-amber' : 'badge-glass-green'
                          }`}>
                            {product.stockQuantity} in stock
                          </span>
                          {isOutOfStock && <span className="text-danger small" style={{ fontSize: '0.7rem' }}>OUT</span>}
                          {!isOutOfStock && isLowStock && <span className="text-warning small" style={{ fontSize: '0.7rem' }}>LOW</span>}
                        </div>
                      </td>
                      <td className="text-secondary small">
                        {product.supplier ? product.supplier.name : <em className="text-muted">None</em>}
                      </td>
                      <td className="text-end">
                        <button className="btn btn-link text-cyan p-1 me-2 border-0 bg-transparent" onClick={() => handleOpenEdit(product)}>
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button className="btn btn-link text-danger p-1 border-0 bg-transparent" onClick={() => handleDelete(product._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-box-seam text-muted mb-3 d-block" style={{ fontSize: '3rem' }}></i>
            <h5>No products found matching filters.</h5>
            <p className="small">Try adding a new product or adjust the search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
