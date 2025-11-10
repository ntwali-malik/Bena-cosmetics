import React, { useEffect, useMemo, useState } from 'react';

function CrudTable({ title, columns, initialRows = [], onCreate, onUpdate, onDelete, renderEditor, renderRowActions, canCreate = true, canDelete = true }) {
  const [rows, setRows] = useState(initialRows);
  useEffect(() => {
    setRows(initialRows || []);
  }, [initialRows]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // row index or null
  const [draft, setDraft] = useState({});

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
  }, [rows, query]);

  function startCreate() {
    setEditing('new');
    setDraft(columns.reduce((acc, c) => ({ ...acc, [c.key]: '' }), {}));
  }

  function startEdit(idx) {
    setEditing(idx);
    setDraft({ ...rows[idx] });
  }

  function cancelEdit() {
    setEditing(null);
    setDraft({});
  }

  async function saveEdit() {
    if (editing === 'new') {
      if (onCreate) {
        try {
          setError('');
          const created = await onCreate(draft);
          const normalized = created && typeof created === 'object' ? { id: created.id ?? created._id, ...created } : created;
          setRows((r) => [normalized, ...r]);
        } catch (e) {
          setError(e?.message || 'Save failed');
          return;
        }
      } else {
        setRows((r) => [{ id: Date.now(), ...draft }, ...r]);
      }
    } else if (typeof editing === 'number') {
      if (onUpdate) {
        try {
          setError('');
          const row = rows[editing];
          const rowId = row?.id ?? row?._id;
          const updated = await onUpdate(rowId, draft);
          const normalized = updated && typeof updated === 'object' ? { id: updated.id ?? updated._id, ...updated } : updated;
          setRows((r) => r.map((rw, i) => (i === editing ? normalized : rw)));
        } catch (e) {
          setError(e?.message || 'Save failed');
          return;
        }
      } else {
        setRows((r) => r.map((row, i) => (i === editing ? { ...row, ...draft } : row)));
      }
    }
    cancelEdit();
  }

  async function remove(idx) {
    if (onDelete) {
      const row = rows[idx];
      const rowId = row?.id ?? row?._id;
      await onDelete(rowId);
    }
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>{title}</h3>
        <div className="admin-actions">
          <input className="admin-search" placeholder="Search…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {canCreate && onCreate && (
            <button className="admin-primary" onClick={startCreate}>Add</button>
          )}
        </div>
      </div>

      {(editing !== null) && (
        <div className="admin-form">
          {error && (<div className="error-banner">{error}</div>)}
          {columns.map((c) => (
            <label key={c.key} className={`admin-field ${c.fullWidth ? 'full' : ''}`}>
              <span>{c.label}</span>
              {(() => {
                if (renderEditor) {
                  const custom = renderEditor({
                    column: c,
                    value: draft[c.key],
                    draft,
                    onChange: (val) => setDraft((d) => ({ ...d, [c.key]: val })),
                    setDraft,
                  });
                  if (custom !== null && custom !== undefined) return custom;
                }
                return (
                  <input placeholder={c.placeholder || ''} value={draft[c.key] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [c.key]: e.target.value }))} />
                );
              })()}
            </label>
          ))}
          <div className="admin-form-actions">
            <button className="admin-primary" onClick={saveEdit}>Save</button>
            <button className="admin-ghost" onClick={cancelEdit}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              {columns.map((c) => (<th key={c.key}>{c.label}</th>))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (<tr><td colSpan={columns.length + 1} className="empty">No data</td></tr>)}
            {filtered.map((r, idx) => (
              <tr key={r.id ?? idx}>
                {columns.map((c) => (<td key={c.key}>{r[c.key]}</td>))}
                <td className="admin-row-actions">
                  {renderRowActions ? (
                    renderRowActions({ row: r, idx, startEdit: () => startEdit(idx), remove: canDelete && onDelete ? () => remove(idx) : undefined })
                  ) : (
                    <>
                      <button className="admin-link" onClick={() => startEdit(idx)}>Edit</button>
                      {canDelete && onDelete && (
                        <button className="admin-link danger" onClick={() => remove(idx)}>Delete</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default CrudTable;


