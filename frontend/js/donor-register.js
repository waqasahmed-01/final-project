const form = document.querySelector('form');
const finalMsg = document.getElementById('final');

function showMessage(message, type = 'error') {
  finalMsg.textContent = message;
  finalMsg.style.color = type === 'success' ? 'green' : 'red';
}

// Simple email validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  finalMsg.textContent = '';

  const name = document.getElementById('full-name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  // CLIENT-SIDE VALIDATION
  if (!name || !email || !password) {
    showMessage('All fields are required.');
    return;
  }

  if (name.length < 3) {
    showMessage('Name must be at least 3 characters.');
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
    const res = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        role: 'donor',
      }),
    });

    if (!res.ok) {
      // Generic backend error (duplicate email, etc.)
      showMessage('Registration failed. Email may already be registered.');
      return;
    }

    showMessage('Registration successful! Redirecting...', 'success');

    setTimeout(() => {
      window.location.href = './donor-register-success.html';
    }, 1200);
  } catch (error) {
    console.error(error);
    showMessage('Server not responding. Please try again later.');
  }
});
