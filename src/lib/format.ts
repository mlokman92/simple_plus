/** Malaysian ringgit, no decimals when whole. */
export function myr(value: number): string {
  return value % 1 === 0 ? `RM${value}` : `RM${value.toFixed(2)}`;
}

export function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/** "2026-08-10" -> "10 Aug" */
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  if (!y || !m || !d) return iso;
  return `${d} ${months[m - 1]}`;
}

export function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function pluralize(n: number, one: string, many: string): string {
  return n === 1 ? `${n} ${one}` : `${n} ${many}`;
}
