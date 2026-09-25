/**
 * The "naive" strategy from the blog post: flush every delta straight to
 * the DOM as it arrives. No batching, no yielding. This is the version
 * that blocks input while the model is talking.
 */

export async function naiveStreamAnswer(prompt, onChunk, signal) {
  const session = await LanguageModel.create({ signal });
  const stream = session.promptStreaming(prompt, { signal });

  for await (const delta of stream) {
    onChunk(delta);
  }

  session.destroy();
}
