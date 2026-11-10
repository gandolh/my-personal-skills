function useCount(): number {
  return 1;
}

export function counter(show: boolean): number {
  if (show) {
    useCount();
  }
  return 0;
}
