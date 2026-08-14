import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <i className="bi bi-box-seam-fill text-cyan" style={{ fontSize: '1.5rem' }}></i>
        <span className="ms-1">Smart Stock</span>
      </div>

      {user && (
        <div className="d-flex align-items-center gap-3 mb-4 px-2 py-2 rounded" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div className="rounded-circle d-flex align-items-center justify-content-center bg-cyan text-dark" style={{ width: '40px', height: '40px', fontWeight: '800', backgroundColor: '#06b6d4' }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h6 className="mb-0 text-truncate text-white" style={{ fontSize: '0.9rem', fontWeight: '600' }}>{user.username}</h6>
            <span className="badge-glass-cyan text-uppercase" style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem' }}>{user.role}</span>
          </div>
        </div>
      )}

      <ul className="sidebar-menu">
        <li className="sidebar-item">
          <NavLink to="/" className="sidebar-link" end>
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/products" className="sidebar-link">
            <i className="bi bi-box-seam"></i>
            <span>Products</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/suppliers" className="sidebar-link">
            <i className="bi bi-truck"></i>
            <span>Suppliers</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/purchase-orders" className="sidebar-link">
            <i className="bi bi-file-earmark-arrow-down"></i>
            <span>Purchase Orders</span>
          </NavLink>
        </li>
        <li className="sidebar-item">
          <NavLink to="/sales" className="sidebar-link">
            <i className="bi bi-cart-check"></i>
            <span>Sales & Checkout</span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar-footer">
        <button className="btn btn-link sidebar-link w-100 text-start border-0 bg-transparent p-2 text-danger" onClick={logout} style={{ color: '#ef4444' }}>
          <i className="bi bi-box-arrow-left"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
