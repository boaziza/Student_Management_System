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
app.use(errorHandler);
app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use('/api/attendance',        require('./routes/attendance'));
app.use('/api/classes',           require('./routes/classes'));
app.use('/api/users',             require('./routes/users'));
app.use('/api/devices',           require('./routes/devices'));
app.use('/api/grades',            require('./routes/grades'));
app.use('/api/notification',      require('./routes/notification'));
app.use('/api/parents',           require('./routes/parents'));
app.use('/api/schedules',         require('./routes/schedules'));
app.use('/api/students',          require('./routes/students'));
app.use('/api/subjects',          require('./routes/subjects'));
app.use('/api/teachers',          require('./routes/teachers'));
app.use('/api/fee-accounts',      require('./routes/fee_accounts'));
app.use('/api/class-subjects',    require('./routes/class_subjects'));
app.use('/api/fee-transactions',  require('./routes/fee_transactions'));
app.use('/api/parent-students',   require('./routes/parent_students'));

app.get('/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));