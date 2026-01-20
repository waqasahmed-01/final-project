// admin-dashboard.js

const API_BASE = 'http://localhost:3000/api';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

// DOM elements
const totalDonorsEl = document.getElementById('totalDonors');
const totalNgosEl = document.getElementById('totalNgos');
const pendingNgosEl = document.getElementById('pendingNgos');
const totalDonationsEl = document.getElementById('totalDonations');

// 🔒 AUTH GUARD (ADMIN ONLY)
if (!token || role !== 'admin') {
  window.location.href = './admin-login.html';
}

// Fetch admin stats
async function loadAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to load admin stats');
    }

    totalDonorsEl.textContent = data.totalDonors;
    totalNgosEl.textContent = data.totalNgos;
    pendingNgosEl.textContent = data.pendingNgos;
    totalDonationsEl.textContent = data.totalDonations;
  } catch (err) {
    console.error(err);

    // fallback UI
    totalDonorsEl.textContent = '—';
    totalNgosEl.textContent = '—';
    pendingNgosEl.textContent = '—';
    totalDonationsEl.textContent = '—';
  }
}

// INIT
loadAdminStats();
