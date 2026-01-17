// ngo-register.js

const API_BASE = 'http://localhost:3000';
const form = document.querySelector('form');
const finalMsg = document.getElementById('final');

function showMessage(message, type = 'error') {
  finalMsg.textContent = message;
  finalMsg.style.color = type === 'success' ? 'green' : 'red';
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  finalMsg.textContent = '';

  const name = document
    .querySelector("input[placeholder='NGO Name']")
    .value.trim();
  const email = document
    .querySelector("input[placeholder='Official Email']")
    .value.trim();
  const password = document
    .querySelector("input[placeholder='Password']")
    .value.trim();

  // ✅ CLIENT-SIDE VALIDATION
  if (!name || !email || !password) {
    showMessage('All fields are required.');
    return;
  }

  if (name.length < 3) {
    showMessage('NGO name must be at least 3 characters.');
    return;
  }

  if (!isValidEmail(email)) {
    showMessage('Please enter a valid email address.');
    return;
  }

  if (password.length < 6) {
    showMessage('Password must be at least 6 characters.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/ngo-signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role: 'ngo',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'NGO registration failed.');
      return;
    }

    showMessage('NGO registered successfully! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = './ngo-login.html';
    }, 1200);
  } catch (err) {
    console.error(err);
    showMessage('Server not responding. Please try again later.');
  }
});
