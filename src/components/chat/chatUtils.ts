import { format } from 'date-fns';

// Helper: Parse amount from text
export function parseAmount(text: string): number {
  const lowerText = text.toLowerCase();

  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*(?:triệu|tr)/i, multiplier: 1000000 },
    { regex: /(\d+(?:\.\d+)?)\s*(?:ngàn|nghìn|k)/i, multiplier: 1000 },
    { regex: /(\d+(?:,\d{3})+)/, multiplier: 1, replace: true },
    { regex: /(\d+(?:\.\d{3})+)(?!\s*tr)/i, multiplier: 1, replaceDot: true },
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
        if (multiplier === 1 && num < 1000 && num > 0) {
          return num * 1000;
        }
        return num * multiplier;
      }
    }
  }
  return 0;
}

// Helper: Parse date from text
export function parseDate(text: string): Date {
  const lowerText = text.toLowerCase();
  const today = new Date();

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
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
    today.setDate(today.getDate() + daysUntilSaturday);
  } else if (/đầu tuần|thứ 2|thứ hai|monday/.test(lowerText)) {
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

  const dateMatch = lowerText.match(/(?:ngày\s+(\d{1,2}))|(?:(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{4}))?)/);
  if (dateMatch) {
    if (dateMatch[1]) {
      const day = parseInt(dateMatch[1]);
      if (day >= 1 && day <= 31) {
        today.setDate(day);
      }
    } else if (dateMatch[2] && dateMatch[3]) {
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
export function categorizeExpense(text: string): string {
  const lowerText = text.toLowerCase();

  if (/ăn|cơm|phở|bún|mì|bánh|cafe|cà phê|trà|coffee|uống|nhậu|bia|rượu|đồ ăn|thức ăn|bữa|sáng|trưa|tối|lẩu|nướng|gà|vịt|heo|bò|cá|tôm|cua|ốc|chè|kem|nước|milk tea|trà sữa|pizza|burger|gỏi|salad|cháo|xôi|hủ tiếu/.test(lowerText)) {
    return 'food';
  }
  if (/grab|taxi|xe|xăng|dầu|gửi xe|đỗ xe|uber|be|gojek|bus|xe buýt|tàu|máy bay|vé|đi lại|di chuyển|ship|giao hàng|vận chuyển/.test(lowerText)) {
    return 'transport';
  }
  if (/shopee|lazada|tiki|sendo|mua|quần|áo|giày|dép|túi|ví|đồng hồ|mỹ phẩm|son|kem|nước hoa|thời trang|phụ kiện|online|order|đặt hàng/.test(lowerText)) {
    return 'shopping';
  }
  if (/điện|nước|internet|wifi|4g|5g|điện thoại|thuê|rent|phòng|nhà|gas|truyền hình|netflix|spotify|youtube|subscription|đăng ký|hóa đơn|bill/.test(lowerText)) {
    return 'bills';
  }
  if (/thuốc|khám|bệnh|viện|doctor|bác sĩ|y tế|sức khỏe|gym|tập|thể dục|spa|massage|răng|mắt|vitamin|thực phẩm chức năng/.test(lowerText)) {
    return 'health';
  }
  if (/game|phim|giải trí|cinema|rạp|karaoke|du lịch|travel|chơi|vui|party|tiệc|sinh nhật|event|sự kiện|concert|show|vé xem/.test(lowerText)) {
    return 'entertainment';
  }
  if (/học|sách|course|khóa học|udemy|coursera|học phí|trường|lớp|thầy|cô|gia sư|tài liệu|giáo trình/.test(lowerText)) {
    return 'education';
  }

  return 'other';
}

// Helper: Auto categorize income
export function categorizeIncome(text: string): string {
  const lowerText = text.toLowerCase();

  if (/lương|salary|wage/.test(lowerText)) return 'salary';
  if (/thưởng|bonus|thưởng tết|thưởng quý/.test(lowerText)) return 'bonus';
  if (/đầu tư|invest|cổ tức|lãi|profit|trading|crypto|coin/.test(lowerText)) return 'investment';
  if (/freelance|dự án|project|làm thêm|part.?time/.test(lowerText)) return 'other';

  return 'other';
}

// Types
export interface ParseCommandResult {
  type: 'event' | 'expense' | 'income' | 'query' | 'unknown';
  data?: Record<string, unknown>;
  response: string;
}

export interface OllamaAction {
  action: 'expense' | 'income' | 'event';
  amount?: number;
  description?: string;
  category?: string;
  title?: string;
  date?: string;
  startTime?: string;
}

export interface OllamaChatResult {
  response: string;
  action?: OllamaAction;
  ollamaFailed?: boolean;
}

// Simple command parser (rule-based)
export function parseCommand(input: string): ParseCommandResult {
  const lowerInput = input.toLowerCase().trim();
  const originalInput = input.trim();

  // Early exit for event keywords
  const hasEventKeywords = /(?:họp|meeting|lịch|hẹn|gặp|call|học|tập|gym|nhắc|reminder|cuộc họp|cuộc hẹn)/.test(lowerInput);
  const hasTimePattern = /\d{1,2}\s*(?:h|:|giờ)\s*(?:\d{0,2})?\s*(?:sáng|chiều|tối|am|pm)?/.test(lowerInput);
  const hasEventPhrase = /(?:có|cần|phải)\s+(?:cuộc\s+)?(?:họp|hẹn|gặp|meeting)/.test(lowerInput);
  const likelyEvent = (hasEventKeywords && hasTimePattern) || hasEventPhrase;

  // ========== EXPENSE PATTERNS ==========
  const expensePattern1 = lowerInput.match(/^(?:chi|mua|tiêu|trả|thanh toán|đóng|nạp|chuyển|gửi)\s+(.+)/i);
  const expensePattern2 = lowerInput.match(/^(.+?)\s+(?:hết|mất|tốn|là|:)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i);
  const expensePattern3 = lowerInput.match(/(?:hôm nay|sáng nay|trưa nay|chiều nay|tối nay|hôm qua|vừa|mới|sáng|trưa|chiều|tối)\s+(.+?)\s+(?:hết|mất|tốn)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?/i);
  const expensePattern4 = lowerInput.match(/(?:tôi|mình|em|anh|chị)?\s*(?:đã|vừa|mới)?\s*(?:chi|mua|tiêu|trả)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(?:cho|để|vào)?\s*(.+)/i);
  const expensePattern5 = lowerInput.match(/^(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(?:cho|để|vào)?\s*(.+)/i);
  const expensePattern6 = lowerInput.match(/^tiền\s+(.+?)\s+(?:hết|mất|tốn|là|:)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i);
  const expensePattern7 = lowerInput.match(/^(?:bữa\s+)?(sáng|trưa|tối|khuya)\s+(?:hết|mất|tốn|là|:)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i);
  const expensePattern8 = lowerInput.match(/^đi\s+(.+?)\s+(?:hết|mất|tốn)?\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i);
  const expensePattern9 = lowerInput.match(/^[-−]\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(.+)/i);
  const expensePattern10 = lowerInput.match(/^(ăn|uống|nhậu|lai rai)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/i);

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
    if (expenseAmount > 0 && categorizeExpense(expenseDesc) !== 'other') {
      expenseMatch = true;
    }
  }

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
  const incomePattern1 = lowerInput.match(/^(?:nhận|thu|được|có|lãi|nhận được|kiếm được|earn)\s+(.+)/i);
  const incomePattern2 = lowerInput.match(/^(lương|thưởng|tiền|thu nhập|freelance|dự án|bonus|tiền công|công|hoa hồng|commission)\s+(.+)/i);
  const incomePattern3 = lowerInput.match(/^(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s+(?:tiền\s+)?(lương|thưởng|thu nhập|freelance|bonus|hoa hồng)/i);
  const incomePattern4 = lowerInput.match(/^\+\s*(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s*(.*)$/i);
  const incomePattern5 = lowerInput.match(/^(?:bán|làm|làm thêm|part.?time|freelance)\s+.+?\s+(?:được|kiếm|thu)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?/i);
  const incomePattern6 = lowerInput.match(/(?:khách|sếp|công ty|cty|boss|client)\s+(?:trả|cho|gửi|chuyển)\s+(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?\s*(.*)$/i);

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
  const eventPattern1 = lowerInput.match(/^(?:họp|meeting|gặp|hẹn|phỏng vấn|interview|call|gọi điện)\s*(.+?)?\s*(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i);
  const eventPattern2 = lowerInput.match(/^(?:học|đi học|lớp|khóa|course)\s+(.+?)\s+(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i);
  const eventPattern3 = lowerInput.match(/^(?:đi|tập|chơi|xem|ăn)\s+(.+?)\s+(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i);
  const eventPattern4 = lowerInput.match(/^(\d{1,2})(?:h|:)(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?\s+(.+)/i);
  const eventPattern5 = lowerInput.match(/^(?:nhắc|nhắc nhở|reminder|đặt lịch|tạo lịch|thêm lịch)\s+(.+?)\s+(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i);
  const eventPattern6 = lowerInput.match(/^lịch\s+(họp|hẹn|gặp|meeting|call|làm việc|work|học|tập)\s*(.+?)?\s*(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i);
  const eventPattern7 = lowerInput.match(/(?:có|cần|phải)\s+(?:cuộc\s+)?(họp|hẹn|gặp|meeting|call|học|tập)\s*(.+?)?\s*(?:lúc\s*)?(\d{1,2})(?:h|:)?(\d{0,2})?\s*(sáng|chiều|tối|am|pm)?/i);
  const eventPattern8 = lowerInput.match(/^(?:sáng|chiều|tối)?\s*(?:nay|mai|mốt|hôm nay|ngày mai)?\s*(\d{1,2})\s*(?:h|giờ|:)\s*(\d{0,2})?\s*(?:sáng|chiều|tối)?\s*(?:có|cần|phải)\s+(?:cuộc\s+)?(họp|hẹn|gặp|meeting|call|học|tập|lịch)\s*(.+)?/i);

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
    const eventType = eventPattern6[1];
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
    const eventType = eventPattern7[1];
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
    eventHour = parseInt(eventPattern8[1]) || 0;
    eventMinute = parseInt(eventPattern8[2]) || 0;
    const eventType = eventPattern8[3];
    const extraInfo = eventPattern8[4]?.trim() || '';

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
  if (/(?:tổng|bao nhiêu|còn lại|đã chi|đã tiêu|chi tiêu|thống kê|summary|report|báo cáo)/.test(lowerInput)) {
    return {
      type: 'query',
      response: '📊 Để xem tổng quan chi tiêu, vui lòng vào tab **Tổng quan** hoặc **Chi tiêu** nhé!',
    };
  }

  if (/(?:lịch|hôm nay có gì|mai có gì|tuần này|kế hoạch|schedule|plan|sự kiện|events?)/.test(lowerInput)) {
    return {
      type: 'query',
      response: '📅 Để xem lịch trình, vui lòng vào tab **Lịch trình** nhé!',
    };
  }

  if (/^(?:xem|show|list|liệt kê|hiện|hiển thị)\s+(?:chi tiêu|giao dịch|transactions?|lịch|events?)/.test(lowerInput)) {
    return {
      type: 'query',
      response: '📋 Vui lòng vào tab tương ứng để xem danh sách chi tiết nhé!',
    };
  }

  // ========== GREETING PATTERNS ==========
  if (/^(?:hi|hello|xin chào|chào|hey|yo|ê|ơi|alo|a lô)/.test(lowerInput)) {
    const greetings = [
      'Xin chào! 👋 Tôi là Lifetrack Guy, có thể giúp bạn quản lý chi tiêu và lịch trình. Gõ "help" để xem hướng dẫn!',
      'Chào bạn! 😊 Tôi sẵn sàng hỗ trợ bạn quản lý tài chính và lịch trình.',
      'Hello! 👋 Bạn cần ghi chi tiêu hay tạo lịch hẹn gì không?',
    ];
    return {
      type: 'unknown',
      response: greetings[Math.floor(Math.random() * greetings.length)],
    };
  }

  if (/^(?:chào buổi sáng|good morning|morning)/.test(lowerInput)) {
    return { type: 'unknown', response: 'Chào buổi sáng! ☀️ Chúc bạn một ngày mới tràn đầy năng lượng!' };
  }

  if (/^(?:chào buổi tối|good evening|evening|good night)/.test(lowerInput)) {
    return { type: 'unknown', response: 'Chào buổi tối! 🌙 Bạn muốn ghi lại chi tiêu hôm nay không?' };
  }

  if (/^(?:bạn khỏe không|how are you|bạn có khỏe không|khỏe không|what's up|sup)/.test(lowerInput)) {
    return { type: 'unknown', response: 'Tôi vẫn hoạt động tốt! 💪 Cảm ơn bạn đã hỏi thăm. Bạn cần gì hôm nay?' };
  }

  if (/(?:bạn làm được gì|bạn có thể làm gì|what can you do|chức năng|features?)/.test(lowerInput)) {
    return {
      type: 'unknown',
      response: `🤖 Tôi là **Lifetrack Guy**, có thể giúp bạn:

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

💰 **Thu nhập:**
• "nhận 10tr lương"
• "+5tr thưởng"

📅 **Sự kiện:**
• "họp 3h chiều"
• "học tiếng anh 9h sáng"

💡 Tip: "k" = nghìn, "tr" = triệu`,
    };
  }

  // ========== THANKS ==========
  if (/^(?:cảm ơn|thank|thanks|cám ơn|camon)/.test(lowerInput)) {
    const thanks = ['Không có gì! 😊', 'Rất vui được giúp bạn! 🙌', 'Cứ gọi tôi khi cần nhé! 😄'];
    return { type: 'unknown', response: thanks[Math.floor(Math.random() * thanks.length)] };
  }

  if (/^(?:ok|okay|được|tốt|good|great|nice|oke|okie|okê|ổn|đc|dc|👍|👌)$/.test(lowerInput)) {
    return { type: 'unknown', response: 'Tuyệt! 👍 Còn gì khác không?' };
  }

  if (/(?:xóa|xoá|delete|remove|hủy|cancel|sửa|edit|update|chỉnh)/.test(lowerInput)) {
    return { type: 'unknown', response: '✏️ Để xóa hoặc sửa, vui lòng vào tab **Chi tiêu** hoặc **Lịch trình** nhé!' };
  }

  if (/^(?:bye|goodbye|tạm biệt|tạm biệt nhé|bai|bb|see you|hẹn gặp lại)/.test(lowerInput)) {
    return { type: 'unknown', response: 'Tạm biệt! 👋 Hẹn gặp lại bạn!' };
  }

  if (/^(\d+(?:\.\d+)?)\s*(?:k|ngàn|nghìn|tr|triệu|đồng|vnd|đ)?$/.test(lowerInput)) {
    const amount = parseAmount(lowerInput);
    if (amount > 0) {
      return {
        type: 'unknown',
        response: `💡 Bạn muốn ghi **${amount.toLocaleString()}đ** là chi tiêu hay thu nhập?\n\nVí dụ:\n• "chi ${lowerInput} ăn trưa"\n• "nhận ${lowerInput} lương"`,
      };
    }
  }

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

// Ollama chat handler
export async function handleOllamaChat(userMessage: string): Promise<OllamaChatResult> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, useOllama: true }),
    });
    const data = await res.json();

    if (!data.success) {
      console.log('Ollama API failed:', data.error);
      return {
        response: data.error || 'Có lỗi khi kết nối với AI',
        action: undefined,
        ollamaFailed: true,
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
      ollamaFailed: true,
    };
  }
}
