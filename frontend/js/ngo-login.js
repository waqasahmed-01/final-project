// ngo-login.js

const API_BASE = 'http://localhost:3000/api';

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.querySelector("input[type='email']").value.trim();
  const password = document
    .querySelector("input[type='password']")
    .value.trim();

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Login failed.');
      return;
    }

    // NGO approval check (your backend already rejects if not approved)
    if (data.profile.role === 'ngo') {
      alert('Login successful!');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.profile.role);
    localStorage.setItem('name', data.profile.user);

    window.location.href = './ngo-dashboard.html';
  } catch (err) {
    console.error(err);
    alert('Error connecting to the server.');
  }
});
