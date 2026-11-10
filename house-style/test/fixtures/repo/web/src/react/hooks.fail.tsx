function useCount(): number {
  return 1;
}

export function Counter({ show }: { show: boolean }) {
  if (show) {
    useCount();
  }
  return <p>count</p>;
}
