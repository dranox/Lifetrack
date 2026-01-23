import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

const SYSTEM_PROMPT = `Bạn là trợ lý cá nhân thông minh giúp quản lý chi tiêu và lịch trình.

Khi người dùng yêu cầu thêm chi tiêu, thu nhập, hoặc sự kiện, hãy trả về JSON với format:

1. Chi tiêu:
{"action": "expense", "amount": 50000, "description": "ăn trưa", "category": "food"}

2. Thu nhập:
{"action": "income", "amount": 10000000, "description": "lương tháng 1", "category": "salary"}

3. Sự kiện:
{"action": "event", "title": "Họp team", "date": "2024-01-25", "startTime": "14:00", "category": "meeting"}

Categories cho chi tiêu: food, transport, shopping, entertainment, bills, health, education, other
Categories cho thu nhập: salary, bonus, investment, other
Categories cho sự kiện: work, personal, health, education, meeting, other

Nếu không phải yêu cầu thêm dữ liệu, hãy trả lời bình thường (không cần JSON).
Luôn trả lời bằng tiếng Việt.
Ngày hôm nay: ${new Date().toISOString().split('T')[0]}`;

export async function POST(request: NextRequest) {
  try {
    const { message, useOllama } = await request.json();

    if (!useOllama) {
      return NextResponse.json({
        success: false,
        error: 'Ollama not enabled'
      });
    }

    // Check if Ollama is available
    try {
      const healthCheck = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });
      if (!healthCheck.ok) throw new Error('Ollama not available');
    } catch {
      return NextResponse.json({
        success: false,
        error: 'Ollama không khả dụng. Hãy chắc chắn Ollama đang chạy.'
      });
    }

    // Call Ollama
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'qwen2.5-coder',
        prompt: `${SYSTEM_PROMPT}\n\nNgười dùng: ${message}\n\nTrợ lý:`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({
        success: false,
        error: `Ollama error: ${error}`
      });
    }

    const data = await response.json();
    const assistantMessage = data.response?.trim() || '';

    // Try to parse JSON action from response
    let action = null;
    const jsonMatch = assistantMessage.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      try {
        action = JSON.parse(jsonMatch[0]);
      } catch {
        // Not valid JSON, that's fine
      }
    }

    // Clean response (remove JSON if present for display)
    let displayMessage = assistantMessage;
    if (action && jsonMatch) {
      displayMessage = assistantMessage.replace(jsonMatch[0], '').trim();
      if (!displayMessage) {
        // Generate friendly message based on action
        if (action.action === 'expense') {
          displayMessage = `Đã thêm chi tiêu: ${action.description} - ${action.amount?.toLocaleString()}đ`;
        } else if (action.action === 'income') {
          displayMessage = `Đã thêm thu nhập: ${action.description} - ${action.amount?.toLocaleString()}đ`;
        } else if (action.action === 'event') {
          displayMessage = `Đã thêm sự kiện: ${action.title} lúc ${action.startTime}`;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: displayMessage || assistantMessage,
      action,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Có lỗi xảy ra khi xử lý yêu cầu'
    });
  }
}

// Health check endpoint
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(2000),
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        available: true,
        models: data.models?.map((m: { name: string }) => m.name) || []
      });
    }
    return NextResponse.json({ available: false });
  } catch {
    return NextResponse.json({ available: false });
  }
}
