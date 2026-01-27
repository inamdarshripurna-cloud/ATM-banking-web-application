
import React from 'react';
import { Transaction } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  isAdminView?: boolean;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, isAdminView }) => {
  const getTransactionConfig = () => {
    switch (transaction.type) {
      case 'deposit':
      case 'receive':
      case 'admin_deposit':
        return { 
          icon: 'fa-arrow-down', 
          color: 'bg-green-100 text-secondary', 
          amountColor: 'text-secondary', 
          prefix: '+₹',
          label: transaction.type === 'receive' ? 'Money Received' : 'Deposit'
        };
      case 'withdraw':
      case 'admin_withdraw':
        return { 
          icon: 'fa-arrow-up', 
          color: 'bg-red-100 text-danger', 
          amountColor: 'text-danger', 
          prefix: '-₹',
          label: 'Withdrawal'
        };
      case 'send':
        return { 
          icon: 'fa-exchange-alt', 
          color: 'bg-yellow-100 text-warning', 
          amountColor: 'text-danger', 
          prefix: '-₹',
          label: 'Transfer Out'
        };
      default:
        return { icon: 'fa-history', color: 'bg-gray-100 text-gray', amountColor: 'text-gray', prefix: '₹', label: 'Transaction' };
    }
  };

  const config = getTransactionConfig();
  const date = new Date(transaction.Date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
          <i className={`fas ${config.icon}`}></i>
        </div>
        <div>
          <h4 className="font-semibold text-dark dark:text-gray-200">
            {config.label} {isAdminView && <span className="text-xs font-normal text-gray opacity-70">- {transaction.mobile}</span>}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray">
            {transaction.Send_to && (
              <span className="flex items-center gap-1"><i className="fas fa-user"></i> To: {transaction.Send_to}</span>
            )}
            {transaction.Receive_from && (
              <span className="flex items-center gap-1"><i className="fas fa-user"></i> From: {transaction.Receive_from}</span>
            )}
            <span className="flex items-center gap-1"><i className="fas fa-clock"></i> {formattedDate} at {formattedTime}</span>
          </div>
        </div>
      </div>
      <div className={`text-lg font-bold ${config.amountColor}`}>
        {config.prefix}{parseFloat(String(transaction.amount)).toFixed(2)}
      </div>
    </div>
  );
};

export default TransactionItem;
