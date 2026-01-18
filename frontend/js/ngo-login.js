// ngo-login.js

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

  const email = document.querySelector("input[type='email']").value.trim();
  const password = document.getElementById('password').value.trim();

  // ✅ CLIENT-SIDE VALIDATION
  if (!email || !password) {
    showMessage('Email and password are required.');
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
    const res = await fetch(`${API_BASE}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || 'Invalid email or password.');
      return;
    }

    // ✅ ensure NGO role
    if (data.profile.role !== 'ngo') {
      showMessage('Access denied. Not an NGO account.');
      return;
    }

    // ✅ store auth info
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.profile.role);
    localStorage.setItem('name', data.profile.user);

    showMessage('Login successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = './ngo-dashboard.html';
    }, 1000);
  } catch (err) {
    console.error(err);
    showMessage('Server not responding. Please try again later.');
  }
});
