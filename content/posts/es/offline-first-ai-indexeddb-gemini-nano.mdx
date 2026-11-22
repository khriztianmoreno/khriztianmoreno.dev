---
title: IA offline-first — IndexedDB como memoria de Gemini Nano
tags:
  - web-performance
  - offline-first
  - indexeddb
  - chrome-ai
  - gemini-nano
  - prompt-api
  - javascript
  - pwa
date: 2026-08-12 09:30:00
updated: 2026-08-12 09:30:00
---

La mayoría de las interfaces con inteligencia artificial que construimos hoy comparten el mismo talón de Aquiles: son cascarones vacíos sin conexión. Tratamos a los LLMs como un endpoint HTTP remoto al que debemos invocar con cada interacción, asumiendo una conectividad perfecta que rara vez existe en el mundo real. Con la llegada de **Gemini Nano integrado en el navegador vía la Prompt API**, esa dependencia desaparece: por fin podemos mover la inferencia directamente a la GPU o NPU del dispositivo del usuario.

Sin embargo, ejecutar un modelo local apenas resuelve la primera mitad de la ecuación.

En cuanto llevás la IA al cliente, te chocás contra un problema de persistencia web clásico: una sesión instanciada con `LanguageModel.create()` vive únicamente en la memoria volátil de la pestaña. Si un inspector de mantenimiento está en el sótano de una subestación eléctrica documentando la falla de una bomba, la pestaña se descarta en segundo plano o el dispositivo se reinicia en pleno modo avión, el modelo pierde todo el hilo de la conversación. No hay servidor ni Redis que rescate el estado. Para que una experiencia de IA on-device sea verdaderamente usable en producción, **necesita memoria persistente y local**.

Ahí es donde **IndexedDB** se convierte en el copiloto natural de Gemini Nano.

Al combinar ambas tecnologías, no solo dotamos al modelo de una memoria duradera a través del parámetro `initialPrompts`, sino que también resolvemos el impacto energético: calcular el hash de cada consulta en local nos permite devolver respuestas cacheadas en 0 ms, protegiendo la batería del dispositivo al no despertar al modelo para procesar dos veces el mismo dato.

Para aterrizar este patrón en una solución real, construí **FieldTech Zero**: un cuaderno de campo técnico offline-first. La aplicación toma notas crudas de incidentes redactadas en campo, extrae automáticamente un JSON estructurado con diagnósticos y severidades, y permite realizar preguntas de seguimiento contextuales sobre inspecciones previas, incluso después de cerrar y recargar el navegador a 30 metros bajo tierra.

El código completo y listo para correr está en [`demos/offline-first-ai-indexeddb-gemini-nano`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/offline-first-ai-indexeddb-gemini-nano) (en el [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/README.md) tenés los flags de Chromium para encender la Prompt API).

A continuación, vamos a revisar cómo orquestar esta arquitectura: desde el ciclo de descarga reactivo del modelo hasta el flujo de persistencia que evita la amnesia de la sesión sin tocar la red.

## Cómo funciona el demo

<figure>
  <video controls preload="metadata" width="100%">
    <source src="https://res.cloudinary.com/khriztianmoreno/video/upload/f_auto,q_auto/v1790632262/blogpost-demos/offline-first-ai-indexeddb-gemini/demo_fgndrr.mp4" type="video/mp4" />
    Tu navegador no soporta video embebido — <a href="https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/offline-first-ai-indexeddb-gemini-nano">cloná el demo</a> y corrélo local.
  </video>
  <figcaption>La corrida completa: procesar una nota, pegarle al caché en una repetida, recargar la página, y hacer una pregunta de seguimiento que el modelo sigue pudiendo responder — offline.</figcaption>
</figure>

El escenario completo es "FieldTech Zero": el técnico escribe la nota, la app extrae JSON estructurado — componente, severidad, diagnóstico, acción sugerida, si hace falta reemplazar una pieza —, y todo el flujo se puede resumir en cuatro pasos:

1. **Escribí una nota, apretá "Process note."** Gemini Nano extrae el JSON localmente.
2. **Enviá exactamente la misma nota de nuevo.** El badge cambia a `cache (IndexedDB)` — no corre inferencia la segunda vez.
3. **Recargá la página.** El historial de la sesión sigue ahí, restaurado desde IndexedDB.
4. **Hacé una pregunta de seguimiento que referencie la nota anterior** — por ejemplo "¿cuál fue la lectura de presión del sensor?" — sin red de por medio. El modelo lo recuerda igual, porque la recarga reconstruyó su contexto desde IndexedDB, no desde una conexión activa.

Como se ve en el video de arriba, esa es justo la prueba que hago: proceso la nota de la bomba, recargo la página y le pregunto *"What was the sensor pressure reading on the pump from the earlier note?"*, sin conexión. Esto es lo que responde:

```json
{
  "component": "Auxiliary pump 3",
  "severity": "LOW",
  "diagnostic": "The sensor reading on the auxiliary pump 3 is 4.2 bar.",
  "suggestedAction": "Monitor the pump pressure closely and investigate the leak.",
  "partReplacementRequired": false
}
```

Sacó "4.2 bar" de una nota que nunca había visto en *esta* carga de página — solo en el historial de IndexedDB restaurado a la sesión al arrancar.

## El problema: una sesión de Gemini Nano no sobrevive a una recarga

`LanguageModel.create()` te da un objeto de sesión que vive en memoria. Refrescás la pestaña y desaparece — junto con todo lo que el usuario le contó. Para un juguete de chat eso molesta un poco. Para una herramienta de campo donde el teléfono del técnico se bloquea solo entre inspecciones, o la pestaña queda en segundo plano y se mata, es un problema serio: la app se olvida con quién está hablando y por qué.

La solución no es una ventana de contexto más grande. Es directamente no guardar el estado en memoria — es escribir cada turno a IndexedDB y reconstruir el contexto de la sesión desde disco cada vez que carga la página.

## Pieza 1: dos almacenes de IndexedDB

[`db.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/db.js) mantiene dos object stores — `history` para los turnos de conversación, `cache` para respuestas indexadas por un hash del prompt:

```js
export async function hashPrompt(text) {
  const bytes = new TextEncoder().encode(text.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getCachedResponse(hash) {
  const db = await openDB();
  return new Promise((resolve) => {
    const store = db.transaction('cache', 'readonly').objectStore('cache');
    const req = store.get(hash);
    req.onsuccess = () => resolve(req.result?.response ?? null);
    req.onerror = () => resolve(null);
  });
}
```

El caché no es solo optimización de latencia — en un dispositivo corriendo inferencia a batería, una pregunta repetida (un técnico releyendo el mismo código de error dos veces) es un costo repetido que no hace falta pagar dos veces. Hashear el prompt y consultar IndexedDB primero sale casi gratis en comparación.

## Pieza 2: restaurar contexto con `initialPrompts`

`LanguageModel.create()` acepta `initialPrompts` — un array de turnos `{ role, content }` que siembran la sesión antes de que reciba su primer prompt real. [`nano-loader.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/nano-loader.js) lee el historial directo de IndexedDB y se lo pasa:

```js
export class LocalGeminiManager {
  constructor(onStatus) {
    this.onStatus = onStatus ?? (() => {});
    const { promise, resolve, reject } = Promise.withResolvers();
    this.ready = promise;
    this._resolve = resolve;
    this._reject = reject;
  }

  async init(initialPrompts = []) {
    if (!('LanguageModel' in self)) {
      this._reject(new Error('LanguageModel unavailable'));
      return this.ready;
    }

    try {
      this.session = await LanguageModel.create({ initialPrompts, /* monitor abajo */ });
      this._resolve(this.session);
    } catch (err) {
      this._reject(err);
    }

    return this.ready;
  }
}
```

`Promise.withResolvers()` (Baseline desde marzo de 2024) es lo que hace que `ready` se pueda usar desde afuera de la clase sin un callback incómodo: devuelve `{ promise, resolve, reject }` como tres valores independientes, así `init()` puede resolver o rechazar la misma promesa que otro código ya está esperando con `await`, en vez de anidar un `new Promise((resolve, reject) => { ... })` alrededor de todo el método.

## Pieza 3: rastrear la descarga, a la defensiva

La primera vez que un usuario abre la app, el modelo mismo puede necesitar descargarse. La opción `monitor` reporta el progreso — pero la forma exacta del evento `downloadprogress` cambió entre versiones de Chrome, e incluso entre la propia documentación de Google: un ejemplo calcula `loaded * 100` (asumiendo una fracción 0-1), otro calcula `(loaded / total) * 100` (asumiendo conteos de bytes). En vez de apostar por uno, `nano-loader.js` maneja los dos:

```js
monitor: (m) => {
  m.addEventListener('downloadprogress', (e) => {
    const pct = e.total ? (e.loaded / e.total) * 100 : e.loaded * 100;
    this.onStatus({ status: 'downloading', progress: Math.round(pct) });
  });
},
```

Este es el tipo de código defensivo que parece innecesario hasta que una API en origin trial te cambia el piso debajo. Costó una línea extra.

## Pieza 4: caché → local → nube, en ese orden

[`orchestrator.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/orchestrator.js) es la parte híbrida: consulta el caché, después el modelo local, y — solo si hay conexión y no hay modelo local — cae a un servidor:

```js
if (this.localReady && this.local.session) {
  text = await this.local.session.prompt(prompt);
  source = 'nano';
} else {
  if (pretendOffline || !navigator.onLine) {
    throw new Error('No local model and no connection — nothing left to fall back to.');
  }
  const res = await fetch('/api/generate', { /* ... */ }).catch(() => null);
  if (!res || !res.ok) {
    throw new Error('Cloud fallback unreachable — see server-reference/ in the repo.');
  }
  // ...
}
```

Algo que hice a propósito: **el fallback a la nube en este demo no está desplegado.** No hay servidor corriendo detrás y no hay ninguna API key en el repositorio — un demo estático público no es el lugar para ninguna de las dos cosas. Lo que sí incluyo es [`server-reference/index.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/server-reference/index.js), una implementación real en Node.js del endpoint `/api/generate` usando `@google/genai`, para que la copies a tu propio backend:

```js
const response = await ai.models.generateContent({
  model: 'gemini-flash-latest',
  contents: [
    ...history.map((turn) => ({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }],
    })),
    { role: 'user', parts: [{ text: prompt }] },
  ],
});
```

Sin desplegarlo, el camino de fallback del demo falla con un error explicativo en vez de quedarse colgado — que es justamente el comportamiento que vale la pena mandar a producción: un sistema híbrido debería decirte qué capa respondió, y fallar con claridad cuando ninguna puede, en lugar de dejar al usuario mirando un spinner.

## Una advertencia honesta: el modelo no siempre devuelve JSON limpio

El system prompt pide solo JSON, sin prosa. La mayoría de las veces eso es exactamente lo que vuelve. A veces no — una frase suelta antes del objeto, o fences de markdown alrededor. [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/offline-first-ai-indexeddb-gemini-nano/main.js) limpia los fences e intenta `JSON.parse`, y si falla muestra el texto crudo:

```js
try {
  const cleaned = text.replace(/```json|```/g, '').trim();
  reportEl.textContent = JSON.stringify(JSON.parse(cleaned), null, 2);
} catch {
  reportEl.textContent = text; // el modelo no devolvió JSON limpio — mostramos el texto crudo
}
```

No lances extracción estructurada contra un modelo chico on-device sin un fallback de parseo. Tarde o temprano te va a devolver algo que no es JSON válido, y un crash silencioso es peor que mostrar el string crudo.

## Lo que aprendí peleando con esto (y por qué deberías probarlo)

Armar este experimento me dejó una sensación parecida a cuando empezamos a meter Service Workers en producción hace años: **el soporte nativo cambia las reglas del juego, pero te exige pensar la arquitectura al revés.**

Acá van tres conclusiones directas desde la trinchera:

1. **La IA on-device no es para reemplazar a la nube; es para no dejar al usuario varado.** No le pidas a Gemini Nano que redacte un paper de 40 páginas en el browser. Usalo para estructurar, clasificar, resumir o filtrar en el borde. Para eso, la velocidad y la privacidad son imbatibles.
2. **Tu memoria ya no es la RAM.** Tratar el contexto del modelo como algo volátil es el error número uno. Si estás pensando en interfaces conversacionales o agentes en el cliente, IndexedDB tiene que ser el disco duro de la sesión desde el día cero.
3. **El rendimiento de la batería importa.** Hashear consultas para servir respuestas idénticas desde disco no es paranoia: en un teléfono o tablet industrial, ahorrar ciclos de NPU/GPU es la diferencia entre terminar la jornada de trabajo o quedarte sin batería en la mitad de un túnel.

El patrón no se limita a reportes técnicos. Pensá en un editor de Markdown que sugiere etiquetas en un avión, una app de recetas que recalcula porciones en una cocina sin cobertura, o un triaje médico en zonas rurales. **"Sin señal" nunca debió ser sinónimo de "pantalla en blanco".**

---

### Para seguir explorando

Si te picó la curiosidad y querés meter mano en el código o ver hacia dónde va el ecosistema:

- **El repositorio con el demo completo:** dale una mirada a [`demos/offline-first-ai-indexeddb-gemini-nano`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/offline-first-ai-indexeddb-gemini-nano) para clonar el proyecto, revisar los flags necesarios de Chromium y correr el fallback en Node.js.
- **Documentación oficial de Chrome Built-in AI:** la guía de Google para habilitar y experimentar con la [Prompt API en el navegador](https://developer.chrome.com/docs/ai/built-in).
- **Web Machine Learning Community Group:** el borrador formal del [explainer de la Prompt API](https://github.com/explainers-by-googlers/prompt-api), ideal si querés entender cómo se está estandarizando esta interfaz entre navegadores.
- **IndexedDB Best Practices (web.dev):** un repaso indispensable de [cómo trabajar con almacenamiento local confiable](https://web.dev/articles/indexeddb-best-practices) sin bloquear el hilo principal.

¿Te tocó implementar flujos offline en producción o ya estás probando las APIs locales de Chrome? Me encantaría saber qué casos de uso te hacen sentido o con qué problemas te topaste. Charlemos por [X/Twitter](https://twitter.com/khriztianmoreno) o [LinkedIn](https://www.linkedin.com/in/khriztianmoreno/).

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)