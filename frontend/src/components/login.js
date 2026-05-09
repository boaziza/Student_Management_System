if (getToken()) {
  const u = getUser();
  window.location.href = u?.role === 'parent' ? 'parent.html' : 'student.html';
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn      = document.getElementById('submit-btn');
  const alertBox = document.getElementById('alert-box');
  btn.textContent = 'Signing in…';
  btn.disabled    = true;
  alertBox.innerHTML = '';

  try {
    const res = await api.login({
      email:     document.getElementById('email').value.trim(),
      password:  document.getElementById('password').value,
      device_id: getDeviceId(),
    });

    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user',  JSON.stringify(res.data.user));

    const role = res.data.user.role;
    window.location.href = role === 'parent' ? 'parent.html' : 'student.html';
  } catch (err) {
    alertBox.innerHTML  = `<div class="alert alert-danger">${err.message}</div>`;
    btn.textContent     = 'Sign In';
    btn.disabled        = false;
  }
});
