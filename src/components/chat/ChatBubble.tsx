'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Zap, Cpu } from 'lucide-react';
import { useStore, useChatMessages } from '@/store/useStore';
import { format } from 'date-fns';

// Import parseCommand and other helpers from ChatInterface logic
import { parseCommand, handleOllamaChat } from './chatUtils';

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useOllama, setUseOllama] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMessages = useChatMessages();
  const { addChatMessage, clearChat, addTransaction, addEvent } = useStore();

  // Check Ollama availability on mount
  useEffect(() => {
    const checkOllama = async () => {
      try {
        const res = await fetch('/api/chat');
        const data = await res.json();
        setOllamaAvailable(data.available);
        if (data.available) {
          setUseOllama(true);
        }
      } catch {
        setOllamaAvailable(false);
      }
    };
    checkOllama();
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    addChatMessage({ role: 'user', content: userMessage });

    try {
      let response: string;

      if (useOllama && ollamaAvailable) {
        const result = await handleOllamaChat(userMessage);

        if (result.ollamaFailed) {
          const ruleResult = parseCommand(userMessage);
          response = ruleResult.response;

          if ((ruleResult.type === 'expense' || ruleResult.type === 'income') && ruleResult.data) {
            addTransaction(ruleResult.data as Parameters<typeof addTransaction>[0]);
          } else if (ruleResult.type === 'event' && ruleResult.data) {
            addEvent(ruleResult.data as Parameters<typeof addEvent>[0]);
          }
        } else {
          response = result.response;
          let actionAdded = false;

          if (result.action) {
            const { action, ...data } = result.action;
            if (action === 'expense' || action === 'income') {
              addTransaction({
                ...data,
                type: action,
                date: data.date || new Date().toISOString().split('T')[0],
              } as Parameters<typeof addTransaction>[0]);
              actionAdded = true;
            } else if (action === 'event') {
              addEvent({
                ...data,
                date: data.date || new Date().toISOString().split('T')[0],
              } as Parameters<typeof addEvent>[0]);
              actionAdded = true;
            }
          }

          if (!actionAdded) {
            const ruleResult = parseCommand(userMessage);
            if ((ruleResult.type === 'expense' || ruleResult.type === 'income') && ruleResult.data) {
              addTransaction(ruleResult.data as Parameters<typeof addTransaction>[0]);
              const data = ruleResult.data as { amount: number; description: string };
              response = `${response}\n\n✅ Đã ghi nhận: ${data.description} - ${data.amount.toLocaleString()}đ`;
            } else if (ruleResult.type === 'event' && ruleResult.data) {
              addEvent(ruleResult.data as Parameters<typeof addEvent>[0]);
              const data = ruleResult.data as { title: string; startTime: string };
              response = `${response}\n\n✅ Đã thêm sự kiện: ${data.title} lúc ${data.startTime}`;
            }
          }
        }
      } else {
        const result = parseCommand(userMessage);
        response = result.response;

        if ((result.type === 'expense' || result.type === 'income') && result.data) {
          addTransaction(result.data as Parameters<typeof addTransaction>[0]);
        } else if (result.type === 'event' && result.data) {
          addEvent(result.data as Parameters<typeof addEvent>[0]);
        }
      }

      addChatMessage({ role: 'assistant', content: response });
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage({
        role: 'assistant',
        content: 'Có lỗi xảy ra. Vui lòng thử lại!',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-gray-600 hover:bg-gray-700 rotate-90'
            : 'bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 animate-pulse hover:animate-none'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">Lifetrack Guy</h3>
                <p className="text-xs text-white/80 flex items-center gap-1">
                  {useOllama && ollamaAvailable ? (
                    <>
                      <Cpu className="w-3 h-3" /> AI Mode
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3" /> Fast Mode
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {ollamaAvailable === null ? (
                <span className="px-3 py-1.5 text-xs text-white/60">...</span>
              ) : ollamaAvailable ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    alert('Clicked! Current mode: ' + (useOllama ? 'AI' : 'Fast'));
                    setUseOllama(prev => !prev);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer select-none ${
                    useOllama
                      ? 'bg-white text-violet-600 shadow-md hover:shadow-lg'
                      : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
                  }`}
                >
                  {useOllama ? '🤖 AI' : '⚡ Fast'}
                </div>
              ) : (
                <span className="px-3 py-1.5 text-xs text-white/60" title="Ollama chưa chạy">
                  ⚡ Fast only
                </span>
              )}
              {chatMessages.length > 0 && (
                <div
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    clearChat();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      clearChat();
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-white/20 text-white/80 cursor-pointer select-none"
                >
                  <Trash2 className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">👋</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Xin chào! Tôi là <strong>Lifetrack Guy</strong>
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                  Gõ "help" để xem hướng dẫn
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {['chi 50k ăn trưa', 'họp 3h chiều'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-xs">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-violet-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      message.role === 'user'
                        ? 'text-violet-200'
                        : 'text-gray-400'
                    }`}
                  >
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs">
                  🤖
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="px-4 py-2.5 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
