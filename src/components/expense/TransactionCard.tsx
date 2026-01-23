'use client';

import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Transaction, EXPENSE_CATEGORIES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from './TransactionForm';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { deleteTransaction } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const category = EXPENSE_CATEGORIES[transaction.category];
  const isExpense = transaction.type === 'expense';

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <>
      <div className="group flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 hover:shadow-md transition-all">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {category.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">
            {transaction.description}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{category.label}</span>
            <span>•</span>
            <span>{format(new Date(transaction.date), 'dd/MM/yyyy', { locale: vi })}</span>
          </div>
          {transaction.note && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
              {transaction.note}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="text-right">
          <p
            className={`font-semibold ${
              isExpense ? 'text-red-500' : 'text-green-500'
            }`}
          >
            {isExpense ? '-' : '+'}
            {formatAmount(transaction.amount)}đ
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowEdit(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title="Chỉnh sửa giao dịch"
      >
        <TransactionForm
          onClose={() => setShowEdit(false)}
          editTransaction={transaction}
        />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Xác nhận xóa"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Bạn có chắc muốn xóa giao dịch "{transaction.description}"?
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Hủy
          </button>
          <button
            onClick={() => {
              deleteTransaction(transaction.id);
              setShowDelete(false);
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
          >
            Xóa
          </button>
        </div>
      </Modal>
    </>
  );
}
