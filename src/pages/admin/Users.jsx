import React, { useEffect, useState } from 'react';
import CrudTable from '../../components/CrudTable';
import { listUsers, createUser as createUserSvc, updateUser as updateUserSvc, deleteUser as deleteUserSvc } from '../../services/userService';

function Users() {
  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];
  const [rows, setRows] = useState([]);

  useEffect(() => {
    listUsers().then(setRows).catch(() => setRows([]));
  }, []);
  return (
    <div className="admin-page">
      <div className="page-top">
        <h2>Users</h2>
        <div className="page-actions">
          <button className="admin-primary">New User</button>
        </div>
      </div>
      <div className="page-scroll">
        <CrudTable
          title="Users"
          columns={columns}
          initialRows={rows}
          onCreate={async (draft) => createUserSvc(draft)}
          onUpdate={async (id, draft) => updateUserSvc(id, draft)}
          onDelete={async (id) => deleteUserSvc(id)}
        />
      </div>
    </div>
  );
}

export default Users;


