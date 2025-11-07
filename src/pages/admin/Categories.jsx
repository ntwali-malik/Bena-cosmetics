import React, { useEffect, useMemo, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';

function Categories() {
  const columns = [
    { key: 'name', label: 'Category Name' },
    { key: 'description', label: 'Description' },
  ];
  const [rows, setRows] = useState([]);

  useEffect(() => {
    listCategories().then(setRows).catch(() => setRows([]));
  }, []);

  const displayRows = useMemo(() => rows.map((r) => ({ id: r._id || r.id, name: r.name, description: r.description })), [rows]);
  return (
    <div className="admin-page">
      <div className="page-top">
        <h2>Categories</h2>
        <div className="page-actions">
          <button className="admin-primary">New Category</button>
        </div>
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Categories"
          columns={columns}
          initialRows={displayRows}
          onCreate={async (draft) => createCategory(draft)}
          onUpdate={async (id, draft) => updateCategory(id, draft)}
          onDelete={async (id) => deleteCategory(id)}
        />
      </div>
    </div>
  );
}

export default Categories;


