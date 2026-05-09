requireAuth();

const user    = getUser();
let studentId = null;
let classId   = null;

document.getElementById('user-name').textContent = user?.first_name || 'Student';

function navigate(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById(`section-${section}`)?.classList.add('active');
  document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
  loaders[section]?.();
}

async function loadDashboard() {
  await loadStudentProfile();
  if (!studentId) return;
  await Promise.all([loadBalance(), loadRecentTx(), loadRecentGrades(), loadAttendanceStat()]);
}

async function loadStudentProfile() {
  try {
    const res = await api.getStudent(user.id);
    studentId = res.data.id;
    classId   = res.data.class_id;
  } catch {}
}

async function loadBalance() {
  try {
    const res = await api.getBalance(studentId);
    const bal = parseFloat(res.data.balance);
    document.getElementById('stat-balance').textContent       = bal.toLocaleString();
    document.getElementById('fee-balance-amount').textContent = bal.toLocaleString();
    if (bal < 5000) {
      document.getElementById('low-balance-alert').innerHTML =
        `<div class="alert alert-warning">⚠️ Low fee balance: RWF ${bal.toLocaleString()}. Please make a payment soon.</div>`;
    }
  } catch {}
}

async function loadRecentTx() {
  try {
    const res   = await api.getHistory(studentId);
    const tbody = document.getElementById('recent-tx-body');
    tbody.innerHTML = res.data.slice(0, 5).map(tx => `
      <tr>
        <td>${new Date(tx.created_at).toLocaleDateString()}</td>
        <td><span class="badge ${tx.type==='deposit'?'badge-success':'badge-warning'}">${tx.type}</span></td>
        <td>RWF ${parseFloat(tx.amount).toLocaleString()}</td>
        <td>RWF ${parseFloat(tx.balance_after).toLocaleString()}</td>
        <td><span class="badge badge-info">${tx.status}</span></td>
      </tr>`).join('') || '<tr><td colspan="5" class="empty-state"><p>No transactions yet</p></td></tr>';
  } catch {}
}

async function loadRecentGrades() {
  try {
    const res   = await api.getMyGrades(studentId);
    const tbody = document.getElementById('recent-grades-body');
    tbody.innerHTML = res.data.slice(0, 5).map(g => `
      <tr>
        <td>${g.subject_name}</td>
        <td>${g.term}</td>
        <td>${g.score ?? '—'}</td>
        <td><span class="badge ${gradeColor(g.score)}">${g.grade_letter || gradeLetter(g.score)}</span></td>
      </tr>`).join('') || '<tr><td colspan="4"><div class="empty-state"><p>No grades yet</p></div></td></tr>';
    const avg = res.data.reduce((s, g) => s + (g.score || 0), 0) / (res.data.length || 1);
    document.getElementById('stat-grade').textContent = avg.toFixed(1);
  } catch {}
}

async function loadAttendanceStat() {
  try {
    const res     = await api.getMyAttendance(studentId);
    const present = res.data.filter(a => a.status === 'present').length;
    const pct     = res.data.length ? ((present / res.data.length) * 100).toFixed(0) : 0;
    document.getElementById('stat-attendance').textContent = `${pct}%`;
  } catch {}
}

async function loadGrades() {
  if (!studentId) await loadStudentProfile();
  try {
    const res   = await api.getMyGrades(studentId);
    const tbody = document.getElementById('grades-body');
    tbody.innerHTML = res.data.length ? res.data.map(g => `
      <tr>
        <td>${g.subject_name}</td><td>${g.term}</td>
        <td>${g.score ?? '—'}</td><td>${g.max_score}</td>
        <td><span class="badge ${gradeColor(g.score)}">${g.grade_letter || gradeLetter(g.score)}</span></td>
        <td>${g.comments || '—'}</td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📝</div><p>No grades recorded yet</p></div></td></tr>';
  } catch {}
}

async function loadAttendance() {
  if (!studentId) await loadStudentProfile();
  try {
    const res   = await api.getMyAttendance(studentId);
    const tbody = document.getElementById('attendance-body');
    tbody.innerHTML = res.data.length ? res.data.map(a => `
      <tr>
        <td>${new Date(a.date).toLocaleDateString()}</td>
        <td>${a.subject_name}</td>
        <td><span class="badge ${statusBadge(a.status)}">${a.status}</span></td>
        <td>${a.notes || '—'}</td>
      </tr>`).join('') : '<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📅</div><p>No attendance records</p></div></td></tr>';
  } catch {}
}

async function loadTimetable() {
  if (!classId) await loadStudentProfile();
  const container = document.getElementById('timetable-container');
  if (!classId) { container.innerHTML = '<div class="empty-state"><p>Not assigned to a class yet</p></div>'; return; }
  try {
    const res  = await api.getTimetable(classId);
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    container.innerHTML = `<div class="timetable-grid">${days.map((d, i) => {
      const slots = res.data.filter(s => s.day_of_week === i + 1);
      return `<div>
        <div class="timetable-day">${d}</div>
        ${slots.length ? slots.map(s => `
          <div class="timetable-slot">
            <div class="subject">${s.subject_name}</div>
            <div class="time">${s.start_time} – ${s.end_time}</div>
            <div class="room">${s.room || ''}</div>
          </div>`).join('') : '<div class="timetable-slot empty">Free</div>'}
      </div>`;
    }).join('')}</div>`;
  } catch { container.innerHTML = '<div class="empty-state"><p>Could not load timetable</p></div>'; }
}

async function loadFees() {
  if (!studentId) await loadStudentProfile();
  await Promise.all([loadBalance(), loadTxHistory()]);
}

async function loadTxHistory() {
  try {
    const res   = await api.getHistory(studentId);
    const tbody = document.getElementById('tx-history-body');
    tbody.innerHTML = res.data.length ? res.data.map(tx => `
      <tr>
        <td>${new Date(tx.created_at).toLocaleDateString()}</td>
        <td><span class="badge ${tx.type==='deposit'?'badge-success':'badge-warning'}">${tx.type}</span></td>
        <td>RWF ${parseFloat(tx.amount).toLocaleString()}</td>
        <td>RWF ${parseFloat(tx.balance_after).toLocaleString()}</td>
        <td>${tx.description || '—'}</td>
        <td><span class="badge badge-info">${tx.status}</span></td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💰</div><p>No transactions yet</p></div></td></tr>';
  } catch {}
}

async function loadDevices() {
  try {
    const res   = await api.getMyDevices();
    const tbody = document.getElementById('devices-body');
    tbody.innerHTML = res.data.map(d => `
      <tr>
        <td>${d.device_name || 'Unknown Device'}</td>
        <td><code style="font-size:11px;color:var(--text-muted)">${d.device_id}</code></td>
        <td>${d.is_verified
          ? '<span class="badge badge-success">Verified</span>'
          : '<span class="badge badge-warning">Pending admin approval</span>'}</td>
        <td>${new Date(d.created_at).toLocaleDateString()}</td>
      </tr>`).join('');
  } catch {}
}

async function loadNotifications() {
  try {
    const res    = await api.getNotifications();
    const unread = res.data.filter(n => !n.is_read).length;
    const badge  = document.getElementById('notif-count');
    badge.style.display = unread ? 'inline' : 'none';
    badge.textContent   = unread;
    document.getElementById('notif-list').innerHTML = res.data.length ? res.data.map(n => `
      <div class="notif-item ${n.is_read ? '' : 'unread'}" onclick="markRead('${n.id}', this)">
        <div class="notif-icon ${n.type}">
          ${({ payment:'[Pay]', refund:'[Ref]', low_balance:'[Low]', login:'[Login]' })[n.type] || '[Notif]'}
        </div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${new Date(n.created_at).toLocaleString()}</div>
        </div>
      </div>`).join('') : '<div class="empty-state" style="padding:32px"><div class="empty-icon">🔔</div><p>No notifications</p></div>';
  } catch {}
}

async function markRead(id, el) {
  try { await api.markRead(id); el.classList.remove('unread'); } catch {}
}

async function markAllRead() {
  try { await api.markAllRead(); document.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread')); } catch {}
}

document.getElementById('deposit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById('deposit-alert');
  try {
    const res = await api.deposit({
      student_id:  studentId,
      amount:      parseFloat(document.getElementById('deposit-amount').value),
      description: document.getElementById('deposit-desc').value,
    });
    alertEl.innerHTML = `<div class="alert alert-success">Deposit successful. New balance: RWF ${parseFloat(res.data.balance).toLocaleString()}</div>`;
    document.getElementById('deposit-form').reset();
    loadFees();
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
});

document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const alertEl = document.getElementById('withdraw-alert');
  try {
    const res = await api.withdraw({
      student_id:  studentId,
      amount:      parseFloat(document.getElementById('withdraw-amount').value),
      description: document.getElementById('withdraw-desc').value,
    });
    alertEl.innerHTML = `<div class="alert alert-success">Withdrawal processed. New balance: RWF ${parseFloat(res.data.balance).toLocaleString()}</div>`;
    document.getElementById('withdraw-form').reset();
    loadFees();
  } catch (err) {
    alertEl.innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
  }
});

function gradeLetter(score) {
  if (!score) return '—';
  if (score >= 80) return 'A'; if (score >= 70) return 'B';
  if (score >= 60) return 'C'; if (score >= 50) return 'D'; return 'F';
}

function gradeColor(score) {
  if (!score) return 'badge-grey';
  if (score >= 70) return 'badge-success'; if (score >= 50) return 'badge-warning'; return 'badge-danger';
}

function statusBadge(s) {
  return { present:'badge-success', absent:'badge-danger', late:'badge-warning', excused:'badge-info' }[s] || 'badge-grey';
}

const loaders = {
  dashboard:     loadDashboard,
  grades:        loadGrades,
  attendance:    loadAttendance,
  timetable:     loadTimetable,
  fees:          loadFees,
  devices:       loadDevices,
  notifications: loadNotifications,
};

navigate('dashboard');
