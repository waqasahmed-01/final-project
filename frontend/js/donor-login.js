// donor-login.js

const API_BASE = 'http://localhost:3000';
const form = document.querySelector('form');
const finalMsg = document.getElementById('final');

// show message in <p id="final">
function showMessage(message, type = 'error') {
  finalMsg.textContent = message;
  finalMsg.style.color = type === 'success' ? 'green' : 'red';
}

// simple email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  finalMsg.textContent = '';

  const email = document.querySelector("input[type='email']").value.trim();
  const password = document
    .querySelector("input[type='password']")
    .value.trim();

  // CLIENT-SIDE VALIDATION
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

    //STORE AUTH DATA
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.profile.role);
    localStorage.setItem('name', data.profile.user);

    showMessage('Login successful! Redirecting...', 'success');

    // REDIRECT BASED ON ROLE (SAFE)
    setTimeout(() => {
      if (data.profile.role === 'donor') {
        window.location.href = './donor-dashboard.html';
      } else if (data.profile.role === 'ngo') {
        window.location.href = './ngo-dashboard.html';
      } else {
        window.location.href = './index.html';
      }
    }, 1000);
  } catch (err) {
    console.error(err);
    showMessage('Server not responding. Please try again later.');
  }
});
