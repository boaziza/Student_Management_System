requireAuth();

const user = getUser();
let children = [], activeChild = null;

document.getElementById('user-name').textContent = user?.first_name || 'Parent';

function navigate(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  document.getElementById(`section-${section}`)?.classList.add('active');
  document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
  loaders[section]?.();
}

function onChildChange() {
  const id = document.getElementById('child-select').value;
  activeChild = children.find(c => c.id === id) || null;
  loadDashboardData();
}

async function loadDashboard() {
  await loadChildren();
  if (activeChild) loadDashboardData();
}

async function loadChildren() {
  try {
    const res = await request('GET', '/parents');
    const me  = res.data?.find(p => p.user_id === user.id);
    if (!me) return;
    const childRes = await request('GET', `/parents/${me.id}/children`);
    children = childRes.data || [];
    const sel = document.getElementById('child-select');
    sel.innerHTML = children.length
      ? children.map(c => `<option value="${c.id}">${c.first_name} ${c.last_name}</option>`).join('')
      : '<option value="">No children linked yet</option>';
    if (children.length) { activeChild = children[0]; loadDashboardData(); }
  } catch {}
}

async function loadDashboardData() {
  if (!activeChild) return;
  await Promise.all([loadBalance(), loadRecentTx(), loadAttendanceStat(), loadGradeStat()]);
}

async function loadBalance() {
  if (!activeChild) return;
  try {
    const res = await api.getBalance(activeChild.id);
    const bal = parseFloat(res.data.balance);
    document.getElementById('stat-balance').textContent       = bal.toLocaleString();
    document.getElementById('fee-balance-amount').textContent = bal.toLocaleString();
    document.getElementById('low-balance-alert').innerHTML    = bal < 5000
      ? `<div class="alert alert-warning">⚠️ Low balance for ${activeChild.first_name}: RWF ${bal.toLocaleString()}. Please make a payment.</div>` : '';
  } catch {}
}

async function loadRecentTx() {
  if (!activeChild) return;
  try {
    const res = await api.getHistory(activeChild.id);
    document.getElementById('recent-tx-body').innerHTML = res.data.slice(0, 5).map(tx => `
      <tr>
        <td>${new Date(tx.created_at).toLocaleDateString()}</td>
        <td><span class="badge ${tx.type==='deposit'?'badge-success':'badge-warning'}">${tx.type}</span></td>
        <td>RWF ${parseFloat(tx.amount).toLocaleString()}</td>
        <td>RWF ${parseFloat(tx.balance_after).toLocaleString()}</td>
        <td><span class="badge badge-info">${tx.status}</span></td>
      </tr>`).join('') || '<tr><td colspan="5"><div class="empty-state"><p>No transactions</p></div></td></tr>';
  } catch {}
}

async function loadAttendanceStat() {
  if (!activeChild) return;
  try {
    const res = await api.getMyAttendance(activeChild.id);
    const pct = res.data.length ? ((res.data.filter(a => a.status==='present').length / res.data.length) * 100).toFixed(0) : 0;
    document.getElementById('stat-attendance').textContent = `${pct}%`;
  } catch {}
}

async function loadGradeStat() {
  if (!activeChild) return;
  try {
    const res = await api.getMyGrades(activeChild.id);
    const avg = res.data.reduce((s, g) => s + (g.score || 0), 0) / (res.data.length || 1);
    document.getElementById('stat-grade').textContent = avg.toFixed(1);
  } catch {}
}

async function loadGrades() {
  if (!activeChild) return;
  try {
    const res = await api.getMyGrades(activeChild.id);
    document.getElementById('grades-body').innerHTML = res.data.length ? res.data.map(g => `
      <tr>
        <td>${g.subject_name}</td><td>${g.term}</td>
        <td>${g.score ?? '—'}</td><td>${g.max_score}</td>
        <td><span class="badge ${gradeColor(g.score)}">${g.grade_letter || gradeLetter(g.score)}</span></td>
        <td>${g.comments || '—'}</td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📝</div><p>No grades yet</p></div></td></tr>';
  } catch {}
}

async function loadAttendance() {
  if (!activeChild) return;
  try {
    const res = await api.getMyAttendance(activeChild.id);
    document.getElementById('attendance-body').innerHTML = res.data.length ? res.data.map(a => `
      <tr>
        <td>${new Date(a.date).toLocaleDateString()}</td><td>${a.subject_name}</td>
        <td><span class="badge ${statusBadge(a.status)}">${a.status}</span></td>
        <td>${a.notes || '—'}</td>
      </tr>`).join('') : '<tr><td colspan="4"><div class="empty-state"><div class="empty-icon">📅</div><p>No records</p></div></td></tr>';
  } catch {}
}

async function loadTimetable() {
  const c = document.getElementById('timetable-container');
  if (!activeChild?.class_id) { c.innerHTML = '<div class="empty-state"><p>Child not assigned to a class yet</p></div>'; return; }
  try {
    const res  = await api.getTimetable(activeChild.class_id);
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    c.innerHTML = `<div class="timetable-grid">${days.map((d, i) => {
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
  } catch { c.innerHTML = '<div class="empty-state"><p>Could not load timetable</p></div>'; }
}

async function loadFees() {
  if (!activeChild) return;
  await Promise.all([loadBalance(), loadTxHistory()]);
}

async function loadTxHistory() {
  if (!activeChild) return;
  try {
    const res = await api.getHistory(activeChild.id);
    document.getElementById('tx-history-body').innerHTML = res.data.length ? res.data.map(tx => `
      <tr>
        <td>${new Date(tx.created_at).toLocaleDateString()}</td>
        <td><span class="badge ${tx.type==='deposit'?'badge-success':'badge-warning'}">${tx.type}</span></td>
        <td>RWF ${parseFloat(tx.amount).toLocaleString()}</td>
        <td>RWF ${parseFloat(tx.balance_after).toLocaleString()}</td>
        <td>${tx.description || '—'}</td>
        <td><span class="badge badge-info">${tx.status}</span></td>
      </tr>`).join('') : '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💰</div><p>No transactions</p></div></td></tr>';
  } catch {}
}

async function loadDevices() {
  try {
    const res = await api.getMyDevices();
    document.getElementById('devices-body').innerHTML = res.data.map(d => `
      <tr>
        <td>${d.device_name || 'Unknown'}</td>
        <td><code style="font-size:11px;color:var(--text-muted)">${d.device_id}</code></td>
        <td>${d.is_verified ? '<span class="badge badge-success">Verified</span>' : '<span class="badge badge-warning">Pending approval</span>'}</td>
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
        <div class="notif-icon ${n.type}">${({ payment:'[Pay]', refund:'[Ref]', low_balance:'[Low]', login:'[Login]' })[n.type] || '[Notif]'}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-msg">${n.message}</div>
          <div class="notif-time">${new Date(n.created_at).toLocaleString()}</div>
        </div>
      </div>`).join('') : '<div class="empty-state" style="padding:32px"><div class="empty-icon">🔔</div><p>No notifications</p></div>';
  } catch {}
}

document.getElementById('deposit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!activeChild) { document.getElementById('deposit-alert').innerHTML = '<div class="alert alert-danger">Select a child first</div>'; return; }
  try {
    const res = await api.deposit({
      student_id:  activeChild.id,
      amount:      parseFloat(document.getElementById('deposit-amount').value),
      description: document.getElementById('deposit-desc').value,
    });
    document.getElementById('deposit-alert').innerHTML = `<div class="alert alert-success">Deposit successful. Balance: RWF ${parseFloat(res.data.balance).toLocaleString()}</div>`;
    document.getElementById('deposit-form').reset();
    loadFees();
  } catch (err) { document.getElementById('deposit-alert').innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
});

document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!activeChild) { document.getElementById('withdraw-alert').innerHTML = '<div class="alert alert-danger">Select a child first</div>'; return; }
  try {
    const res = await api.withdraw({
      student_id:  activeChild.id,
      amount:      parseFloat(document.getElementById('withdraw-amount').value),
      description: document.getElementById('withdraw-desc').value,
    });
    document.getElementById('withdraw-alert').innerHTML = `<div class="alert alert-success">Withdrawal processed. Balance: RWF ${parseFloat(res.data.balance).toLocaleString()}</div>`;
    document.getElementById('withdraw-form').reset();
    loadFees();
  } catch (err) { document.getElementById('withdraw-alert').innerHTML = `<div class="alert alert-danger">${err.message}</div>`; }
});

async function markRead(id, el) { try { await api.markRead(id); el.classList.remove('unread'); } catch {} }
async function markAllRead()    { try { await api.markAllRead(); document.querySelectorAll('.notif-item').forEach(el => el.classList.remove('unread')); } catch {} }

function gradeLetter(s) { if(!s)return'—'; if(s>=80)return'A'; if(s>=70)return'B'; if(s>=60)return'C'; if(s>=50)return'D'; return'F'; }
function gradeColor(s)  { if(!s)return'badge-grey'; if(s>=70)return'badge-success'; if(s>=50)return'badge-warning'; return'badge-danger'; }
function statusBadge(s) { return{ present:'badge-success', absent:'badge-danger', late:'badge-warning', excused:'badge-info' }[s] || 'badge-grey'; }

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
