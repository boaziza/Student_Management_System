document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn      = document.getElementById('submit-btn');
  const alertBox = document.getElementById('alert-box');
  alertBox.innerHTML = '';

  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm_password').value;

  if (password !== confirm) {
    alertBox.innerHTML = '<div class="alert alert-danger">Passwords do not match.</div>';
    return;
  }

  btn.textContent = 'Creating account…';
  btn.disabled    = true;

  try {
    await api.register({
      first_name: document.getElementById('first_name').value.trim(),
      last_name:  document.getElementById('last_name').value.trim(),
      email:      document.getElementById('email').value.trim(),
      phone:      document.getElementById('phone').value.trim(),
      role:       document.getElementById('role').value,
      password,
    });

    alertBox.innerHTML = `
      <div class="alert alert-success">
        Account created. Please wait for an admin to verify your device before logging in.
      </div>`;
    document.getElementById('register-form').reset();
  } catch (err) {
    alertBox.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  } finally {
    btn.textContent = 'Create Account';
    btn.disabled    = false;
  }
});
