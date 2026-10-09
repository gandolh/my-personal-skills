# Capturing screenshots, GIFs and video

Real captures of the running app beat mock-ups. They also go stale, so every capture is recorded in `docs/images/shots.md` and can be re-run.

## Before you capture: data

This is the rule that decides whether an image ships.

- **Use seed, demo or staged data only.** Look for a seed script, fixtures, a demo mode or an e2e setup first. If there is none, create neutral content through the UI (made-up titles, places like "Sample City", items like "Example task").
- **Nothing personal may appear:** no real people's names or usernames, messages, emails, phone numbers, addresses, faces, private photos, home locations, or private trip and calendar details. The owner's own account name counts as personal.
- **No secrets or internals:** no tokens, API keys, session cookies in devtools, internal hostnames, or error pages with stack traces.
- **Check every frame you ship.** For a screenshot, look at the whole image, including corners, avatars and browser chrome. For a GIF, look at the first, last and a frame every second.
- If a screen cannot be shown without personal data, do not capture it. Say so in the report.

## Tools

Any browser driver works. The commands below use `agent-browser`; Playwright is the same idea.

```bash
agent-browser --session readme open http://localhost:5173/app/
agent-browser --session readme set viewport 1440 900 2     # 1440×900 CSS px at 2× pixel density
agent-browser --session readme wait --load networkidle
agent-browser --session readme screenshot /abs/path/docs/images/hero.png
```

Phone-first apps: `agent-browser --session readme set device "iPhone 14"` instead of the viewport line.

Known traps:

- **Always pass absolute output paths.** Relative paths resolve against the browser daemon's directory, not yours.
- **Avoid full-page mode** for README images. It can paint transformed images blank, and a tall strip is unreadable on a phone anyway. Capture the viewport, or resize the viewport to the content height first.
- **Wait for the app to settle**: network idle, then one or two seconds for fonts, charts, maps and animations. Maps and 3D canvases may need longer.
- Close toasts, cookie banners and dev overlays (Vite error overlay, React devtools badge) before capturing.

## Screenshots

- **Size:** desktop 1440×900 CSS px at 2×. Phone: device emulation at its native ratio. Retina capture matters: GitHub scales images down and 1× text turns soft.
- **Format:** convert to WebP for the repo, keeping files small:

  ```bash
  ffmpeg -y -loglevel error -i hero.png -c:v libwebp -quality 82 hero.webp && rm hero.png
  ```

  Aim for under 400 KB per image. Keep PNG only if WebP visibly damages text.
- **Framing:** show the main screen doing its main job, filled with realistic demo content. Crop out empty space rather than shipping half a blank page. For two phone shots, place them side by side in a table instead of composing a new image.
- **Theme:** use the app's default theme. If it has both light and dark and one is clearly the main one, use that.
- **Check at phone width.** Make a 360 px wide copy (`ffmpeg -i hero.webp -vf scale=360:-1 /tmp/check.png`) and look at it. If the key content is unreadable, crop tighter or capture a smaller viewport. A wide dashboard will only read as its overall shape at that size; that is fine for the hero as long as one of the other screenshots is a tighter crop (a detail panel, a single card) that stays legible.
- **Trim empty space.** Set the viewport height to roughly where the content ends instead of shipping a half-empty screen.

## GIFs

Use a GIF when the value is a process (drag, generate, play) rather than a screen. GitHub plays GIFs inline; it does not play video files committed to the repo.

1. Plan the beats: 3–6 actions, 6–12 seconds in total, ending on the result. Do a dry run without recording first, so you know the selectors and timings work.
2. Record:

   ```bash
   agent-browser --session readme set viewport 1280 800
   agent-browser --session readme open http://localhost:5173/app/
   agent-browser --session readme record start /abs/path/tmp/flow.webm
   # ... actions, with `wait 600`–`wait 1200` between them so a viewer can follow
   agent-browser --session readme record stop
   ```

3. Convert with a two-pass palette:

   ```bash
   ffmpeg -y -loglevel error -i flow.webm \
     -vf "fps=12,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" \
     -loop 0 docs/images/flow.gif
   ```

   Trim the start and end with `-ss <start> -t <duration>` before `-i` if there are dead frames.

4. Budget: under 5 MB and 15 seconds. If it is bigger, lower `fps` to 10, scale to 800 px, or shorten the flow.
5. Inspect frames for personal data (first, last, one per second): `ffmpeg -i flow.gif -vf fps=1 /tmp/frames/f%02d.png`.
6. Give it alt text, and put the same steps in text nearby; a GIF is invisible to screen readers and to anyone reading in a terminal.

## Video

Only when a flow is too long for a GIF. Commit an MP4 to `docs/images/` and link it from a still frame; GitHub will not play it inline from the repo.

```bash
ffmpeg -y -loglevel error -i flow.webm -c:v libx264 -pix_fmt yuv420p -crf 28 -movflags +faststart -an docs/images/flow.mp4
ffmpeg -y -loglevel error -ss 2 -i flow.webm -frames:v 1 docs/images/flow-poster.webp
```

```markdown
[![Walkthrough: <what it shows>](docs/images/flow-poster.webp)](docs/images/flow.mp4)
```

Keep it under 10 MB.

## Diagrams

- **Architecture and flows:** a Mermaid block in Markdown. GitHub renders it, it stays editable, and it needs no image file.
- **Hero diagram** (for projects with no UI): an SVG in `docs/images/` with a 1200-unit-wide `viewBox`, its own background (so it works on GitHub light and dark), system fonts, no scripts or `foreignObject`, and text at least 20 units for anything essential. Give it a `<title>` and alt text. The `diagram-design` or `archify` skills can produce one.
- **Existing interactive diagrams** (archify HTML on a docs site): screenshot or export them to a static SVG/PNG in `docs/images/`.

## CLI and terminal output

Prefer a real command and its real output in a fenced code block. It is searchable, copyable and always legible. Run the command and paste what it printed; never type output by hand. Strip anything private (home paths, hostnames, tokens) by changing the input, not by editing the output.

A terminal GIF (VHS, asciinema) is optional and only worth it when the motion matters.

## Record it

Add a row to `docs/images/shots.md` for every file: what it shows, how to reach that state, viewport, data source, date.
