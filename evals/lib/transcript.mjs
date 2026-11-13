// Turns a recorded run into { toolCalls: [{ name, input }], finalMessage }.
// Accepts the stream-json event list a `claude -p --output-format stream-json`
// run writes (assistant events holding tool_use and text blocks, then a result
// event), or an object already in the normalized shape.

export function normalize(raw) {
  if (raw && !Array.isArray(raw) && Array.isArray(raw.toolCalls)) {
    return { toolCalls: raw.toolCalls, finalMessage: String(raw.finalMessage ?? '') };
  }
  const events = Array.isArray(raw) ? raw : [];
  const toolCalls = [];
  let lastText = '';
  let result = null;
  for (const ev of events) {
    if (ev?.type === 'assistant' && Array.isArray(ev.message?.content)) {
      const texts = [];
      for (const block of ev.message.content) {
        if (block.type === 'tool_use') toolCalls.push({ name: block.name, input: block.input ?? {} });
        if (block.type === 'text') texts.push(block.text);
      }
      if (texts.length) lastText = texts.join('\n');
    }
    if (ev?.type === 'result' && typeof ev.result === 'string') result = ev.result;
  }
  return { toolCalls, finalMessage: result ?? lastText };
}

export function callsNamed(t, name) {
  return t.toolCalls.filter((c) => c.name === name);
}

export function inputText(call) {
  return typeof call.input === 'string' ? call.input : JSON.stringify(call.input ?? {});
}
