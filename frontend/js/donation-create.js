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
  }, 5000);
}

// Show / hide price
const isFreeSelect = document.getElementById('isFree');
const priceGroup = document.getElementById('priceGroup');

isFreeSelect.addEventListener('change', () => {
  priceGroup.style.display = isFreeSelect.value === 'false' ? 'block' : 'none';
});

// Validation helpers
function isValidText(value, min = 3) {
  return value && value.length >= min;
}

function isValidPhone(phone) {
  return /^[0-9+\-\s]{10,15}$/.test(phone);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  messageBox.style.display = 'none';

  const foodName = document.getElementById('foodName').value.trim();
  const foodType = document.getElementById('foodType').value;
  const quantity = document.getElementById('quantity').value.trim();
  const location = document.getElementById('location').value.trim();
  const phoneNumber = document.getElementById('phoneNumber').value.trim();
  const description = document.getElementById('description').value.trim();
  const isFree = isFreeSelect.value === 'true';
  const price = document.getElementById('price').value;

  // CLIENT VALIDATION
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

  if (!isValidPhone(phoneNumber)) {
    showMessage('error', 'Please enter a valid phone number.');
    return;
  }

  if (!isFree && (!price || Number(price) <= 0)) {
    showMessage('error', 'Please enter a valid price.');
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
        phoneNumber,
        description,
        isFree,
        price: isFree ? 0 : Number(price),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage('error', data || 'Failed to create donation.');
      return;
    }

    showMessage('success', 'Donation created successfully! Redirecting...');

    setTimeout(() => {
      window.location.href = './donor-dashboard.html';
    }, 4000);
  } catch (err) {
    console.error(err);
    showMessage('error', 'Server error. Please try again later.');
  }
});
