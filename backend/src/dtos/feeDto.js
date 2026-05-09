function feeAccountDto(account) {
  return {
    id:         account.id,
    student_id: account.student_id,
    balance:    account.balance,
    currency:   account.currency,
    first_name: account.first_name,
    last_name:  account.last_name,
    updated_at: account.updated_at,
  };
}

function feeTransactionDto(tx) {
  return {
    id:             tx.id,
    fee_account_id: tx.fee_account_id,
    type:           tx.type,
    amount:         tx.amount,
    balance_after:  tx.balance_after,
    description:    tx.description,
    status:         tx.status,
    created_at:     tx.created_at,
  };
}

module.exports = { feeAccountDto, feeTransactionDto };
