const API = 'http://localhost:3000/api/admin';
const token = localStorage.getItem('token');

const table = document.getElementById('ngoTable');
const msg = document.getElementById('message');

function showMessage(text, type = 'success') {
  msg.className = `alert alert-${type}`;
  msg.textContent = text;
}

async function loadPendingNgos() {
  const res = await fetch(`${API}/ngos/pending`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    showMessage('Failed to load NGOs', 'danger');
    return;
  }

  if (!data.length) {
    table.innerHTML = `<tr><td colspan="4" class="text-center">No pending NGOs</td></tr>`;
    return;
  }

  table.innerHTML = '';
  data.forEach((ngo, i) => {
    table.innerHTML += `
      <tr>
        <td>${i + 1}</td>
        <td>${ngo.name}</td>
        <td>${ngo.email}</td>
        <td>
          <button class="btn btn-success btn-sm"
            onclick="approveNgo('${ngo._id}')">
            Approve
          </button>
        </td>
      </tr>`;
  });
}

async function approveNgo(id) {
  if (!confirm('Approve this NGO?')) return;

  const res = await fetch(`${API}/ngos/approve/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    showMessage(data.message || 'Approval failed', 'danger');
    return;
  }

  showMessage('NGO approved successfully');
  loadPendingNgos();
}

loadPendingNgos();
