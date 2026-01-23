'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { TransactionCategory, EXPENSE_CATEGORIES, Transaction } from '@/types';

interface TransactionFormProps {
  onClose: () => void;
  editTransaction?: Transaction;
  defaultType?: 'income' | 'expense';
}

export function TransactionForm({
  onClose,
  editTransaction,
  defaultType = 'expense',
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useStore();
  const [formData, setFormData] = useState({
    type: editTransaction?.type || defaultType,
    amount: editTransaction?.amount?.toString() || '',
    description: editTransaction?.description || '',
    category: editTransaction?.category || ('food' as TransactionCategory),
    date: editTransaction?.date || new Date().toISOString().split('T')[0],
    note: editTransaction?.note || '',
  });

  const incomeCategories = ['salary', 'bonus', 'investment', 'other'];
  const expenseCategories = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'education', 'other'];
  const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      category: formData.category as TransactionCategory,
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, transaction);
    } else {
      addTransaction(transaction);
    }
    onClose();
  };

  const formatCurrency = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Toggle */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'expense', category: 'food' })}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            formData.type === 'expense'
              ? 'bg-red-500 text-white'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Chi tiêu
        </button>
        <button
          type="button"
          onClick={() => setFormData({ ...formData, type: 'income', category: 'salary' })}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            formData.type === 'income'
              ? 'bg-green-500 text-white'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Thu nhập
        </button>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Số tiền *
        </label>
        <div className="relative">
          <input
            type="text"
            required
            value={formatCurrency(formData.amount)}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, '');
              setFormData({ ...formData, amount: raw });
            }}
            className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-semibold"
            placeholder="0"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
            VNĐ
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mô tả *
        </label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Ăn trưa, Grab, Shopee..."
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Danh mục
        </label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => {
            const category = EXPENSE_CATEGORIES[cat];
            const isSelected = formData.category === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat as TransactionCategory })}
                className={`flex flex-col items-center p-2 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-violet-100 dark:bg-violet-900/30 ring-2 ring-violet-500'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ngày
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Note */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Ghi chú
        </label>
        <input
          type="text"
          value={formData.note}
          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          className="w-full px-4 py-2 border dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Thêm ghi chú..."
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 border dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          className={`flex-1 px-4 py-2 text-white rounded-xl transition-colors ${
            formData.type === 'expense'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {editTransaction ? 'Cập nhật' : 'Thêm'}
        </button>
      </div>
    </form>
  );
}
