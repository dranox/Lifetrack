'use client';

import { useState, useMemo } from 'react';
import { Eye, EyeOff, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { useStore, calculateTotalBalance, calculateMonthlyStats } from '@/store/useStore';
import { format } from 'date-fns';

export function BalanceCard() {
  const [showBalance, setShowBalance] = useState(true);
  const transactions = useStore((state) => state.transactions);

  const totalBalance = useMemo(
    () => calculateTotalBalance(transactions),
    [transactions]
  );
  const currentMonth = format(new Date(), 'yyyy-MM');

  const { income, expense, balance: monthlyBalance } = useMemo(
    () => calculateMonthlyStats(transactions, currentMonth),
    [transactions, currentMonth]
  );

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.abs(amount));
  };

  return (
    <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
      {/* Total Balance */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-violet-200 text-sm mb-1">Tổng số dư</p>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold">
              {showBalance ? (
                <>
                  {totalBalance >= 0 ? '' : '-'}
                  {formatAmount(totalBalance)}
                  <span className="text-lg">đ</span>
                </>
              ) : (
                '••••••••'
              )}
            </h2>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              {showBalance ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
          <Wallet className="w-8 h-8" />
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-300" />
            </div>
            <span className="text-violet-200 text-sm">Thu nhập</span>
          </div>
          <p className="text-xl font-semibold">
            {showBalance ? `+${formatAmount(income)}đ` : '••••••'}
          </p>
          <p className="text-xs text-violet-300 mt-1">Tháng này</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-red-400/20 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-300" />
            </div>
            <span className="text-violet-200 text-sm">Chi tiêu</span>
          </div>
          <p className="text-xl font-semibold">
            {showBalance ? `-${formatAmount(expense)}đ` : '••••••'}
          </p>
          <p className="text-xs text-violet-300 mt-1">Tháng này</p>
        </div>
      </div>

      {/* Monthly Balance */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <span className="text-violet-200">Còn lại tháng này</span>
          <span
            className={`font-semibold ${
              monthlyBalance >= 0 ? 'text-green-300' : 'text-red-300'
            }`}
          >
            {showBalance
              ? `${monthlyBalance >= 0 ? '+' : '-'}${formatAmount(monthlyBalance)}đ`
              : '••••••'}
          </span>
        </div>
      </div>
    </div>
  );
}
