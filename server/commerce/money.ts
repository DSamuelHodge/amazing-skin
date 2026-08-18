export function fromMoney(value: string | number | null | undefined): number {
  if (value == null) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function toMoney(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function toCents(value: number): number {
  return Math.max(0, Math.round(value * 100));
}
