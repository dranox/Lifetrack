'use client';

import { useStore } from '@/store/useStore';
import { EXPENSE_CATEGORIES, EVENT_CATEGORIES } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Calendar, Wallet } from 'lucide-react';

export function RecentActivity() {
  const transactions = useStore((state) => state.transactions);
  const events = useStore((state) => state.events);

  // Combine and sort by date
  const activities = [
    ...transactions.slice(-5).map((t) => ({
      type: 'transaction' as const,
      data: t,
      date: new Date(t.createdAt),
    })),
    ...events.slice(-5).map((e) => ({
      type: 'event' as const,
      data: e,
      date: new Date(e.createdAt),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 8);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Hoạt động gần đây
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Chưa có hoạt động nào</p>
          <p className="text-sm mt-1">Thêm sự kiện hoặc giao dịch để bắt đầu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Hoạt động gần đây
      </h3>
      <div className="space-y-3">
        {activities.map((activity) => {
          if (activity.type === 'transaction') {
            const t = activity.data;
            const cat = EXPENSE_CATEGORIES[t.category];
            return (
              <div
                key={`t-${t.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {t.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(t.date), 'dd/MM/yyyy', { locale: vi })}
                  </p>
                </div>
                <div
                  className={`font-semibold ${
                    t.type === 'expense' ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {t.type === 'expense' ? '-' : '+'}
                  {formatAmount(t.amount)}đ
                </div>
              </div>
            );
          } else {
            const e = activity.data;
            const cat = EVENT_CATEGORIES[e.category];
            return (
              <div
                key={`e-${e.id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cat.color}`}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {e.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(e.date), 'dd/MM/yyyy', { locale: vi })} • {e.startTime}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-violet-500">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
