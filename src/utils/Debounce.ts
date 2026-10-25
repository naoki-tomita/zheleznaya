export function debounce<T extends any[]>(
  fn: (...args: T) => void,
  timeout: number,
): (...args: T) => void {
  let timer: any;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), timeout);
  };
}
