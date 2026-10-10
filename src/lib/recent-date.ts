const calendar = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai',
});

function calendarDay(date: Date) {
  const parts = Object.fromEntries(calendar.formatToParts(date).map(part => [part.type, part.value]));
  return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86400000;
}

export function recentDateLabel(date: Date, now = new Date()) {
  const days = calendarDay(now) - calendarDay(date);
  if (date.getTime() > now.getTime() || days >= 30) return calendar.format(date);
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  return `${days}天前`;
}
