import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, artwork, message } = body;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('Немає токена або ID чату в .env.local');
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    // Красивий текст повідомлення, який прийде в групу
    const text = `
🔔 <b>Нова заявка з сайту!</b>
👤 <b>Ім'я:</b> ${name}
📞 <b>Тел:</b> ${phone}
🎨 <b>Картина:</b> ${artwork || 'Не обрано'}
💬 <b>Повідомлення:</b> ${message || '-'}
    `.trim();

    // Відправляємо запит на сервери Telegram
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Telegram API повернув помилку');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Помилка відправки в Telegram:', error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}