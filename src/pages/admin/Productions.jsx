import React, { useEffect, useMemo, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import MaterialsEditor from '../../components/MaterialsEditor';
import { listProductions, createProduction, updateProduction, deleteProduction } from '../../services/productionService';
import { listProducts } from '../../services/productService';
import { listRawMaterials, getRawMaterial, updateRawMaterial } from '../../services/rawMaterialService';

function Productions() {
  const columns = [
    { key: 'product', label: 'Product' },
    { key: 'quantityProduced', label: 'Quantity Produced' },
    { key: 'productionDate', label: 'Production Date' },
    { key: 'materialsUsed', label: 'Materials Used (JSON)', fullWidth: true, placeholder: '[{"material":"<id>","quantityUsed":5,"unit":"kg"}]' },
  ];
  const [rows, setRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    listProductions().then((data) => {
      setRows(data);
      setOriginalRows(data);
    }).catch(() => {
      setRows([]);
      setOriginalRows([]);
    });
    listProducts().then(setProducts).catch(() => setProducts([]));
    listRawMaterials().then(setMaterials).catch(() => setMaterials([]));
  }, []);

  const displayRows = useMemo(() => {
    const prodMap = new Map(products.map((p) => [p._id || p.id, p.name]));
    const matMap = new Map(materials.map((m) => [m._id || m.id, m.name]));
    function fmtDate(d) { try { return d ? new Date(d).toISOString().slice(0,10) : ''; } catch { return ''; } }
    function getMaterialName(mu) {
      if (!mu || !mu.material) return '';
      if (typeof mu.material === 'object') {
        return mu.material.name || matMap.get(mu.material._id || mu.material.id) || '';
      }
      return matMap.get(mu.material) || '';
    }
    return rows.map((r) => ({
      id: r._id || r.id,
      product: r.product?.name || prodMap.get(r.product) || (typeof r.product === 'string' ? r.product : '') || '',
      quantityProduced: r.quantityProduced || 0,
      productionDate: fmtDate(r.productionDate),
      materialsUsed: Array.isArray(r.materialsUsed) 
        ? r.materialsUsed.map(mu => {
            const qty = mu.quantityUsed || 0;
            const unit = mu.unit || '';
            const name = getMaterialName(mu);
            return `${qty}${unit ? ' ' + unit : ''} ${name}`.trim();
          }).filter(Boolean).join(', ') || ''
        : '',
    }));
  }, [rows, products, materials]);

  function normalizeForDisplay(row) {
    const prodMap = new Map(products.map((p) => [p._id || p.id, p.name]));
    const matMap = new Map(materials.map((m) => [m._id || m.id, m.name]));
    function fmtDate(d) { try { return d ? new Date(d).toISOString().slice(0,10) : ''; } catch { return ''; } }
    function getMaterialName(mu) {
      if (!mu || !mu.material) return '';
      if (typeof mu.material === 'object') {
        return mu.material.name || matMap.get(mu.material._id || mu.material.id) || '';
      }
      return matMap.get(mu.material) || '';
    }
    return {
      id: row._id || row.id,
      product: row.product?.name || prodMap.get(row.product) || (typeof row.product === 'string' ? row.product : '') || '',
      quantityProduced: row.quantityProduced || 0,
      productionDate: fmtDate(row.productionDate),
      materialsUsed: Array.isArray(row.materialsUsed) 
        ? row.materialsUsed.map(mu => {
            const qty = mu.quantityUsed || 0;
            const unit = mu.unit || '';
            const name = getMaterialName(mu);
            return `${qty}${unit ? ' ' + unit : ''} ${name}`.trim();
          }).filter(Boolean).join(', ') || ''
        : '',
    };
  }

  function normalizePayload(draft) {
    const prodId = typeof draft.product === 'object' ? (draft.product._id || draft.product.id) : draft.product;
    let materialsUsed = draft.materialsUsed;
    if (typeof materialsUsed === 'string') {
      try { materialsUsed = JSON.parse(materialsUsed); } catch { materialsUsed = []; }
    }
    if (!Array.isArray(materialsUsed)) materialsUsed = [];
    const normalizedMaterials = materialsUsed
      .map((mu) => ({
        material: typeof mu.material === 'object' ? (mu.material?._id || mu.material?.id) : mu.material,
        quantityUsed: mu.quantityUsed === '' || mu.quantityUsed === undefined ? 0 : Number(mu.quantityUsed),
        unit: mu.unit || undefined,
      }))
      .filter((mu) => mu.material && mu.quantityUsed > 0);

    return {
      product: prodId,
      quantityProduced: draft.quantityProduced === '' || draft.quantityProduced === undefined ? 0 : Number(draft.quantityProduced),
      productionDate: draft.productionDate || null,
      materialsUsed: normalizedMaterials,
    };
  }

  return (
    <div className="admin-page">
      <div className="page-top">
        <h2>Production</h2>
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Production"
          columns={columns}
          initialRows={displayRows}
          renderEditor={({ column, value, draft, onChange }) => {
            if (column.key === 'product') {
              let prodId = typeof value === 'object' ? (value?._id || value?.id) : value;
              const ids = new Set(products.map((p) => (p._id || p.id)));
              if (!ids.has(prodId)) {
                const raw = originalRows.find((r) => (r._id || r.id) === draft.id);
                const id = raw ? (typeof raw.product === 'object' ? (raw.product._id || raw.product.id) : raw.product) : '';
                if (id) prodId = id;
              }
              return (
                <select value={prodId || ''} onChange={(e) => onChange(e.target.value)}>
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                  ))}
                </select>
              );
            }
            if (column.key === 'quantityProduced') {
              return <input type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
            }
            if (column.key === 'productionDate') {
              return <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value)} />;
            }
            if (column.key === 'materialsUsed') {
              let editorValue = value;
              if (typeof value === 'string') {
                const originalRow = originalRows.find((r) => (r._id || r.id) === draft.id);
                if (originalRow && Array.isArray(originalRow.materialsUsed)) {
                  editorValue = originalRow.materialsUsed;
                } else {
                  editorValue = [];
                }
              }
              if (!Array.isArray(editorValue)) editorValue = [];
              return <MaterialsEditor materials={materials} value={editorValue} onChange={onChange} />;
            }
            return null;
          }}
          onCreate={async (draft) => {
            const payload = normalizePayload(draft);
            const created = await createProduction(payload);
            
            // Deduct raw material quantities
            if (Array.isArray(payload.materialsUsed) && payload.materialsUsed.length > 0) {
              try {
                for (const mu of payload.materialsUsed) {
                  if (mu.material && mu.quantityUsed > 0) {
                    const rm = await getRawMaterial(mu.material);
                    if (rm) {
                      const currentQty = Number(rm.quantity || 0);
                      const used = Number(mu.quantityUsed || 0);
                      const newQty = Math.max(0, currentQty - used);
                      await updateRawMaterial(mu.material, { quantity: newQty });
                    }
                  }
                }
                // Refresh materials list for display
                listRawMaterials().then(setMaterials).catch(() => {});
              } catch (e) {
                console.error('Failed to update raw materials:', e);
              }
            }
            
            // Refresh immediately to get properly formatted data
            const refreshed = await listProductions();
            setRows(refreshed);
            setOriginalRows(refreshed);
            
            // Return a normalized version for CrudTable's immediate display
            return normalizeForDisplay(created);
          }}
          onUpdate={async (id, draft) => {
            const payload = normalizePayload(draft);
            const oldProduction = originalRows.find((r) => (r._id || r.id) === id);
            
            // Add back old quantities (reverse old deduction)
            if (oldProduction && Array.isArray(oldProduction.materialsUsed)) {
              try {
                for (const mu of oldProduction.materialsUsed) {
                  const matId = typeof mu.material === 'object' ? (mu.material?._id || mu.material?.id) : mu.material;
                  if (matId && mu.quantityUsed > 0) {
                    const rm = await getRawMaterial(matId);
                    if (rm) {
                      const currentQty = Number(rm.quantity || 0);
                      const oldUsed = Number(mu.quantityUsed || 0);
                      await updateRawMaterial(matId, { quantity: currentQty + oldUsed });
                    }
                  }
                }
              } catch (e) {
                console.error('Failed to reverse old raw materials:', e);
              }
            }
            
            const updated = await updateProduction(id, payload);
            
            // Deduct new quantities
            if (Array.isArray(payload.materialsUsed) && payload.materialsUsed.length > 0) {
              try {
                for (const mu of payload.materialsUsed) {
                  if (mu.material && mu.quantityUsed > 0) {
                    const rm = await getRawMaterial(mu.material);
                    if (rm) {
                      const currentQty = Number(rm.quantity || 0);
                      const used = Number(mu.quantityUsed || 0);
                      const newQty = Math.max(0, currentQty - used);
                      await updateRawMaterial(mu.material, { quantity: newQty });
                    }
                  }
                }
                listRawMaterials().then(setMaterials).catch(() => {});
              } catch (e) {
                console.error('Failed to update raw materials:', e);
              }
            }
            
            // Refresh immediately to get properly formatted data
            const refreshed = await listProductions();
            setRows(refreshed);
            setOriginalRows(refreshed);
            
            // Return a normalized version for CrudTable's immediate display
            return normalizeForDisplay(updated);
          }}
          onDelete={async (id) => {
            const oldProduction = originalRows.find((r) => (r._id || r.id) === id);
            
            // Add back quantities (reverse production)
            if (oldProduction && Array.isArray(oldProduction.materialsUsed)) {
              try {
                for (const mu of oldProduction.materialsUsed) {
                  const matId = typeof mu.material === 'object' ? (mu.material?._id || mu.material?.id) : mu.material;
                  if (matId && mu.quantityUsed > 0) {
                    const rm = await getRawMaterial(matId);
                    if (rm) {
                      const currentQty = Number(rm.quantity || 0);
                      const oldUsed = Number(mu.quantityUsed || 0);
                      await updateRawMaterial(matId, { quantity: currentQty + oldUsed });
                    }
                  }
                }
                listRawMaterials().then(setMaterials).catch(() => {});
              } catch (e) {
                console.error('Failed to restore raw materials:', e);
              }
            }
            
            await deleteProduction(id);
            listProductions().then((data) => {
              setRows(data);
              setOriginalRows(data);
            }).catch(() => {});
          }}
        />
      </div>
    </div>
  );
}

export default Productions;


