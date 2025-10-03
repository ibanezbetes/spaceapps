export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function formatMagnitude(mag: number | undefined): string {
  if (mag === undefined) {
    return 'N/A';
  }
  return mag.toFixed(2);
}

export function formatCoordinate(value: number, type: 'ra' | 'dec'): string {
  if (type === 'ra') {
    // Convert degrees to HMS
    const hours = Math.floor(value / 15);
    const minutes = Math.floor(((value / 15) % 1) * 60);
    const seconds = (((value / 15) % 1) * 3600) % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toFixed(1)}s`;
  } else {
    // DMS
    const sign = value >= 0 ? '+' : '-';
    const absValue = Math.abs(value);
    const degrees = Math.floor(absValue);
    const minutes = Math.floor((absValue % 1) * 60);
    const seconds = ((absValue % 1) * 3600) % 60;
    return `${sign}${degrees.toString().padStart(2, '0')}° ${minutes.toString().padStart(2, '0')}' ${seconds.toFixed(1)}"`;
  }
}
