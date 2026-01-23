// Schedule Types
export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  category: EventCategory;
  reminder?: boolean;
  completed?: boolean;
  createdAt: string;
}

export type EventCategory =
  | 'work'
  | 'personal'
  | 'health'
  | 'education'
  | 'meeting'
  | 'other';

export const EVENT_CATEGORIES: Record<EventCategory, { label: string; color: string; icon: string }> = {
  work: { label: 'Công việc', color: 'bg-blue-500', icon: '💼' },
  personal: { label: 'Cá nhân', color: 'bg-purple-500', icon: '👤' },
  health: { label: 'Sức khỏe', color: 'bg-green-500', icon: '🏃' },
  education: { label: 'Học tập', color: 'bg-yellow-500', icon: '📚' },
  meeting: { label: 'Họp', color: 'bg-red-500', icon: '👥' },
  other: { label: 'Khác', color: 'bg-gray-500', icon: '📌' },
};

// Expense Types
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: TransactionCategory;
  date: string; // ISO string
  note?: string;
  createdAt: string;
}

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'bills'
  | 'health'
  | 'education'
  | 'salary'
  | 'bonus'
  | 'investment'
  | 'other';

export const EXPENSE_CATEGORIES: Record<string, { label: string; color: string; icon: string }> = {
  food: { label: 'Ăn uống', color: '#FF6384', icon: '🍜' },
  transport: { label: 'Di chuyển', color: '#36A2EB', icon: '🚗' },
  shopping: { label: 'Mua sắm', color: '#FFCE56', icon: '🛒' },
  entertainment: { label: 'Giải trí', color: '#4BC0C0', icon: '🎮' },
  bills: { label: 'Hóa đơn', color: '#9966FF', icon: '📄' },
  health: { label: 'Sức khỏe', color: '#FF9F40', icon: '💊' },
  education: { label: 'Học tập', color: '#FF6384', icon: '📚' },
  salary: { label: 'Lương', color: '#4BC0C0', icon: '💰' },
  bonus: { label: 'Thưởng', color: '#36A2EB', icon: '🎁' },
  investment: { label: 'Đầu tư', color: '#9966FF', icon: '📈' },
  other: { label: 'Khác', color: '#C9CBCF', icon: '📌' },
};

// Budget Types
export interface Budget {
  id: string;
  category: TransactionCategory;
  amount: number;
  month: string; // YYYY-MM
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
