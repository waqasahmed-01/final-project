const API = 'http://localhost:3000/api/admin';
const token = localStorage.getItem('token');
const table = document.getElementById('donationsTable');

async function loadDonations() {
  const res = await fetch(`${API}/donations`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    table.innerHTML = `<tr><td colspan="6">Failed to load</td></tr>`;
    return;
  }

  table.innerHTML = '';
  data.forEach((d, i) => {
    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${d.foodName}</td>
        <td>${d.donor?.name || '-'}</td>
        <td>${d.ngo?.name || '-'}</td>
        <td><span class="badge bg-secondary">${d.status}</span></td>
        <td>${d.phoneNumber || '-'}</td>
      </tr>`;
  });
}

loadDonations();
