const feeModel          = require('../models/feeModel');
const notificationModel = require('../models/notificationModel');
const studentModel      = require('../models/studentModel');
const { feeAccountDto, feeTransactionDto } = require('../dtos/feeDto');

const LOW_BALANCE_THRESHOLD = 5000;

async function getBalance(studentId) {
  const account = await feeModel.getAccount(studentId);
  if (!account) throw new Error('Fee account not found');
  return feeAccountDto(account);
}

async function getAllAccounts() {
  const accounts = await feeModel.getAllAccounts();
  return accounts.map(feeAccountDto);
}

async function deposit(studentId, amount, description, processedBy) {
  const result = await feeModel.deposit(studentId, amount, description, processedBy);

  const student = await studentModel.findById(studentId);
  await notificationModel.create({
    user_id: student.user_id,
    title:   'Payment Received',
    message: `A deposit of ${amount} RWF has been added to your fee account. New balance: ${result.balance} RWF.`,
    type:    'payment',
  });

  return {
    balance:     result.balance,
    transaction: feeTransactionDto(result.transaction),
  };
}

async function withdraw(studentId, amount, description, processedBy) {
  const result = await feeModel.withdraw(studentId, amount, description, processedBy);

  const student = await studentModel.findById(studentId);
  await notificationModel.create({
    user_id: student.user_id,
    title:   'Refund Processed',
    message: `A withdrawal of ${amount} RWF has been processed. New balance: ${result.balance} RWF.`,
    type:    'refund',
  });

  if (parseFloat(result.balance) < LOW_BALANCE_THRESHOLD) {
    await notificationModel.create({
      user_id: student.user_id,
      title:   'Low Fee Balance',
      message: `Your fee balance is low: ${result.balance} RWF. Please make a payment soon.`,
      type:    'low_balance',
    });
  }

  return {
    balance:     result.balance,
    transaction: feeTransactionDto(result.transaction),
  };
}

async function getHistory(studentId) {
  const transactions = await feeModel.getHistory(studentId);
  return transactions.map(feeTransactionDto);
}

module.exports = { getBalance, getAllAccounts, deposit, withdraw, getHistory };
