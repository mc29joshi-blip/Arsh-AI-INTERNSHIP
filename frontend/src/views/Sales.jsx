import React, { useState, useEffect } from 'react';
import api from '../api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // POS / Cart State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [cart, setCart] = useState([]);

  const fetchSalesAndProducts = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes] = await Promise.all([
        api.get('/sales'),
        api.get('/products'),
      ]);
      setSales(salesRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sales details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesAndProducts();
  }, []);

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    setError('');

    const productObj = products.find((p) => p._id === selectedProduct);
    if (!productObj) return;

    if (productObj.stockQuantity <= 0) {
      return setError(`Cannot add '${productObj.name}' to cart. Product is completely out of stock.`);
    }

    // Check if item already in cart
    const existingIndex = cart.findIndex((item) => item.product === selectedProduct);

    if (existingIndex > -1) {
      const existingItem = cart[existingIndex];
      if (existingItem.quantity >= productObj.stockQuantity) {
        return setError(`Cannot add more '${productObj.name}'. Exceeds available stock quantity (${productObj.stockQuantity}).`);
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, {
        product: productObj._id,
        name: productObj.name,
        sku: productObj.sku,
        price: productObj.price,
        maxStock: productObj.stockQuantity,
        quantity: 1,
      }]);
    }
    
    setSelectedProduct('');
  };

  const handleUpdateCartQty = (index, delta) => {
    setError('');
    const updated = [...cart];
    const item = updated[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      updated.splice(index, 1);
    } else if (newQty > item.maxStock) {
      setError(`Cannot set quantity higher. Only ${item.maxStock} units of '${item.name}' are in stock.`);
    } else {
      item.quantity = newQty;
    }

    setCart(updated);
  };

  const handleRemoveFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const calculateCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (cart.length === 0) {
      return setError('Cart is empty. Please add products first.');
    }

    try {
      const payload = cart.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
      }));

      const { data } = await api.post('/sales', { products: payload });

      setSales([data, ...sales]);
      setSuccess(`Sale logged successfully! Invoice ID: ${data.saleNumber}`);
      setCart([]);
      
      // Refresh products list to reflect deducted quantities
      const prodRes = await api.get('/products');
      setProducts(prodRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing sales checkout.');
    }
  };

  // Find stock info for currently selected dropdown product
  const currentSelectedObj = products.find((p) => p._id === selectedProduct);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Sales Register</h2>
          <p className="text-secondary mb-0">Record customer invoices and monitor outgoing product sales</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 text-danger bg-opacity-10 bg-danger rounded-3 p-3 mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <i className="bi bi-exclamation-octagon-fill me-2"></i>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success border-0 text-success bg-opacity-10 bg-success rounded-3 p-3 mb-4" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
          <i className="bi bi-check-circle-fill me-2"></i>
          {success}
        </div>
      )}

      <div className="row g-4">
        {/* POS Cashier Cart */}
        <div className="col-12 col-lg-5">
          <div className="glass-panel p-4">
            <h4 className="fw-bold text-white mb-4">New Sale Checkout</h4>

            <div className="row g-2 mb-4">
              <div className="col-12 col-md-9">
                <select
                  className="form-select glass-input glass-select"
                  value={selectedProduct}
                  onChange={(e) => {
                    setSelectedProduct(e.target.value);
                    setError('');
                  }}
                >
                  <option value="" style={{ background: '#0b0f19' }}>Scan or Select Product...</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} style={{ background: '#0b0f19' }} disabled={p.stockQuantity <= 0}>
                      {p.name} (SKU: {p.sku}) {p.stockQuantity <= 0 ? ' [OUT OF STOCK]' : ` - $${p.price.toFixed(2)}`}
                    </option>
                  ))}
                </select>
                {currentSelectedObj && (
                  <div className="mt-1 ps-1 text-secondary" style={{ fontSize: '0.75rem' }}>
                    Available Stock Quantity: {' '}
                    <span className={currentSelectedObj.stockQuantity <= currentSelectedObj.reorderLevel ? 'text-warning fw-semibold' : 'text-success fw-semibold'}>
                      {currentSelectedObj.stockQuantity} units
                    </span>
                  </div>
                )}
              </div>
              <div className="col-12 col-md-3">
                <button type="button" className="btn btn-cyan w-100 py-2" onClick={handleAddToCart} disabled={!selectedProduct}>
                  <i className="bi bi-cart-plus me-1"></i> Add
                </button>
              </div>
            </div>

            <div className="mb-4" style={{ minHeight: '180px' }}>
              <h6 className="fw-bold text-white mb-3">Invoice Details</h6>
              {cart.length > 0 ? (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
                  {cart.map((item, index) => (
                    <div key={item.product} className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                      <div className="overflow-hidden" style={{ flexGrow: 1, marginRight: '10px' }}>
                        <span className="text-white fw-semibold small d-block text-truncate">{item.name}</span>
                        <span className="text-muted small" style={{ fontSize: '0.7rem' }}>SKU: {item.sku} | ${item.price.toFixed(2)}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button type="button" className="btn btn-sm btn-outline-cyan px-1 py-0" onClick={() => handleUpdateCartQty(index, -1)}>
                          <i className="bi bi-dash"></i>
                        </button>
                        <span className="text-white small fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button type="button" className="btn btn-sm btn-outline-cyan px-1 py-0" onClick={() => handleUpdateCartQty(index, 1)}>
                          <i className="bi bi-plus"></i>
                        </button>
                        <button type="button" className="btn btn-link text-danger p-0 border-0 bg-transparent ms-2" onClick={() => handleRemoveFromCart(index)} style={{ color: '#ef4444' }}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5 text-secondary rounded small" style={{ border: '1px dashed var(--border-color)', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <i className="bi bi-cart3 text-muted mb-2 d-block" style={{ fontSize: '1.5rem' }}></i>
                  Invoice cart is empty.
                </div>
              )}
            </div>

            <div className="border-top border-color pt-3 mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-secondary fw-semibold">Total Invoice Amount:</span>
                <span className="text-cyan fw-bold h4 mb-0">${calculateCartTotal().toFixed(2)}</span>
              </div>
              <button
                type="button"
                className="btn btn-cyan w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                <i className="bi bi-wallet2"></i>
                <span>Complete Checkout & Print Invoice</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sales Logs */}
        <div className="col-12 col-lg-7">
          <div className="glass-panel p-4">
            <h4 className="fw-bold text-white mb-4">Historical Invoices Log</h4>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-cyan" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : sales.length > 0 ? (
              <div className="glass-table-container">
                <table className="table glass-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Products Sold</th>
                      <th>Total Value</th>
                      <th>Sale Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale._id}>
                        <td className="fw-bold text-white">{sale.saleNumber}</td>
                        <td>
                          <div style={{ fontSize: '0.85rem' }}>
                            {sale.products.map((item, idx) => (
                              <div key={idx} className="text-secondary text-truncate" style={{ maxWidth: '300px' }}>
                                {item.product ? item.product.name : 'Deleted Product'} x{item.quantity} (${item.price.toFixed(2)})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="fw-semibold text-cyan">${sale.totalAmount.toFixed(2)}</td>
                        <td className="text-muted small">{new Date(sale.saleDate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-wallet2 text-muted mb-3 d-block" style={{ fontSize: '3rem' }}></i>
                <h5>No sales recorded yet.</h5>
                <p className="small">Perform client checkout actions in the cash card pane.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;
