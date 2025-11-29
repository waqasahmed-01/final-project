// donation-create.js

const API_BASE = 'http://localhost:5000/api';

const token = localStorage.getItem('token');
const role = localStorage.getItem('role');

const messageBox = document.getElementById('formMessage');

function showMessage(type, text) {
  messageBox.style.display = 'block';
  messageBox.textContent = text;

  if (type === 'error') {
    messageBox.className = 'msg-error';
  } else {
    messageBox.className = 'msg-success';
  }
}

if (!token || role !== 'donor') {
  showMessage(
    'error',
    'You must be logged in as a Donor to create a donation.'
  );
  setTimeout(() => {
    window.location.href = '../pages/donor-login.html';
  }, 1500);
}

document
  .getElementById('donationForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    // get values
    const foodName = document.getElementById('foodName').value.trim();
    const foodType = document.getElementById('foodType').value;
    const quantity = document.getElementById('quantity').value.trim();
    const location = document.getElementById('location').value.trim();

    // simple validation
    if (!foodName || !foodType || !quantity || !location) {
      showMessage('error', 'Please fill all fields before submitting.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
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
        showMessage(
          'error',
          data.message || 'Something went wrong. Try again.'
        );
        return;
      }

      // SUCCESS
      showMessage('success', 'Donation created successfully!');

      // Redirect after delay
      setTimeout(() => {
        window.location.href = './donor-donations.html';
      }, 1200);
    } catch (err) {
      console.error(err);
      showMessage('error', 'Server error. Please try again later.');
    }
  });
