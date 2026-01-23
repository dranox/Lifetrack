'use client';

import { useState } from 'react';
import { Check, Edit2, Trash2, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ScheduleEvent, EVENT_CATEGORIES } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { EventForm } from './EventForm';

interface EventCardProps {
  event: ScheduleEvent;
}

export function EventCard({ event }: EventCardProps) {
  const { deleteEvent, toggleEventComplete } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const category = EVENT_CATEGORIES[event.category];

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 transition-all hover:shadow-md ${
          event.completed ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={() => toggleEventComplete(event.id)}
            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              event.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-violet-500'
            }`}
          >
            {event.completed && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs rounded-full text-white ${category.color}`}>
                {category.icon} {category.label}
              </span>
            </div>
            <h3
              className={`font-medium text-gray-900 dark:text-white ${
                event.completed ? 'line-through' : ''
              }`}
            >
              {event.title}
            </h3>
            {event.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {event.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                {event.startTime}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            </div>
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
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Chỉnh sửa sự kiện">
        <EventForm onClose={() => setShowEdit(false)} editEvent={event} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Xác nhận xóa">
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Bạn có chắc muốn xóa sự kiện "{event.title}"?
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
              deleteEvent(event.id);
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
