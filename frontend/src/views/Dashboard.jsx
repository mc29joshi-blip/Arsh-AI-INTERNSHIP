import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/dashboard/stats');
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-cyan" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 text-danger bg-opacity-10 bg-danger rounded-3 p-3 my-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
        <i className="bi bi-exclamation-octagon-fill me-2"></i>
        {error}
      </div>
    );
  }

  const { counters, lowStockAlerts, salesTrend, categoryDistribution, recentSales, recentPOs } = stats;

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-1">Executive Dashboard</h2>
          <p className="text-secondary mb-0">Overview of operations and warehouse metrics</p>
        </div>
        <button className="btn btn-outline-cyan btn-sm d-flex align-items-center gap-2" onClick={fetchStats}>
          <i className="bi bi-arrow-clockwise"></i>
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="glass-panel glass-panel-hover stat-card p-3">
            <div className="stat-card-icon cyan">
              <i className="bi bi-currency-dollar"></i>
            </div>
            <h6 className="text-secondary small mb-1">Total Stock Value</h6>
            <h3 className="fw-bold text-white mb-0">${counters.totalStockValue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="glass-panel glass-panel-hover stat-card p-3">
            <div className="stat-card-icon green">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <h6 className="text-secondary small mb-1">Total Sales Revenue</h6>
            <h3 className="fw-bold text-white mb-0">${counters.totalSalesRevenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="glass-panel glass-panel-hover stat-card p-3">
            <div className="stat-card-icon purple">
              <i className="bi bi-box"></i>
            </div>
            <h6 className="text-secondary small mb-1">Total Products</h6>
            <h3 className="fw-bold text-white mb-0">{counters.totalProducts}</h3>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="glass-panel glass-panel-hover stat-card p-3" style={counters.lowStockCount > 0 ? { border: '1px solid rgba(245, 158, 11, 0.3)' } : {}}>
            <div className={`stat-card-icon ${counters.lowStockCount > 0 ? 'amber' : 'green'}`}>
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h6 className="text-secondary small mb-1">Low Stock Warnings</h6>
            <h3 className={`fw-bold mb-0 ${counters.lowStockCount > 0 ? 'text-warning' : 'text-success'}`}>
              {counters.lowStockCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Graphs Row */}
      <div className="row g-4 mb-4">
        {/* Sales Trend Line Chart */}
        <div className="col-12 col-lg-8">
          <div className="glass-panel p-4">
            <h5 className="fw-bold text-white mb-3">Revenue Performance (7 Days)</h5>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} 
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }} 
                  />
                  <Line type="monotone" dataKey="sales" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6, stroke: '#0b0f19', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="col-12 col-lg-4">
          <div className="glass-panel p-4">
            <h5 className="fw-bold text-white mb-3">Stock Category Split</h5>
            <div className="chart-container d-flex align-items-center justify-content-center" style={{ minHeight: '230px' }}>
              {categoryDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-secondary small text-center">No inventory to analyze.</div>
              )}
            </div>
            <div className="d-flex flex-wrap gap-2 justify-content-center mt-2">
              {categoryDistribution.map((item, index) => (
                <div key={item.name} className="d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                  <span className="d-inline-block rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="text-secondary">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Records */}
      <div className="row g-4">
        {/* Recent Sales */}
        <div className="col-12 col-xl-6">
          <div className="glass-panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white mb-0">Recent Sales Outflow</h5>
              <i className="bi bi-cart-check text-cyan" style={{ fontSize: '1.25rem' }}></i>
            </div>
            <div className="glass-table-container">
              <table className="table glass-table small">
                <thead>
                  <tr>
                    <th>Invoice ID</th>
                    <th>Items</th>
                    <th>Value</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.length > 0 ? (
                    recentSales.map((sale) => (
                      <tr key={sale._id}>
                        <td className="fw-bold text-white">{sale.saleNumber}</td>
                        <td className="text-secondary">{sale.products.length} Products</td>
                        <td className="fw-semibold text-cyan">${sale.totalAmount.toLocaleString()}</td>
                        <td className="text-muted">{new Date(sale.saleDate).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-secondary py-3">No sales logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent POs */}
        <div className="col-12 col-xl-6">
          <div className="glass-panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-white mb-0">Recent Procurements</h5>
              <i className="bi bi-file-earmark-arrow-down text-purple" style={{ fontSize: '1.25rem' }}></i>
            </div>
            <div className="glass-table-container">
              <table className="table glass-table small">
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPOs.length > 0 ? (
                    recentPOs.map((po) => (
                      <tr key={po._id}>
                        <td className="fw-bold text-white">{po.orderNumber}</td>
                        <td className="text-secondary text-truncate" style={{ maxWidth: '120px' }}>
                          {po.supplier ? po.supplier.name : 'Unknown'}
                        </td>
                        <td className="fw-semibold text-white">${po.totalAmount.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${
                            po.status === 'Received' ? 'badge-glass-green' : 
                            po.status === 'Pending' ? 'badge-glass-amber' : 'badge-glass-danger'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-secondary py-3">No POs logged.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert */}
      {lowStockAlerts.length > 0 && (
        <div className="glass-panel p-4 mt-4" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
          <div className="d-flex align-items-center gap-2 mb-3">
            <i className="bi bi-exclamation-triangle-fill text-warning"></i>
            <h5 className="fw-bold text-white mb-0">Critical Warehouse Replenishment Actions Required</h5>
          </div>
          <div className="row g-3">
            {lowStockAlerts.map((alert) => (
              <div key={alert._id} className="col-12 col-md-6 col-lg-4">
                <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  <div className="overflow-hidden">
                    <h6 className="mb-0 text-white text-truncate">{alert.name}</h6>
                    <span className="text-muted small">SKU: {alert.sku}</span>
                  </div>
                  <div className="text-end">
                    <div className="text-danger fw-bold">{alert.stockQuantity} Left</div>
                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>Trigger Level: {alert.reorderLevel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
