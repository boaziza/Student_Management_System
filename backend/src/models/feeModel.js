const pool = require('../config/db');

async function createAccount(studentId) {
  const result = await pool.query(
    'INSERT INTO fee_accounts (student_id) VALUES ($1) RETURNING *',
    [studentId]
  );
  return result.rows[0];
}

async function getAccount(studentId) {
  const result = await pool.query(
    'SELECT * FROM fee_accounts WHERE student_id = $1',
    [studentId]
  );
  return result.rows[0] || null;
}

async function getAllAccounts() {
  const result = await pool.query(
    `SELECT fa.*, u.first_name, u.last_name
     FROM fee_accounts fa
     JOIN students s ON fa.student_id = s.id
     JOIN users u    ON s.user_id     = u.id
     ORDER BY u.last_name`
  );
  return result.rows;
}

async function deposit(studentId, amount, description, processedBy) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const accountRes = await client.query(
      'SELECT * FROM fee_accounts WHERE student_id = $1 FOR UPDATE',
      [studentId]
    );
    const account = accountRes.rows[0];
    if (!account) throw new Error('Fee account not found');

    const newBalance = parseFloat(account.balance) + parseFloat(amount);

    await client.query(
      'UPDATE fee_accounts SET balance = $1 WHERE student_id = $2',
      [newBalance, studentId]
    );

    const txRes = await client.query(
      `INSERT INTO fee_transactions (fee_account_id, type, amount, balance_after, description, status, processed_by)
       VALUES ($1, 'deposit', $2, $3, $4, 'completed', $5) RETURNING *`,
      [account.id, amount, newBalance, description, processedBy]
    );

    await client.query('COMMIT');
    return { balance: newBalance, transaction: txRes.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function withdraw(studentId, amount, description, processedBy) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const accountRes = await client.query(
      'SELECT * FROM fee_accounts WHERE student_id = $1 FOR UPDATE',
      [studentId]
    );
    const account = accountRes.rows[0];
    if (!account) throw new Error('Fee account not found');
    if (parseFloat(account.balance) < parseFloat(amount)) {
      throw new Error('Insufficient balance');
    }

    const newBalance = parseFloat(account.balance) - parseFloat(amount);

    await client.query(
      'UPDATE fee_accounts SET balance = $1 WHERE student_id = $2',
      [newBalance, studentId]
    );

    const txRes = await client.query(
      `INSERT INTO fee_transactions (fee_account_id, type, amount, balance_after, description, status, processed_by)
       VALUES ($1, 'withdraw', $2, $3, $4, 'completed', $5) RETURNING *`,
      [account.id, amount, newBalance, description, processedBy]
    );

    await client.query('COMMIT');
    return { balance: newBalance, transaction: txRes.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getHistory(studentId) {
  const result = await pool.query(
    `SELECT ft.* FROM fee_transactions ft
     JOIN fee_accounts fa ON ft.fee_account_id = fa.id
     WHERE fa.student_id = $1
     ORDER BY ft.created_at DESC`,
    [studentId]
  );
  return result.rows;
}

module.exports = { createAccount, getAccount, getAllAccounts, deposit, withdraw, getHistory };
