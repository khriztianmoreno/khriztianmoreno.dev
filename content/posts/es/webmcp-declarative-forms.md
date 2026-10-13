---
title: "Marcado semántico para IA: convertí tus formularios en tools WebMCP sin JavaScript"
tags:
  - webmcp
  - ai-agents
  - mcp
  - chrome-ai
  - web-platform
  - html
  - forms
date: 2026-10-13 09:30:00
updated: 2026-10-13 09:30:00
---

En el [primer post de la serie](/es/blog/webmcp-fundamentals) cada tool de WebMCP era un objeto de JavaScript: nombre, descripción, un `inputSchema` escrito a mano y una función `execute` que llamaba al store. Funciona, y para lógica que vive en JavaScript es exactamente lo que querés. Pero mirá tu app un segundo: ¿dónde vive la mayor parte de lo que un usuario puede *hacer*? Buscar, filtrar, suscribirse, reservar, pagar, dejar un comentario. Casi todo es un `<form>`.

Y un formulario ya es, en buena medida, la descripción de una tool. Tiene un nombre por campo (`name`), tipos (`type="date"`, `type="email"`), reglas (`required`, `pattern`, `min`, `max`), opciones cerradas (`<select>`) y un punto de envío. Lo único que le falta para que un agente lo entienda es contexto en lenguaje natural: qué hace el formulario y qué significa cada campo.

Eso es lo que propone la **API declarativa de WebMCP**: un puñado de atributos que convierten un `<form>` común en una tool. **La tool básica no necesita ni una línea de JavaScript**, y se degrada perfecto: un humano sigue viendo un formulario normal. JavaScript vuelve a aparecer solo para una cosa: contestarle al agente sin navegar.

Armé un demo con el mismo dominio de vuelos del post anterior. El código está en [`demos/webmcp-declarative-forms`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-declarative-forms) (en el [README](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/README.md) tenés cómo correrlo).

## Cómo funciona el demo

<figure>
  <video controls preload="metadata" width="100%">
    <source src="https://res.cloudinary.com/khriztianmoreno/video/upload/f_auto,q_auto/v1791851489/blogpost-demos/webmcp-declarative-forms/webmcp-declarative-forms_zcece8.mp4" type="video/mp4" />
    Tu navegador no soporta video embebido — <a href="https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-declarative-forms">cloná el demo</a> y corrélo local.
  </video>
  <figcaption>La corrida completa: el agente buscando solo, frenando en la reserva para que la revises vos, y los tres caminos de cancelación.</figcaption>
</figure>

La app es otra vez SkyFare, pero ahora no hay ningún `registerTool()`. Son **dos formularios HTML planos** con atributos declarativos:

- **`search_flights`** tiene `toolautosubmit`: el agente lo llena y el formulario se envía solo.
- **`book_flight`** no lo tiene: el agente lo llena, el botón de enviar recibe el foco, y **vos** revisás y confirmás.

Al lado hay dos paneles. Uno es un **agente simulado** (sin LLM, como en la parte 1: el plan está hard-codeado) con el objetivo *encontrar el vuelo sin escalas más barato BOG → MAD para 2 pasajeros y reservarlo para Ana Gómez*. El otro es un **inspector de schemas** que muestra, en vivo, el JSON Schema que sale de cada formulario.

En mis corridas (Chrome 154 headless, con el shim):

1. **El agente descubre 2 tools** a partir del markup, sin que la página registre nada.
2. **`search_flights` se llena y se envía solo.** El agente recibe 745 caracteres de JSON con los vuelos y la URL no cambia: cero navegaciones.
3. **`book_flight` se llena y se queda esperando.** El formulario se marca, el botón "Confirm booking" late y tiene el foco. El agente no puede terminar hasta que vos hagas click. Cuando lo hacés, recibe 313 caracteres de JSON con la confirmación.

Mientras espera, podés cancelar de tres formas distintas: el agente cancela, vos reseteás el formulario, o la página le cambia el `toolname`. Las tres cortan la invocación en curso.

## El problema: cada tool pedía JavaScript

La parte 1 dejó una idea central: una tool no es una segunda implementación de la feature, es otra puerta de entrada a la que ya tenés. Pero con la API imperativa, esa puerta la tenés que construir a mano. Así se veía `search_flights` en [`tools.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-fundamentals/tools.js) del primer demo:

```js
{
  name: 'search_flights',
  title: 'Search flights',
  description:
    'Search available flights between two airports. Returns every matching flight with id, airline, times, number of stops and price in USD.',
  inputSchema: {
    type: 'object',
    properties: {
      origin: { type: 'string', description: 'IATA code of the departure airport, e.g. "BOG".' },
      destination: { type: 'string', description: 'IATA code of the arrival airport, e.g. "MAD".' },
      date: { type: 'string', format: 'date', description: 'Departure date, YYYY-MM-DD.' },
    },
    required: ['origin', 'destination'],
  },
  annotations: { readOnlyHint: true },
  execute: async ({ origin, destination, date }) => {
    const flights = searchFlights({ origin, destination, date });
    return { count: flights.length, flights };
  },
},
```

Fijate en el `inputSchema`. Ese bloque **repite información que tu formulario ya tiene**: que `origin` es un string obligatorio, que `date` es una fecha. Y como está duplicada, se puede desincronizar: el día que alguien agrega `pattern` al input de origen, el schema no se entera. Además, no todo en tu sitio está detrás de una función de JavaScript. Muchos formularios hacen un `POST` al servidor y listo. Para exponerlos con la API imperativa, primero tendrías que reescribirlos.

## Pieza 1: el mismo contrato, escrito en HTML

Este es el formulario de búsqueda del demo, en [`index.html`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/index.html) (le saqué los campos de cabina y pasajeros para que se lea mejor):

```html
<form
  id="search-form"
  action="submitted.html"
  method="get"
  toolname="search_flights"
  tooldescription="Search flights between two airports on a given date. Returns each flight's id, airline, times, number of stops and per-passenger price."
  toolautosubmit
  class="tool-form grid grid-cols-2 gap-3 sm:grid-cols-4"
>
  <label class="field">From
    <input name="origin" required pattern="[A-Za-z]{3}" maxlength="3" placeholder="BOG" autocomplete="off" title="3-letter airport code"
      toolparamdescription="Origin airport, as a 3-letter IATA code (e.g. BOG)" />
  </label>
  <label class="field">To
    <input name="destination" required pattern="[A-Za-z]{3}" maxlength="3" placeholder="MAD" autocomplete="off" title="3-letter airport code"
      toolparamdescription="Destination airport, as a 3-letter IATA code (e.g. MAD)" />
  </label>
  <label class="field col-span-2">Date
    <input name="date" type="date" required min="2026-10-13" max="2027-10-12"
      toolparamdescription="Departure date" />
  </label>
```

El patrón sale directo del [explainer de la API declarativa](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), que muestra el mismo paralelo con un buscador de autos. Los atributos son pocos:

- **En el `<form>`:** `toolname` (el equivalente a `name` de la tool imperativa), `tooldescription` (el equivalente a `description`) y `toolautosubmit`, un atributo booleano del que hablamos en la pieza 3.
- **En cada control:** el `name` de siempre se convierte en el nombre de la propiedad, y `toolparamdescription` aporta su descripción.

Un detalle que vas a ver mal en varios lados: **no existe un atributo `toolparam`**. El nombre de la propiedad es el `name` del control, el mismo que ya viaja en el envío del formulario. Lo único nuevo por control es la descripción.

Y fijate lo que *no* hay: ni `execute`, ni `registerTool()`, ni `AbortController` para desregistrar. Según el explainer, cuando un formulario con estos atributos se inserta, se quita, o le cambian los atributos, el navegador crea una nueva tool declarativa. El ciclo de vida de la tool es el ciclo de vida del elemento.

## Pieza 2: del formulario al JSON Schema (y por qué es TBD)

Para que el agente sepa cómo llenar el formulario, el navegador tiene que "compilar" el formulario a un `inputSchema`. El explainer lo llama *input schema synthesis*, y acá viene la parte que más me importa que quede clara: **el algoritmo todavía no existe en la spec.** La sección dice literalmente TODO: falta especificar cómo `<input>`, `<select>` y atributos como `step` y `min` se reducen a un JSON Schema con `anyOf`, `oneOf`, `minimum` y `maximum`. Chromium está implementando "una versión laxa" para probarla.

Así que el demo trae **nuestra propia aproximación**, en [`schema-synthesis.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/schema-synthesis.js), y el inspector la muestra con una etiqueta que lo dice. Esta tabla es lo que *esperaría* que pase, no lo que dice un estándar:

| En el HTML | Nuestra aproximación en JSON Schema |
| --- | --- |
| `required` | La propiedad entra en `required` |
| `pattern="[A-Za-z]{3}"` | `"pattern": "^(?:[A-Za-z]{3})$"` (HTML ancla el patrón implícitamente; JSON Schema no) |
| `minlength` / `maxlength` | `minLength` / `maxLength` |
| `type="email"` | `"format": "email"` |
| `type="date"` con `min` / `max` | `"format": "date"`; el rango va a un `$comment`, porque JSON Schema no tiene una palabra clave estándar para rangos de fechas |
| `type="number" min="0" max="3"` | `"type": "integer", "minimum": 0, "maximum": 3` (el `step` por defecto es 1, así que entero) |
| `type="checkbox"` | `"type": "boolean"` |
| `<select>` | `"oneOf": [{ "const": "economy", "title": "Economy" }, …]`; el placeholder vacío se descarta si el select es `required` |
| Custom element form-associated | `"type": "string"` con un `$comment`: el mapeo no está especificado |

Dos cosas que me dejó armar esto. Primero, **tus validaciones de HTML pasan a ser documentación para el agente**. Ese `pattern` que pusiste para el usuario ahora también le dice al modelo qué formato espera el campo. Segundo, hay cosas que no cruzan bien: un rango de fechas no tiene palabra clave estándar, y un control custom es opaco. La validación igual se aplica cuando el formulario se envía (es HTML, al fin y al cabo), pero el agente no la ve por adelantado.

El inspector se actualiza con un `MutationObserver`. Marcá la casilla de `toolautosubmit` o renombrá la tool y vas a ver cómo el schema se vuelve a sintetizar en el momento.

## Pieza 3: `toolautosubmit` o revisión humana

Esta es la decisión de diseño más importante de la API, y es un solo atributo booleano:

- **Con `toolautosubmit`**, el agente llena el formulario y lo envía en nombre del usuario. Tiene sentido para una búsqueda: es de solo lectura y no tiene consecuencias.
- **Sin `toolautosubmit`**, cuando el agente termina de llenar, **el navegador pone el foco en el botón de enviar**, y el agente le debería decir al usuario que revise el formulario y lo envíe a mano.

En la parte 1, el "Approve / Deny" antes de reservar lo implementaba mi agente simulado leyendo `consequentialHint`. Acá el humano en el loop sale gratis: **es el propio formulario**, con los datos que llenó el agente a la vista, y el mismo botón de siempre. Sin JavaScript, sin un diálogo aparte.

Para que el usuario note que hay un formulario esperándolo, el explainer propone dos pseudo-clases de CSS: `:tool-form-active` para el `<form>` cuya tool está "corriendo", y `:tool-submit-active` para su botón de enviar. Un script no puede hacer que una pseudo-clase real matchee, así que el shim las refleja como atributos `data-*`, y [`style.css`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/style.css) tiene las dos versiones:

```css
form:tool-form-active {
  outline: 2px dashed var(--review);
  outline-offset: 8px;
  border-radius: 0.5rem;
}

/* ... */

form[data-tool-form-active] {
  outline: 2px dashed var(--review);
  outline-offset: 8px;
  border-radius: 0.5rem;
}
```

Van en reglas separadas a propósito: si un navegador no conoce `:tool-form-active`, descarta la regla entera; si juntaras las dos versiones en una sola lista de selectores, ese navegador descartaría también la del shim.

La invocación también se puede cortar. Según el explainer, si el formulario se resetea o cambia su declaración (por ejemplo, el `toolname`), la invocación en curso se cancela y se le avisa al agente. En el demo lo podés probar con los botones "Clear" y "Rename to reserve_flight" mientras el agente espera.

### Buscar, previsualizar, confirmar

Después de la parte 1, un lector me hizo una pregunta que vale oro: si el agente ya no tiene que adivinar botones, ¿cómo expresa un sitio la diferencia entre **encontrar** una opción, **previsualizar** el resultado y **confirmar** un cambio? Son tres intenciones distintas, y hoy WebMCP las cubre de forma despareja:

| Intención | API imperativa (parte 1) | API declarativa (esta parte) |
| --- | --- | --- |
| **Encontrar** | `readOnlyHint` en la tool | un formulario de búsqueda con `toolautosubmit` |
| **Previsualizar** | no existe como concepto: lo modelás como una tool de solo lectura aparte (por ejemplo, `quote_booking`) | el formulario lleno por el agente, esperando revisión (`:tool-form-active`, foco en el botón) |
| **Confirmar** | `consequentialHint`, más tu propia UI de aprobación | el humano aprieta enviar (sin `toolautosubmit`) |

El detalle incómodo es que la API declarativa **no tiene** equivalente a `readOnlyHint` ni a `consequentialHint`. Los únicos atributos que propone el explainer son `toolname`, `tooldescription`, `toolautosubmit` y `toolparamdescription`. La única señal de "esto tiene consecuencias" es que falte `toolautosubmit`.

Lo que sigue es lectura mía, no está en el explainer: la web ya tiene esta distinción desde hace décadas. En HTTP, `GET` es un método *safe*, pensado para consultar, y `POST` no lo es. Un formulario bien hecho ya declara su intención con el `method`: la búsqueda va por `GET` y la reserva por `POST`. Ojo, en el demo la reserva usa `GET` solo porque un servidor estático rechaza `POST`; en una app real sería `POST`. Si la síntesis de tools terminara usando esa señal, el agente heredaría una semántica que la web ya entiende, en vez de inventar una nueva. Cómo resolver esto en serio, con permisos y confirmaciones, es tema del post sobre human-in-the-loop de esta serie.

## Pieza 4: `agentInvoked` y `respondWith()`, donde vuelve JavaScript

Hasta acá, cero JavaScript. Pero hay un hueco: cuando el agente envía el formulario de búsqueda, ¿qué recibe de vuelta? Sin JavaScript, el formulario navega a su `action`, igual que siempre. El explainer tenía una idea para ese caso: usar el primer `<script type="application/ld+json">` de la página de destino como respuesta. Esa idea hoy está **en debate** en la [issue #135](https://github.com/webmachinelearning/webmcp/issues/135).

La alternativa, que es la que usa el demo, es responder desde la página. El explainer suma dos miembros a `SubmitEvent`: `agentInvoked`, para saber si el envío lo disparó un agente, y `respondWith(promise)`, para pasarle la respuesta sin navegar. La regla: tenés que llamar a `preventDefault()` **antes** de `respondWith()`. Así queda en [`app.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/app.js):

```js
searchForm.addEventListener('submit', (event) => {
  // Enhanced path: answer in-page instead of navigating to the GET action.
  event.preventDefault();
  const flights = searchFlights(Object.fromEntries(new FormData(searchForm)));
  renderResults(resultsEl, flights, bookForm);

  if (event.agentInvoked) {
    // The agent gets structured data back; the page never navigates.
    event.respondWith(Promise.resolve({ flights }));
  }
});
```

Esto es lo que más me gustó del enfoque: **es el mismo handler para humanos y agentes.** Si llenás la búsqueda vos, `agentInvoked` es `false`, los resultados se pintan en la página y listo. Si la llena el agente, pasa exactamente lo mismo, y además el agente recibe `{ flights }` como datos, no tiene que leer la tabla de resultados. La única línea específica para agentes es el `if`.

Un detalle que el explainer no resuelve: cuando el agente llena `book_flight` y vos hacés click en "Confirm booking", ¿ese envío es `agentInvoked`? El shim decide que sí, para que el agente reciba la confirmación. Es una decisión mía, no algo que diga el texto.

## Pieza 5: Web Components que participan

El explainer habla de `<form>` y de [form-associated elements](https://html.spec.whatwg.org/#form-associated-element). No menciona `<details>`, ni tablas, ni microformatos. Pero un detalle importante: un custom element con `static formAssociated = true` y `ElementInternals` **es** un form-associated element según HTML. Así que un Web Component puede participar. El demo tiene uno, [`passenger-stepper.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/passenger-stepper.js):

```js
class PassengerStepper extends HTMLElement {
  static formAssociated = true;

  #internals = this.attachInternals();
```

Aparece en `form.elements`, envía su valor con `setFormValue()`, valida con `setValidity()` y responde al reset con `formResetCallback()`. Para el shim, es un control más.

Ahora, lo que sigue es **inferencia mía, no spec**: el explainer no dice cómo un custom element se traduce a schema. Un `<input type="number" min="1" max="6">` le dice al agente "entero entre 1 y 6". Mi custom element, en cambio, es una caja negra: el navegador no tiene cómo saber qué valores acepta. Por eso, en nuestra aproximación, sale como un `string` con un `$comment`, y el agente del demo manda `"2"`. La validación sigue funcionando al enviar, pero el agente pierde el tipo y el rango. Si podés usar un control nativo, el agente sale ganando.

## Pieza 6: progressive enhancement de verdad

Como todo es HTML, el demo se puede usar sin JavaScript. Los dos formularios hacen un `GET` a `submitted.html`, una página estática que te muestra qué llegó. El stepper también tiene su plan B: en el markup envuelve un `<input type="number" name="passengers">` común, y cuando el custom element se activa, copia su contrato (`name`, `min`, `max` y `toolparamdescription`) y lo reemplaza. Sin JavaScript, el elemento nunca se activa y el formulario envía el input de siempre.

Para probarlo sin tocar la configuración del navegador, el link "View without the page script" carga la página con `?nojs`, y [`main.js`](https://github.com/khriztianmoreno/khriztianmoreno.dev/blob/main/demos/webmcp-declarative-forms/main.js) se detiene antes de hacer nada:

```js
if (new URLSearchParams(location.search).has('nojs')) {
  document.documentElement.dataset.nojs = '';
} else {
  await boot();
}
```

Es una simulación, y la UI lo dice. Para la prueba real, desactivá JavaScript en DevTools. Yo lo verifiqué así con Playwright: con JavaScript apagado, el formulario de reserva navega a `submitted.html?flight=IB-6584&passenger=Ana+G%C3%B3mez&…` como cualquier formulario de los 2000.

Ese es el argumento de fondo: **los atributos declarativos no le cuestan nada a nadie.** Un navegador que no los entiende los ignora, un humano ve el formulario de siempre, y la página que ya funcionaba sigue funcionando.

## Una advertencia honesta: esto es todavía más temprano que la parte 1

Si la API imperativa es una propuesta, la declarativa está un paso más atrás:

- **Solo existe en un explainer.** No está en la [spec](https://webmachinelearning.github.io/webmcp/), que ya es un Draft Community Group Report fuera del standards track.
- **La síntesis del schema es TBD.** Todo lo que viste en la tabla es nuestra aproximación. Chromium está probando su propia versión laxa, y el resultado puede ser distinto.
- **Cómo vuelve la respuesta al agente está en debate** ([issue #135](https://github.com/webmachinelearning/webmcp/issues/135)). `respondWith()` está en el explainer, pero el camino sin JavaScript (`application/ld+json` en la página de destino) quedó en discusión.
- **Los nombres de los eventos no coinciden.** El explainer habla de `toolactivated` y `toolcanceled`. El IDL de la spec, en cambio, define `ontoolcancel`. Además, sigue abierto si se disparan en `Window` o en el `<form>`. El shim, mientras tanto, dispara `toolcanceled` y `toolcancel`.
- **La integración con `getTools()` / `executeTool()` es TBD.** El explainer dice que casi seguro las tools declarativas van a poder invocarse por ahí, pero los detalles no están. Por eso el shim expone su propio `getTools()` / `executeTool()` y no toca `document.modelContext`.
- **No probé la ruta nativa.** No hay forma documentada de detectar soporte para la API declarativa, así que el demo no inventa una: el comportamiento declarativo es **siempre** el shim. Si tu navegador expone el `document.modelContext` imperativo, el badge lo muestra, pero eso no dice nada sobre los formularios.

## Lo que aprendí armando esto

1. **Tus formularios ya eran un contrato.** `name`, `type`, `required` y `pattern` llevan años describiendo qué espera tu app. La API declarativa no te pide un contrato nuevo, te pide que le agregues las descripciones.
2. **El humano en el loop puede ser un atributo.** Sacar `toolautosubmit` alcanza para que el usuario revise antes de una acción con consecuencias, con la UI que ya conoce. Es la forma más barata de control que vi hasta ahora en esta serie.
3. **Un solo handler para humanos y agentes.** `agentInvoked` + `respondWith()` no te obliga a bifurcar la lógica: solo agregás una respuesta estructurada al final del camino que ya existía.
4. **Lo nativo le gana a lo custom, al menos para el agente.** Un Web Component puede participar, pero un `<input>` nativo le da al modelo tipos y rangos que un componente opaco esconde.

En los próximos posts de la serie vamos a ver qué pasa cuando el estado vive en hooks y stores de una SPA, cómo diseñar permisos con humano en el loop más allá de un formulario, y cómo debuggear todo esto con DevTools.

---

### Para seguir explorando

- **El explainer de la API declarativa:** [`declarative-api-explainer.md`](https://github.com/webmachinelearning/webmcp/blob/main/declarative-api-explainer.md), la fuente de todo lo que viste acá.
- **La issue sobre la respuesta al agente:** [webmachinelearning/webmcp#135](https://github.com/webmachinelearning/webmcp/issues/135), donde se discute cómo vuelve el resultado de un formulario.
- **La spec de WebMCP:** [webmachinelearning.github.io/webmcp](https://webmachinelearning.github.io/webmcp/), el Draft Community Group Report (la API imperativa).
- **La parte 1 de la serie:** [WebMCP — Por qué los agentes no deberían adivinar cómo funciona tu UI](/es/blog/webmcp-fundamentals), con `registerTool()`, `getTools()` y `executeTool()`.
- **El demo completo:** [`demos/webmcp-declarative-forms`](https://github.com/khriztianmoreno/khriztianmoreno.dev/tree/main/demos/webmcp-declarative-forms): corré el agente, dejalo esperando en la reserva y probá las tres formas de cancelar.

¿Cuántos de los formularios de tu app podrían ser tools mañana con solo agregar descripciones? Me encantaría saber cuál expondrías primero. Charlemos por [X/Twitter](https://twitter.com/khriztianmoreno) o [LinkedIn](https://www.linkedin.com/in/khriztianmoreno/).

![Profile](https://res.cloudinary.com/khriztianmoreno/image/upload/c_scale,w_148/v1591324337/KM-brand/stickers/sticker-3_2x.png)
