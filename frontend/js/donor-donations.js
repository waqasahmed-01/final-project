const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const tableBody = document.getElementById('donationsTableBody');

function showRowMessage(text) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center text-muted">${text}</td>
    </tr>
  `;
}

// Auth guard
if (!token || role !== 'donor') {
  window.location.href = './donor-login.html';
}

// Status badge helper
function getStatusBadge(status) {
  switch (status) {
    case 'pending':
      return `<span class="badge bg-warning text-dark">Pending</span>`;
    case 'accepted':
      return `<span class="badge bg-success">Accepted</span>`;
    case 'rejected':
      return `<span class="badge bg-danger">Rejected</span>`;
    default:
      return `<span class="badge bg-secondary">${status}</span>`;
  }
}

// Status message helper
function getStatusMessage(status) {
  switch (status) {
    case 'pending':
      return 'Waiting for NGO response ⏳';
    case 'accepted':
      return 'Donation accepted. Rider is on the way 🚚';
    case 'rejected':
      return 'Donation rejected by NGO ❌';
    default:
      return '-';
  }
}

async function loadMyDonations() {
  try {
    const res = await fetch(`${API_BASE}/donations/my-donations`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      showRowMessage('Failed to load donations');
      return;
    }

    if (data.length === 0) {
      showRowMessage('You have not made any donations yet');
      return;
    }

    tableBody.innerHTML = '';

    data.forEach((donation, index) => {
      tableBody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${donation.foodName}</td>
          <td>${donation.quantity}</td>
          <td>${getStatusBadge(donation.status)}</td>
          <td>${getStatusMessage(donation.status)}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    showRowMessage('Server error');
  }
}

loadMyDonations();
