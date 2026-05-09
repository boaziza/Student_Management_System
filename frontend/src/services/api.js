const BASE_URL = 'http://localhost:4000/api';

function getToken() { return localStorage.getItem('token'); }
function getUser()  { return JSON.parse(localStorage.getItem('user') || 'null'); }

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
}

// Auth
const api = {
  login:    (data) => request('POST', '/users/login', data),
  register: (data) => request('POST', '/users/register', data),

  // Devices
  registerDevice: (data) => request('POST', '/devices', data),
  getMyDevices:   ()     => request('GET',  '/devices/my'),

  // Students
  getStudent:    (id) => request('GET', `/students/${id}`),

  // Grades
  getMyGrades: (studentId) => request('GET', `/grades/student/${studentId}`),

  // Attendance
  getMyAttendance: (studentId) => request('GET', `/attendance/student/${studentId}`),

  // Timetable
  getTimetable: (classId) => request('GET', `/schedules/class/${classId}`),

  // Fees
  getBalance:  (studentId) => request('GET', `/fee-accounts/${studentId}`),
  getHistory:  (studentId) => request('GET', `/fee-accounts/${studentId}/history`),
  deposit:     (data)      => request('POST', '/fee-accounts/deposit', data),
  withdraw:    (data)      => request('POST', '/fee-accounts/withdraw', data),

  // Notifications
  getNotifications: () => request('GET', '/notifications'),
  markRead: (id)    => request('PATCH', `/notifications/${id}/read`),
  markAllRead: ()   => request('PATCH', '/notifications/read-all'),
};

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../pages/login.html';
}

function requireAuth() {
  if (!getToken()) { window.location.href = '../pages/login.html'; }
}

function getDeviceId() {
  let id = localStorage.getItem('device_id');
  if (!id) {
    id = 'dev-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    localStorage.setItem('device_id', id);
  }
  return id;
}
