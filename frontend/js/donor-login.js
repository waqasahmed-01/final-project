// donor-login.js

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

    // store token and role
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.profile.role);
    localStorage.setItem('name', data.profile.user);

    alert('Login successful!');
    window.location.href = './donor-dashboard.html';
  } catch (err) {
    console.error(err);
    alert('Error connecting to server.');
  }
});
