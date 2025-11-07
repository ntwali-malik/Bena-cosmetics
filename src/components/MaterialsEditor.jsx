import React, { useEffect, useState } from 'react';

function MaterialsEditor({ materials, value, onChange }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      if (Array.isArray(value)) {
        const normalized = value.map((v) => ({
          material: typeof v.material === 'object' ? (v.material?._id || v.material?.id) : (v.material || ''),
          quantityUsed: v.quantityUsed || 0,
          unit: v.unit || '',
        }));
        setRows(normalized);
      } else if (typeof value === 'string' && value.trim()) {
        setRows(JSON.parse(value));
      } else {
        setRows([]);
      }
    } catch {
      setRows([]);
    }
  }, [value]);

  function update(idx, key, val) {
    const next = rows.map((r, i) => (i === idx ? { ...r, [key]: val } : r));
    setRows(next);
    onChange(next);
  }

  function addRow() {
    const next = [...rows, { material: '', quantityUsed: 0, unit: '' }];
    setRows(next);
    onChange(next);
  }

  function removeRow(idx) {
    const next = rows.filter((_, i) => i !== idx);
    setRows(next);
    onChange(next);
  }

  return (
    <div className="materials-editor">
      {rows.map((r, idx) => (
        <div className="materials-row" key={idx}>
          <select value={r.material || ''} onChange={(e) => update(idx, 'material', e.target.value)}>
            <option value="">Material</option>
            {materials.map((m) => (
              <option key={m._id || m.id} value={m._id || m.id}>{m.name}</option>
            ))}
          </select>
          <input type="number" placeholder="Qty" value={r.quantityUsed ?? ''} onChange={(e) => update(idx, 'quantityUsed', Number(e.target.value))} />
          <input placeholder="Unit" value={r.unit || ''} onChange={(e) => update(idx, 'unit', e.target.value)} />
          <button type="button" className="admin-ghost" onClick={() => removeRow(idx)}>Remove</button>
        </div>
      ))}
      <button type="button" className="admin-primary" onClick={addRow}>Add material</button>
    </div>
  );
}

export default MaterialsEditor;


