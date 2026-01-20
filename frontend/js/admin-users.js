const API = 'http://localhost:3000/api/admin';
const token = localStorage.getItem('token');
const table = document.getElementById('usersTable');

async function loadUsers() {
  const res = await fetch(`${API}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    table.innerHTML = `<tr><td colspan="5">Failed to load users</td></tr>`;
    return;
  }

  table.innerHTML = '';
  data.forEach((u, i) => {
    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td>
          ${
            u.role === 'ngo'
              ? u.isApproved
                ? 'Approved'
                : 'Pending'
              : 'Active'
          }
        </td>
      </tr>`;
  });
}

loadUsers();
