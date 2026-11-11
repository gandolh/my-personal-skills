// The web root gets the file-size rule only: import.meta.env, and a listen call, are its own business.
export function App() {
  const socket = new WebSocket(import.meta.env.VITE_SOCKET ?? "ws://localhost");
  socket.addEventListener("open", () => socket.send("listen()"));
  return <main>{process.env.NODE_ENV}</main>;
}
