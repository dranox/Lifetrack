'use client';

import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useStore, filterTransactionsByMonth, calculateMonthlyStats } from '@/store/useStore';
import { BalanceCard } from '@/components/expense/BalanceCard';
import { TransactionCard } from '@/components/expense/TransactionCard';
import { TransactionForm } from '@/components/expense/TransactionForm';
import { Modal } from '@/components/ui/Modal';
import { EXPENSE_CATEGORIES } from '@/types';

export default function ExpensePage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const allTransactions = useStore((state) => state.transactions);
  const monthStr = format(currentMonth, 'yyyy-MM');

  const transactions = useMemo(
    () => filterTransactionsByMonth(allTransactions, monthStr),
    [allTransactions, monthStr]
  );

  const { income, expense } = useMemo(
    () => calculateMonthlyStats(allTransactions, monthStr),
    [allTransactions, monthStr]
  );

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (filter !== 'all') {
      result = result.filter((t) => t.type === filter);
    }

    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category === categoryFilter);
    }

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, filter, categoryFilter]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof filteredTransactions> = {};
    filteredTransactions.forEach((t) => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Chi tiêu
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Quản lý thu chi cá nhân
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Thêm giao dịch</span>
        </button>
      </div>

      {/* Balance Card */}
      <div className="mb-8">
        <BalanceCard />
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy', { locale: vi })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Thu nhập</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">
            +{formatAmount(income)}đ
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Chi tiêu</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-300">
            -{formatAmount(expense)}đ
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          {[
            { value: 'all', label: 'Tất cả' },
            { value: 'income', label: 'Thu nhập' },
            { value: 'expense', label: 'Chi tiêu' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="all">Tất cả danh mục</option>
          {Object.entries(EXPENSE_CATEGORIES).map(([key, { label, icon }]) => (
            <option key={key} value={key}>
              {icon} {label}
            </option>
          ))}
        </select>
      </div>

      {/* Transactions */}
      {Object.keys(groupedTransactions).length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-3xl">💰</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Chưa có giao dịch
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Thêm giao dịch đầu tiên của bạn
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
          >
            Thêm giao dịch
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                {format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: vi })}
              </h3>
              <div className="space-y-2">
                {dayTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm giao dịch"
      >
        <TransactionForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
}
