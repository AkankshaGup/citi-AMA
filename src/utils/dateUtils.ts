export function getWeeksInCurrentMonth(): number {
  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1–12

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  // Convert Sunday(0) → 7 (ISO style)
  const startDay = firstDay.getDay() === 0 ? 7 : firstDay.getDay();
  const endDay = lastDay.getDay() === 0 ? 7 : lastDay.getDay();

  const daysInMonth = lastDay.getDate();

  return Math.ceil((daysInMonth + startDay - endDay) / 7);
}
