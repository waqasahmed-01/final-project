const API = 'http://localhost:3000/api/admin';
const token = localStorage.getItem('token');
const table = document.getElementById('donationsTable');

const statusColors = {
  pending: 'warning',
  accepted: 'info',
  'picked-up': 'primary',
  completed: 'success',
  rejected: 'danger',
};

async function loadDonations() {
  const res = await fetch(`${API}/donations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  table.innerHTML = '';

  data.forEach((d, i) => {
    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${d.foodName}</td>
        <td>${d.donor?.name || '-'}</td>
        <td>${d.ngo?.name || '-'}</td>
        <td>
          <span class="badge bg-${statusColors[d.status] || 'secondary'}">
            ${d.status.toUpperCase()}
          </span>
        </td>
        <td>${d.phoneNumber || '-'}</td>
      </tr>
    `;
  });
}

loadDonations();
