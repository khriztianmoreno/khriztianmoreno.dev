---
title: WebMCP — Por qué los agentes no deberían adivinar cómo funciona tu UI
tags:
  - webmcp
  - ai-agents
  - mcp
  - chrome-ai
  - web-platform
  - javascript
date: 2026-10-09 09:30:00
updated: 2026-10-09 09:30:00
---

Le pedís a un agente de navegador que te reserve el vuelo más barato sin escalas de Bogotá a Madrid. El agente saca una captura de pantalla, la manda al modelo, el modelo decide que el campo "Origen" está más o menos en la esquina superior izquierda, hace click… y el click cae sobre un banner de cookies que apareció medio segundo después de cargar la página. Nueva captura. Nuevo razonamiento. "Parece que hay un modal, voy a buscar un botón que diga Aceptar". Otra captura para confirmar que el modal se fue. Y así, paso a paso, cada mirada a la pantalla cuesta miles de tokens, y todavía ni siquiera escribió "BOG".

Así trabajan hoy la mayoría de los agentes que operan la web: **adivinan**. Adivinan qué significa cada pixel, adivinan qué selector apunta al botón correcto, adivinan si la acción funcionó. Y cuando el equipo de producto saca un rediseño un martes cualquiera, todo lo que el agente "aprendió" sobre tu interfaz deja de valer.

**WebMCP** propone algo distinto: que la página le diga al agente qué puede hacer, con herramientas declaradas por vos, con un JSON Schema de entrada, y que reutilizan la lógica y el estado que tu app ya tiene — con el navegador en el medio, mediando. Este es el primer post de una serie sobre WebMCP. Acá vamos a los fundamentos; más adelante quiero meterme con estado en SPAs (hooks y stores), formularios, permisos con humano en el loop, y debugging con DevTools.

Para que no quede en teoría, armé un demo: **reserva de vuelos, dos agentes, un toggle de rediseño**. El código completo está en [`demos/webmcp-fundamentals`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-fundamentals) (en el [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/README.md) tenés cómo correrlo y cómo probar la API nativa en Chrome).

## Cómo funciona el demo

<figure>
  <video controls preload="metadata" width="100%">
    <source src="https://res.cloudinary.com/khriztianmoreno/video/upload/f_auto,q_auto/v1791569939/blogpost-demos/webmcp-fundamentals/webmcp-fundamentals_vz8ycu.mp4" type="video/mp4" />
    Tu navegador no soporta video embebido — <a href="https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-fundamentals">cloná el demo</a> y corrélo local.
  </video>
  <figcaption>La corrida completa: los dos agentes reservando el vuelo sobre la UI original, el toggle "Ship UI redesign", y el agente de actuación rompiéndose mientras el agente WebMCP termina igual que antes.</figcaption>
</figure>

La app se llama SkyFare, una pantalla de búsqueda y reserva de vuelos. Al lado hay dos paneles, cada uno con un agente distinto y el mismo objetivo: *reservar el vuelo sin escalas más barato BOG → MAD para Ana Gómez*.

- **El agente de actuación** solo ve el DOM y solo actúa con clicks y teclas. Cada vez que necesita "mirar" la página, manda un snapshot completo de la app al "modelo". Su plan fue armado contra la UI v1.
- **El agente WebMCP** nunca toca el DOM. Descubre las herramientas de la página con `getTools()`, lee sus schemas y llama a `executeTool()`.

Ninguno de los dos usa un LLM de verdad: los planes están hard-codeados para que la corrida sea determinística y el contraste se vea claro. El flujo es este:

1. **Corré los dos agentes sobre la UI v1.** Los dos reservan el vuelo. Pero mirá los contadores: en mis corridas (Chrome 154 headless, usando el shim), el agente de actuación necesitó **16 pasos y unos 20.9k caracteres** de payload. El agente WebMCP, **4 pasos y unos 2.9k**.
2. **Activá "Ship UI redesign".** Mismo comportamiento, distinto markup: ids y clases renombrados, otro texto en los botones, y un banner de cookies.
3. **Corré los dos de nuevo.** El agente de actuación choca con el banner (el click queda interceptado), lo cierra buscando un botón "Accept all", y después se queda esperando `#search-btn`, que ahora se llama `#find-trips`, hasta que expira. El agente WebMCP termina en los mismos 4 pasos y los mismos ~2.9k caracteres, como si nada hubiera pasado.

Sobre esos números, siendo honesto: son aproximados. El contador mide **caracteres, no tokens** (la estimación de tokens que muestra el panel es simplemente caracteres ÷ 4), y además **subestima** el costo de la actuación: un agente real manda capturas de pantalla o el árbol de accesibilidad de toda la página, no solo el `outerHTML` del contenedor de la app. Y medí solo el camino del shim; la ruta nativa de Chrome no la probé.

## El problema: el agente adivina

Un agente que opera tu UI "desde afuera" tiene que resolver dos problemas a la vez, y los dos son frágiles:

- **Scraping (percepción).** Tiene que entender qué hay en la pantalla: capturas de pantalla, el árbol de accesibilidad, el DOM serializado. Todo eso es caro en tokens y ambiguo. El agente del demo lee precios parseando texto renderizado como `"$689"` y decide si un vuelo es directo comparando un label contra la string `'Nonstop'`. Cambiá el formato de moneda o el copy, y el agente lee mal sin enterarse.
- **Actuación (acción).** Tiene que traducir una intención ("buscar vuelos") en coordenadas o selectores: `#search-btn`, `.select-flight`, `#confirm-booking`. Esos selectores son detalles de implementación de tu UI, no un contrato. Nadie en tu equipo se siente obligado a mantenerlos estables, y está bien que así sea.

El árbol de accesibilidad ayuda bastante: roles y nombres accesibles son más estables que clases de CSS, y si tu app es accesible, un agente la va a entender mejor. Pero sigue sin ser un contrato. Un botón que pasa de "Search" a "Find trips" es un cambio de copy totalmente legítimo, y para el agente es una rotura. Además, el árbol describe *qué hay en pantalla*, no *qué podés hacer* ni con qué reglas.

Y hay un costo más sutil: cada paso es un viaje de ida y vuelta al modelo. Más pasos, más latencia, más tokens, y más oportunidades de que el modelo razone distinto la segunda vez.

## Tres modelos lado a lado

Antes de entrar en la API, vale la pena ubicar a WebMCP frente a las alternativas. La comparación que más me sirvió es esta:

| | Actuación (capturas, DOM, clicks) | Servidor MCP en el backend | WebMCP |
| --- | --- | --- | --- |
| **Acceso al estado del cliente** | Solo lo que se ve en pantalla | Ninguno: no ve la pestaña del usuario | Directo: las tools corren en la página |
| **Autenticación** | Usa la sesión del navegador, pero sin control fino | Separada: tokens/OAuth propios para el agente | La sesión que el usuario ya tiene abierta |
| **Duplicación de lógica** | Ninguna, pero depende del markup | Alta: reimplementás flujos y estado en el server | Ninguna: las tools llaman a las mismas funciones que la UI |
| **Fragilidad ante cambios de UI** | Alta | Nula (no pasa por la UI) | Nula mientras el contrato de la tool se mantenga |
| **Costo** | Alto: muchos pasos, payloads grandes | Bajo | Bajo: pocos pasos, JSON chico |

Un servidor MCP en el backend es robusto, y para muchos casos es exactamente lo que necesitás. Pero esquiva la UI por completo: el agente no ve el carrito que el usuario armó hace cinco minutos, ni los filtros que tiene aplicados, ni el borrador sin guardar. Y para darle acceso, terminás duplicando estado y montando un esquema de autenticación aparte para el agente.

WebMCP **no reemplaza** a MCP en el backend; lo complementa. Y una tool de WebMCP puede perfectamente llamar a tu API del servidor por dentro: la diferencia es que lo hace desde la página, con la sesión del usuario y el estado del cliente a mano.

## Pieza 1: la página como un "servidor MCP dentro de la página"

La idea mental más útil es pensar a la página como un servidor MCP que vive dentro de la pestaña. Tu código registra herramientas — nombre, descripción, `inputSchema` en JSON Schema, una función `execute` — y el navegador se las expone a un agente.

Ojo con un detalle que confunde mucho: WebMCP **toma prestado el vocabulario** de MCP (tools, schemas, descripciones pensadas para un modelo), pero **no está construido sobre el protocolo MCP**. La spec dice que una página "puede pensarse como" un servidor MCP, y deja explícitamente sin prescribir el formato con el que el navegador le pasa esas tools a su agente. No hay JSON-RPC entre tu página y el agente; hay una API de JavaScript y un navegador en el medio.

## Pieza 2: `document.modelContext.registerTool()`

En el demo, todo el estado vive en [`store.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/store.js). Es la única fuente de verdad, y la UI la usa así:

```js
export function bookFlight({ flightId, passenger }) {
  const flight = state.results.find((f) => f.id === flightId);
  const name = String(passenger ?? '').trim();

  if (!flight) throw new Error(`Flight ${flightId} is not in the current results — search first.`);
  if (name.length < 2) throw new Error('Passenger name is required.');

  state.selectedId = flightId;
  state.booking = {
    confirmation: `WMCP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    passenger: name,
    flight: structuredClone(flight),
    bookedAt: new Date().toISOString(),
  };
  emit();

  return structuredClone(state.booking);
}
```

[`tools.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/tools.js) define las tools como adaptadores finos sobre esas mismas funciones:

```js
{
  name: 'book_flight',
  title: 'Book a flight',
  description:
    'Book one flight from the latest search results for a passenger. This creates a real reservation in the user\'s session.',
  inputSchema: {
    type: 'object',
    properties: {
      flightId: { type: 'string', description: 'The `id` of a flight returned by search_flights.' },
      passenger: { type: 'string', description: 'Full name of the passenger.' },
    },
    required: ['flightId', 'passenger'],
  },
  // Consequential: the agent should get explicit user approval first.
  annotations: { consequentialHint: true },
  execute: async ({ flightId, passenger }) => {
    try {
      return { ok: true, booking: bookFlight({ flightId, passenger }) };
    } catch (err) {
      // Report recoverable failures inside the result so the agent can retry.
      return { ok: false, error: err.message };
    }
  },
},
```

Y registrarlas es un loop:

```js
export async function registerTools(modelContext) {
  const controller = new AbortController();
  for (const tool of TOOLS) {
    await modelContext.registerTool(tool, { signal: controller.signal });
  }
  return controller;
}
```

Esto es lo central del post: **una tool no es una segunda implementación de la feature, es otra puerta de entrada a la que ya tenés.** La misma validación, el mismo estado, la misma sesión. Cuando el agente WebMCP reserva, el `emit()` del store dispara el re-render y la confirmación aparece en pantalla, igual que si el usuario hubiera hecho click. Si mañana cambia la regla de validación del nombre, la UI y el agente la heredan a la vez.

Fijate también en dos detalles de diseño. Primero, los errores recuperables vuelven *dentro del resultado* (`{ ok: false, error }`) para que el agente pueda reintentar con otra entrada. Segundo, para desregistrar no hay un `unregisterTool()`: abortás el `signal` y se van todas las tools juntas.

## Pieza 3: invocar sin un agente real

Acá viene la parte incómoda: hoy **ningún agente de uso masivo consume estas tools todavía**. Así que, para poder ver el flujo de punta a punta, el agente del demo es una consola dentro de la misma página que usa las dos funciones del lado "consumidor" de la API: `getTools()` y `executeTool()`. Así se ve en [`webmcp-agent.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/webmcp-agent.js):

```js
async function call(tool, input) {
  const raw = await modelContext.executeTool(tool, input);
  const inputJson = JSON.stringify(input);
  ui.step('tool', `executeTool("${tool.name}", ${inputJson})`, inputJson.length);
  ui.addPayload(raw.length);
  const result = JSON.parse(raw); // executeTool() always resolves to a string
  ui.json(`← ${raw.length.toLocaleString()} ch of JSON`, result);
  return result;
}
```

Y el "razonamiento" del agente trabaja sobre datos, no sobre pixeles:

```js
const search = byName('search_flights');
const { flights } = await call(search.tool, { origin: goal.origin, destination: goal.destination, date: goal.date });

const pick = flights.filter((f) => f.stops === 0).sort((a, b) => a.price - b.price)[0];
```

Compará eso con el agente de actuación, que tiene que parsear `"$689"` del texto renderizado. Acá `price` es un número y `stops` es un número. No hay nada que adivinar.

Un detalle del contrato que vale la pena tener claro: tu `execute` puede devolver **cualquier valor serializable a JSON**. El navegador lo pasa a string, y `executeTool()` resuelve con **ese string**, nunca con un objeto vivo. Por eso el `JSON.parse(raw)`. Tiene sentido: lo que viaja hacia un modelo es texto, y así tu página nunca le entrega al agente una referencia a su estado interno.

## Pieza 4: el navegador como mediador

Lo que diferencia a WebMCP de "exponer funciones en `window`" es que el navegador está en el medio y aplica reglas:

- **Permissions Policy.** Registrar tools está detrás del feature `tools`, con allowlist por defecto `'self'`. Un iframe de terceros no puede registrar tools en tu página a menos que vos lo habilites explícitamente. En el demo, si el `registerTool()` nativo falla (por ejemplo con un `NotAllowedError` por la policy), se cae al shim.
- **`exposedTo`.** Una opción de `registerTool()` que, según la spec, es una lista de orígenes que controla a qué documentos del árbol de la página actual se expone la tool.
- **Anotaciones.** Pistas para el agente sobre la naturaleza de cada tool:
  - `readOnlyHint`: la tool solo lee, no modifica estado. En el demo, `search_flights` y `get_booking`.
  - `untrustedContentHint`: el resultado contiene contenido que el propio autor de la página considera no confiable. `get_booking` lo lleva porque el nombre del pasajero es texto libre que escribió un usuario: exactamente el tipo de lugar por donde se cuela un prompt injection.
  - `consequentialHint`: la ejecución tiene consecuencias significativas, del mundo real o irreversibles. `book_flight` lo lleva.

En el demo, el agente respeta esa última anotación: antes de llamar a `book_flight`, te frena con un **Approve / Deny**:

```js
const book = byName('book_flight');
if (book.meta.annotations?.consequentialHint) {
  const approved = await ui.approval(`book_flight is consequential. Book ${pick.id} for ${goal.passenger}?`);
  if (!approved) {
    ui.log('fail', 'user denied the booking — nothing was changed');
    ui.status('failed', 'denied');
    return;
  }
}
```

Apretá **Deny** y no se reserva nada. Ojo: acá la aprobación la implementa mi agente simulado, no el navegador. Las anotaciones son *hints*; quién pide confirmación, cómo y cuándo, es un tema en sí mismo, y es justamente el del post sobre permisos con humano en el loop.

## Una advertencia honesta: esto todavía se mueve mucho

Antes de que salgas corriendo a meter WebMCP en producción, el contexto:

- **La spec es un Draft Community Group Report** del W3C Web Machine Learning Community Group, con editores de Microsoft y Google. **No está en el standards track.** Es una propuesta seria, pero una propuesta.
- **La API se mudó.** Arrancó como `navigator.modelContext` y ahora vive en `document.modelContext`. En Chrome 152 Canary, `navigator.modelContext` ya no existe. Muchos tutoriales que vas a encontrar online usan la ubicación vieja, y no van a funcionar.
- **La API declarativa con `<form>`** (anotar formularios HTML para que se vuelvan tools) **solo existe en un explainer**, no en la spec. El demo no la usa.
- **Chrome la está probando en un origin trial.** Según lo que reportan las fuentes, arrancó en Chrome 149; tomalo como reportado, no como confirmado. Para habilitarla localmente, mirá el README del demo y el [implementation status](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md) del repo de la spec, porque los nombres de flags y trials cambian rápido.

Por todo eso, el demo hace feature detection y tiene un fallback. [`webmcp-shim.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/webmcp-shim.js) elige entre la API nativa y un shim en la página:

```js
export function getModelContext() {
  const native = document.modelContext ?? navigator.modelContext;
  const usable =
    native &&
    typeof native.registerTool === 'function' &&
    typeof native.getTools === 'function' &&
    typeof native.executeTool === 'function';

  return usable ? { modelContext: native, kind: 'native' } : { modelContext: new ModelContextShim(), kind: 'shim' };
}
```

Y [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/main.js) se cubre del caso en que la API existe pero el registro falla:

```js
let { modelContext, kind } = getModelContext();

try {
  await registerTools(modelContext);
} catch (err) {
  // e.g. NotAllowedError when the "tools" Permissions Policy blocks this document.
  if (kind !== 'native') throw err;
  runtimeNote.textContent = `Native registerTool() failed (${err.name}: ${err.message}). Using the shim instead.`;
  modelContext = new ModelContextShim();
  kind = 'shim';
  await registerTools(modelContext);
}
```

Fijate que no basta con chequear que `document.modelContext` exista: el demo verifica que tenga las tres funciones que usa. Con una API en origin trial, "existe" y "tiene la forma que espero" son dos preguntas distintas. El shim **no es un polyfill**: no hace descubrimiento entre frames, ni chequeos de origen, ni aplica Permissions Policy. Solo replica la superficie que el demo necesita, para que puedas correrlo en cualquier navegador.

## Lo que aprendí armando esto

1. **El problema no es que el modelo sea tonto, es que le hacemos adivinar.** Un agente con capturas de pantalla gasta la mayor parte de su esfuerzo en reconstruir información que tu app ya tiene estructurada. WebMCP le da esa estructura directamente.
2. **La UI es un detalle de implementación; las tools son un contrato.** Ver al agente de actuación romperse por un id renombrado, mientras el otro ni se entera, me dejó más claro que cualquier diagrama dónde tiene que vivir la estabilidad.
3. **Si tu lógica está bien separada, WebMCP sale casi gratis.** Las tools del demo son adaptadores de pocas líneas porque `store.js` ya era la única fuente de verdad. Si tu lógica de negocio está enredada en los handlers de los componentes, ese es el primer refactor, con o sin agentes.
4. **Las anotaciones te obligan a pensar en riesgo.** Preguntarte "¿esto es consecuencial? ¿este resultado trae texto no confiable?" por cada tool es un ejercicio que vale la pena incluso antes de que haya un agente del otro lado.

En los próximos posts de la serie vamos a ver qué pasa cuando el estado vive en hooks y stores de una SPA, cómo encajan los formularios, cómo diseñar permisos con humano en el loop, y cómo debuggear todo esto con DevTools.

---

### Para seguir explorando

- **La spec de WebMCP:** [webmachinelearning.github.io/webmcp](https://webmachinelearning.github.io/webmcp/), el Draft Community Group Report.
- **El repositorio de la spec:** [github.com/webmachinelearning/webmcp](https://github.com/webmachinelearning/webmcp), con issues y discusiones abiertas.
- **Implementation status:** [`implementation-status.md`](https://github.com/webmachinelearning/webmcp/blob/main/implementation-status.md), para ver qué está disponible en qué navegador y cómo habilitarlo.
- **El explainer de la API declarativa:** [`declarative-api-explainer.md`](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), la propuesta de tools basadas en `<form>` (todavía fuera de la spec).
- **El demo completo:** [`demos/webmcp-fundamentals`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-fundamentals): clonalo, corré los dos agentes y apretá el toggle de rediseño.

¿Ya estás probando WebMCP, o tenés agentes en producción peleándose con selectores? Me encantaría saber qué tools expondrías primero en tu app. Charlemos por [X/Twitter](https://twitter.com/khriztianmoreno) o [LinkedIn](https://www.linkedin.com/in/khriztianmoreno/).

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)
