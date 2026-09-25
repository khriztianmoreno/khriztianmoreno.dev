import { streamAnswer } from './lib.js';
import { naiveStreamAnswer } from './naive.js';

const promptEl = document.getElementById('prompt');
const answerEl = document.getElementById('answer');
const generateBtn = document.getElementById('generate');
const stopBtn = document.getElementById('stop');
const probeBtn = document.getElementById('probe');
const warningEl = document.getElementById('warning');

let controller = null;

function appendText(text) {
  const span = document.createElement('span');
  span.textContent = text;
  answerEl.appendChild(span);
}

function getStrategy() {
  return document.querySelector('input[name="strategy"]:checked').value;
}

function setBusy(busy) {
  generateBtn.disabled = busy;
  stopBtn.disabled = !busy;
}

if (!('LanguageModel' in self)) {
  warningEl.hidden = false;
  generateBtn.disabled = true;
}

generateBtn.addEventListener('click', async () => {
  answerEl.textContent = '';
  controller = new AbortController();
  setBusy(true);

  const prompt = promptEl.value;
  const strategy = getStrategy();

  try {
    if (strategy === 'naive') {
      await naiveStreamAnswer(prompt, appendText, controller.signal);
    } else {
      await streamAnswer(prompt, appendText, controller.signal);
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      appendText(`\n\n[error] ${error.message}`);
      console.error(error);
    }
  } finally {
    setBusy(false);
    controller = null;
  }
});

stopBtn.addEventListener('click', () => {
  controller?.abort();
});

// No-op on purpose: the point of this button is to be an interaction
// target for INP measurement, not to do any work of its own.
probeBtn.addEventListener('click', () => {});
