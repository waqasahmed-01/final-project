const finalMsg = document.getElementById('final');
// Helper to show messages in <p id="final">
function showMessage(msg, color) {
  finalMsg.textContent = msg;
  finalMsg.style.color = color;
}
document
  .getElementById('register-form')
  .addEventListener('click', async (event) => {
    event.preventDefault();
    const name = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    if (!name || !email || !password) {
      showMessage('All fields are required.', red);
    }
    try {
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role: 'donor',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return showMessage(data.message || 'Registration failed', 'red');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      alert('Registration successful!');
      window.location.href = './donor-login.html';
    } catch (err) {
      console.error(err);
      showMessage('Server not responding. Try again later.', 'red');
    }
  });
