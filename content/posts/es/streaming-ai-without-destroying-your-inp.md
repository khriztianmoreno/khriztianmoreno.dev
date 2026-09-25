---
title: Streaming de IA sin destruir tu INP
tags:
  - web-performance
  - core-web-vitals
  - inp
  - chrome-ai
  - gemini-nano
  - prompt-api
  - javascript
  - performance
date: 2026-09-25 09:30:00
updated: 2026-09-25 09:30:00
---

Tu feature de IA es el nuevo culpable de tu INP.

Durante años, los sospechosos habituales de un mal puntaje de [Interaction to Next Paint](https://web.dev/articles/inp) eran siempre los mismos: bundles pesados, handlers de scroll sin throttle, una librería de gráficos re-renderizando en cada movimiento del mouse. Ahora hay uno nuevo, y es la feature que todo el mundo está lanzando en este momento: hacer streaming de la respuesta de un modelo de lenguaje directo al DOM.

Este post tiene detrás un demo completo y ejecutable — [`demos/streaming-ai-without-destroying-your-inp`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/streaming-ai-without-destroying-your-inp), en el repositorio de este mismo sitio. Necesita flags de Chrome que la mayoría de los lectores no va a tener activados, así que no hay una versión alojada para abrir con un clic — cloná el repo (o simplemente leé los archivos en GitHub) y corrélo localmente según el [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/README.md). En lugar de pegar snippets sueltos, voy a recorrer los archivos reales: una implementación ingenua que destruye tu INP, y una optimizada que no, ambas conectadas a un indicador de INP en vivo para que la diferencia sea algo que puedas ver pasar, no solo algo que te cuento.

## Cómo funciona el demo

Corrélo localmente y vas a ver tres cosas: un cuadro de prompt con un selector de estrategia arriba, un área de salida, y un log de INP debajo. El flujo es:

1. **Elegí una estrategia** — "Naive (per-chunk, no yield)" u "Optimized (sentence batching + yield)" — con el mismo prompt en ambas.
2. **Apretá Generate.** El modelo empieza a hacer streaming al área de salida usando la estrategia que elegiste.
3. **Mientras sigue generando, hacé clic varias veces en "🔘 Click me while it's generating"**. Ese botón no hace nada a propósito — su único trabajo es darte algo con qué interactuar a mitad del stream, tal como un usuario tocaría "detener" o haría scroll mientras tu chat sigue hablando.
4. **Mirá el log de INP.** Cada clic reporta ahí su latencia medida, en tiempo real, vía `onINP` de `web-vitals` — sin necesidad de DevTools, aunque también deberías abrir el panel Performance de DevTools para ver la traza completa.
5. **Apretá Stop** en cualquier momento para ver al `AbortController` cancelar de verdad la generación en curso, en lugar de dejar una sesión zombie escribiéndole a un componente que ya nadie está mirando.

Corré primero la estrategia ingenua, machacá el botón de prueba, y mirá el log llenarse de números altos. Después cambiá a la optimizada, mismo prompt, y mirá esos mismos clics volver bajos. Esa comparación lado a lado es todo el punto del demo.

## Por qué el streaming de texto rompe el INP

Los modelos on-device como Gemini Nano exponen su salida a través de `promptStreaming()` de la [Prompt API](https://developer.chrome.com/docs/ai/prompt-api), que devuelve un `ReadableStream` de fragmentos de texto:

```js
const session = await LanguageModel.create();
const stream = session.promptStreaming('Explica el entrelazamiento cuántico.');

for await (const chunk of stream) {
  console.log(chunk);
}
```

Hay dos cosas de ese loop que son fáciles de pasar por alto y ambas importan para el rendimiento:

1. Cada `chunk` es un **delta incremental**, no el texto completo hasta ese momento. Tenés que concatenarlos vos mismo para reconstruir la respuesta.
2. Los chunks llegan rápido — muchas veces varios por segundo — y lo obvio es agregar cada uno al DOM de inmediato, para que el texto "se escriba solo" en pantalla.

Ese segundo instinto es exactamente lo que implementa [`naive.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/naive.js) del demo:

```js
export async function naiveStreamAnswer(prompt, onChunk, signal) {
  const session = await LanguageModel.create({ signal });
  const stream = session.promptStreaming(prompt, { signal });

  for await (const delta of stream) {
    onChunk(delta);
  }

  session.destroy();
}
```

Cada escritura al DOM que dispara `onChunk` es una tarea en el hilo principal: una mutación de nodo de texto, un reflow, a veces un re-render si estás pasando el chunk por el estado de un framework. Hacé eso decenas de veces por segundo y construiste una pared de tareas pequeñas pero constantes que nunca deja respirar al hilo principal. Si el usuario hace clic en "detener" o escribe en otro campo mientras el modelo sigue hablando, esa entrada queda encolada detrás de tu actividad en el DOM — y ese retraso en la cola es exactamente lo que mide el INP.

La solución no es "hacer streaming más lento". Es controlar **dónde** volcás al DOM y **con qué frecuencia** le devolvés el control al navegador — que es justo lo que hace la otra implementación del demo, [`lib.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/lib.js).

## Las piezas

### 1. Agrupar por oración, no por token

Pintar token por token se siente responsivo en una demo, pero es la cadencia más costosa posible — y en idiomas como el español, cortar a mitad de palabra o de puntuación se ve roto. [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) (Baseline desde abril de 2024) te da límites de oración conscientes del idioma sin costo extra:

```js
const segmenter = new Intl.Segmenter('es', { granularity: 'sentence' });

for (const { segment } of segmenter.segment(texto)) {
  console.log(segment); // una oración completa a la vez
}
```

Segmentar por oración significa una escritura al DOM por oración en lugar de una por token — a menudo un orden de magnitud menos actualizaciones — y respeta las reglas de abreviaturas y puntuación de cada idioma, algo que un `texto.split('. ')` ingenuo no hace.

Así se ve esto en una corrida real, con el prompt "Write two short sentences describing a sunrise over the mountains." en el demo. Gemini Nano devolvió 37 deltas — casi todos fragmentos de palabra:

```
"Golden" " light" " kissed" " the" " jagged" " peaks" "," " slowly"
" chasing" " away" " the" " lingering" " shadows" " of" " night" "."
"  " "Warm" " hues" " painted" " the" " sky" "," " transforming"
" the" " mountains" " into" " majestic" " silhouettes" " bathed"
" in" " a" " new" " dawn" "." " " "\n\n\n\n"
```

La estrategia ingenua convierte cada uno de esos en su propia escritura al DOM — 37 tareas. Pasando esos mismos deltas por la lógica de agrupamiento por oración de arriba, quedan 5 escrituras, 2 de las cuales llevan todo el contenido real:

```
1. "Golden light kissed the jagged peaks, slowly chasing away the lingering shadows of night.  "
2. "Warm hues painted the sky, transforming the mountains into majestic silhouettes bathed in a new dawn. \n"
3. "\n"   4. "\n"   5. "\n"
```

Misma salida del modelo, mismo texto total — de 37 escrituras al DOM a 5, y las últimas tres son saltos de línea que el modelo agregó al final, no contenido con significado. Esa es toda la optimización, en un antes/después concreto.

### 2. Darle aire al hilo principal

Incluso a nivel de oración, una respuesta larga puede acumular suficientes escrituras al DOM como para bloquear la entrada del usuario. Entre actualizaciones, `lib.js` le devuelve el control al navegador con [`scheduler.yield()`](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler/yield):

```js
export function yieldToMain() {
  if (globalThis.scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
```

`scheduler.yield()` todavía no es Baseline, así que el fallback importa — sin él, esta estrategia deja de funcionar silenciosamente en los navegadores que no lo soportan. El punto de ceder el control no es hacer el streaming más lento; es insertar un checkpoint donde un clic o una tecla pendiente puedan procesarse antes de que retomes la escritura.

### 3. Dejar que lo puedan cancelar

Un `AbortController` debería existir desde el momento en que arranca la generación, no como algo agregado después — un modelo que sigue volcando oraciones a un componente del que el usuario ya se fue es un bug en sí mismo. En el demo, [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/main.js) crea el controller en cada clic de "Generate" y conecta el botón "Stop" directo a `controller.abort()`.

## Uniendo todo

Este es el [`lib.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/lib.js) completo — agrupamiento por oración, cesión de control y cancelación, en una sola función:

```js
export async function streamAnswer(prompt, onSentence, signal) {
  const session = await LanguageModel.create({ signal });
  const segmenter = new Intl.Segmenter('es', { granularity: 'sentence' });

  const stream = session.promptStreaming(prompt, { signal });
  let buffer = '';
  let cursor = 0;

  for await (const delta of stream) {
    buffer += delta;

    // El último segmento de un buffer parcial puede seguir creciendo,
    // así que solo volcamos los que ya están completos.
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
```

Una advertencia honesta, directo de probar esto en el demo: volver a segmentar todo el buffer en cada chunk hace que el costo crezca con el largo de la respuesta, y `Intl.Segmenter` a veces puede revisar dónde cae un límite cuando llega más texto (una abreviatura como "Dr." se resuelve distinto una vez que aparece la siguiente palabra). Para agrupar por oración esto casi nunca se nota, pero vale la pena saberlo antes de asumir que la salida es idéntica byte a byte a segmentar el texto final de una sola pasada.

El log de INP en pantalla sale de [`metrics.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/metrics.js), lo bastante corto como para pegarlo completo — solo conecta `onINP` de `web-vitals` directo a un `<ul>`:

```js
import { onINP } from 'https://unpkg.com/web-vitals@5?module';

onINP((metric) => {
  const target = metric.entries.at(-1)?.target;
  const label = target?.id || target?.tagName?.toLowerCase() || 'unknown target';
  const item = document.createElement('li');
  item.textContent = `${metric.value.toFixed(0)}ms — ${label}`;
  document.getElementById('inp-log')?.prepend(item);
});
```

Si `LanguageModel` todavía no está definido en tu navegador cuando lo corrés, la página te lo va a decir — el [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/streaming-ai-without-destroying-your-inp/README.md) cubre el flag de Chrome que necesitás.

## Medir antes y después

No lances esto por fe — perfilalo. Cuando corrí la estrategia ingenua en este demo y dejé que una respuesta larga hiciera streaming mientras hacía clic en el botón de prueba, el panel Performance de DevTools mostró una fila densa de tareas pequeñas en el hilo principal, una tras otra, sin espacios — y los clics de prueba se registraron altos en el log de INP. Cambiando a la estrategia optimizada con el mismo prompt, la traza muestra tareas cortas separadas por espacios visibles, y los mismos clics de prueba vuelven bajos.

`metric.entries` en el callback de `onINP` te apunta directo a la interacción específica que fue lenta y qué tarea la bloqueó — esa es tu evidencia, no una suposición, de si el agrupamiento realmente ayudó. Corré el demo con tus propios prompts; los números van a variar según el dispositivo y el largo de la respuesta, pero la forma de las dos trazas no.

## Qué sigue

Este mismo patrón — actualizaciones pequeñas y frecuentes peleando contra el hilo principal — aparece en cualquier lugar donde un modelo haga streaming hacia una página viva, no solo en interfaces de chat. El stack de IA integrada de Chrome sigue creciendo (la [Rewriter API](https://developer.chrome.com/docs/ai/rewriter-api) para reescritura on-device, [WebMCP](https://developer.chrome.com/docs/ai/webmcp) para exponer acciones de la página a agentes, ambas presentadas en [Chrome at I/O '26](https://developer.chrome.com/blog/chrome-at-io26)), y todas te van a entregar la salida de la misma forma: de manera incremental, dejando en tus manos cuándo pintarla.

La API te da los tokens. Mantener el INP saludable sigue siendo trabajo tuyo.

¡Espero que esto haya sido útil y/o te haya hecho aprender algo nuevo!

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)

@khriztianmoreno 🚀