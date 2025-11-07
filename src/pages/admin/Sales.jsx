import React, { useEffect, useMemo, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import InvoiceModal from '../../components/InvoiceModal';
import SaleItemsEditor from '../../components/SaleItemsEditor';
import { listSales, createSale, updateSale, deleteSale } from '../../services/salesService';
import { listProducts } from '../../services/productService';

function Sales() {
  const columns = [
    { key: 'items', label: 'Items', fullWidth: true },
    { key: 'saleDate', label: 'Sale Date' },
    { key: 'totalAmount', label: 'Total Amount' },
    { key: 'customerName', label: 'Customer' },
    { key: 'paymentMethod', label: 'Payment' },
  ];
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [alertMsg, setAlertMsg] = useState('');
  const [invoiceSale, setInvoiceSale] = useState(null);

  useEffect(() => {
    document.title = 'Sales - Bena Cosmetics';
    listSales().then((data) => { setRows(data); setOriginalRows(data); }).catch(() => { setRows([]); setOriginalRows([]); });
    listProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const displayRows = useMemo(() => {
    const prodMap = new Map(products.map((p) => [p._id || p.id, p.name]));
    function fmtDate(d) { try { return d ? new Date(d).toISOString().slice(0,10) : ''; } catch { return ''; } }
    return rows.map((r) => {
      const items = Array.isArray(r.items) ? r.items : [];
      const label = items.length === 0
        ? ''
        : (items.length === 1
            ? `${items[0].quantity} x ${(items[0].product?.name || prodMap.get(items[0].product) || 'Item')}`
            : `${items.length} items`);
      const totalAmount = r.totalAmount ?? items.reduce((s, it) => s + (it.lineTotal || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      return {
        id: r._id || r.id,
        items: label,
        saleDate: fmtDate(r.saleDate),
        totalAmount,
        customerName: r.customerName || '',
        paymentMethod: r.paymentMethod || 'cash',
      };
    });
  }, [rows, products]);

  function normalizeForDisplay(row) {
    const prodMap = new Map(products.map((p) => [p._id || p.id, p.name]));
    function fmtDate(d) { try { return d ? new Date(d).toISOString().slice(0,10) : ''; } catch { return ''; } }
    const items = Array.isArray(row.items) ? row.items : [];
    const label = items.length === 0
      ? ''
      : (items.length === 1
          ? `${items[0].quantity} x ${(items[0].product?.name || prodMap.get(items[0].product) || 'Item')}`
          : `${items.length} items`);
    const totalAmount = row.totalAmount ?? items.reduce((s, it) => s + (it.lineTotal || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
    return {
      id: row._id || row.id,
      items: label,
      saleDate: fmtDate(row.saleDate),
      totalAmount,
      customerName: row.customerName || '',
      paymentMethod: row.paymentMethod || 'cash',
    };
  }

  function normalizePayload(draft) {
    const itemsDraft = Array.isArray(draft.items) ? draft.items : [];
    const items = itemsDraft
      .map((it) => ({
        product: typeof it.product === 'object' ? (it.product?._id || it.product?.id) : it.product,
        quantity: Number(it.quantity || 0),
        unitPrice: it.unitPrice === '' || it.unitPrice === undefined ? undefined : Number(it.unitPrice),
        lineTotal: (Number(it.quantity || 0) * Number(it.unitPrice || 0)) || 0,
      }))
      .filter((it) => it.product && it.quantity > 0);
    if (items.length === 0) {
      throw new Error('Please add at least one product item.');
    }
    const today = new Date().toISOString().slice(0,10);
    const saleDate = draft.saleDate || today;
    const customerName = (draft.customerName && String(draft.customerName).trim()) || 'Walk-in';
    const paymentMethod = draft.paymentMethod || 'cash';
    const totalAmount = items.reduce((s,i)=> s + (i.lineTotal || 0), 0);
    return { items, saleDate, customerName, paymentMethod, totalAmount };
  }

  function renderEditor({ column, value, draft, onChange, setDraft }) {
    if (column.key === 'items') {
      let editorVal = Array.isArray(value) ? value : (Array.isArray(draft.items) ? draft.items : [{ product: '', quantity: 1, unitPrice: '', lineTotal: 0 }]);
      if (!Array.isArray(draft.items)) {
        // initialize items once on first open
        setDraft((d) => ({ ...d, items: editorVal }));
      }
      return <SaleItemsEditor products={products} value={editorVal} onChange={(val) => onChange(val)} />;
    }
    if (column.key === 'saleDate') {
      const today = new Date().toISOString().slice(0,10);
      const val = value || today;
      return <input type="date" value={val} onChange={(e) => onChange(e.target.value)} />;
    }
    if (column.key === 'totalAmount') {
      const items = Array.isArray(draft.items) ? draft.items : [];
      const sum = items.reduce((s, it) => s + (Number(it.lineTotal || 0) || (Number(it.quantity || 0) * Number(it.unitPrice || 0))), 0);
      return <input readOnly value={sum || ''} />;
    }
    if (column.key === 'customerName') {
      const stored = localStorage.getItem('sales.defaultCustomer') || 'Walk-in';
      const val = value ?? (draft.customerName ?? stored);
      return <input placeholder="Walk-in" value={val} onChange={(e) => onChange(e.target.value)} />;
    }
    if (column.key === 'paymentMethod') {
      const stored = localStorage.getItem('sales.defaultPayment') || 'cash';
      const val = value ?? (draft.paymentMethod ?? stored);
      return (
        <select value={val} onChange={(e) => onChange(e.target.value)}>
          <option value="cash">Cash</option>
          <option value="credit">Credit</option>
          <option value="mobile">Mobile</option>
        </select>
      );
    }
    return null;
  }
  return (
    <div className="admin-page">
      <div className="page-top">
        <h2>Sales</h2>
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Sales"
          columns={columns}
          initialRows={displayRows}
          renderEditor={renderEditor}
          renderRowActions={({ row, idx, startEdit, remove }) => {
            const openInvoice = () => {
              const full = originalRows.find((r) => (r._id || r.id) === row.id);
              setInvoiceSale(full || row);
            };
            return (
              <>
                <button className="admin-link" onClick={startEdit}>Edit</button>
                <button className="admin-link" onClick={openInvoice}>Invoice</button>
                <button className="admin-link danger" onClick={remove}>Delete</button>
              </>
            );
          }}
          onCreate={async (draft) => {
            const payload = normalizePayload(draft);
            const created = await createSale(payload);
            try { localStorage.setItem('sales.defaultCustomer', payload.customerName || ''); localStorage.setItem('sales.defaultPayment', payload.paymentMethod || 'cash'); } catch {}
            const refreshed = await listSales();
            setRows(refreshed);
            setOriginalRows(refreshed);
            return normalizeForDisplay(created);
          }}
          onUpdate={async (id, draft) => {
            const payload = normalizePayload(draft);
            const updated = await updateSale(id, payload);
            try { localStorage.setItem('sales.defaultCustomer', payload.customerName || ''); localStorage.setItem('sales.defaultPayment', payload.paymentMethod || 'cash'); } catch {}
            const refreshed = await listSales();
            setRows(refreshed);
            setOriginalRows(refreshed);
            return normalizeForDisplay(updated);
          }}
          onDelete={async (id) => {
            await deleteSale(id);
            const refreshed = await listSales();
            setRows(refreshed);
            setOriginalRows(refreshed);
          }}
        />
      </div>
      {Boolean(alertMsg) && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000}}>
          <div style={{background:'#fff', borderRadius:8, padding:24, width:'min(440px, 92vw)', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
            <h3 style={{marginTop:0, marginBottom:12}}>Stock warning</h3>
            <p style={{margin:'0 0 16px 0'}}>{alertMsg}</p>
            <div style={{display:'flex', justifyContent:'flex-end', gap:12}}>
              <button className="admin-primary" onClick={() => setAlertMsg('')}>OK</button>
            </div>
          </div>
        </div>
      )}
      {invoiceSale && (
        <InvoiceModal sale={invoiceSale} onClose={() => setInvoiceSale(null)} />
      )}
    </div>
  );
}

export default Sales;


