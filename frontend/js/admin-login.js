const API_BASE = 'http://localhost:3000/api';
const form = document.getElementById('adminLoginForm');
const message = document.getElementById('message');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || data.profile.role !== 'admin') {
      message.textContent = 'Unauthorized admin access';
      message.style.color = 'red';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('role', 'admin');

    window.location.href = './admin-dashboard.html';
  } catch (err) {
    message.textContent = 'Server error';
    message.style.color = 'red';
  }
});
