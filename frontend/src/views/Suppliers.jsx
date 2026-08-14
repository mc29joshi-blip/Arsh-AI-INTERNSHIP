import React, { useState, useEffect } from 'react';
import api from '../api';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
  });

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditId(supplier._id);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    });
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editId) {
        const { data } = await api.put(`/suppliers/${editId}`, formData);
        setSuppliers(suppliers.map((s) => (s._id === editId ? data : s)));
        setSuccess('Supplier records updated successfully.');
      } else {
        const { data } = await api.post('/suppliers', formData);
        setSuppliers([...suppliers, data]);
        setSuccess('New supplier added successfully.');
      }
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing supplier request.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/suppliers/${id}`);
      setSuppliers(suppliers.filter((s) => s._id !== id));
      setSuccess('Supplier removed from register.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error removing supplier.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Suppliers Register</h2>
          <p className="text-secondary mb-0">Manage partner vendors, contact nodes, and active contracts</p>
        </div>
        <button className="btn btn-cyan d-flex align-items-center gap-2" onClick={handleOpenCreate}>
          <i className="bi bi-plus-lg"></i>
          <span>Add Supplier</span>
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
          <h4 className="fw-bold text-white mb-4">{editId ? 'Modify Supplier Records' : 'Add New Supplier'}</h4>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Supplier Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control glass-input"
                  placeholder="e.g. Intel Corp"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  className="form-control glass-input"
                  placeholder="e.g. Sarah Connor"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-control glass-input"
                  placeholder="e.g. sales@intel.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-secondary small">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control glass-input"
                  placeholder="e.g. +1 555-0199"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label text-secondary small">Office Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control glass-input"
                  placeholder="e.g. 2200 Mission College Blvd, Santa Clara, CA"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <button type="button" className="btn btn-outline-cyan" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-cyan">
                {editId ? 'Save Changes' : 'Register Supplier'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Suppliers Table list */}
      <div className="glass-panel p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-cyan" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : suppliers.length > 0 ? (
          <div className="glass-table-container">
            <table className="table glass-table">
              <thead>
                <tr>
                  <th>Supplier / Vendor</th>
                  <th>Primary Contact</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td>
                      <span className="fw-semibold text-white d-block">{supplier.name}</span>
                    </td>
                    <td className="text-secondary">{supplier.contactPerson || <em className="text-muted">None</em>}</td>
                    <td className="text-secondary small">{supplier.email || <em className="text-muted">None</em>}</td>
                    <td className="text-secondary small">{supplier.phone || <em className="text-muted">None</em>}</td>
                    <td className="text-secondary small text-truncate" style={{ maxWidth: '200px' }}>
                      {supplier.address || <em className="text-muted">None</em>}
                    </td>
                    <td className="text-end">
                      <button className="btn btn-link text-cyan p-1 me-2 border-0 bg-transparent" onClick={() => handleOpenEdit(supplier)}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button className="btn btn-link text-danger p-1 border-0 bg-transparent" onClick={() => handleDelete(supplier._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5 text-secondary">
            <i className="bi bi-truck text-muted mb-3 d-block" style={{ fontSize: '3rem' }}></i>
            <h5>No registered suppliers.</h5>
            <p className="small">Get started by registering your first supplier partner.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
