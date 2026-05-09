const feeService = require('../services/feeService');

async function getBalance(req, res) {
  try {
    const account = await feeService.getBalance(req.params.studentId);
    res.status(200).json({ data: account });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllAccounts(req, res) {
  try {
    const accounts = await feeService.getAllAccounts();
    res.status(200).json({ data: accounts });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deposit(req, res) {
  try {
    const { student_id, amount, description } = req.body;
    const result = await feeService.deposit(student_id, amount, description, req.user.id);
    res.status(200).json({ message: 'Deposit successful', data: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function withdraw(req, res) {
  try {
    const { student_id, amount, description } = req.body;
    const result = await feeService.withdraw(student_id, amount, description, req.user.id);
    res.status(200).json({ message: 'Withdrawal successful', data: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getHistory(req, res) {
  try {
    const transactions = await feeService.getHistory(req.params.studentId);
    res.status(200).json({ data: transactions });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getBalance, getAllAccounts, deposit, withdraw, getHistory };
