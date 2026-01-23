'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Bot, User, Cpu, Zap } from 'lucide-react';
import { useStore, useChatMessages } from '@/store/useStore';
import { format } from 'date-fns';

// Helper: Parse amount from text
function parseAmount(text: string): number {
  const lowerText = text.toLowerCase();

  // Match patterns like: 50k, 50 ngàn, 50 nghìn, 50000, 5tr, 5 triệu, 5.5tr
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:triệu|tr)/i, multiplier: 1000000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:ngàn|nghìn|k)/i, multiplier: 1000 },
    { regex: /(\d+(?:,\d{3})+)/, multiplier: 1, replace: true }, // 50,000
    { regex: /(\d+(?:\.\d{3})+)(?!\s*tr)/i, multiplier: 1, replaceDot: true }, // 50.000 (not 5.5tr)
    { regex: /(\d+)/, multiplier: 1 },
  ];

  for (const { regex, multiplier, replace, replaceDot } of patterns) {
    const match = lowerText.match(regex);
    if (match) {
      let numStr = match[1];
      if (replace) numStr = numStr.replace(/,/g, '');
      if (replaceDot) numStr = numStr.replace(/\./g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num)) {
        // Auto convert small numbers
        if (multiplier === 1 && num < 1000 && num > 0) {
          return num * 1000; // Assume "50" means 50k
        }
        return num * multiplier;
      }
    }
  }
  return 0;
}

// Helper: Parse date from text
function parseDate(text: string): Date {
  const lowerText = text.toLowerCase();
  const today = new Date();

  // Relative days
  if (/hôm qua|hom qua|yesterday/.test(lowerText)) {
    today.setDate(today.getDate() - 1);
  } else if (/ngày mai|hôm sau|mai|tomorrow/.test(lowerText)) {
    today.setDate(today.getDate() + 1);
  } else if (/ngày kia|mốt|ngày mốt/.test(lowerText)) {
    today.setDate(today.getDate() + 2);
  } else if (/hôm kia|2 ngày trước/.test(lowerText)) {
    today.setDate(today.getDate() - 2);
  } else if (/tuần sau|next week/.test(lowerText)) {
    today.setDate(today.getDate() + 7);
  } else if (/tuần trước|last week/.test(lowerText)) {
    today.setDate(today.getDate() - 7);
  } else if (/tháng sau|next month/.test(lowerText)) {
    today.setMonth(today.getMonth() + 1);
  } else if (/tháng trước|last month/.test(lowerText)) {
    today.setMonth(today.getMonth() - 1);
  } else if (/cuối tuần|weekend/.test(lowerText)) {
    // Next Saturday
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntilSaturday);
  } else if (/đầu tuần|thứ 2|thứ hai|monday/.test(lowerText)) {
    // Next Monday
    const dayOfWeek = today.getDay();
    const daysUntilMonday = (1 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntilMonday);
  } else if (/thứ 3|thứ ba|tuesday/.test(lowerText)) {
    const dayOfWeek = today.getDay();
    const daysUntil = (2 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntil);
  } else if (/thứ 4|thứ tư|wednesday/.test(lowerText)) {
    const dayOfWeek = today.getDay();
    const daysUntil = (3 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntil);
  } else if (/thứ 5|thứ năm|thursday/.test(lowerText)) {
    const dayOfWeek = today.getDay();
    const daysUntil = (4 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntil);
  } else if (/thứ 6|thứ sáu|friday/.test(lowerText)) {
    const dayOfWeek = today.getDay();
    const daysUntil = (5 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntil);
  } else if (/thứ 7|thứ bảy|saturday/.test(lowerText)) {
    const dayOfWeek = today.getDay();
    const daysUntil = (6 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntil);
  } else if (/chủ nhật|cn|sunday/.test(lowerText)) {
    const dayOfWeek = today.getDay();
    const daysUntil = (0 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntil);
  }

  // Parse specific date: "ngày 15", "15/1", "15-1-2024"
  // Must have "ngày" prefix OR date format with separator (/) to avoid matching time like "3 giờ"
  const dateMatch = lowerText.match(/(?:ngày\s+(\d{1,2}))|(?:(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?)/);
  if (dateMatch) {
    if (dateMatch[1]) {
      // "ngày 15" format
      const day = parseInt(dateMatch[1]);
      if (day >= 1 && day <= 31) {
        today.setDate(day);
      }
    } else if (dateMatch[2] && dateMatch[3]) {
      // "15/1" or "15-1-2024" format
      const day = parseInt(dateMatch[2]);
      const month = parseInt(dateMatch[3]);
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        today.setDate(day);
        today.setMonth(month - 1);
        if (dateMatch[4]) {
          today.setFullYear(parseInt(dateMatch[4]));
        }
      }
    }
  }

  return today;
}

// Helper: Auto categorize expense
function categorizeExpense(text: string): string {
  const lowerText = text.toLowerCase();

  // Food & Drinks
  if (/ăn|cơm|phở|bún|mì|bánh|cafe|cà phê|trà|coffee|uống|nhậu|bia|rượu|đồ ăn|thức ăn|bữa|sáng|trưa|tối|lẩu|nướng|gà|vịt|heo|bò|cá|tôm|cua|ốc|chè|kem|nước|milk tea|trà sữa|pizza|burger|gỏi|salad|cháo|xôi|hủ tiếu/.test(lowerText)) {
    return 'food';
  }

  // Transport
  if (/grab|taxi|xe|xăng|dầu|gửi xe|đỗ xe|uber|be|gojek|bus|xe buýt|tàu|máy bay|vé|đi lại|di chuyển|ship|giao hàng|vận chuyển/.test(lowerText)) {
    return 'transport';
  }

  // Shopping
  if (/shopee|lazada|tiki|sendo|mua|quần|áo|giày|dép|túi|ví|đồng hồ|mỹ phẩm|son|kem|nước hoa|thời trang|phụ kiện|online|order|đặt hàng/.test(lowerText)) {
    return 'shopping';
  }

  // Bills & Utilities
  if (/điện|nước|internet|wifi|4g|5g|điện thoại|thuê|rent|phòng|nhà|gas|truyền hình|netflix|spotify|youtube|subscription|đăng ký|hóa đơn|bill/.test(lowerText)) {
    return 'bills';
  }

  // Health
  if (/thuốc|khám|bệnh|viện|doctor|bác sĩ|y tế|sức khỏe|gym|tập|thể dục|spa|massage|răng|mắt|vitamin|thực phẩm chức năng/.test(lowerText)) {
    return 'health';
  }

  // Entertainment
  if (/game|phim|giải trí|cinema|rạp|karaoke|du lịch|travel|chơi|vui|party|tiệc|sinh nhật|event|sự kiện|concert|show|vé xem/.test(lowerText)) {
    return 'entertainment';
  }

  // Education
  if (/học|sách|course|khóa học|udemy|coursera|học phí|trường|lớp|thầy|cô|gia sư|tài liệu|giáo trình/.test(lowerText)) {
    return 'education';
  }

  return 'other';
}

// Helper: Auto categorize income
function categorizeIncome(text: string): string {
  const lowerText = text.toLowerCase();

  if (/lương|salary|wage/.test(lowerText)) return 'salary';
  if (/thưởng|bonus|thưởng tết|thưởng quý/.test(lowerText)) return 'bonus';
  if (/đầu tư|invest|cổ tức|lãi|profit|trading|crypto|coin/.test(lowerText)) return 'investment';
  if (/freelance|dự án|project|làm thêm|part.?time/.test(lowerText)) return 'other';

  return 'other';
}

// Simple command parser (rule-based, no LLM needed)
function parseCommand(input: string): {
  type: 'event' | 'expense' | 'income' | 'query' | 'unknown';
  data?: Record<string, unknown>;
  response: string;
} {
  const lowerInput = input.toLowerCase().trim();
  const originalInput = input.trim();

  // ========== EARLY EXIT FOR EVENT KEYWORDS ==========
  // If input contains event keywords with time, skip expense matching
  const hasEventKeywords = /(?:họp|meeting|lịch|hẹn|gặp|call|học|tập|gym|nhắc|reminder|cuộc họp|cuộc hẹn)/.test(lowerInput);
  const hasTimePattern = /\d{1,2}\s*(?:h|:|giờ)\s*(?:\d{0,2})?\s*(?:sáng|chiều|tối|am|pm)?/.test(lowerInput);
  const hasEventPhrase = /(?:có|cần|phải)\s+(?:cuộc\s+)?(?:họp|hẹn|gặp|meeting)/.test(lowerInput);
  const likelyEvent = (hasEventKeywords && hasTimePattern) || hasEventPhrase;

  // ========== EXPENSE PATTERNS ==========

  // Pattern 1: "chi 50k ăn trưa", "mua 200k shopee", "trả 100k tiền điện"
  const expensePattern1 = lowerInput.match(
    /^(?:chi|mua|tiêu|trả|thanh toán|đóng|nạp|chuyển|gửi)\s+(.+)/i
  );

  // Pattern 2: "ăn trưa 50k", "cafe 30k", "grab 25k" (description + amount)
  const expensePattern2 = lowerInput.match(
    /^(.+?)\s+(?:hết|mất|tốn|là|:)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i
  );

  // Pattern 3: "hôm nay ăn phở hết 50k", "sáng nay uống cafe 30 ngàn"
  const expensePattern3 = lowerInput.match(
    /(?:hôm nay|sáng nay|trưa nay|chiều nay|tối nay|hôm qua|vừa|mới|sáng|trưa|chiều|tối)\s+(.+?)\s+(?:hết|mất|tốn)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?/i
  );

  // Pattern 4: "tôi đã chi 50k cho ăn trưa"
  const expensePattern4 = lowerInput.match(
    /(?:tôi|mình|em|anh|chị)?\s*(?:đã|vừa|mới)?\s*(?:chi|mua|tiêu|trả)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(?:cho|để|vào)?\s*(.+)/i
  );

  // Pattern 5: "50k ăn sáng", "100k đổ xăng" (amount first)
  const expensePattern5 = lowerInput.match(
    /^(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(?:cho|để|vào)?\s*(.+)/i
  );

  // Pattern 6: "tiền ăn 50k", "tiền xăng 100k", "tiền điện 200 ngàn"
  const expensePattern6 = lowerInput.match(
    /^tiền\s+(.+?)\s+(?:hết|mất|tốn|là|:)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i
  );

  // Pattern 7: "bữa sáng/trưa/tối 50k"
  const expensePattern7 = lowerInput.match(
    /^(?:bữa\s+)?(sáng|trưa|tối|khuya)\s+(?:hết|mất|tốn|là|:)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i
  );

  // Pattern 8: "đi ăn/uống/chơi... 50k"
  const expensePattern8 = lowerInput.match(
    /^đi\s+(.+?)\s+(?:hết|mất|tốn)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i
  );

  // Pattern 9: "-50k ăn trưa" (negative sign for expense)
  const expensePattern9 = lowerInput.match(
    /^[-−]\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(.+)/i
  );

  // Pattern 10: "ăn/uống/mua + amount" simple food/drink patterns
  const expensePattern10 = lowerInput.match(
    /^(ăn|uống|nhậu|lai rai)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i
  );

  // Check expense patterns
  let expenseMatch = null;
  let expenseDesc = '';
  let expenseAmount = 0;

  if (expensePattern1) {
    const rest = expensePattern1[1];
    expenseAmount = parseAmount(rest);
    expenseDesc = rest.replace(/\d+(?:\.\d+)?\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?/gi, '').trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern4) {
    expenseAmount = parseAmount(expensePattern4[1]);
    expenseDesc = expensePattern4[2].trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern9) {
    expenseAmount = parseAmount(expensePattern9[1]);
    expenseDesc = expensePattern9[2].trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern6) {
    expenseAmount = parseAmount(expensePattern6[2]);
    expenseDesc = 'Tiền ' + expensePattern6[1].trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern7) {
    expenseAmount = parseAmount(expensePattern7[2]);
    expenseDesc = 'Bữa ' + expensePattern7[1].trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern8) {
    expenseAmount = parseAmount(expensePattern8[2]);
    expenseDesc = 'Đi ' + expensePattern8[1].trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern10) {
    expenseAmount = parseAmount(expensePattern10[2]);
    expenseDesc = expensePattern10[1].charAt(0).toUpperCase() + expensePattern10[1].slice(1);
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern3) {
    expenseAmount = parseAmount(expensePattern3[2]);
    expenseDesc = expensePattern3[1].trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern5) {
    expenseAmount = parseAmount(expensePattern5[1]);
    expenseDesc = expensePattern5[2].trim();
    if (expenseAmount > 0) expenseMatch = true;
  } else if (expensePattern2) {
    expenseAmount = parseAmount(expensePattern2[2]);
    expenseDesc = expensePattern2[1].trim();
    // Only match if description looks like expense
    if (expenseAmount > 0 && categorizeExpense(expenseDesc) !== 'other') {
      expenseMatch = true;
    }
  }

  // Only process expense if it's NOT likely an event
  if (expenseMatch && expenseAmount > 0 && expenseDesc && !likelyEvent) {
    const category = categorizeExpense(expenseDesc);
    const date = parseDate(lowerInput);

    return {
      type: 'expense',
      data: {
        amount: expenseAmount,
        description: expenseDesc.charAt(0).toUpperCase() + expenseDesc.slice(1),
        category,
        type: 'expense',
        date: date.toISOString().split('T')[0],
      },
      response: `✅ Đã thêm chi tiêu: ${expenseDesc} - ${expenseAmount.toLocaleString()}đ (${category === 'food' ? '🍜 Ăn uống' : category === 'transport' ? '🚗 Di chuyển' : category === 'shopping' ? '🛒 Mua sắm' : category === 'bills' ? '📄 Hóa đơn' : category === 'health' ? '💊 Sức khỏe' : category === 'entertainment' ? '🎮 Giải trí' : category === 'education' ? '📚 Học tập' : '📌 Khác'})`,
    };
  }

  // ========== INCOME PATTERNS ==========

  // Pattern 1: "nhận 10tr lương", "thu 500k", "được thưởng 2tr"
  const incomePattern1 = lowerInput.match(
    /^(?:nhận|thu|được|có|lãi|nhận được|kiếm được|earn)\s+(.+)/i
  );

  // Pattern 2: "lương tháng này 15tr", "thưởng tết 5tr"
  const incomePattern2 = lowerInput.match(
    /^(lương|thưởng|tiền|thu nhập|freelance|dự án|bonus|tiền công|công|hoa hồng|commission)\s+(.+)/i
  );

  // Pattern 3: "10tr tiền lương", "5tr thưởng quý"
  const incomePattern3 = lowerInput.match(
    /^(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(?:tiền\s+)?(lương|thưởng|thu nhập|freelance|bonus|hoa hồng)/i
  );

  // Pattern 4: "+10tr lương" (positive sign for income)
  const incomePattern4 = lowerInput.match(
    /^\+\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s*(.*)$/i
  );

  // Pattern 5: "bán hàng được 500k", "làm thêm được 1tr"
  const incomePattern5 = lowerInput.match(
    /^(?:bán|làm|làm thêm|part.?time|freelance)\s+.+?\s+(?:được|kiếm|thu)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?/i
  );

  // Pattern 6: "khách trả 2tr", "sếp cho 500k"
  const incomePattern6 = lowerInput.match(
    /(?:khách|sếp|công ty|cty|boss|client)\s+(?:trả|cho|gửi|chuyển)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s*(.*)$/i
  );

  let incomeMatch = null;
  let incomeDesc = '';
  let incomeAmount = 0;

  if (incomePattern4) {
    incomeAmount = parseAmount(incomePattern4[1]);
    incomeDesc = incomePattern4[2]?.trim() || 'Thu nhập';
    if (incomeAmount > 0) incomeMatch = true;
  } else if (incomePattern5) {
    incomeAmount = parseAmount(incomePattern5[1]);
    incomeDesc = 'Làm thêm';
    if (incomeAmount > 0) incomeMatch = true;
  } else if (incomePattern6) {
    incomeAmount = parseAmount(incomePattern6[1]);
    incomeDesc = incomePattern6[2]?.trim() || 'Thu từ khách';
    if (incomeAmount > 0) incomeMatch = true;
  } else if (incomePattern1) {
    const rest = incomePattern1[1];
    incomeAmount = parseAmount(rest);
    incomeDesc = rest.replace(/\d+(?:\.\d+)?\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?/gi, '').trim() || 'Thu nhập';
    if (incomeAmount > 0) incomeMatch = true;
  } else if (incomePattern3) {
    incomeAmount = parseAmount(incomePattern3[1]);
    incomeDesc = incomePattern3[2].trim();
    if (incomeAmount > 0) incomeMatch = true;
  } else if (incomePattern2) {
    const rest = incomePattern2[2];
    incomeAmount = parseAmount(rest);
    incomeDesc = incomePattern2[1] + ' ' + rest.replace(/\d+(?:\.\d+)?\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?/gi, '').trim();
    if (incomeAmount > 0) incomeMatch = true;
  }

  if (incomeMatch && incomeAmount > 0) {
    const category = categorizeIncome(incomeDesc);
    const date = parseDate(lowerInput);

    return {
      type: 'income',
      data: {
        amount: incomeAmount,
        description: incomeDesc.charAt(0).toUpperCase() + incomeDesc.slice(1),
        category,
        type: 'income',
        date: date.toISOString().split('T')[0],
      },
      response: `✅ Đã thêm thu nhập: ${incomeDesc} - ${incomeAmount.toLocaleString()}đ (${category === 'salary' ? '💰 Lương' : category === 'bonus' ? '🎁 Thưởng' : category === 'investment' ? '📈 Đầu tư' : '📌 Khác'})`,
    };
  }

  // ========== EVENT PATTERNS ==========

  // Pattern 1: "họp 3h chiều", "meeting 14:30"
  const eventPattern1 = lowerInput.match(
    /^(?:họp|meeting|gặp|hẹn|phỏng vấn|interview|call|gọi điện)\s*(.+?)?\s*(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i
  );

  // Pattern 2: "học tiếng anh 9h sáng mai"
  const eventPattern2 = lowerInput.match(
    /^(?:học|đi học|lớp|khóa|course)\s+(.+?)\s+(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i
  );

  // Pattern 3: "đi gym 6h tối", "đi khám 8h sáng"
  const eventPattern3 = lowerInput.match(
    /^(?:đi|tập|chơi|xem|ăn)\s+(.+?)\s+(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i
  );

  // Pattern 4: "3h chiều họp team", "14:30 meeting online"
  const eventPattern4 = lowerInput.match(
    /^(\d{1,2})(?:h|:)(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?\s+(.+)/i
  );

  // Pattern 5: "nhắc tôi ... lúc Xh", "reminder ... at Xh"
  const eventPattern5 = lowerInput.match(
    /^(?:nhắc|nhắc nhở|reminder|đặt lịch|tạo lịch|thêm lịch)\s+(.+?)\s+(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i
  );

  // Pattern 6: "lịch họp 9h tối", "lịch hẹn 3h chiều mai"
  const eventPattern6 = lowerInput.match(
    /^lịch\s+(họp|hẹn|gặp|meeting|call|làm việc|work|học|tập)\s*(.+?)?\s*(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i
  );

  // Pattern 7: "có họp/hẹn ... lúc Xh", "mai có họp 9h", "có cuộc họp 3h"
  const eventPattern7 = lowerInput.match(
    /(?:có|cần|phải)\s+(?:cuộc\s+)?(họp|hẹn|gặp|meeting|call|học|tập)\s*(.+?)?\s*(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i
  );

  // Pattern 8: "chiều nay 3 giờ có cuộc họp", "sáng mai 9h có hẹn khách" (time first, then event)
  const eventPattern8 = lowerInput.match(
    /^(?:sáng|chiều|tối)?\s*(?:nay|mai|mốt|hôm nay|ngày mai)?\s*(\d{1,2})\s*(?:h|giờ|:)\s*(\d{0,2})?\s*(?:sáng|chiều|tối)?\s*(?:có|cần|phải)\s+(?:cuộc\s+)?(họp|hẹn|gặp|meeting|call|học|tập|lịch)\s*(.+)?/i
  );

  let eventMatch = null;
  let eventTitle = '';
  let eventHour = 0;
  let eventMinute = 0;

  const parseEventMatch = (match: RegExpMatchArray | null, titleIndex: number, hourIndex: number, minuteIndex: number, periodIndex: number) => {
    if (!match) return false;

    eventHour = parseInt(match[hourIndex]) || 0;
    eventMinute = parseInt(match[minuteIndex]) || 0;
    const period = match[periodIndex]?.toLowerCase();

    if (period === 'chiều' || period === 'pm') {
      if (eventHour < 12) eventHour += 12;
    } else if (period === 'tối') {
      if (eventHour < 18) eventHour += (eventHour < 6 ? 18 : 12);
    }

    eventTitle = match[titleIndex]?.trim() || '';
    return eventHour >= 0 && eventHour <= 23;
  };

  if (parseEventMatch(eventPattern1, 1, 2, 3, 4)) {
    eventMatch = true;
    if (!eventTitle) eventTitle = 'Họp';
  } else if (parseEventMatch(eventPattern2, 1, 2, 3, 4)) {
    eventMatch = true;
    eventTitle = 'Học ' + eventTitle;
  } else if (parseEventMatch(eventPattern3, 1, 2, 3, 4)) {
    eventMatch = true;
  } else if (eventPattern4) {
    eventHour = parseInt(eventPattern4[1]) || 0;
    eventMinute = parseInt(eventPattern4[2]) || 0;
    const period = eventPattern4[3]?.toLowerCase();
    if (period === 'chiều' || period === 'pm') {
      if (eventHour < 12) eventHour += 12;
    } else if (period === 'tối') {
      if (eventHour < 18) eventHour += (eventHour < 6 ? 18 : 12);
    }
    eventTitle = eventPattern4[4]?.trim() || 'Sự kiện';
    eventMatch = eventHour >= 0 && eventHour <= 23;
  } else if (parseEventMatch(eventPattern5, 1, 2, 3, 4)) {
    eventMatch = true;
  } else if (eventPattern6) {
    // Pattern 6: "lịch họp 9h tối"
    const eventType = eventPattern6[1]; // họp, hẹn, etc.
    eventHour = parseInt(eventPattern6[3]) || 0;
    eventMinute = parseInt(eventPattern6[4]) || 0;
    const period = eventPattern6[5]?.toLowerCase();
    if (period === 'chiều' || period === 'pm') {
      if (eventHour < 12) eventHour += 12;
    } else if (period === 'tối') {
      if (eventHour < 18) eventHour += (eventHour < 6 ? 18 : 12);
    }
    const extraInfo = eventPattern6[2]?.trim() || '';
    eventTitle = eventType.charAt(0).toUpperCase() + eventType.slice(1) + (extraInfo ? ' ' + extraInfo : '');
    eventMatch = eventHour >= 0 && eventHour <= 23;
  } else if (eventPattern7) {
    // Pattern 7: "có họp 9h", "mai có hẹn 3h chiều"
    const eventType = eventPattern7[1]; // họp, hẹn, etc.
    eventHour = parseInt(eventPattern7[3]) || 0;
    eventMinute = parseInt(eventPattern7[4]) || 0;
    const period = eventPattern7[5]?.toLowerCase();
    if (period === 'chiều' || period === 'pm') {
      if (eventHour < 12) eventHour += 12;
    } else if (period === 'tối') {
      if (eventHour < 18) eventHour += (eventHour < 6 ? 18 : 12);
    }
    const extraInfo = eventPattern7[2]?.trim() || '';
    eventTitle = eventType.charAt(0).toUpperCase() + eventType.slice(1) + (extraInfo ? ' ' + extraInfo : '');
    eventMatch = eventHour >= 0 && eventHour <= 23;
  } else if (eventPattern8) {
    // Pattern 8: "chiều nay 3 giờ có cuộc họp", "sáng mai 9h có hẹn khách"
    eventHour = parseInt(eventPattern8[1]) || 0;
    eventMinute = parseInt(eventPattern8[2]) || 0;
    const eventType = eventPattern8[3]; // họp, hẹn, etc.
    const extraInfo = eventPattern8[4]?.trim() || '';

    // Determine period from context (chiều/tối at start of input)
    if (/^chiều/.test(lowerInput)) {
      if (eventHour < 12) eventHour += 12;
    } else if (/^tối/.test(lowerInput)) {
      if (eventHour < 18) eventHour += (eventHour < 6 ? 18 : 12);
    }

    eventTitle = eventType.charAt(0).toUpperCase() + eventType.slice(1) + (extraInfo ? ' ' + extraInfo : '');
    eventMatch = eventHour >= 0 && eventHour <= 23;
  }

  if (eventMatch && eventTitle) {
    const date = parseDate(lowerInput);
    const startTime = `${eventHour.toString().padStart(2, '0')}:${eventMinute.toString().padStart(2, '0')}`;

    let category = 'other';
    if (/họp|meeting|call|gọi/.test(lowerInput)) category = 'meeting';
    else if (/học|lớp|course|khóa/.test(lowerInput)) category = 'education';
    else if (/làm|việc|work|office/.test(lowerInput)) category = 'work';
    else if (/gym|tập|thể dục|chạy|yoga/.test(lowerInput)) category = 'health';
    else if (/chơi|game|phim|giải trí|party/.test(lowerInput)) category = 'personal';

    return {
      type: 'event',
      data: {
        title: eventTitle.charAt(0).toUpperCase() + eventTitle.slice(1),
        date: date.toISOString().split('T')[0],
        startTime,
        category,
      },
      response: `✅ Đã thêm sự kiện: ${eventTitle} lúc ${startTime} ngày ${format(date, 'dd/MM/yyyy')}`,
    };
  }

  // ========== QUERY PATTERNS ==========

  // Budget/expense queries
  if (/(?:tổng|bao nhiêu|còn lại|đã chi|đã tiêu|chi tiêu|thống kê|summary|report|báo cáo)/.test(lowerInput)) {
    return {
      type: 'query',
      response: '📊 Để xem tổng quan chi tiêu, vui lòng vào tab **Tổng quan** hoặc **Chi tiêu** nhé!',
    };
  }

  // Schedule queries
  if (/(?:lịch|hôm nay có gì|mai có gì|tuần này|kế hoạch|schedule|plan|sự kiện|events?)/.test(lowerInput)) {
    return {
      type: 'query',
      response: '📅 Để xem lịch trình, vui lòng vào tab **Lịch trình** nhé!',
    };
  }

  // List/show queries
  if (/^(?:xem|show|list|liệt kê|hiện|hiển thị)\s+(?:chi tiêu|giao dịch|transactions?|lịch|events?)/.test(lowerInput)) {
    return {
      type: 'query',
      response: '📋 Vui lòng vào tab tương ứng để xem danh sách chi tiết nhé!',
    };
  }

  // ========== GREETING PATTERNS ==========

  if (/^(?:hi|hello|xin chào|chào|hey|yo|ê|ơi|alo|a lô)/.test(lowerInput)) {
    const greetings = [
      'Xin chào! 👋 Tôi có thể giúp bạn quản lý chi tiêu và lịch trình. Gõ "help" để xem hướng dẫn!',
      'Chào bạn! 😊 Tôi sẵn sàng hỗ trợ bạn quản lý tài chính và lịch trình.',
      'Hello! 👋 Bạn cần ghi chi tiêu hay tạo lịch hẹn gì không?',
    ];
    return {
      type: 'unknown',
      response: greetings[Math.floor(Math.random() * greetings.length)],
    };
  }

  // Time-based greetings
  if (/^(?:chào buổi sáng|good morning|morning)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: 'Chào buổi sáng! ☀️ Chúc bạn một ngày mới tràn đầy năng lượng!',
    };
  }

  if (/^(?:chào buổi tối|good evening|evening|good night)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: 'Chào buổi tối! 🌙 Bạn muốn ghi lại chi tiêu hôm nay không?',
    };
  }

  // How are you
  if (/^(?:bạn khỏe không|how are you|bạn có khỏe không|khỏe không|what's up|sup)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: 'Tôi vẫn hoạt động tốt! 💪 Cảm ơn bạn đã hỏi thăm. Bạn cần gì hôm nay?',
    };
  }

  // What can you do
  if (/(?:bạn làm được gì|bạn có thể làm gì|what can you do|chức năng|features?)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: `🤖 Tôi có thể giúp bạn:

💰 **Quản lý chi tiêu**: Ghi nhận thu chi, theo dõi ngân sách
📅 **Quản lý lịch trình**: Tạo sự kiện, nhắc nhở
📊 **Xem thống kê**: Phân tích chi tiêu theo danh mục

Gõ "help" để xem chi tiết cách sử dụng!`,
    };
  }

  // ========== HELP ==========

  if (/^(?:help|hướng dẫn|giúp|cách dùng|how|hướng dẫn sử dụng|\?|menu)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: `📖 **Hướng dẫn sử dụng:**

💸 **Chi tiêu:**
• "chi 50k ăn trưa"
• "cafe 30k" / "ăn 50k"
• "grab 25 ngàn"
• "tiền xăng 100k"
• "hôm nay ăn phở hết 50k"
• "bữa trưa 60k"
• "-50k đi chợ"

💰 **Thu nhập:**
• "nhận 10tr lương"
• "+5tr thưởng"
• "thưởng tết 5 triệu"
• "khách trả 2tr"
• "bán hàng được 500k"

📅 **Sự kiện:**
• "họp 3h chiều"
• "meeting 14:30 mai"
• "học tiếng anh 9h sáng thứ 2"
• "đi gym 6h tối"
• "nhắc 2h chiều gọi khách"

📆 **Thời gian:**
• hôm nay, mai, mốt, hôm qua
• thứ 2-7, chủ nhật
• cuối tuần, đầu tuần
• tuần sau, tháng sau

📊 **Xem thống kê:**
• "tổng chi tiêu"
• "còn lại bao nhiêu"
• "lịch hôm nay"

💡 Tip: "k" = nghìn, "tr" = triệu`,
    };
  }

  // ========== THANKS ==========

  if (/^(?:cảm ơn|thank|thanks|cám ơn|camon)/.test(lowerInput)) {
    const thanks = [
      'Không có gì! 😊 Còn gì tôi có thể giúp bạn không?',
      'Rất vui được giúp bạn! 🙌',
      'Không có chi! Cứ gọi tôi khi cần nhé! 😄',
    ];
    return {
      type: 'unknown',
      response: thanks[Math.floor(Math.random() * thanks.length)],
    };
  }

  // Confirmations
  if (/^(?:ok|okay|được|tốt|good|great|nice|oke|okie|okê|ổn|đc|dc|👍|👌)$/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: 'Tuyệt! 👍 Còn gì khác không?',
    };
  }

  // Delete/edit requests
  if (/(?:xóa|xoá|delete|remove|hủy|cancel|sửa|edit|update|chỉnh)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: '✏️ Để xóa hoặc sửa, bạn vui lòng vào tab **Chi tiêu** hoặc **Lịch trình** và chọn mục cần chỉnh sửa nhé!',
    };
  }

  // Bye/goodbye
  if (/^(?:bye|goodbye|tạm biệt|tạm biệt nhé|bai|bb|see you|hẹn gặp lại)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: 'Tạm biệt! 👋 Hẹn gặp lại bạn!',
    };
  }

  // Numbers only - likely an expense amount
  if (/^(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/.test(lowerInput)) {
    const amount = parseAmount(lowerInput);
    if (amount > 0) {
      return {
        type: 'unknown',
        response: `💡 Bạn muốn ghi **${amount.toLocaleString()}đ** là chi tiêu hay thu nhập?\n\nVí dụ:\n• "chi ${lowerInput} ăn trưa"\n• "nhận ${lowerInput} lương"`,
      };
    }
  }

  // Food keywords without amount
  if (/^(?:ăn|uống|cafe|cà phê|phở|bún|cơm|trà sữa|milk tea)$/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: `💡 Bạn muốn ghi chi tiêu "${originalInput}"? Hãy thêm số tiền nhé!\n\nVí dụ: "${originalInput} 50k"`,
    };
  }

  return {
    type: 'unknown',
    response: '🤔 Tôi chưa hiểu ý bạn. Gõ **"help"** để xem hướng dẫn sử dụng nhé!',
  };
}

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useOllama, setUseOllama] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          setUseOllama(true); // Auto-enable if available
        }
      } catch {
        setOllamaAvailable(false);
      }
    };
    checkOllama();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleOllamaChat = async (userMessage: string): Promise<{
    response: string;
    action?: {
      action: 'expense' | 'income' | 'event';
      amount?: number;
      description?: string;
      category?: string;
      title?: string;
      date?: string;
      startTime?: string;
    };
    ollamaFailed?: boolean;
  }> => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, useOllama: true }),
      });
      const data = await res.json();

      if (!data.success) {
        console.log('Ollama API failed:', data.error);
        // Return error but mark that Ollama failed - let handleSubmit decide what to do
        return {
          response: data.error || 'Có lỗi khi kết nối với AI',
          action: undefined,
          ollamaFailed: true
        };
      }

      console.log('Ollama response:', data.message);
      console.log('Ollama action:', data.action);
      return { response: data.message, action: data.action, ollamaFailed: false };
    } catch (error) {
      console.error('Ollama fetch error:', error);
      return {
        response: 'Không thể kết nối với Ollama AI',
        action: undefined,
        ollamaFailed: true
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message
    addChatMessage({ role: 'user', content: userMessage });

    try {
      let response: string;
      let actionData: Record<string, unknown> | undefined;

      if (useOllama && ollamaAvailable) {
        // Use Ollama
        const result = await handleOllamaChat(userMessage);

        // If Ollama completely failed, fallback to rule-based entirely
        if (result.ollamaFailed) {
          console.log('Ollama failed, using rule-based entirely');
          const ruleResult = parseCommand(userMessage);
          response = ruleResult.response;

          if ((ruleResult.type === 'expense' || ruleResult.type === 'income') && ruleResult.data) {
            addTransaction(ruleResult.data as Parameters<typeof addTransaction>[0]);
          } else if (ruleResult.type === 'event' && ruleResult.data) {
            addEvent(ruleResult.data as Parameters<typeof addEvent>[0]);
          }
        } else {
          // Ollama succeeded - use its response
          response = result.response;
          let actionAdded = false;

          // Priority 1: Use Ollama's structured action if available
          if (result.action) {
            console.log('Using Ollama action:', result.action);
            const { action, ...data } = result.action;
            if (action === 'expense' || action === 'income') {
              actionData = {
                ...data,
                type: action,
                date: data.date || new Date().toISOString().split('T')[0],
              };
              console.log('Adding transaction from Ollama:', actionData);
              addTransaction(actionData as Parameters<typeof addTransaction>[0]);
              actionAdded = true;
            } else if (action === 'event') {
              actionData = {
                ...data,
                date: data.date || new Date().toISOString().split('T')[0],
              };
              console.log('Adding event from Ollama:', actionData);
              addEvent(actionData as Parameters<typeof addEvent>[0]);
              actionAdded = true;
            }
          }

          // Priority 2: Fallback to rule-based parser ONLY for data extraction
          // Keep Ollama's response for display
          if (!actionAdded) {
            console.log('Ollama did not return action, trying rule-based for data extraction...');
            const ruleResult = parseCommand(userMessage);
            if ((ruleResult.type === 'expense' || ruleResult.type === 'income') && ruleResult.data) {
              console.log('Fallback: Adding transaction from rule-based:', ruleResult.data);
              addTransaction(ruleResult.data as Parameters<typeof addTransaction>[0]);
              // Keep Ollama's natural response but append confirmation
              const data = ruleResult.data as { amount: number; description: string };
              response = `${response}\n\n✅ Đã ghi nhận: ${data.description} - ${data.amount.toLocaleString()}đ`;
            } else if (ruleResult.type === 'event' && ruleResult.data) {
              console.log('Fallback: Adding event from rule-based:', ruleResult.data);
              addEvent(ruleResult.data as Parameters<typeof addEvent>[0]);
              const data = ruleResult.data as { title: string; startTime: string };
              response = `${response}\n\n✅ Đã thêm sự kiện: ${data.title} lúc ${data.startTime}`;
            }
          }
        }
      } else {
        // Use rule-based parser
        const result = parseCommand(userMessage);
        response = result.response;

        if ((result.type === 'expense' || result.type === 'income') && result.data) {
          console.log('Adding transaction:', result.data);
          addTransaction(result.data as Parameters<typeof addTransaction>[0]);
        } else if (result.type === 'event' && result.data) {
          console.log('Adding event:', result.data);
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
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h2>
            <p className="text-xs text-gray-500">
              {useOllama && ollamaAvailable ? (
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> Ollama AI
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Rule-based
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Ollama Toggle */}
          {ollamaAvailable && (
            <button
              onClick={() => setUseOllama(!useOllama)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                useOllama
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {useOllama ? '🤖 AI' : '⚡ Fast'}
            </button>
          )}

          {chatMessages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Ollama Status Banner */}
      {ollamaAvailable === false && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-700 dark:text-yellow-400">
            💡 Ollama không khả dụng. Đang dùng rule-based parser.{' '}
            <a
              href="https://ollama.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Cài Ollama
            </a>{' '}
            để dùng AI thực sự.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Xin chào! 👋
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {useOllama && ollamaAvailable
                ? 'Tôi là AI Assistant, có thể hiểu ngôn ngữ tự nhiên. Hãy nói chuyện với tôi!'
                : 'Tôi có thể giúp bạn quản lý chi tiêu và lịch trình. Thử gõ "help" để xem hướng dẫn!'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {(useOllama && ollamaAvailable
                ? [
                    'Hôm nay tôi ăn trưa hết 50 ngàn',
                    'Chiều nay 3 giờ có cuộc họp',
                    'Tháng này tôi chi bao nhiêu?',
                  ]
                : ['chi 50k ăn trưa', 'họp 3h chiều', 'nhận 10tr lương']
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-violet-200'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {format(new Date(message.timestamp), 'HH:mm')}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
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
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              useOllama && ollamaAvailable
                ? 'Nhập tin nhắn...'
                : 'Nhập lệnh... (vd: chi 50k ăn trưa)'
            }
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="px-4 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
