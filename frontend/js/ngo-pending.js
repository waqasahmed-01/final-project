// ngo-pending.js

const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const msgBox = document.getElementById('msgBox');
const list = document.getElementById('pendingList');

function showMsg(type, text) {
  msgBox.style.display = 'block';
  msgBox.textContent = text;
  msgBox.className = 'msg ' + (type === 'error' ? 'msg-error' : 'msg-success');
}

if (!token || role !== 'ngo') {
  showMsg('error', 'Only NGOs can access this page.');
  setTimeout(() => (window.location.href = './ngo-login.html'), 1500);
}

async function loadPending() {
  try {
    const res = await fetch(`${API_BASE}/donations/pending`, {
      headers: { Authorization: 'Bearer ' + token },
    });

    const data = await res.json();

    if (!res.ok) {
      showMsg('error', data.message || 'Could not load donations.');
      return;
    }

    if (data.length === 0) {
      list.innerHTML = `<p class="text-center fw-semibold mt-4">No pending donations.</p>`;
      return;
    }

    list.innerHTML = data
      .map(
        (d) => `
      <div class="col-md-6">
        <div class="donation-card">

          <h5 class="fw-bold">${d.foodName}</h5>
          <p class="text-muted mb-1"><strong>Type:</strong> ${d.foodType}</p>
          <p class="text-muted mb-1"><strong>Quantity:</strong> ${d.quantity}</p>
          <p class="text-muted mb-1"><strong>Pickup:</strong> ${d.location}</p>
          <p class="text-muted mb-3"><strong>Donor:</strong> ${d.donor.name} (${d.donor.email})</p>

          <div class="d-flex gap-2">
            <button class="btn btn-accept" onclick="acceptDonation('${d._id}')">Accept</button>
            <button class="btn btn-reject" onclick="rejectDonation('${d._id}')">Reject</button>
          </div>

        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    console.error(err);
    showMsg('error', 'Server error.');
  }
}

async function acceptDonation(id) {
  try {
    const res = await fetch(`${API_BASE}/donations/${id}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await res.json();

    if (!res.ok) return showMsg('error', data.message);

    showMsg('success', 'Donation accepted!');
    loadPending();
  } catch (err) {
    showMsg('error', 'Server error.');
  }
}

async function rejectDonation(id) {
  try {
    const res = await fetch(`${API_BASE}/donations/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await res.json();

    if (!res.ok) return showMsg('error', data.message);

    showMsg('success', 'Donation rejected.');
    loadPending();
  } catch (err) {
    showMsg('error', 'Server error.');
  }
}

loadPending();
