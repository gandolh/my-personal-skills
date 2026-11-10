function useCount(): number {
  return 1;
}

export function Counter() {
  const count = useCount();
  return <p>{count}</p>;
}
