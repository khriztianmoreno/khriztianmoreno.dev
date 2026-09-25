/**
 * The "optimized" strategy from the blog post: batch by sentence with
 * Intl.Segmenter, yield to the main thread between updates, and support
 * cancellation via AbortController.
 */

export function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export async function streamAnswer(prompt, onSentence, signal) {
  const session = await LanguageModel.create({ signal });
  const segmenter = new Intl.Segmenter('es', { granularity: 'sentence' });

  const stream = session.promptStreaming(prompt, { signal });
  let buffer = '';
  let cursor = 0;

  for await (const delta of stream) {
    buffer += delta;

    // The last segment in a partial buffer might still be growing,
    // so only flush the ones that are already complete.
    const segments = [...segmenter.segment(buffer)];
    const complete = segments.slice(0, -1);

    for (const { segment, index } of complete) {
      if (index < cursor) continue;
      await yieldToMain();
      onSentence(segment);
      cursor = index + segment.length;
    }
  }

  const tail = buffer.slice(cursor);
  if (tail) onSentence(tail);

  session.destroy();
}
