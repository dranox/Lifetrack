'use client';

import { useState } from 'react';
import { Calendar, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { BalanceCard } from '@/components/expense/BalanceCard';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Modal } from '@/components/ui/Modal';
import { EventForm } from '@/components/schedule/EventForm';
import { TransactionForm } from '@/components/expense/TransactionForm';
import { useStore } from '@/store/useStore';

export default function DashboardPage() {
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const events = useStore((state) => state.events);
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayEvents = events
    .filter((e) => e.date === today && !e.completed)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Xin chào! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: vi })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => setShowEventModal(true)}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Thêm sự kiện</p>
            <p className="text-sm text-gray-500">Lịch trình mới</p>
          </div>
        </button>

        <button
          onClick={() => setShowTransactionModal(true)}
          className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-gray-900 dark:text-white">Thêm giao dịch</p>
            <p className="text-sm text-gray-500">Thu chi mới</p>
          </div>
        </button>
      </div>

      {/* Balance Card */}
      <div className="mb-8">
        <BalanceCard />
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Hôm nay
            </h2>
            <a
              href="/schedule"
              className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
            >
              Xem tất cả
            </a>
          </div>
          <div className="space-y-3">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700"
              >
                <div className="text-center">
                  <p className="text-2xl font-bold text-violet-600">
                    {event.startTime.split(':')[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {event.startTime.split(':')[1]}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {event.title}
                  </p>
                  {event.description && (
                    <p className="text-sm text-gray-500 truncate">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts and Activity */}
      <div className="grid md:grid-cols-2 gap-8">
        <ExpenseChart />
        <RecentActivity />
      </div>

      {/* Modals */}
      <Modal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        title="Thêm sự kiện mới"
      >
        <EventForm onClose={() => setShowEventModal(false)} />
      </Modal>

      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Thêm giao dịch"
      >
        <TransactionForm onClose={() => setShowTransactionModal(false)} />
      </Modal>
    </div>
  );
}
