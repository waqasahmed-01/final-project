// admin-panel.js

const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const msgBox = document.getElementById('msgBox');
const ngolist = document.getElementById('pendingNgos');
const donationsList = document.getElementById('donationsList');

function showMsg(type, text) {
  msgBox.style.display = 'block';
  msgBox.textContent = text;
  msgBox.className = 'msg ' + (type === 'error' ? 'msg-error' : 'msg-success');
}

if (!token || role !== 'admin') {
  showMsg('error', 'Admins only. Access denied.');
  setTimeout(() => (window.location.href = './admin-login.html'), 1200);
}

/* -----------------------------------------
   LOAD PENDING NGOs
------------------------------------------ */
async function loadPendingNgos() {
  try {
    const res = await fetch(`${API_BASE}/admin/ngos/pending`, {
      headers: { Authorization: 'Bearer ' + token },
    });

    const data = await res.json();

    if (!res.ok) return showMsg('error', data.message);

    if (data.length === 0) {
      ngolist.innerHTML = `<p class="text-muted">No NGOs pending approval.</p>`;
      return;
    }

    ngolist.innerHTML = data
      .map(
        (ngo) => `
      <div class="col-md-6">
        <div class="p-3 border rounded bg-light">
          <h5 class="fw-bold">${ngo.name}</h5>
          <p class="mb-1"><strong>Email:</strong> ${ngo.email}</p>

          <button class="btn btn-approve mt-2" onclick="approveNgo('${ngo._id}')">
            Approve
          </button>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    showMsg('error', 'Server error.');
  }
}

/* -----------------------------------------
   APPROVE NGO
------------------------------------------ */
async function approveNgo(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/ngos/approve/${id}`, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + token },
    });

    const data = await res.json();

    if (!res.ok) return showMsg('error', data.message);

    showMsg('success', 'NGO Approved Successfully!');
    loadPendingNgos();
  } catch (err) {
    showMsg('error', 'Server error.');
  }
}

/* -----------------------------------------
   LOAD ALL DONATIONS
------------------------------------------ */
async function loadAllDonations() {
  try {
    const res = await fetch(`${API_BASE}/donations`, {
      headers: { Authorization: 'Bearer ' + token },
    });

    const data = await res.json();

    if (!res.ok) return showMsg('error', data.message);

    donationsList.innerHTML = data
      .map(
        (d) => `
      <div class="col-md-6">
        <div class="p-3 border rounded bg-light">
          <h5 class="fw-bold">${d.foodName}</h5>
          <p class="text-muted mb-1"><strong>Type:</strong> ${d.foodType}</p>
          <p class="text-muted mb-1"><strong>Quantity:</strong> ${
            d.quantity
          }</p>
          <p class="text-muted mb-1"><strong>Pickup:</strong> ${d.location}</p>
          <p class="text-muted mb-1"><strong>Donor:</strong> ${
            d.donor?.name
          }</p>
          <p class="text-muted mb-1"><strong>NGO:</strong> ${
            d.ngo?.name || '—'
          }</p>

          <span class="badge bg-${
            d.status === 'pending'
              ? 'warning'
              : d.status === 'accepted'
              ? 'info'
              : d.status === 'picked-up'
              ? 'primary'
              : d.status === 'completed'
              ? 'success'
              : 'danger'
          }">${d.status.toUpperCase()}</span>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    showMsg('error', 'Server error.');
  }
}

loadPendingNgos();
loadAllDonations();
