import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiPlus, FiShoppingCart, FiBox, FiTrendingUp, FiTrendingDown, FiClock, FiPackage } from 'react-icons/fi';
import { listProducts } from '../../services/productService';
import { listCategories } from '../../services/categoryService';
import { listPurchases } from '../../services/purchaseService';
import { listRawMaterials } from '../../services/rawMaterialService';
import { listSales } from '../../services/salesService';
import { listUsers } from '../../services/userService';
import { listProductions } from '../../services/productionService';

function DashboardHome() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [p, c, pu, rm, s, u, pr] = await Promise.all([
        listProducts().catch(() => []),
        listCategories().catch(() => []),
        listPurchases().catch(() => []),
        listRawMaterials().catch(() => []),
        listSales().catch(() => []),
        listUsers().catch(() => []),
        listProductions().catch(() => []),
      ]);
      setProducts(p || []);
      setCategories(c || []);
      setPurchases(pu || []);
      setRawMaterials(rm || []);
      setSales(s || []);
      setUsers(u || []);
      setProductions(pr || []);
      setLoading(false);
      setLastUpdated(new Date());
    }
    load();

    const interval = setInterval(load, 60000); // auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0,0,0,0);
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const endOfYesterday = new Date(startOfToday);
    endOfYesterday.setMilliseconds(-1);
    const startOfWeek = new Date(startOfToday);
    const day = startOfWeek.getDay();
    const diffToMonday = (day + 6) % 7; // 0=Sunday -> 6, 1=Mon->0
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);

    const totalProducts = products.length;
    const totalCategories = categories.length;
    const totalPurchases = purchases.length;
    const totalRawMaterials = rawMaterials.length;
    const totalSales = sales.length;
    const totalUsers = users.length;
    const totalProductions = productions.length;
    const LOW_THRESHOLD = 5;
    const lowRawMaterialsList = rawMaterials.filter((m) => Number(m.quantity || 0) <= LOW_THRESHOLD);
    const lowProductsList = products.filter((p) => Number(p.quantity || 0) <= LOW_THRESHOLD);
    const lowStock = lowRawMaterialsList.length;
    const salesRevenue = sales.reduce((sum, s) => {
      if (s.totalAmount !== undefined && s.totalAmount !== null) {
        return sum + Number(s.totalAmount);
      }
      if (Array.isArray(s.items) && s.items.length > 0) {
        return sum + s.items.reduce((itemSum, it) => itemSum + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      }
      return sum;
    }, 0);
    const todaySales = sales.filter((s) => {
      const d = s.saleDate ? new Date(s.saleDate) : null;
      return d && d >= startOfToday;
    });
    const todayRevenue = todaySales.reduce((sum, s) => {
      if (s.totalAmount !== undefined && s.totalAmount !== null) {
        return sum + Number(s.totalAmount);
      }
      if (Array.isArray(s.items) && s.items.length > 0) {
        return sum + s.items.reduce((itemSum, it) => itemSum + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      }
      return sum;
    }, 0);
    const weekSales = sales.filter((s) => {
      const d = s.saleDate ? new Date(s.saleDate) : null;
      return d && d >= startOfWeek;
    });
    const weekRevenue = weekSales.reduce((sum, s) => {
      if (s.totalAmount !== undefined && s.totalAmount !== null) {
        return sum + Number(s.totalAmount);
      }
      if (Array.isArray(s.items) && s.items.length > 0) {
        return sum + s.items.reduce((itemSum, it) => itemSum + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      }
      return sum;
    }, 0);
    const inventoryValue = products.reduce((sum, p) => {
      const qty = Number(p.quantity || 0);
      const unit = Number(p.unitPrice || 0);
      return sum + (qty * unit);
    }, 0);
    const outOfStockProductsList = products.filter((p) => Number(p.quantity || 0) === 0);
    const outOfStockProducts = outOfStockProductsList.length;
    
    // Product ID to name mapping
    const productIdToName = new Map(products.map((p) => [p._id || p.id, p.name]));
    
    // Yesterday's data
    const yesterdaySales = sales.filter((s) => {
      const d = s.saleDate ? new Date(s.saleDate) : null;
      return d && d >= startOfYesterday && d < startOfToday;
    });
    const yesterdayRevenue = yesterdaySales.reduce((sum, s) => {
      if (s.totalAmount !== undefined && s.totalAmount !== null) {
        return sum + Number(s.totalAmount);
      }
      if (Array.isArray(s.items) && s.items.length > 0) {
        return sum + s.items.reduce((itemSum, it) => itemSum + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      }
      return sum;
    }, 0);
    const yesterdaySalesCount = yesterdaySales.length;
    
    // Expiring products (within 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringProducts = products.filter((p) => {
      if (!p.expiryDate) return false;
      const expiry = new Date(p.expiryDate);
      return expiry >= now && expiry <= thirtyDaysFromNow;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    
    // Recent activities
    const recentActivities = [];
    sales.slice(0, 5).forEach((s) => {
      const items = Array.isArray(s.items) ? s.items : [];
      const itemNames = items.length > 0 
        ? items.map(it => it.product?.name || productIdToName.get(it.product) || 'Product').join(', ')
        : (s.product?.name || productIdToName.get(s.product) || 'Product');
      recentActivities.push({
        type: 'sale',
        icon: '💰',
        title: `Sale to ${s.customerName || 'Walk-in'}`,
        description: itemNames,
        amount: s.totalAmount || (items.length > 0 ? items.reduce((sum, it) => sum + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0) : 0),
        date: s.saleDate ? new Date(s.saleDate) : new Date(),
        id: s._id || s.id,
      });
    });
    purchases.slice(0, 3).forEach((p) => {
      recentActivities.push({
        type: 'purchase',
        icon: '📦',
        title: `Purchase: ${p.material?.name || 'Raw Material'}`,
        description: `Quantity: ${p.quantity || 0} ${p.unit || ''}`,
        amount: p.totalPrice || 0,
        date: p.purchaseDate ? new Date(p.purchaseDate) : new Date(),
        id: p._id || p.id,
      });
    });
    productions.slice(0, 2).forEach((pr) => {
      recentActivities.push({
        type: 'production',
        icon: '🏭',
        title: `Production: ${pr.product?.name || productIdToName.get(pr.product) || 'Product'}`,
        description: `Quantity: ${pr.quantity || 0}`,
        amount: 0,
        date: pr.productionDate ? new Date(pr.productionDate) : new Date(),
        id: pr._id || pr.id,
      });
    });
    const sortedActivities = recentActivities.sort((a, b) => b.date - a.date).slice(0, 8);
    const recentSales = [...sales]
      .sort((a, b) => new Date(b.saleDate || 0) - new Date(a.saleDate || 0))
      .slice(0, 5)
      .map((s) => ({
        id: s._id || s.id,
        date: s.saleDate ? new Date(s.saleDate).toISOString().slice(0,10) : '',
        product: s.product?.name || s.product || '',
        qty: Number(s.quantity || 0),
        total: (s.totalPrice !== undefined && s.totalPrice !== null)
          ? Number(s.totalPrice)
          : Number(s.quantity || 0) * Number((s.unitPrice !== undefined && s.unitPrice !== null) ? s.unitPrice : (s.product?.unitPrice || 0)),
      }));
    const salesByProduct = new Map();
    sales.forEach((s) => {
      if (Array.isArray(s.items) && s.items.length > 0) {
        s.items.forEach((it) => {
          const pid = typeof it.product === 'object' ? (it.product?._id || it.product?.id) : it.product;
          const qty = Number(it.quantity || 0);
          if (!pid) return;
          salesByProduct.set(pid, (salesByProduct.get(pid) || 0) + qty);
        });
      } else {
        const pid = typeof s.product === 'object' ? (s.product?._id || s.product?.id) : s.product;
        const qty = Number(s.quantity || 0);
        if (!pid) return;
        salesByProduct.set(pid, (salesByProduct.get(pid) || 0) + qty);
      }
    });
    const topProducts = [...salesByProduct.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pid, qty]) => ({ name: productIdToName.get(pid) || 'Unknown', qty }));
    const modules = 7; // Products, Categories, Purchases, Raw Materials, Sales, Users, Productions
    const active = modules; // assuming all active
    const pending = 0;
    const error = 0 + (lowStock > 0 ? 1 : 0);
    const percent = Math.min(100, Math.round((active / modules) * 100));
    return {
      totalProducts,
      totalCategories,
      totalPurchases,
      totalRawMaterials,
      totalSales,
      totalUsers,
      totalProductions,
      lowStock,
      outOfStockProducts,
      outOfStockProductsList,
      lowRawMaterialsList,
      lowProductsList,
      salesRevenue,
      todayRevenue,
      todaySalesCount: todaySales.length,
      yesterdayRevenue,
      yesterdaySalesCount,
      weekRevenue,
      inventoryValue,
      modules,
      active,
      pending,
      error,
      percent,
      recentSales,
      topProducts,
      expiringProducts,
      recentActivities: sortedActivities,
    };
  }, [products, categories, purchases, rawMaterials, sales, users, productions]);

  function formatRWF(value) {
    try {
      return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(value || 0));
    } catch {
      return `RWF ${Number(value || 0).toLocaleString()}`;
    }
  }

  // Simple, dependency-free charts
  const charts = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const monthly = Array.from({ length: 12 }, () => 0);
    sales.forEach((s) => {
      if (!s.saleDate) return;
      const d = new Date(s.saleDate);
      if (d.getFullYear() !== year) return;
      let total = 0;
      if (s.totalAmount !== undefined && s.totalAmount !== null) {
        total = Number(s.totalAmount);
      } else if (Array.isArray(s.items) && s.items.length > 0) {
        total = s.items.reduce((sum, it) => sum + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      }
      monthly[d.getMonth()] += Number(isNaN(total) ? 0 : total);
    });
    const maxMonthly = Math.max(1, ...monthly);

    const counts = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date();
      day.setHours(0,0,0,0);
      day.setDate(day.getDate() - i);
      const next = new Date(day);
      next.setDate(day.getDate() + 1);
      const c = sales.filter((s) => {
        const d = s.saleDate ? new Date(s.saleDate) : null;
        return d && d >= day && d < next;
      }).length;
      counts.push({ label: `${day.getMonth()+1}/${day.getDate()}`, value: c });
    }
    const maxCount = Math.max(1, ...counts.map((c) => c.value));
    return { monthly, maxMonthly, counts, maxCount };
  }, [sales]);

  const BarChart = ({ data, max }) => {
    const w = 800; const h = 300; const pad = 50; const bottomPad = 60; const topPad = 30;
    const chartH = h - topPad - bottomPad;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const barWidth = (w - pad * 2) / data.length - 8;
    const step = (w - pad * 2) / data.length;
    
    // Calculate Y-axis labels
    const ySteps = 5;
    const yLabels = Array.from({ length: ySteps + 1 }, (_, i) => {
      const value = (max / ySteps) * (ySteps - i);
      return { value, y: topPad + (chartH / ySteps) * i };
    });

    return (
      <div className="chart-container">
        <svg className="chart-professional" viewBox={`0 0 ${w} ${h}`}>
          <defs>
            <linearGradient id="gradChart" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8fbc8f" />
              <stop offset="50%" stopColor="#6b9b6b" />
              <stop offset="100%" stopColor="#5a8a5a" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>
          
          {/* Grid lines */}
          {yLabels.map((label, i) => (
            <g key={i}>
              <line 
                x1={pad} 
                x2={w - pad} 
                y1={label.y} 
                y2={label.y} 
                className="chart-grid-line" 
                stroke="#d4e8d4" 
                strokeWidth="1"
              />
              <text 
                x={pad - 10} 
                y={label.y + 4} 
                textAnchor="end" 
                className="chart-y-label"
                fill="#5a8a5a"
                fontSize="11"
                fontWeight="500"
              >
                {formatRWF(label.value)}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((v, i) => {
            const x = pad + i * step + 4;
            const barH = (chartH * v) / (max || 1);
            const y = topPad + chartH - barH;
            const isZero = v === 0;
            
            return (
              <g key={i}>
                <rect 
                  x={x} 
                  y={y} 
                  width={barWidth} 
                  height={isZero ? 0 : Math.max(barH, 2)} 
                  className="chart-bar"
                  fill={isZero ? 'transparent' : 'url(#gradChart)'}
                  filter={isZero ? 'none' : 'url(#shadow)'}
                  rx="4"
                />
                {/* Value label on top of bar */}
                {!isZero && barH > 20 && (
                  <text 
                    x={x + barWidth / 2} 
                    y={y - 5} 
                    textAnchor="middle" 
                    className="chart-value-label"
                    fill="#1a4d2e"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {formatRWF(v)}
                  </text>
                )}
                {/* Month label */}
                <text 
                  x={x + barWidth / 2} 
                  y={h - 15} 
                  textAnchor="middle" 
                  className="chart-x-label"
                  fill="#5a8a5a"
                  fontSize="11"
                  fontWeight="500"
                >
                  {monthNames[i]}
                </text>
              </g>
            );
          })}

          {/* Y-axis line */}
          <line 
            x1={pad} 
            y1={topPad} 
            x2={pad} 
            y2={topPad + chartH} 
            stroke="#2d5a3d" 
            strokeWidth="2"
          />
          
          {/* X-axis line */}
          <line 
            x1={pad} 
            y1={topPad + chartH} 
            x2={w - pad} 
            y2={topPad + chartH} 
            stroke="#2d5a3d" 
            strokeWidth="2"
          />
        </svg>
      </div>
    );
  };

  const LineChart = ({ points, max }) => {
    const w = 520; const h = 160; const pad = 20; const step = (w - pad*2) / (points.length - 1);
    const toXY = (idx, val) => [pad + idx*step, h - pad - ((h - pad*2) * val) / (max || 1)];
    const path = points.map((p, i) => toXY(i, p.value)).map(([x,y],i) => (i===0?`M ${x} ${y}`:`L ${x} ${y}`)).join(' ');
    const area = `${path} L ${pad + (points.length-1)*step} ${h-pad} L ${pad} ${h-pad} Z`;
    return (
      <svg className="chart" viewBox={`0 0 ${520} ${160}`}>
        {[0,1,2,3].map((i) => (
          <line key={i} x1={pad} x2={520-pad} y1={pad + (i*(160-pad*2))/3} y2={pad + (i*(160-pad*2))/3} className="grid-line" />
        ))}
        <path d={area} className="area-fill" />
        <path d={path} className="line-path" />
      </svg>
    );
  };

  return (
    <div className="coach-dashboard">
      <header className="coach-top">
        <div>
          <div className="coach-subtitle">Welcome back, Admin</div>
          <h2 className="coach-title">Bena Cosmetics Dashboard</h2>
        </div>
        <div className="coach-top-actions">
          <input className="coach-search" placeholder="Search" />
          <div className="coach-avatar">AD</div>
        </div>
      </header>

      <div className="coach-scroll">
        <div className="dashboard-simple">
          {/* Quick Action Cards */}
          <section className="quick-actions">
            <div className="action-card" onClick={() => navigate('/admin-dashboard/sales')}>
              <div className="action-icon sale">
                <FiShoppingCart />
              </div>
              <div className="action-content">
                <div className="action-title">New Sale</div>
                <div className="action-desc">Create a new sale</div>
              </div>
            </div>
            <div className="action-card" onClick={() => navigate('/admin-dashboard/products')}>
              <div className="action-icon product">
                <FiPlus />
              </div>
              <div className="action-content">
                <div className="action-title">Add Product</div>
                <div className="action-desc">Add new product</div>
              </div>
            </div>
            <div className="action-card" onClick={() => navigate('/admin-dashboard/purchases')}>
              <div className="action-icon purchase">
                <FiPackage />
              </div>
              <div className="action-content">
                <div className="action-title">New Purchase</div>
                <div className="action-desc">Record purchase</div>
              </div>
            </div>
            <div className="action-card" onClick={() => navigate('/admin-dashboard/productions')}>
              <div className="action-icon production">
                <FiBox />
              </div>
              <div className="action-content">
                <div className="action-title">New Production</div>
                <div className="action-desc">Record production</div>
              </div>
            </div>
          </section>

          {/* Performance Indicators */}
          <section className="performance-indicators">
            <div className="perf-card">
              <div className="perf-header">
                <span className="perf-label">Sales Today</span>
                {stats.todayRevenue > stats.yesterdayRevenue ? (
                  <FiTrendingUp className="perf-trend up" />
                ) : stats.todayRevenue < stats.yesterdayRevenue ? (
                  <FiTrendingDown className="perf-trend down" />
                ) : null}
              </div>
              <div className="perf-value">{formatRWF(stats.todayRevenue)}</div>
              <div className="perf-comparison">
                {stats.todayRevenue > stats.yesterdayRevenue ? (
                  <span className="perf-change up">
                    +{formatRWF(stats.todayRevenue - stats.yesterdayRevenue)} vs yesterday
                  </span>
                ) : stats.todayRevenue < stats.yesterdayRevenue ? (
                  <span className="perf-change down">
                    {formatRWF(stats.todayRevenue - stats.yesterdayRevenue)} vs yesterday
                  </span>
                ) : (
                  <span className="perf-change neutral">Same as yesterday</span>
                )}
              </div>
            </div>
            <div className="perf-card">
              <div className="perf-header">
                <span className="perf-label">Sales Count</span>
                {stats.todaySalesCount > stats.yesterdaySalesCount ? (
                  <FiTrendingUp className="perf-trend up" />
                ) : stats.todaySalesCount < stats.yesterdaySalesCount ? (
                  <FiTrendingDown className="perf-trend down" />
                ) : null}
              </div>
              <div className="perf-value">{stats.todaySalesCount}</div>
              <div className="perf-comparison">
                {stats.todaySalesCount > stats.yesterdaySalesCount ? (
                  <span className="perf-change up">
                    +{stats.todaySalesCount - stats.yesterdaySalesCount} vs yesterday
                  </span>
                ) : stats.todaySalesCount < stats.yesterdaySalesCount ? (
                  <span className="perf-change down">
                    {stats.todaySalesCount - stats.yesterdaySalesCount} vs yesterday
                  </span>
                ) : (
                  <span className="perf-change neutral">Same as yesterday</span>
                )}
              </div>
            </div>
          </section>

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-title">Sales today</div>
              <div className="metric-value">{stats.todaySalesCount}</div>
              <div className="metric-sub">Revenue {formatRWF(stats.todayRevenue)}</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Week revenue</div>
              <div className="metric-value">{formatRWF(stats.weekRevenue)}</div>
              <div className="metric-sub">Auto-updating</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Products</div>
              <div className="metric-value">{stats.totalProducts}</div>
              <div className="metric-sub">Low {stats.lowProductsList.length} • OOS {stats.outOfStockProducts}</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Raw materials</div>
              <div className="metric-value">{stats.totalRawMaterials}</div>
              <div className="metric-sub">Low {stats.lowRawMaterialsList.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Purchases</div>
              <div className="metric-value">{stats.totalPurchases}</div>
              <div className="metric-sub">All time</div>
            </div>
            <div className="metric-card">
              <div className="metric-title">Users</div>
              <div className="metric-value">{stats.totalUsers}</div>
              <div className="metric-sub">Active modules {stats.modules}</div>
            </div>
          </div>

          <section className="card top-products-card">
            <div className="card-head"><span>Top products</span></div>
            <table className="top-products-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left' }}>Product</th>
                  <th style={{ textAlign: 'right' }}>Sold qty</th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.length === 0 && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', padding: '20px', color: '#8aa2b3' }}>No sales yet</td>
                  </tr>
                )}
                {stats.topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name}</td>
                    <td style={{ textAlign: 'right' }}>{p.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Low Stock Alerts (Expanded) */}
          {(stats.lowProductsList.length > 0 || stats.lowRawMaterialsList.length > 0 || stats.outOfStockProductsList.length > 0) && (
            <section className="card low-stock-card">
              <div className="card-head">
                <span>Low Stock Alerts</span>
                <span className="alert-badge">
                  {stats.outOfStockProductsList.length + stats.lowProductsList.length + stats.lowRawMaterialsList.length}
                </span>
              </div>
              <div className="low-stock-content">
                {stats.outOfStockProductsList.length > 0 && (
                  <div className="stock-alert-section">
                    <div className="alert-section-header">
                      <FiAlertCircle className="alert-icon critical" />
                      <span className="alert-section-title">Out of Stock ({stats.outOfStockProductsList.length})</span>
                    </div>
                    <div className="stockout-grid">
                      {stats.outOfStockProductsList.map((p, idx) => (
                        <div key={idx} className="stockout-item">
                          <div className="stockout-icon">
                            <FiAlertCircle />
                          </div>
                          <div className="stockout-info">
                            <div className="stockout-name">{p.name}</div>
                            <div className="stockout-qty">Quantity: 0</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {stats.lowProductsList.length > 0 && (
                  <div className="stock-alert-section">
                    <div className="alert-section-header">
                      <FiAlertCircle className="alert-icon warning" />
                      <span className="alert-section-title">Low Stock Products ({stats.lowProductsList.length})</span>
                    </div>
                    <div className="low-stock-grid">
                      {stats.lowProductsList.map((p, idx) => (
                        <div key={idx} className="low-stock-item">
                          <div className="low-stock-icon warning">
                            <FiAlertCircle />
                          </div>
                          <div className="low-stock-info">
                            <div className="low-stock-name">{p.name}</div>
                            <div className="low-stock-qty">Quantity: {Number(p.quantity || 0)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {stats.lowRawMaterialsList.length > 0 && (
                  <div className="stock-alert-section">
                    <div className="alert-section-header">
                      <FiAlertCircle className="alert-icon warning" />
                      <span className="alert-section-title">Low Raw Materials ({stats.lowRawMaterialsList.length})</span>
                    </div>
                    <div className="low-stock-grid">
                      {stats.lowRawMaterialsList.map((m, idx) => (
                        <div key={idx} className="low-stock-item">
                          <div className="low-stock-icon warning">
                            <FiAlertCircle />
                          </div>
                          <div className="low-stock-info">
                            <div className="low-stock-name">{m.name}</div>
                            <div className="low-stock-qty">Quantity: {Number(m.quantity || 0)} {m.unit || ''}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Expiring Products Alert */}
          {stats.expiringProducts.length > 0 && (
            <section className="card expiring-card">
              <div className="card-head">
                <span>Expiring Products</span>
                <span className="expiring-badge">{stats.expiringProducts.length}</span>
              </div>
              <div className="expiring-grid">
                {stats.expiringProducts.slice(0, 6).map((p, idx) => {
                  const expiry = new Date(p.expiryDate);
                  const now = new Date();
                  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={idx} className="expiring-item">
                      <div className="expiring-icon">
                        <FiClock />
                      </div>
                      <div className="expiring-info">
                        <div className="expiring-name">{p.name}</div>
                        <div className="expiring-date">
                          Expires: {expiry.toLocaleDateString()} ({daysLeft} days)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Recent Activity Feed */}
          <section className="card activity-card">
            <div className="card-head">
              <span>Recent Activity</span>
              <FiClock className="activity-icon" />
            </div>
            <div className="activity-feed">
              {stats.recentActivities.length === 0 ? (
                <div className="activity-empty">No recent activity</div>
              ) : (
                stats.recentActivities.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-icon-wrapper">
                      <span className="activity-emoji">{activity.icon}</span>
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-desc">{activity.description}</div>
                      {activity.amount > 0 && (
                        <div className="activity-amount">{formatRWF(activity.amount)}</div>
                      )}
                    </div>
                    <div className="activity-time">
                      {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="card chart-card">
            <div className="card-head">
              <span>Sales revenue (monthly)</span>
              <div className="chart-summary">
                <span className="chart-total">Total: {formatRWF(charts.monthly.reduce((a, b) => a + b, 0))}</span>
              </div>
            </div>
            <BarChart data={charts.monthly} max={charts.maxMonthly} />
          </section>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;


