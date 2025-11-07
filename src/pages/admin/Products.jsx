import React, { useEffect, useMemo, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import { listProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import { listCategories } from '../../services/categoryService';

function Products() {
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
        <div className="page-actions">
          <button className="admin-primary">New Product</button>
        </div>
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Products"
          columns={columns}
          initialRows={displayRows}
          renderEditor={({ column, value, onChange }) => {
            if (column.key === 'category') {
              return (
                <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>{c.name}</option>
                  ))}
                </select>
              );
            }
            if (column.key === 'productionDate' || column.key === 'expiryDate') {
              return (
                <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />
              );
            }
            if (column.key === 'quantity' || column.key === 'unitPrice') {
              return (
                <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
              );
            }
            if (column.key === 'status') {
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
          onCreate={async (draft) => {
            const created = await createProduct(normalizePayload(draft));
            return created;
          }}
          onUpdate={async (id, draft) => {
            return updateProduct(id, normalizePayload(draft));
          }}
          onDelete={async (id) => {
            await deleteProduct(id);
          }}
        />
      </div>
    </div>
  );
}

export default Products;


