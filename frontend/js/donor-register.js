document
  .getElementById('register-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = {
      name: document.getElementById('full-name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };
  });
