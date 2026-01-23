'use client';

import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useStore, filterEventsByDate } from '@/store/useStore';
import { Calendar } from '@/components/schedule/Calendar';
import { EventCard } from '@/components/schedule/EventCard';
import { EventForm } from '@/components/schedule/EventForm';
import { Modal } from '@/components/ui/Modal';

export default function SchedulePage() {
  const { selectedDate, setSelectedDate, events: allEvents } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const events = useMemo(
    () => filterEventsByDate(allEvents, selectedDate),
    [allEvents, selectedDate]
  );

  const completedCount = events.filter((e) => e.completed).length;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lịch trình
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Quản lý thời gian biểu của bạn
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Thêm sự kiện</span>
        </button>
      </div>

      <div className="grid md:grid-cols-[350px_1fr] gap-8">
        {/* Calendar */}
        <div>
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Events List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {format(new Date(selectedDate), "EEEE, dd MMMM", { locale: vi })}
              </h2>
              <p className="text-sm text-gray-500">
                {events.length} sự kiện
                {completedCount > 0 && ` • ${completedCount} hoàn thành`}
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Không có sự kiện
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Ngày này chưa có sự kiện nào
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
              >
                Thêm sự kiện
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Thêm sự kiện mới"
      >
        <EventForm
          onClose={() => setShowAddModal(false)}
          defaultDate={selectedDate}
        />
      </Modal>
    </div>
  );
}
