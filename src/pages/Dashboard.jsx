import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout as doLogout } from '../services/authService';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  function handleLogout() {
    doLogout();
    navigate('/login', { replace: true });
  }

  const orders = useMemo(() => {
    // Mock data similar to the design
    return [
      { id: '83HKDH', name: 'Earphones', stockValue: '343K', qty: '23K', status: 'Delivered' },
      { id: '83HKDH', name: 'Marketing', stockValue: '83K', qty: '20K', status: 'Cancelled' },
      { id: '83HKDH', name: 'Design', stockValue: '73K', qty: '14K', status: 'Delivered' },
      { id: '63HGDH', name: 'Marketing', stockValue: '28K', qty: '11K', status: 'Delivered' },
      { id: '83HKDH', name: 'Design', stockValue: '23K', qty: '7K', status: 'Cancelled' },
      { id: '83H2DH', name: 'Marketing', stockValue: '63K', qty: '35K', status: 'Delivered' },
      { id: '13H0H', name: 'Design', stockValue: '38K', qty: '1000K', status: 'Cancelled' },
    ];
  }, []);

  const filtered = useMemo(() => {
    let rows = orders;
    if (activeTab === 'cancelled') rows = rows.filter((o) => o.status === 'Cancelled');
    if (activeTab === 'completed') rows = rows.filter((o) => o.status === 'Delivered');
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      rows = rows.filter((o) => `${o.id} ${o.name}`.toLowerCase().includes(q));
    }
    return rows;
  }, [orders, activeTab, query]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function changePage(next) {
    setPage(Math.min(Math.max(1, next), totalPages));
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="profile">
          <div className="avatar">NK</div>
          <div className="profile-info">
            <div className="name">Nirmal Kumar P</div>
            <div className="email">nirmal@email.com</div>
          </div>
        </div>
        <nav className="nav">
          <button className="nav-item">Dashboard</button>
          <button className="nav-item">Inventory</button>
          <button className="nav-item active">Orders</button>
          <button className="nav-item">Purchase</button>
          <button className="nav-item">Reporting</button>
          <button className="nav-item">Support</button>
          <button className="nav-item">Settings</button>
        </nav>
        <button className="logout" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="search-pill">
            <span className="icon">🔍</span>
            <input
              className="search"
              placeholder="Search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" aria-label="notifications">🔔</button>
            <button className="icon-btn" aria-label="settings">⚙️</button>
          </div>
        </header>

        <section className="panel">
          <div className="panel-head">
            <div className="title">Order History</div>
            <div className="filters">
              <div className="date">📅 13-03-2023</div>
              <div className="date">To 13-03-2023</div>
            </div>
          </div>

          <div className="tabs underline">
            <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => { setActiveTab('all'); setPage(1); }}>All Orders</button>
            <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => { setActiveTab('summary'); setPage(1); }}>Summary</button>
            <button className={`tab ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => { setActiveTab('completed'); setPage(1); }}>Completed</button>
            <button className={`tab ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => { setActiveTab('cancelled'); setPage(1); }}>Cancelled</button>
          </div>

          <div className="table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>S No</th>
                  <th>Order ID</th>
                  <th>Order Name</th>
                  <th>Stock Value</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {current.length === 0 && (
                  <tr><td colSpan={6} className="empty">No orders found</td></tr>
                )}
                {current.map((o, idx) => (
                  <tr key={`${o.id}-${idx}`}>
                    <td>{(page - 1) * pageSize + idx + 1}</td>
                    <td>{o.id}</td>
                    <td>{o.name}</td>
                    <td>{o.stockValue}</td>
                    <td>{o.qty}</td>
                    <td>
                      <span className={`status ${o.status === 'Cancelled' ? 'cancelled' : 'delivered'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination dots">
            <button onClick={() => changePage(page - 1)} disabled={page === 1} aria-label="Previous" />
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={page === i + 1 ? 'active' : ''}
                onClick={() => changePage(i + 1)}
                aria-label={`Page ${i + 1}`}
              />
            ))}
            <button onClick={() => changePage(page + 1)} disabled={page === totalPages} aria-label="Next" />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;


