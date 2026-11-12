# Shutdown and timeouts

Rule 1 says `server.ts` sets the timeouts and wires `close-with-grace`. This
page is what the 17 server moves of 2026-11-11 and 2026-11-12 found when they
ran the built server on a real socket: the timeouts that cut a legitimate
reply, and the shutdown that waits for a response nobody will finish.
[server-skeleton.md](server-skeleton.md) has the `server.ts` these settings
go in.

Checked on 2026-11-12 against `fastify` 5.12.8: the `preClose` row below was
measured in a scratch folder, the rest is from the repos named.

## The timeouts

| Setting | What it cuts | Set it to |
|---|---|---|
| `connectionTimeout` | A socket silent this long, mid-request or mid-reply: a stream that goes quiet is cut too, and a stream that keeps writing isn't | Above the longest silent response in the repo: wicket's 25 s long poll (35 s), lantern's 26 s record route (45 s), Shelfmark's lookup (130 s), atrium's LaTeX compile (150 s). |
| `requestTimeout` | Receiving the request, body included. It never cuts a reply (newspapper, on a real socket) | 0 or raised for a large upload (comercial-website's 500 MB multipart); 30 to 60 s elsewhere |
| `keepAliveTimeout` | An idle connection between requests | 125 s: above Caddy's 2 minutes, so the proxy never sends a request down a socket the server just closed (sports-app, almanac, ro-housing) |

- **`connectionTimeout` doesn't apply to an upgraded socket** (satchel): a
  websocket idle for 12 s outlived a 10 s setting.
- **A stream turns its own socket timeout off.** `socket.setTimeout(0)`,
  behind `request.raw.socket instanceof Socket`, because `inject()` has no
  socket (newspapper's three SSE streams and its zip, atrium's media).
- **A route with an unbounded run lifts the timeout for itself**, in an
  `onRequest` hook (public-resource-map's two refresh routes).
- **Measure before choosing.** newspapper timed its slowest routes (a
  12-slide render streams 7 to 10 s) and set 35 / 60 / 125 s from the
  numbers. A number nobody measured is a guess: write it in the repo's
  decisions with the route it was chosen for.
- **An undeployed server may defer all of these** with a decision entry
  (3D-sandbox, mini-projects, imbatranim-apps). A deployed one doesn't.

## What holds a shutdown

`close-with-grace` calls `app.close()` on SIGINT and SIGTERM and exits
anyway when its delay runs out: with exit 1, nothing recorded, and a
container's `docker stop` has waited its 10 s. `app.close()` runs the
`onClose` hooks only after every request in flight has finished, so any
response that is held open keeps the process alive. `inject()` never shows
it: only a real socket does.

Measured: a long poll that never answers, then `app.close()`. With the
cancel in an `onClose` hook, the close was still waiting after 3 s and the
client had got nothing. With the same cancel in a `preClose` hook, it closed
in 10 ms and the client read `{"cancelled":true}`.

- **Cancel held responses in `preClose`** (wicket's long poll, newspapper's
  SSE streams, atrium's media stream). A stream gets an `error` or a final
  event, then ends.
- **Close the database in `onClose`**, in the same hook as anything that
  must finish first. `onClose` hooks run last-added first, so two hooks
  close the database before the drain (satchel); put both in one.
- **A websocket needs its plugin's own `preClose`.** `@fastify/websocket`'s
  default closes every client with no code (1005) and runs before any hook
  of yours, and `ws` then waits 30 s for a silent client. Set the plugin's
  `preClose` (close each socket with 1001, then `websocketServer.close()`)
  and `options.closeTimeout` (1 to 2 s). Setting your own `preClose` replaces the plugin's (it drops
  its upgrade listener), so yours closes the sockets.
  The web client reconnects on 1001 (satchel's did; check yours).
- **A slow read holds it too.** atrium's media stream read slowly held
  shutdown only with a file larger than the loopback buffer (40 MB; 2 MB
  finished at once). Cut it in `preClose`.
- **A job that outlives the grace window** (ro-housing's refresh,
  Shelfmark's lookup) runs the 10 s out and exits 1, where the old loop
  waited without limit. Record it as a todo when it matters.

## The real-socket check

Every brief runs the built server once on a real socket, because it is the
only check of the entry, the timeouts and the shutdown together.

- **Run it from a scratch folder with no `.env`, and pin every setting.**
  Several servers load a `.env` from the working directory or a fixed path;
  an unpinned key can reach a real cloud or database (wicket, almanac).
- **Start the built `dist/server.js` from a small script** so `$!` is node.
  A subshell reported 143 when node itself exited 0.
- **Read the exit code of node's own PID.** Expect 0 within a second. With a
  long response held, expect the cancel and 0, not close-with-grace's
  delay.
- **`close-with-grace` exits 0 after a signal** only if the handler lets it:
  newspapper's exited 143 (128 + the signal), which is also correct. State
  which a repo expects.
- **Check a bad setting too:** `PORT=abc` or a missing required variable
  exits 1 naming the variable.
- **The container is the owner's check.** Local Docker can't build, so the
  `CMD` change is verified after the deploy: the container turns healthy
  and `docker stop` ends at once.
