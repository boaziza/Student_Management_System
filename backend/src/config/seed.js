const path   = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
const pool = require('./db');

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha512').update(salt + password).digest('hex');
  return { salt, hash };
}

async function seed() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🌱 Seeding database...');

    // ── CLEAR EXISTING DATA ──────────────────────────
    await client.query(`
      TRUNCATE notifications, fee_transactions, fee_accounts,
               attendance, grades, schedules, class_subjects,
               parent_students, students, parents, teachers,
               classes, subjects, devices, users
      RESTART IDENTITY CASCADE
    `);
    console.log('✅ Cleared existing data');

    // ── USERS ──────────────────────────
    const users = [
      { first_name:'James',   last_name:'Uwimana', email:'admin@school.rw',   phone:'+250788000001', role:'admin',   password:'Admin@1234'   },
      { first_name:'Sarah',   last_name:'Mutoni',  email:'teacher@school.rw', phone:'+250788000002', role:'teacher', password:'Teacher@1234' },
      { first_name:'Eric',    last_name:'Mugisha',  email:'student@school.rw', phone:'+250788000003', role:'student', password:'Student@1234' },
      { first_name:'Alice',   last_name:'Kagabo',  email:'parent@school.rw',  phone:'+250788000004', role:'parent',  password:'Parent@1234'  },
      { first_name:'Robert',  last_name:'Nkurunziza', email:'teacher2@school.rw', phone:'+250788000005', role:'teacher', password:'Teacher@1234' },
      { first_name:'Diane',   last_name:'Uwase',   email:'student2@school.rw', phone:'+250788000006', role:'student', password:'Student@1234' },
    ];

    const userIds = {};
    for (const u of users) {
      const { salt, hash } = hashPassword(u.password);
      const res = await client.query(
        `INSERT INTO users (email, password_hash, password_salt, role, first_name, last_name, phone)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [u.email, hash, salt, u.role, u.first_name, u.last_name, u.phone]
      );
      userIds[u.email] = res.rows[0].id;
    }
    console.log('✅ Users created');

    // ── DEVICES (pre-verified) ──────────────────────────
    const deviceData = [
      { email:'admin@school.rw',   device_id:'admin-device-001',   device_name:'Admin PC' },
      { email:'teacher@school.rw', device_id:'teacher-device-001', device_name:'Teacher Laptop' },
      { email:'student@school.rw', device_id:'student-device-001', device_name:'Student Phone' },
      { email:'parent@school.rw',  device_id:'parent-device-001',  device_name:'Parent Phone' },
      { email:'teacher2@school.rw',device_id:'teacher-device-002', device_name:'Teacher 2 Laptop' },
      { email:'student2@school.rw',device_id:'student-device-002', device_name:'Student 2 Phone' },
    ];

    for (const d of deviceData) {
      await client.query(
        `INSERT INTO devices (user_id, device_id, device_name, is_verified, verified_at, verified_by)
         VALUES ($1,$2,$3,TRUE,NOW(),$4)`,
        [userIds[d.email], d.device_id, d.device_name, userIds['admin@school.rw']]
      );
    }
    console.log('✅ Devices created and verified');

    // ── CLASSES ──────────────────────────
    const classRes = await client.query(`
      INSERT INTO classes (name, grade_level, academic_year) VALUES
        ('S3 A', 'Senior 3', '2025'),
        ('S4 B', 'Senior 4', '2025'),
        ('S2 C', 'Senior 2', '2025')
      RETURNING id
    `);
    const [classS3A, classS4B, classS2C] = classRes.rows.map(r => r.id);
    console.log('✅ Classes created');

    // ── SUBJECTS ──────────────────────────
    const subjectRes = await client.query(`
      INSERT INTO subjects (name, code, description) VALUES
        ('Mathematics',        'MATH101', 'Core mathematics including algebra and geometry'),
        ('English Language',   'ENG101',  'Reading, writing and comprehension'),
        ('Physics',            'PHY101',  'Mechanics, waves and electricity'),
        ('Chemistry',          'CHEM101', 'Organic and inorganic chemistry'),
        ('Biology',            'BIO101',  'Cell biology and ecology'),
        ('History',            'HIST101', 'African and world history'),
        ('Computer Science',   'CS101',   'Programming and computing concepts')
      RETURNING id
    `);
    const [sMath, sEng, sPhy, sChem, sBio, sHist, sCS] = subjectRes.rows.map(r => r.id);
    console.log('✅ Subjects created');

    // ── TEACHERS ──────────────────────────
    const teacher1Res = await client.query(
      `INSERT INTO teachers (user_id, employee_number, department) VALUES ($1,'EMP001','Science') RETURNING id`,
      [userIds['teacher@school.rw']]
    );
    const teacher2Res = await client.query(
      `INSERT INTO teachers (user_id, employee_number, department) VALUES ($1,'EMP002','Languages') RETURNING id`,
      [userIds['teacher2@school.rw']]
    );
    const teacher1Id = teacher1Res.rows[0].id;
    const teacher2Id = teacher2Res.rows[0].id;
    console.log('✅ Teachers created');

    // ── STUDENTS ──────────────────────────
    const student1Res = await client.query(
      `INSERT INTO students (user_id, student_number, class_id, date_of_birth)
       VALUES ($1,'STU2025001',$2,'2008-03-15') RETURNING id`,
      [userIds['student@school.rw'], classS3A]
    );
    const student2Res = await client.query(
      `INSERT INTO students (user_id, student_number, class_id, date_of_birth)
       VALUES ($1,'STU2025002',$2,'2009-07-22') RETURNING id`,
      [userIds['student2@school.rw'], classS3A]
    );
    const student1Id = student1Res.rows[0].id;
    const student2Id = student2Res.rows[0].id;
    console.log('✅ Students created');

    // ── PARENTS ──────────────────────────
    const parentRes = await client.query(
      `INSERT INTO parents (user_id) VALUES ($1) RETURNING id`,
      [userIds['parent@school.rw']]
    );
    const parentId = parentRes.rows[0].id;

    await client.query(
      `INSERT INTO parent_students (parent_id, student_id, relationship) VALUES ($1,$2,'parent')`,
      [parentId, student1Id]
    );
    console.log('✅ Parents linked to students');

    // ── CLASS SUBJECTS ──────────────────────────
    const csRes = await client.query(`
      INSERT INTO class_subjects (class_id, subject_id, teacher_id) VALUES
        ($1,$2,$3),
        ($1,$4,$3),
        ($1,$5,$3),
        ($1,$6,$7),
        ($1,$8,$7),
        ($1,$9,$3)
      RETURNING id`,
      [classS3A, sMath, teacher1Id, sPhy, sChem, sEng, teacher2Id, sHist, sCS]
    );
    const [csMath, csPhy, csChem, csEng, csHist, csCS] = csRes.rows.map(r => r.id);
    console.log('✅ Class subjects assigned');

    // ── SCHEDULES (timetable) ──────────────────────────
    await client.query(`
      INSERT INTO schedules (class_subject_id, day_of_week, start_time, end_time, room) VALUES
        ($1,1,'07:00','08:00','Room 101'),
        ($2,1,'08:00','09:00','Room 102'),
        ($3,2,'07:00','08:00','Lab 1'),
        ($4,2,'08:00','09:00','Room 103'),
        ($5,3,'07:00','08:00','Room 104'),
        ($6,3,'08:00','09:00','Lab 2'),
        ($1,4,'07:00','08:00','Room 101'),
        ($2,4,'08:00','09:00','Room 102'),
        ($3,5,'07:00','08:00','Lab 1'),
        ($4,5,'09:00','10:00','Room 103')
    `, [csMath, csPhy, csChem, csEng, csHist, csCS]);
    console.log('✅ Schedules created');

    // ── GRADES ──────────────────────────
    await client.query(`
      INSERT INTO grades (student_id, class_subject_id, term, score, max_score, grade_letter, comments, recorded_by) VALUES
        ($1,$2,'Term 1 2025',85,100,'A','Excellent performance',$3),
        ($1,$4,'Term 1 2025',78,100,'B','Good understanding of concepts',$3),
        ($1,$5,'Term 1 2025',91,100,'A','Outstanding work',$3),
        ($1,$6,'Term 1 2025',72,100,'B','Good effort',$7),
        ($1,$8,'Term 1 2025',68,100,'C','Needs improvement in essays',$7),
        ($1,$2,'Term 2 2025',88,100,'A','Consistent improvement',$3),
        ($1,$4,'Term 2 2025',82,100,'A','Great progress',$3),
        ($9,$2,'Term 1 2025',76,100,'B','Solid performance',$3),
        ($9,$4,'Term 1 2025',69,100,'C','Average performance',$3),
        ($9,$5,'Term 1 2025',83,100,'A','Very good',$3)
    `, [student1Id, csMath, teacher1Id, csPhy, csChem, csEng, teacher2Id, csHist, student2Id]);
    console.log('✅ Grades created');

    // ── ATTENDANCE ──────────────────────────
    const dates = ['2025-01-13','2025-01-14','2025-01-15','2025-01-20','2025-01-21','2025-01-22'];
    const statuses1 = ['present','present','present','absent','present','present'];
    const statuses2 = ['present','late','present','present','present','absent'];

    for (let i = 0; i < dates.length; i++) {
      await client.query(
        `INSERT INTO attendance (student_id, class_subject_id, date, status, recorded_by)
         VALUES ($1,$2,$3,$4,$5)`,
        [student1Id, csMath, dates[i], statuses1[i], teacher1Id]
      );
      await client.query(
        `INSERT INTO attendance (student_id, class_subject_id, date, status, recorded_by)
         VALUES ($1,$2,$3,$4,$5)`,
        [student1Id, csPhy, dates[i], statuses2[i], teacher1Id]
      );
    }
    console.log('✅ Attendance records created');

    // ── FEE ACCOUNTS ──────────────────────────
    const fee1Res = await client.query(
      `INSERT INTO fee_accounts (student_id, balance, currency) VALUES ($1,150000,'RWF') RETURNING id`,
      [student1Id]
    );
    const fee2Res = await client.query(
      `INSERT INTO fee_accounts (student_id, balance, currency) VALUES ($1,3500,'RWF') RETURNING id`,
      [student2Id]
    );
    const fee1Id = fee1Res.rows[0].id;
    const fee2Id = fee2Res.rows[0].id;
    console.log('✅ Fee accounts created');

    // ── FEE TRANSACTIONS ──────────────────────────
    await client.query(`
      INSERT INTO fee_transactions (fee_account_id, type, amount, balance_after, description, status, processed_by) VALUES
        ($1,'deposit',200000,200000,'Term 1 2025 school fees','completed',$2),
        ($1,'withdraw',50000,150000,'Books and materials refund','completed',$2),
        ($3,'deposit',50000,50000,'Partial fee payment','completed',$2),
        ($3,'withdraw',46500,3500,'Transport refund','completed',$2)
    `, [fee1Id, userIds['admin@school.rw'], fee2Id]);
    console.log('✅ Fee transactions created');

    // ── NOTIFICATIONS ──────────────────────────
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
        ($1,'Payment Received','A deposit of 200,000 RWF has been added to Eric''s fee account.','payment',TRUE),
        ($1,'Refund Processed','A withdrawal of 50,000 RWF has been processed. New balance: 150,000 RWF.','refund',FALSE),
        ($2,'Payment Received','A deposit of 50,000 RWF has been added to Diane''s fee account.','payment',TRUE),
        ($2,'Low Fee Balance','Diane''s fee balance is low: 3,500 RWF. Please make a payment soon.','low_balance',FALSE),
        ($3,'Device Verified','Your device "Student Phone" has been verified. You can now log in.','login',TRUE),
        ($4,'Device Verified','Your device "Parent Phone" has been verified. You can now log in.','login',TRUE)
    `, [userIds['parent@school.rw'], userIds['parent@school.rw'],
        userIds['student2@school.rw'], userIds['student2@school.rw'],
        userIds['student@school.rw'], userIds['parent@school.rw']]);
    console.log('✅ Notifications created');

    await client.query('COMMIT');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 TEST CREDENTIALS\n');
    console.log('👑 Admin');
    console.log('   Email:    admin@school.rw');
    console.log('   Password: Admin@1234\n');
    console.log('👨‍🏫 Teacher');
    console.log('   Email:    teacher@school.rw');
    console.log('   Password: Teacher@1234\n');
    console.log('🎓 Student (Eric Mugisha — balance: 150,000 RWF)');
    console.log('   Email:    student@school.rw');
    console.log('   Password: Student@1234\n');
    console.log('👨‍👩‍👦 Parent (Alice Kagabo — linked to Eric)');
    console.log('   Email:    parent@school.rw');
    console.log('   Password: Parent@1234\n');
    console.log('🎓 Student 2 (Diane Uwase — LOW balance: 3,500 RWF)');
    console.log('   Email:    student2@school.rw');
    console.log('   Password: Student@1234\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
