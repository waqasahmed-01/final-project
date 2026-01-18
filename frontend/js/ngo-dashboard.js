const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const tableBody = document.getElementById('donationsTableBody');
const actionMessage = document.getElementById('actionMessage');

// ---------- helpers ----------
function showMessage(type, text) {
  const colors = {
    success: 'alert alert-success',
    error: 'alert alert-danger',
    info: 'alert alert-info',
  };

  actionMessage.className = colors[type];
  actionMessage.textContent = text;
}

function clearMessage() {
  actionMessage.className = '';
  actionMessage.textContent = '';
}

function showTableSpinner() {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center py-4">
        <div class="spinner-border text-success spinner-border-sm"></div>
        <span class="ms-2">Loading donations...</span>
      </td>
    </tr>
  `;
}

function showRowMessage(text) {
  tableBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center text-muted py-3">${text}</td>
    </tr>
  `;
}

// ---------- auth guard ----------
if (!token || role !== 'ngo') {
  window.location.href = './ngo-login.html';
}

// ---------- load donations ----------
async function loadDonations() {
  // clearMessage();
  showTableSpinner();

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
          <td>${donation.donor?.name || 'Unknown'}</td>
          <td>${donation.foodName}</td>
          <td>${donation.quantity}</td>
          <td>
            <button
              class="btn btn-success btn-sm me-2"
              data-id="${donation._id}"
              onclick="updateStatus('${donation._id}', 'accept')"
            >
              Accept
            </button>

            <button
              class="btn btn-danger btn-sm"
              data-id="${donation._id}"
              onclick="updateStatus('${donation._id}', 'reject')"
            >
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

// ---------- accept / reject ----------
async function updateStatus(donationId, action) {
  if (!confirm(`Are you sure you want to ${action} this donation?`)) return;

  clearMessage();
  showMessage('info', 'Processing request...');

  // disable buttons
  const buttons = document.querySelectorAll(`button[data-id='${donationId}']`);
  buttons.forEach((btn) => (btn.disabled = true));

  try {
    const res = await fetch(`${API_BASE}/donations/${donationId}/${action}`, {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage('error', data.message || 'Action failed');
      buttons.forEach((btn) => (btn.disabled = false));
      return;
    }

    showMessage(
      'success',
      `Donation ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
    );

    setTimeout(loadDonations, 600);
  } catch (err) {
    console.error(err);
    showMessage('error', 'Server error');
    buttons.forEach((btn) => (btn.disabled = false));
  }
}
