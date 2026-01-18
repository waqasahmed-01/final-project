// donation-create.js

const API_BASE = 'http://localhost:3000';
const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const form = document.getElementById('donationForm');
const messageBox = document.getElementById('formMessage');

function showMessage(type, text) {
  messageBox.style.display = 'block';
  messageBox.textContent = text;
  messageBox.className = type === 'error' ? 'msg-error' : 'msg-success';
}

// 🔒 AUTH GUARD
if (!token || role !== 'donor') {
  showMessage('error', 'Please login as a donor to create a donation.');
  setTimeout(() => {
    window.location.href = './donor-login.html';
  }, 1500);
}

// Simple validation helpers
function isValidText(value, min = 3) {
  return value && value.length >= min;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageBox.style.display = 'none';

  const foodName = document.getElementById('foodName').value.trim();
  const foodType = document.getElementById('foodType').value;
  const quantity = document.getElementById('quantity').value.trim();
  const location = document.getElementById('location').value.trim();

  // ✅ CLIENT-SIDE VALIDATION
  if (!isValidText(foodName)) {
    showMessage('error', 'Food name must be at least 3 characters.');
    return;
  }

  if (!foodType) {
    showMessage('error', 'Please select a food type.');
    return;
  }

  if (!isValidText(quantity, 1)) {
    showMessage('error', 'Please enter a valid quantity.');
    return;
  }

  if (!isValidText(location, 5)) {
    showMessage('error', 'Pickup location must be detailed.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        foodName,
        foodType,
        quantity,
        location,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage('error', data || 'Failed to create donation.');
      return;
    }

    showMessage(
      'success',
      'Donation created successfully! Redirecting to dashboard...',
    );

    setTimeout(() => {
      window.location.href = './donor-dashboard.html';
    }, 4000);
  } catch (err) {
    console.error(err);
    showMessage('error', 'Server error. Please try again later.');
  }
});
