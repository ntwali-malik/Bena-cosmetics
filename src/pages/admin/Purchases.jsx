import React, { useEffect, useMemo, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import { listPurchases, createPurchase, updatePurchase, deletePurchase } from '../../services/purchaseService';
import { listRawMaterials, getRawMaterial, updateRawMaterial } from '../../services/rawMaterialService';

function Purchases() {
  const columns = [
    { key: 'material', label: 'Material' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'unitPrice', label: 'Unit Price' },
    { key: 'totalCost', label: 'Total Cost' },
    { key: 'purchaseDate', label: 'Purchase Date' },
    { key: 'supplier', label: 'Supplier' },
  ];
  const [rows, setRows] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    listPurchases().then(setRows).catch(() => setRows([]));
    listRawMaterials().then(setMaterials).catch(() => setMaterials([]));
  }, []);

  const displayRows = useMemo(() => {
    const idToName = new Map(materials.map((m) => [m._id || m.id, m.name]));
    function fmtDate(d) {
      try { return d ? new Date(d).toISOString().slice(0, 10) : ''; } catch { return ''; }
    }
    return rows.map((r) => ({
      id: r._id || r.id,
      material: (r.material && (r.material.name || idToName.get(r.material) || r.material)) || '',
      quantity: r.quantity,
      unitPrice: r.unitPrice,
      totalCost: r.totalCost ?? (r.quantity && r.unitPrice ? r.quantity * r.unitPrice : ''),
      purchaseDate: fmtDate(r.purchaseDate),
      supplier: r.supplier || '',
    }));
  }, [rows, materials]);

  function normalizePayload(draft) {
    const matId = typeof draft.material === 'object' ? (draft.material._id || draft.material.id) : draft.material;
    const qty = draft.quantity === '' || draft.quantity === undefined ? 0 : Number(draft.quantity);
    const price = draft.unitPrice === '' || draft.unitPrice === undefined ? 0 : Number(draft.unitPrice);
    return {
      material: matId,
      quantity: qty,
      unitPrice: price,
      totalCost: price && qty ? price * qty : undefined,
      purchaseDate: draft.purchaseDate || null,
      supplier: draft.supplier || '',
    };
  }
  return (
    <div className="admin-page">
      <div className="page-top">
        <h2>Purchases</h2>
        <div className="page-actions">
          <button className="admin-primary">New Purchase</button>
        </div>
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Purchases"
          columns={columns}
          initialRows={displayRows}
          renderEditor={({ column, value, draft, onChange }) => {
            if (column.key === 'material') {
              return (
                <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
                  <option value="">Select material</option>
                  {materials.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>
                  ))}
                </select>
              );
            }
            if (column.key === 'purchaseDate') {
              return <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
            }
            if (column.key === 'quantity' || column.key === 'unitPrice') {
              // auto compute totalCost when editing
              const handleNum = (e) => {
                const val = e.target.value;
                onChange(val);
              };
              return <input type="number" value={value ?? ''} onChange={handleNum} />;
            }
            if (column.key === 'totalCost') {
              const qty = Number(draft.quantity || 0);
              const price = Number(draft.unitPrice || 0);
              const total = qty && price ? qty * price : '';
              return <input value={total} disabled readOnly />;
            }
            return null;
          }}
          onCreate={async (draft) => {
            const payload = normalizePayload(draft);
            const created = await createPurchase(payload);
            try {
              const rm = await getRawMaterial(payload.material);
              const currentQty = Number(rm?.quantity || 0);
              const added = Number(payload.quantity || 0);
              await updateRawMaterial(payload.material, { quantity: currentQty + added });
              // refresh materials list used for display mapping
              listRawMaterials().then(setMaterials).catch(() => {});
            } catch (e) {
              // ignore stock update errors in UI for now
            }
            return created;
          }}
          onUpdate={async (id, draft) => updatePurchase(id, normalizePayload(draft))}
          onDelete={async (id) => deletePurchase(id)}
        />
      </div>
    </div>
  );
}

export default Purchases;


