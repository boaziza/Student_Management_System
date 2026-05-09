const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const express = require('express');
const cors    = require('cors');
const helmet      = require('helmet');
const rateLimiter = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(helmet());
app.use(rateLimiter);
app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));

// Auth & Users
app.use('/api/users',            require('./routes/users'));
app.use('/api/devices',          require('./routes/devices'));

// Student & Parent
app.use('/api/students',         require('./routes/students'));
app.use('/api/parents',          require('./routes/parents'));
app.use('/api/parent-students',  require('./routes/parent_students'));

// Academic Records (view only for client)
app.use('/api/grades',           require('./routes/grades'));
app.use('/api/attendance',       require('./routes/attendance'));
app.use('/api/schedules',        require('./routes/schedules'));

// Fee Management
app.use('/api/fee-accounts',     require('./routes/fee_accounts'));
app.use('/api/fee-transactions', require('./routes/fee_transactions'));

// Notifications
app.use('/api/notifications',    require('./routes/notification'));

app.get('/health', (_, res) => res.json({ ok: true }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));