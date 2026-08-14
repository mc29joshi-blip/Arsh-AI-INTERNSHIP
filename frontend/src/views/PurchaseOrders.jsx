import React, { useState, useEffect } from 'react';
import api from '../api';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState([{ product: '', quantity: 1, price: 0 }]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/purchase-orders');
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load purchase orders.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliersAndProducts = async () => {
    try {
      const [suppliersRes, productsRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/products'),
      ]);
      setSuppliers(suppliersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error('Error fetching support lists:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliersAndProducts();
  }, []);

  const handleAddItemLine = () => {
    setOrderItems([...orderItems, { product: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItemLine = (index) => {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    
    if (field === 'product') {
      const prod = products.find((p) => p._id === value);
      updated[index] = {
        ...updated[index],
        product: value,
        price: prod ? prod.price : 0,
      };
    } else if (field === 'quantity') {
      updated[index] = {
        ...updated[index],
        quantity: Math.max(1, Number(value)),
      };
    } else if (field === 'price') {
      updated[index] = {
        ...updated[index],
        price: Math.max(0, Number(value)),
      };
    }

    setOrderItems(updated);
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleOpenCreate = () => {
    setSelectedSupplier('');
    setOrderItems([{ product: '', quantity: 1, price: 0 }]);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Form validation
    if (!selectedSupplier) {
      return setError('Please select a supplier.');
    }

    const invalidItem = orderItems.find((item) => !item.product || item.quantity <= 0);
    if (invalidItem) {
      return setError('Please verify all items have products and positive quantities.');
    }

    try {
      const { data } = await api.post('/purchase-orders', {
        supplier: selectedSupplier,
        products: orderItems,
      });

      setOrders([data, ...orders]);
      setSuccess(`Drafted Purchase Order ${data.orderNumber} successfully.`);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating purchase order.');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setError('');
    setSuccess('');

    try {
      const { data } = await api.put(`/purchase-orders/${id}/status`, { status: newStatus });
      setOrders(orders.map((o) => (o._id === id ? data : o)));
      setSuccess(`Purchase Order status updated to '${newStatus}'. Stock quantities updated.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase order history?')) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/purchase-orders/${id}`);
      setOrders(orders.filter((o) => o._id !== id));
      setSuccess('Purchase order removed.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Purchase Orders</h2>
          <p className="text-secondary mb-0">Procure stock from suppliers and monitor incoming shipments</p>
        </div>
        <button className="btn btn-cyan d-flex align-items-center gap-2" onClick={handleOpenCreate}>
          <i className="bi bi-plus-lg"></i>
          <span>Create PO</span>
        </button>
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

      {showForm && (
        <div className="glass-panel p-4 mb-4">
          <h4 className="fw-bold text-white mb-4">Draft Procurement Order</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Vendor Supplier</label>
                <select
                  className="form-select glass-input glass-select"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  required
                >
                  <option value="" style={{ background: '#0b0f19' }}>Select Supplier Partner</option>
                  {suppliers.map((sup) => (
                    <option key={sup._id} value={sup._id} style={{ background: '#0b0f19' }}>
                      {sup.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <h6 className="fw-bold text-white mb-3">Line Items</h6>
            {orderItems.map((item, index) => (
              <div key={index} className="row g-3 align-items-end mb-3">
                <div className="col-12 col-md-5">
                  <label className="form-label text-secondary small">Select Product</label>
                  <select
                    className="form-select glass-input glass-select"
                    value={item.product}
                    onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                    required
                  >
                    <option value="" style={{ background: '#0b0f19' }}>Choose Product...</option>
                    {products.map((prod) => (
                      <option key={prod._id} value={prod._id} style={{ background: '#0b0f19' }}>
                        {prod.name} (SKU: {prod.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label text-secondary small">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control glass-input"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    required
                  />
                </div>

                <div className="col-6 col-md-3">
                  <label className="form-label text-secondary small">Unit Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control glass-input"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-1 text-md-center">
                  <button
                    type="button"
                    className="btn btn-outline-danger p-2 border-0 bg-transparent"
                    onClick={() => handleRemoveItemLine(index)}
                    disabled={orderItems.length <= 1}
                    style={{ color: '#ef4444' }}
                  >
                    <i className="bi bi-trash-fill" style={{ fontSize: '1.2rem' }}></i>
                  </button>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-outline-cyan btn-sm mb-4 d-flex align-items-center gap-1" onClick={handleAddItemLine}>
              <i className="bi bi-plus-lg"></i>
              <span>Add Product Line</span>
            </button>

            <div className="d-flex justify-content-between align-items-center border-top border-color pt-3 mt-4">
              <h5 className="fw-bold text-white mb-0">Total Amount: <span className="text-cyan">${calculateTotal().toFixed(2)}</span></h5>
              <div className="d-flex gap-3">
                <button type="button" className="btn btn-outline-cyan" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-cyan">
                  Save Draft PO
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Orders Grid/Table */}
      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-cyan" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : orders.length > 0 ? (
          <div className="glass-table-container">
            <table className="table glass-table">
              <thead>
                <tr>
                  <th>PO Number</th>
                  <th>Supplier / Vendor</th>
                  <th>Items Purchased</th>
                  <th>Order Date</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="fw-bold text-white">{order.orderNumber}</td>
                    <td>
                      <span className="fw-semibold text-white d-block">
                        {order.supplier ? order.supplier.name : <em className="text-muted">Deleted Supplier</em>}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        {order.products.map((item, idx) => (
                          <div key={idx} className="text-secondary text-truncate" style={{ maxWidth: '250px' }}>
                            {item.product ? item.product.name : 'Unknown Product'} x{item.quantity} (${item.price.toFixed(2)})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="text-muted small">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="fw-semibold text-white">${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'Received' ? 'badge-glass-green' : 
                        order.status === 'Pending' ? 'badge-glass-amber' : 'badge-glass-danger'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {order.status === 'Pending' && (
                        <div className="d-inline-flex gap-2">
                          <button
                            className="btn btn-outline-green btn-sm px-2 py-1 text-success border-success"
                            style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}
                            onClick={() => handleUpdateStatus(order._id, 'Received')}
                            title="Mark as Received"
                          >
                            <i className="bi bi-check-lg me-1"></i> Receive
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm px-2 py-1 text-danger border-danger"
                            style={{ fontSize: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
                            onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                            title="Cancel Order"
                          >
                            <i className="bi bi-x-lg me-1"></i> Cancel
                          </button>
                        </div>
                      )}
                      
                      {order.status !== 'Received' && (
                        <button className="btn btn-link text-danger p-1 ms-2 border-0 bg-transparent" onClick={() => handleDelete(order._id)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-file-earmark-arrow-down text-muted mb-3 d-block" style={{ fontSize: '3rem' }}></i>
            <h5>No purchase orders found.</h5>
            <p className="small">Initiate procurement drafts by using the 'Create PO' command.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseOrders;
