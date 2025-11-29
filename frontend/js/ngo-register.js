// ngo-register.js

const API_BASE = 'http://localhost:5000/api';

document.querySelector('button').addEventListener('click', async (e) => {
  e.preventDefault();

  const name = document
    .querySelector("input[placeholder='NGO Name']")
    .value.trim();
  const email = document
    .querySelector("input[placeholder='Official Email']")
    .value.trim();
  const password = document
    .querySelector("input[placeholder='Password']")
    .value.trim();

  if (!name || !email || !password) {
    alert('All fields are required.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/users`, {
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
      alert(data.message || 'NGO registration failed.');
      return;
    }

    alert('NGO registered successfully! Waiting for admin approval.');
    window.location.href = './ngo-login.html';
  } catch (err) {
    console.error(err);
    alert('Something went wrong. Try again.');
  }
});
