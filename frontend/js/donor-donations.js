// donor-donations.js

const API_BASE = 'http://localhost:5000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const msg = document.getElementById('messageBox');
const list = document.getElementById('donationsList');

function showError(text) {
  msg.style.display = 'block';
  msg.textContent = text;
}

if (!token || role !== 'donor') {
  showError('You must be logged in as a Donor.');
  setTimeout(() => (window.location.href = './donor-login.html'), 1500);
}

async function loadDonations() {
  try {
    const res = await fetch(`${API_BASE}/donations/my-donations`, {
      headers: { Authorization: 'Bearer ' + token },
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.message || 'Error fetching donations.');
      return;
    }

    if (data.length === 0) {
      list.innerHTML = `<p class="text-center fw-semibold mt-4">No donations created yet.</p>`;
      return;
    }

    list.innerHTML = data
      .map((d) => {
        return `
        <div class="col-md-6">
          <div class="donation-card">
            <h5 class="fw-bold">${d.foodName}</h5>
            <p class="text-muted mb-1"><strong>Type:</strong> ${d.foodType}</p>
            <p class="text-muted mb-1"><strong>Quantity:</strong> ${
              d.quantity
            }</p>
            <p class="text-muted mb-1"><strong>Pickup:</strong> ${
              d.location
            }</p>
            <p class="text-muted mb-1"><strong>Created:</strong> ${new Date(
              d.createdAt
            ).toLocaleString()}</p>

            <span class="status-badge bg-${
              d.status === 'pending'
                ? 'warning'
                : d.status === 'accepted'
                ? 'success'
                : d.status === 'rejected'
                ? 'danger'
                : 'secondary'
            }">
              ${d.status.toUpperCase()}
            </span>

            ${
              d.ngo
                ? `<p class="mt-2"><strong>Accepted By:</strong> ${d.ngo.name}</p>`
                : ''
            }
          </div>
        </div>
      `;
      })
      .join('');
  } catch (err) {
    console.error(err);
    showError('Server error. Please try again later.');
  }
}

loadDonations();
