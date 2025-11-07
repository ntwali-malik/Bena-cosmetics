import React, { useEffect, useMemo, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import { listRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial } from '../../services/rawMaterialService';

function RawMaterials() {
  const columns = [
    { key: 'name', label: 'Name', placeholder: 'e.g., Shea Butter', fullWidth: true },
    { key: 'quantity', label: 'Quantity', placeholder: 'e.g., 120' },
    { key: 'unit', label: 'Unit' },
  ];
  const [rows, setRows] = useState([]);

  useEffect(() => {
    listRawMaterials().then(setRows).catch(() => setRows([]));
  }, []);

  const displayRows = useMemo(() => rows.map((r) => ({ id: r._id || r.id, name: r.name, quantity: r.quantity, unit: r.unit })), [rows]);

  function normalizePayload(draft) {
    return {
      name: draft.name || '',
      quantity: draft.quantity === '' || draft.quantity === undefined ? 0 : Number(draft.quantity),
      unit: draft.unit || '',
    };
  }
  return (
    <div className="admin-page">
      <div className="page-top">
        <h2>Raw materials</h2>
        <div className="page-actions">
          <button className="admin-primary">New Material</button>
        </div>
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Raw Materials"
          columns={columns}
          initialRows={displayRows}
          renderEditor={({ column, value, onChange }) => {
            if (column.key === 'quantity') {
              return <input type="number" placeholder={column.placeholder || ''} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
            }
            if (column.key === 'unit') {
              return (
                <select value={value || ''} onChange={(e) => onChange(e.target.value)}>
                  <option value="">Select unit</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="liters">liters</option>
                  <option value="ml">ml</option>
                  <option value="pieces">pieces</option>
                  <option value="packs">packs</option>
                </select>
              );
            }
            return null;
          }}
          onCreate={async (draft) => createRawMaterial(normalizePayload(draft))}
          onUpdate={async (id, draft) => updateRawMaterial(id, normalizePayload(draft))}
          onDelete={async (id) => deleteRawMaterial(id)}
        />
      </div>
    </div>
  );
}

export default RawMaterials;


