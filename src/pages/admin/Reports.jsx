import React, { useEffect, useMemo, useState } from 'react';
import { FiFileText, FiDownload, FiCalendar, FiTrendingUp, FiPackage } from 'react-icons/fi';
import { listSales } from '../../services/salesService';
import { listProducts } from '../../services/productService';
import { listPurchases } from '../../services/purchaseService';
import { listProductions } from '../../services/productionService';
import { listRawMaterials } from '../../services/rawMaterialService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { isAdmin } from '../../components/RequireRole';
import './admin.css';

function Reports() {
  const admin = isAdmin();
  const [reportType, setReportType] = useState('daily'); // daily, weekly, monthly
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [productions, setProductions] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logoData, setLogoData] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [s, p, pu, pr, rm] = await Promise.all([
        listSales().catch(() => []),
        listProducts().catch(() => []),
        listPurchases().catch(() => []),
        listProductions().catch(() => []),
        listRawMaterials().catch(() => []),
      ]);
      setSales(s || []);
      setProducts(p || []);
      setPurchases(pu || []);
      setProductions(pr || []);
      setRawMaterials(rm || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let active = true;

    async function loadLogo() {
      try {
        const response = await fetch('/logo.png');
        if (!response.ok) return;
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (active) {
            setLogoData(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        if (active) {
          setLogoData(null);
        }
      }
    }

    loadLogo();

    return () => {
      active = false;
    };
  }, []);

  const reportData = useMemo(() => {
    const date = new Date(selectedDate);
    let startDate, endDate;

    if (reportType === 'daily') {
      startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
    } else if (reportType === 'weekly') {
      const day = date.getDay();
      const diffToMonday = (day + 6) % 7;
      startDate = new Date(date);
      startDate.setDate(startDate.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else { // monthly
      startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
    }

    // Filter sales
    const filteredSales = sales.filter((s) => {
      if (!s.saleDate) return false;
      const saleDate = new Date(s.saleDate);
      return saleDate >= startDate && saleDate <= endDate;
    });

    // Filter purchases
    const filteredPurchases = purchases.filter((p) => {
      if (!p.purchaseDate) return false;
      const purchaseDate = new Date(p.purchaseDate);
      return purchaseDate >= startDate && purchaseDate <= endDate;
    });

    // Filter productions
    const filteredProductions = productions.filter((pr) => {
      if (!pr.productionDate) return false;
      const productionDate = new Date(pr.productionDate);
      return productionDate >= startDate && productionDate <= endDate;
    });

    // Calculate sales totals
    const totalSalesRevenue = filteredSales.reduce((sum, s) => {
      if (s.totalAmount !== undefined && s.totalAmount !== null) {
        return sum + Number(s.totalAmount);
      }
      if (Array.isArray(s.items) && s.items.length > 0) {
        return sum + s.items.reduce((itemSum, it) => itemSum + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      }
      return sum;
    }, 0);

    const totalSalesCount = filteredSales.length;
    const totalItemsSold = filteredSales.reduce((sum, s) => {
      if (Array.isArray(s.items) && s.items.length > 0) {
        return sum + s.items.reduce((itemSum, it) => itemSum + Number(it.quantity || 0), 0);
      }
      return sum + Number(s.quantity || 0);
    }, 0);

    // Calculate purchase totals
    const totalPurchaseCost = filteredPurchases.reduce((sum, p) => sum + Number(p.totalPrice || 0), 0);
    const totalPurchaseCount = filteredPurchases.length;

    // Calculate production totals
    const totalProductionCount = filteredProductions.length;
    const totalProductsProduced = filteredProductions.reduce((sum, pr) => sum + Number(pr.quantity || 0), 0);

    // Product sales breakdown
    const productIdToName = new Map(products.map((p) => [p._id || p.id, p.name]));
    const productSales = new Map();
    filteredSales.forEach((s) => {
      if (Array.isArray(s.items) && s.items.length > 0) {
        s.items.forEach((it) => {
          const pid = typeof it.product === 'object' ? (it.product?._id || it.product?.id) : it.product;
          const qty = Number(it.quantity || 0);
          const price = Number(it.unitPrice || 0);
          const total = Number(it.lineTotal || 0) || (qty * price);
          if (!pid) return;
          const existing = productSales.get(pid) || { qty: 0, revenue: 0 };
          productSales.set(pid, { qty: existing.qty + qty, revenue: existing.revenue + total });
        });
      }
    });

    const topProducts = [...productSales.entries()]
      .map(([pid, data]) => ({
        name: productIdToName.get(pid) || 'Unknown',
        quantity: data.qty,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      startDate,
      endDate,
      totalSalesRevenue,
      totalSalesCount,
      totalItemsSold,
      totalPurchaseCost,
      totalPurchaseCount,
      totalProductionCount,
      totalProductsProduced,
      filteredSales,
      filteredPurchases,
      filteredProductions,
      topProducts,
      products: products.length,
      rawMaterials: rawMaterials.length,
    };
  }, [reportType, selectedDate, sales, products, purchases, productions, rawMaterials]);

  function formatRWF(value) {
    try {
      return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(Number(value || 0));
    } catch {
      return `RWF ${Number(value || 0).toLocaleString()}`;
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-RW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  function exportToPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Header (match invoice style, compact height)
    // Background bar (subtle, reduced height)
    doc.setFillColor(248, 250, 248); // light
    doc.rect(0, 0, pageWidth, 36, 'F');

    const brandLeft = 14;
    let brandTop = 8;

    if (logoData) {
      const logoW = 24;
      const logoH = 24;
      doc.addImage(logoData, 'PNG', brandLeft, brandTop, logoW, logoH);
    }

    // Brand text
    const textLeft = brandLeft + 24 + 8;
    doc.setTextColor(26, 77, 46);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('Bena Cosmetics Ltd', textLeft, 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(90, 123, 142);
    doc.text('Glow Naturally Thrive Beautifully', textLeft, 20);
    doc.text('Remera, Kisimenti • 0788776218 • benacosmeticsrw@gmail.com', textLeft, 26);

    // Report title on the right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(26, 77, 46);
    doc.text(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`, pageWidth - 14, 14, { align: 'right' });

    // Divider line
    doc.setDrawColor(237, 243, 250);
    doc.line(14, 36, pageWidth - 14, 36);

    yPos = 44;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${formatDate(reportData.startDate)} - ${formatDate(reportData.endDate)}`, 14, yPos);
    doc.text(`Generated: ${new Date().toLocaleString('en-RW')}`, 14, yPos + 6);

    yPos += 20;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryData = [
      ['Total Sales Revenue', formatRWF(reportData.totalSalesRevenue)],
      ['Total Sales Count', reportData.totalSalesCount.toString()],
      ['Total Items Sold', reportData.totalItemsSold.toString()],
      ...(admin ? [
        ['Total Purchase Cost', formatRWF(reportData.totalPurchaseCost)],
        ['Total Purchases', reportData.totalPurchaseCount.toString()],
        ['Total Productions', reportData.totalProductionCount.toString()],
        ['Products Produced', reportData.totalProductsProduced.toString()],
        ['Net Profit', formatRWF(reportData.totalSalesRevenue - reportData.totalPurchaseCost)],
      ] : []),
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [26, 77, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });

    yPos = (doc.lastAutoTable?.finalY || yPos) + 15;

    // Top Products Section
    if (reportData.topProducts.length > 0) {
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Products', 14, yPos);
      yPos += 8;

      const topProductsData = reportData.topProducts.map((p, idx) => [
        (idx + 1).toString(),
        p.name,
        p.quantity.toString(),
        formatRWF(p.revenue),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Product Name', 'Quantity Sold', 'Revenue']],
        body: topProductsData,
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 40, halign: 'right' },
          3: { cellWidth: 50, halign: 'right' },
        },
      });

      yPos = (doc.lastAutoTable?.finalY || yPos) + 15;
    }

    // Sales Details
    if (reportData.filteredSales.length > 0) {
      if (yPos > pageHeight - 80) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Sales Details', 14, yPos);
      yPos += 8;

      const salesData = reportData.filteredSales.slice(0, 20).map((s) => {
        const items = Array.isArray(s.items) ? s.items : [];
        const itemNames = items.length > 0
          ? items.map(it => it.product?.name || 'Product').join(', ')
          : (s.product?.name || 'Product');
        return [
          s.invoiceNumber || 'N/A',
          formatDate(s.saleDate || new Date()),
          s.customerName || 'Walk-in',
          itemNames.substring(0, 30),
          formatRWF(s.totalAmount || 0),
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Invoice', 'Date', 'Customer', 'Items', 'Amount']],
        body: salesData,
        theme: 'striped',
        headStyles: { fillColor: [26, 77, 46], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 'auto' },
          4: { cellWidth: 40, halign: 'right' },
        },
      });
    }

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${totalPages} • Bena Cosmetics Ltd`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `Bena_Cosmetics_${reportType}_Report_${selectedDate.replace(/-/g, '_')}.pdf`;
    doc.save(fileName);
  }

  return (
    <div className="admin-page">
      <div className="page-top report-top">
        <div className="report-title">
          <img src="/logo.png" alt="Bena Cosmetics" className="report-logo" />
          <div className="report-title-text">
            <h2>Reports</h2>
            <p className="report-subtitle">Daily, weekly & monthly insights</p>
          </div>
        </div>
        <div className="page-actions">
          <button className="admin-primary" onClick={exportToPDF} disabled={loading}>
            <FiDownload style={{ marginRight: '6px' }} />
            Export PDF
          </button>
        </div>
      </div>
      <div className="page-scroll">
        <div className="report-container">
          {/* Report Type Selection */}
          <div className="report-controls">
            <div className="report-type-selector">
              <label>Report Type:</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="report-select">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="report-date-selector">
              <label>
                <FiCalendar style={{ marginRight: '6px' }} />
                {reportType === 'daily' ? 'Date:' : reportType === 'weekly' ? 'Week Starting:' : 'Month:'}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="report-date-input"
              />
            </div>
          </div>

          {/* Report Summary */}
          <div className="report-summary">
            <div className="report-summary-card">
              <div className="summary-icon revenue">
                <FiTrendingUp />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Sales Revenue</div>
                <div className="summary-value">{formatRWF(reportData.totalSalesRevenue)}</div>
              </div>
            </div>
            <div className="report-summary-card">
              <div className="summary-icon sales">
                <FiFileText />
              </div>
              <div className="summary-content">
                <div className="summary-label">Total Sales</div>
                <div className="summary-value">{reportData.totalSalesCount}</div>
              </div>
            </div>
            <div className="report-summary-card">
              <div className="summary-icon items">
                <FiPackage />
              </div>
              <div className="summary-content">
                <div className="summary-label">Items Sold</div>
                <div className="summary-value">{reportData.totalItemsSold}</div>
              </div>
            </div>
            {admin && (
              <div className="report-summary-card">
                <div className="summary-icon profit">
                  <FiTrendingUp />
                </div>
                <div className="summary-content">
                  <div className="summary-label">Net Profit</div>
                  <div className="summary-value">{formatRWF(reportData.totalSalesRevenue - reportData.totalPurchaseCost)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Report Details */}
          <div className="report-details">
            <div className="report-section">
              <h3>Sales Overview</h3>
              <div className="report-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Revenue:</span>
                  <span className="stat-value">{formatRWF(reportData.totalSalesRevenue)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Number of Sales:</span>
                  <span className="stat-value">{reportData.totalSalesCount}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Items Sold:</span>
                  <span className="stat-value">{reportData.totalItemsSold}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average Sale Value:</span>
                  <span className="stat-value">
                    {formatRWF(reportData.totalSalesCount > 0 ? reportData.totalSalesRevenue / reportData.totalSalesCount : 0)}
                  </span>
                </div>
              </div>
            </div>

            {admin && (
              <div className="report-section">
                <h3>Purchases Overview</h3>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Purchase Cost:</span>
                    <span className="stat-value">{formatRWF(reportData.totalPurchaseCost)}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Number of Purchases:</span>
                    <span className="stat-value">{reportData.totalPurchaseCount}</span>
                  </div>
                </div>
              </div>
            )}

            {admin && (
              <div className="report-section">
                <h3>Production Overview</h3>
                <div className="report-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Productions:</span>
                    <span className="stat-value">{reportData.totalProductionCount}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Products Produced:</span>
                    <span className="stat-value">{reportData.totalProductsProduced}</span>
                  </div>
                </div>
              </div>
            )}

            {reportData.topProducts.length > 0 && (
              <div className="report-section">
                <h3>Top Products</h3>
                <table className="report-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>Quantity Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.topProducts.map((p, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{p.name}</td>
                        <td>{p.quantity}</td>
                        <td>{formatRWF(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="report-section">
              <h3>Report Period</h3>
              <div className="report-period">
                <div className="period-item">
                  <span className="period-label">Start Date:</span>
                  <span className="period-value">{formatDate(reportData.startDate)}</span>
                </div>
                <div className="period-item">
                  <span className="period-label">End Date:</span>
                  <span className="period-value">{formatDate(reportData.endDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;

