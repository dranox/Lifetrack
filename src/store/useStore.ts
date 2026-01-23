import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ScheduleEvent, Transaction, Budget, ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // Schedule
  events: ScheduleEvent[];
  addEvent: (event: Omit<ScheduleEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, event: Partial<ScheduleEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleEventComplete: (id: string) => void;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Budgets
  budgets: Budget[];
  setBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;

  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;

  // UI State
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Schedule State
      events: [],
      addEvent: (event) =>
        set((state) => ({
          events: [
            ...state.events,
            {
              ...event,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),
      toggleEventComplete: (id) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, completed: !e.completed } : e
          ),
        })),

      // Transaction State
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [
            ...state.transactions,
            {
              ...transaction,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      // Budget State
      budgets: [],
      setBudget: (budget) =>
        set((state) => {
          const existingIndex = state.budgets.findIndex(
            (b) => b.category === budget.category && b.month === budget.month
          );
          if (existingIndex >= 0) {
            const newBudgets = [...state.budgets];
            newBudgets[existingIndex] = { ...newBudgets[existingIndex], ...budget };
            return { budgets: newBudgets };
          }
          return {
            budgets: [...state.budgets, { ...budget, id: uuidv4() }],
          };
        }),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        })),

      // Chat State
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            {
              ...message,
              id: uuidv4(),
              timestamp: new Date().toISOString(),
            },
          ],
        })),
      clearChat: () => set({ chatMessages: [] }),

      // UI State
      selectedDate: new Date().toISOString().split('T')[0],
      setSelectedDate: (date) => set({ selectedDate: date }),
    }),
    {
      name: 'personal-assistant-storage',
    }
  )
);

// Selectors
export const useEvents = () => useStore((state) => state.events);
export const useTransactions = () => useStore((state) => state.transactions);
export const useBudgets = () => useStore((state) => state.budgets);
export const useChatMessages = () => useStore((state) => state.chatMessages);

// Helper functions (use with useMemo in components to avoid infinite loops)
export const filterEventsByDate = (events: ScheduleEvent[], date: string) =>
  events
    .filter((e) => e.date === date)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

export const filterTransactionsByMonth = (transactions: Transaction[], month: string) =>
  transactions.filter((t) => t.date.startsWith(month));

export const calculateTotalBalance = (transactions: Transaction[]) =>
  transactions.reduce(
    (acc, t) => (t.type === 'income' ? acc + t.amount : acc - t.amount),
    0
  );

export const calculateMonthlyStats = (transactions: Transaction[], month: string) => {
  const monthTransactions = transactions.filter((t) =>
    t.date.startsWith(month)
  );
  const income = monthTransactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);
  const expense = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  return { income, expense, balance: income - expense };
};
