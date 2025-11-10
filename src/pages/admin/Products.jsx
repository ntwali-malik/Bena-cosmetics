import React, { useEffect, useMemo, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { listCategories } from '../../services/categoryService';
import { isAdmin } from '../../components/RequireRole';

function Products() {
  const admin = isAdmin();
  const columns = [
    { key: 'name', label: 'Name', placeholder: 'e.g., Face Cream' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'size', label: 'Size/Unit', placeholder: 'e.g., 500ml or Medium' },
    { key: 'unitPrice', label: 'Unit Price' },
    { key: 'productionDate', label: 'Production Date' },
    { key: 'expiryDate', label: 'Expiry Date' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
  ];
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    listProducts().then(setRows).catch(() => setRows([]));
    listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const displayRows = useMemo(() => {
    function fmtDate(d) {
      try { return d ? new Date(d).toISOString().slice(0, 10) : ''; } catch { return ''; }
    }
    const idToName = new Map(categories.map((c) => [c._id || c.id, c.name]));
    return rows.map((r) => ({
      id: r._id || r.id,
      name: r.name,
      quantity: r.quantity,
      size: r.size,
      unitPrice: r.unitPrice,
      productionDate: fmtDate(r.productionDate),
      expiryDate: fmtDate(r.expiryDate),
      category: (r.category && (r.category.name || idToName.get(r.category) || r.category)) || '',
      status: r.status,
    }));
  }, [rows, categories]);

  function normalizeForDisplay(row) {
    const fmtDate = (d) => { try { return d ? new Date(d).toISOString().slice(0, 10) : ''; } catch { return ''; } };
    const idToName = new Map(categories.map((c) => [c._id || c.id, c.name]));
    return {
      id: row._id || row.id,
      name: row.name,
      quantity: row.quantity,
      size: row.size,
      unitPrice: row.unitPrice,
      productionDate: fmtDate(row.productionDate),
      expiryDate: fmtDate(row.expiryDate),
      category: (row.category && (row.category.name || idToName.get(row.category) || row.category)) || '',
      status: row.status,
    };
  }

  function normalizePayload(draft) {
    return {
      name: draft.name ?? '',
      quantity: draft.quantity === '' || draft.quantity === undefined ? 0 : Number(draft.quantity),
      size: draft.size ?? '',
      unitPrice: draft.unitPrice === '' || draft.unitPrice === undefined ? 0 : Number(draft.unitPrice),
      productionDate: draft.productionDate || null,
      expiryDate: draft.expiryDate || null,
      category: typeof draft.category === 'object' ? (draft.category._id || draft.category.id) : draft.category,
      status: draft.status || 'available',
    };
  }
  return (
    <div className="admin-page">
      <div className="page-top">
        <h2>Products</h2>
        {admin && (
          <div className="page-actions">
            <button className="admin-primary">New Product</button>
          </div>
        )}
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Products"
          columns={columns}
          initialRows={displayRows}
          canCreate={admin}
          canDelete={admin}
          renderEditor={({ column, value, draft, onChange }) => {
            if (column.key === 'category') {
              // Staff cannot edit category
              if (!admin) return <input type="text" value={value || ''} readOnly />;
              // value may be a name string from display; resolve to id
              let selected = (value && (value._id || value.id)) || value || '';
              const ids = new Set(categories.map((c) => (c._id || c.id)));
              if (!ids.has(selected)) {
                const raw = rows.find((r) => (r._id || r.id) === draft.id);
                const id = raw ? (typeof raw.category === 'object' ? (raw.category._id || raw.category.id) : raw.category) : '';
                if (id) selected = id;
              }
              return (
                <select value={selected} onChange={(e) => onChange(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                  ))}
                </select>
              );
            }
            if (column.key === 'productionDate' || column.key === 'expiryDate') {
              // Staff cannot edit dates
              if (!admin) return <input type="text" value={value || ''} readOnly />;
              return (
                <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />
              );
            }
            if (column.key === 'unitPrice') {
              // Staff cannot edit price
              if (!admin) return <input type="text" value={value ?? ''} readOnly />;
              return (
                <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
              );
            }
            if (column.key === 'quantity') {
              // Staff can edit quantity
              return (
                <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
              );
            }
            if (column.key === 'name') {
              // Staff cannot edit name
              if (!admin) return <input type="text" value={value ?? ''} readOnly />;
              return null; // fall back to default input
            }
            if (column.key === 'size') {
              // Staff cannot edit size
              if (!admin) return <input type="text" value={value ?? ''} readOnly />;
              return null; // fall back to default input
            }
            if (column.key === 'status') {
              // Staff can edit status
              return (
                <select value={value || 'available'} onChange={(e) => onChange(e.target.value)}>
                  <option value="available">available</option>
                  <option value="expired">expired</option>
                  <option value="out-of-stock">out-of-stock</option>
                </select>
              );
            }
            return null; // fall back to default input inside CrudTable
          }}
          onCreate={admin ? async (draft) => {
            const created = await createProduct(normalizePayload(draft));
            const fresh = await listProducts().catch(() => []);
            setRows(fresh);
            return normalizeForDisplay(created);
          } : undefined}
          onUpdate={async (id, draft) => {
            // Staff can only update quantity and status
            if (!admin) {
              const payload = {
                quantity: draft.quantity === '' || draft.quantity === undefined ? 0 : Number(draft.quantity),
                status: draft.status || 'available',
              };
              const updated = await updateProduct(id, payload);
              const fresh = await listProducts().catch(() => []);
              setRows(fresh);
              return normalizeForDisplay(updated);
            }
            const updated = await updateProduct(id, normalizePayload(draft));
            const fresh = await listProducts().catch(() => []);
            setRows(fresh);
            return normalizeForDisplay(updated);
          }}
          onDelete={admin ? async (id) => {
            await deleteProduct(id);
          } : undefined}
        />
      </div>
    </div>
  );
}

export default Products;


