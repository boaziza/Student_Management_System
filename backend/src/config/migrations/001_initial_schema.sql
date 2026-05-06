-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS  (base table for all roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255) NOT NULL,
  role          VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  phone         VARCHAR(20),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- DEVICES  (each device must be admin-verified before login)
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id   VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  created_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, device_id)
);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  grade_level   VARCHAR(20)  NOT NULL,
  academic_year VARCHAR(20)  NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(20)  UNIQUE NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_number VARCHAR(50) UNIQUE NOT NULL,
  class_id       UUID REFERENCES classes(id) ON DELETE SET NULL,
  date_of_birth  DATE,
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PARENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS parents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parent ↔ Student (one parent can have many children and vice-versa)
CREATE TABLE IF NOT EXISTS parent_students (
  parent_id    UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  relationship VARCHAR(50) NOT NULL DEFAULT 'parent',
  PRIMARY KEY (parent_id, student_id)
);

-- ============================================================
-- TEACHERS
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_number VARCHAR(50) UNIQUE NOT NULL,
  department      VARCHAR(100),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CLASS SUBJECTS  (which teacher teaches which subject in which class)
-- ============================================================
CREATE TABLE IF NOT EXISTS class_subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
  UNIQUE (class_id, subject_id)
);

-- ============================================================
-- TIMETABLE / SCHEDULES
-- ============================================================
CREATE TABLE IF NOT EXISTS schedules (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_subject_id UUID NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
  day_of_week      SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Mon … 7=Sun
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  room             VARCHAR(50),
  created_at       TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- GRADES
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_subject_id UUID NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
  term             VARCHAR(20) NOT NULL,            -- e.g. "Term 1 2025"
  score            NUMERIC(5,2),
  max_score        NUMERIC(5,2) NOT NULL DEFAULT 100,
  grade_letter     VARCHAR(5),
  comments         TEXT,
  recorded_by      UUID REFERENCES teachers(id),
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, class_subject_id, term)
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_subject_id UUID NOT NULL REFERENCES class_subjects(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  status           VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes            TEXT,
  recorded_by      UUID REFERENCES teachers(id),
  created_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE (student_id, class_subject_id, date)
);

-- ============================================================
-- FEE ACCOUNTS  (one per student)
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_accounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  balance    NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  currency   VARCHAR(10)   NOT NULL DEFAULT 'RWF',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- FEE TRANSACTIONS  (deposits & withdrawals)
-- ============================================================
CREATE TABLE IF NOT EXISTS fee_transactions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_account_id UUID NOT NULL REFERENCES fee_accounts(id) ON DELETE CASCADE,
  type           VARCHAR(20)   NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  balance_after  NUMERIC(12,2) NOT NULL,
  description    TEXT,
  status         VARCHAR(20)   NOT NULL DEFAULT 'completed'
                   CHECK (status IN ('pending', 'completed', 'rejected')),
  processed_by   UUID REFERENCES users(id),
  created_at     TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50)  NOT NULL,   -- 'payment', 'refund', 'low_balance', 'login', etc.
  is_read    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- INDEXES  (speeds up common queries)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_devices_user        ON devices(user_id);
CREATE INDEX IF NOT EXISTS idx_students_class      ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_par ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_stu ON parent_students(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student      ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student  ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_tx_account      ON fee_transactions(fee_account_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user  ON notifications(user_id);

-- ============================================================
-- updated_at auto-update trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_grades_updated_at
  BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trg_fee_accounts_updated_at
  BEFORE UPDATE ON fee_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
