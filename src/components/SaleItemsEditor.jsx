import React, { useEffect, useMemo, useState } from 'react';

function SaleItemsEditor({ products, value, onChange }) {
  const [rows, setRows] = useState([]);
  const [lastAdded, setLastAdded] = useState(0);

  useEffect(() => {
    if (!rows.length) {
      if (Array.isArray(value)) setRows(value.map((r) => ({
      product: typeof r.product === 'object' ? (r.product?._id || r.product?.id) : r.product || '',
      quantity: Number(r.quantity || 0),
      unitPrice: r.unitPrice ?? (() => {
        const p = products.find((x) => (x._id || x.id) === (typeof r.product === 'object' ? (r.product?._id || r.product?.id) : r.product));
        return p?.unitPrice ?? '';
      })(),
      lineTotal: r.lineTotal,
    })));
      else setRows([{ product: '', quantity: 1, unitPrice: '', lineTotal: 0 }]);
      setLastAdded(0);
    }
  }, [value, products, rows.length]);

  const productMap = useMemo(() => new Map(products.map((p) => [p._id || p.id, p])), [products]);

  function pushChange(next) {
    setRows(next);
    const outbound = next.map((r) => ({
      product: r.product,
      quantity: Number(r.quantity || 0),
      unitPrice: r.unitPrice === '' || r.unitPrice === undefined ? undefined : Number(r.unitPrice),
      lineTotal: (Number(r.quantity || 0) * Number(r.unitPrice || 0)) || 0,
    })).filter((r) => r.product && r.quantity > 0);
    onChange(outbound);
  }

  function update(idx, key, val) {
    const next = rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r));
    // auto fill unitPrice from product
    if (key === 'product') {
      const p = productMap.get(val);
      next[idx].unitPrice = next[idx].unitPrice === '' || next[idx].unitPrice === undefined ? (p?.unitPrice ?? '') : next[idx].unitPrice;
    }
    pushChange(next);
  }

  function addRow() {
    const next = [...rows, { product: '', quantity: 1, unitPrice: '', lineTotal: 0 }];
    setLastAdded(next.length - 1);
    pushChange(next);
  }
  function removeRow(i) { pushChange(rows.filter((_, idx) => idx !== i)); }

  const grandTotal = rows.reduce((s, r) => s + (Number(r.quantity || 0) * Number(r.unitPrice || 0)), 0);

  return (
    <div className="materials-editor">
      {rows.map((r, idx) => (
        <div className="materials-row" key={idx}>
          <select value={r.product || ''} onChange={(e) => update(idx, 'product', e.target.value)} autoFocus={idx === lastAdded && !r.product}>
            <option value="">Product</option>
            {products.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
            ))}
          </select>
          <div className="qty-wrap" style={{display:'grid', gridTemplateColumns:'auto 1fr auto', alignItems:'center', gap:6}}>
            <button type="button" className="admin-ghost" onClick={() => update(idx, 'quantity', Math.max(1, Number(r.quantity || 1) - 1))}>-</button>
            <input type="number" min={1} placeholder="Qty" value={r.quantity ?? ''} onChange={(e) => update(idx, 'quantity', Number(e.target.value))} />
            <button type="button" className="admin-ghost" onClick={() => update(idx, 'quantity', Number(r.quantity || 0) + 1)}>+</button>
          </div>
          <input
            type="number"
            step="0.01"
            placeholder="Unit"
            value={r.unitPrice ?? ''}
            onChange={(e) => update(idx, 'unitPrice', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // add a new row if current is valid
                if (r.product && Number(r.quantity || 0) > 0) addRow();
              }
            }}
          />
          <input readOnly placeholder="Line total" value={(Number(r.quantity || 0) * Number(r.unitPrice || 0)) || 0} />
          {idx > 0 && (
            <button type="button" className="admin-ghost" onClick={() => removeRow(idx)}>Remove</button>
          )}
        </div>
      ))}
      <div className="admin-form-actions">
        <button type="button" className="admin-primary" onClick={addRow}>Add item</button>
        <div className="admin-ghost" style={{border:'none'}}>Total: {new Intl.NumberFormat('en-RW',{style:'currency',currency:'RWF',maximumFractionDigits:0}).format(grandTotal)}</div>
      </div>
    </div>
  );
}

export default SaleItemsEditor;


