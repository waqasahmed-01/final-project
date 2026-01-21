const API_BASE = 'http://localhost:3000/api/admin';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

if (!token || role !== 'admin') {
  window.location.href = './admin-login.html';
}

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    document.getElementById('totalDonors').textContent = data.totalDonors;
    document.getElementById('totalNgos').textContent = data.totalNgos;
    document.getElementById('totalDonations').textContent = data.totalDonations;
  } catch (err) {
    console.error(err);
  }
}

loadStats();
