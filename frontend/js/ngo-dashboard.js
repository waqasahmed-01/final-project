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
if (!token || role !== 'ngo') {
  alert('Unauthorized access');
  window.location.href = './ngo-login.html';
}

// Fetch pending donations
async function loadDonations() {
  try {
    const res = await fetch(`${API_BASE}/donations/pending`, {
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
      showRowMessage('No pending donations available');
      return;
    }

    tableBody.innerHTML = '';

    data.forEach((donation, index) => {
      tableBody.innerHTML += `
        <tr>
          <td>${index + 1}</td>
          <td>${donation.donor.name}</td>
          <td>${donation.foodName}</td>
          <td>${donation.quantity}</td>
          <td>
            <button class="btn btn-success btn-sm me-2"
              onclick="updateStatus('${donation._id}', 'accepted')">
              Accept
            </button>
            <button class="btn btn-danger btn-sm"
              onclick="updateStatus('${donation._id}', 'rejected')">
              Reject
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error(err);
    showRowMessage('Server error');
  }
}

loadDonations();

async function updateStatus(donationId, status) {
  if (!confirm(`Are you sure you want to ${status} this donation?`)) return;

  try {
    const res = await fetch(`${API_BASE}/donations/${donationId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Action failed');
      return;
    }

    alert(`Donation ${status} successfully`);
    loadDonations(); // refresh list
  } catch (err) {
    console.error(err);
    alert('Server error');
  }
}
