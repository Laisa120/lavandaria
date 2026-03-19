export function formatNumberAO(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  const fixed = safe.toFixed(2);
  const [integer, decimal] = fixed.split('.');
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${grouped},${decimal}`;
}

export function formatCurrencyAO(value: number): string {
  return `${formatNumberAO(value)} Kz`;
}
