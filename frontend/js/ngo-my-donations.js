const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const tableBody = document.getElementById('donationsTableBody');
const pageMessage = document.getElementById('pageMessage');

// ---------- helpers ----------
function showMessage(type, text) {
  const classes = {
    error: 'alert alert-danger',
    info: 'alert alert-info',
  };

  pageMessage.className = classes[type];
  pageMessage.textContent = text;
}

function showTableMessage(text) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center text-muted py-3">${text}</td>
    </tr>
  `;
}

// ---------- auth guard ----------
if (!token || role !== 'ngo') {
  window.location.href = './ngo-login.html';
}

// ---------- load donations ----------
async function loadMyDonations() {
  showTableMessage('Loading your donations...');

  try {
    const res = await fetch(`${API_BASE}/donations/ngo/my`, {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      showTableMessage('Failed to load donations');
      return;
    }

    if (data.length === 0) {
      showTableMessage('No accepted or rejected donations yet');
      return;
    }

    tableBody.innerHTML = '';

    data.forEach((donation, index) => {
      const costBadge = donation.isFree
        ? `<span class="badge bg-success">Free</span>`
        : `<span class="badge bg-warning text-dark">
            PKR ${donation.price}
          </span>`;

      const statusBadge =
        donation.status === 'accepted'
          ? `<span class="badge bg-success">Accepted</span>`
          : `<span class="badge bg-danger">Rejected</span>`;

      tableBody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>
            <strong>${donation.foodName}</strong><br />
            <small class="text-muted">${donation.description || '—'}</small>
          </td>
          <td>${donation.donor?.name || 'Unknown'}</td>
          <td>${donation.phoneNumber}</td>
          <td>${donation.quantity}</td>
          <td>${costBadge}</td>
          <td>${statusBadge}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    showTableMessage('Server error');
  }
}

loadMyDonations();
