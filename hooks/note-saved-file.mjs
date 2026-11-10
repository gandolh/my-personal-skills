#!/usr/bin/env node
// note-saved-file.mjs - a PostToolUse hook on Edit|Write. It records that
// this session saved a code file, so the Stop hook knows which packages to
// check (see hooks/session-state.mjs). It prints nothing and always exits 0:
// a note that can't be written only means the Stop hook skips that package.
import { readEvent } from "./repo.mjs";
import { isCodeFile, noteSavedFile } from "./session-state.mjs";

try {
  const event = await readEvent();
  const file = event?.tool_input?.file_path;
  const session = event?.session_id;
  if (typeof file === "string" && typeof session === "string" && session && isCodeFile(file)) {
    noteSavedFile(session, file);
  }
} catch {
  // Never fail the edit over a note.
}
process.exit(0);
