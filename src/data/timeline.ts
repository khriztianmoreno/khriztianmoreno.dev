import { postHref } from '@/components/blog/paths';

interface BaseEntry {
  title: string;
  sortKey: number;
  displayDate: string;
  undated?: boolean;
}

export interface TalkEntry extends BaseEntry {
  type: 'talk';
  event?: string;
  location?: string;
  format?: string;
  attendance?: number;
  description?: string;
}

export interface WorkshopEntry extends BaseEntry {
  type: 'workshop';
  org: string;
  description: string;
  format: string;
  attendance?: number;
}

export interface PostEntry extends BaseEntry {
  type: 'post';
  theme: string;
  description: string;
  url: string;
}

export type TimelineEntry = TalkEntry | WorkshopEntry | PostEntry;

const TALKS: TalkEntry[] = [
  {
    type: 'talk',
    title:
      'Desarrollo web potenciado por IA: Optimiza tu workflow con Antigravity y Chrome DevTools',
    event: 'GDG Quito / EPN',
    location: 'Ecuador',
    format: 'Presencial',
    attendance: 430,
    sortKey: 202606,
    displayDate: 'Jun 2026',
  },
  {
    type: 'talk',
    title:
      'Desarrollo web potenciado por IA: Optimiza tu workflow con Antigravity IDE y Chrome DevTools',
    event: 'GDG Santa Cruz',
    location: 'Bolivia',
    format: 'Presencial',
    attendance: 450,
    sortKey: 202605,
    displayDate: 'May 2026',
  },
  {
    type: 'talk',
    title:
      'Desarrollo web potenciado por IA: Optimiza tu workflow con Antigravity y Chrome DevTools',
    event: 'GDG Medellín - Build with AI',
    location: 'Colombia',
    format: 'Presencial',
    attendance: 70,
    sortKey: 202605,
    displayDate: 'May 2026',
  },
  {
    type: 'talk',
    title: 'DADD - Digital Agencies-Driven Development',
    event: 'DevFest GDG Santo Domingo',
    location: 'República Dominicana',
    format: 'Presencial',
    attendance: 550,
    sortKey: 202310,
    displayDate: 'Oct 2023',
  },
  {
    type: 'talk',
    title: 'Serverless para Frontends',
    event: 'DevFest GDG Medellín',
    location: 'Colombia',
    format: 'Virtual',
    attendance: 1000,
    sortKey: 202212,
    displayDate: 'Dec 2022',
  },
  {
    type: 'talk',
    title: 'Serverless para Frontends',
    event: 'DevFest GDG Santo Domingo',
    location: 'República Dominicana',
    format: 'Presencial',
    attendance: 500,
    sortKey: 202210,
    displayDate: 'Oct 2022',
  },
  {
    type: 'talk',
    title:
      'Un viaje a las Single Page Application a través de React y JavaScript',
    event: 'Meetup MedellínJS',
    location: 'Colombia',
    format: 'Virtual',
    attendance: 115,
    sortKey: 202206,
    displayDate: 'Jun 2022',
  },
  {
    type: 'talk',
    title: 'Temas de #Javascript que todo #FrontEnd debería conocer',
    event: 'Meetup MedellínJS',
    location: 'Colombia',
    format: 'Virtual',
    attendance: 500,
    sortKey: 202110,
    displayDate: 'Oct 2021',
  },
  {
    type: 'talk',
    title: 'WordPress in the JAMstack ecosystem',
    event: 'WordCamp Colombia',
    location: 'Colombia',
    format: 'Virtual',
    sortKey: 202009,
    displayDate: 'Sep 2020',
  },
  {
    type: 'talk',
    title: 'Sequelize 101',
    event: 'Sesión de Arquitectura y Persistencia',
    location: 'Virtual',
    format: 'Virtual',
    sortKey: 201805,
    displayDate: 'May 2018',
  },
  {
    type: 'talk',
    title: 'CI & CD in javascript',
    description:
      'La integración continua (CI) es una práctica en la que un equipo de desarrolladores integra su código con anticipación y frecuencia a la rama principal. El despliegue continuo es la liberación del código a producción tan pronto esté listo.',
    sortKey: 202410,
    displayDate: 'Oct 2024',
  },
  {
    type: 'talk',
    title: 'Modern Frontend Developers',
    description:
      'Un viaje por las herramientas y tecnologías que potencian el camino para convertirse en un Modern Frontend Developer.',
    sortKey: 202211,
    displayDate: 'Nov 2022',
  },
  {
    type: 'talk',
    title: 'Serverless para Frontends',
    description:
      'Los desarrolladores front-end pueden hacer mucha magia en la web hoy en día, pero a veces todavía existe la necesidad de manejar algo de lógica del lado del servidor.',
    sortKey: 202010,
    displayDate: 'Oct 2020',
  },
  {
    type: 'talk',
    title: 'React Hooks 101',
    description:
      'React 16.3.x introdujo los Hooks, que reemplazan los life cycles de las versiones anteriores y hacen que React sea cada vez más funcional y fácil de testear.',
    sortKey: 202007,
    displayDate: 'Jul 2020',
  },
  {
    type: 'talk',
    title: 'Intro to Stackbit: Build a Custom JAMstack in Minutes',
    description:
      'Stackbit is a SaaS that allows developers of any level to build their own JAMstack sites, fast.',
    sortKey: 202007,
    displayDate: 'Jul 2020',
  },
  {
    type: 'talk',
    title: 'Headless CMS and Modern web development',
    description:
      'A headless CMS is a CMS that has had its "head" — the front-end delivery layer — removed, leaving only the back-end.',
    sortKey: 202002,
    displayDate: 'Feb 2020',
  },
  {
    type: 'talk',
    title: 'Pataconf',
    sortKey: 201910,
    displayDate: 'Oct 2019',
  },
  {
    type: 'talk',
    title: 'The JAMstack in 2019: Why (and How) to Get Started',
    sortKey: 201909,
    displayDate: 'Sep 2019',
  },
  {
    type: 'talk',
    title: 'Gatsby ⚛️',
    description:
      'Gatsby is a free and open source framework based on React that helps developers build blazing fast websites and apps.',
    sortKey: 201908,
    displayDate: 'Aug 2019',
  },
  {
    type: 'talk',
    title: 'GraphQL Query Language',
    description:
      'GraphQL is one of the most popular ways to create an API: the QL in GraphQL — the query language — is used to query data, change data with mutations, and listen for changes with subscriptions.',
    sortKey: 201908,
    displayDate: 'Aug 2019',
  },
  {
    type: 'talk',
    title: 'React Native 101',
    description:
      "React Native's architecture opened up many possibilities for re-inventing the clunkier aspects of UX construction on traditional platforms, making it faster to build world-class experiences.",
    sortKey: 201905,
    displayDate: 'May 2019',
  },
  {
    type: 'talk',
    title: 'Introduction to react-storybook',
    description:
      'A design system is a series of components that can be reused in different combinations.',
    sortKey: 201905,
    displayDate: 'May 2019',
  },
  {
    type: 'talk',
    title:
      'Introducing JAMstack - What we talk about when we talk about modern web tools',
    description:
      "Today's static sites are anything but static — thanks to modern browsers, JavaScript, third-party APIs, and Markup.",
    sortKey: 201905,
    displayDate: 'May 2019',
  },
  {
    type: 'talk',
    title: 'GraphQL Apollo-Client Workshop',
    description:
      "GraphQL lets a client make specific, complex, and/or aggregate queries for data, and it's user-friendly to boot.",
    sortKey: 201903,
    displayDate: 'Mar 2019',
  },
  {
    type: 'talk',
    title: 'Reduce Redux Boilerplate with Redux-Actions',
    description:
      'The redux-actions library offers a small but powerful API to help cut down on the boilerplate typical of an application that uses Redux for state management.',
    sortKey: 201902,
    displayDate: 'Feb 2019',
  },
  {
    type: 'talk',
    title: 'Flux - Redux',
    description:
      'Una presentación corta acerca de la historia de Flux y Redux.',
    sortKey: 201810,
    displayDate: 'Oct 2018',
  },
  {
    type: 'talk',
    title: 'Build a Server-rendered ReactJS Application with Next.js',
    description:
      'A look at just how quickly Next.js makes the process of building server-rendered ReactJS applications.',
    sortKey: 201809,
    displayDate: 'Sep 2018',
  },
  {
    type: 'talk',
    title: 'NuxtJS',
    description:
      'A quick tour of the features of this framework to make server side rendering easy.',
    sortKey: 201803,
    displayDate: 'Mar 2018',
  },
];

const WORKSHOPS: WorkshopEntry[] = [
  {
    type: 'workshop',
    title: 'Full Stack Web Developer Bootcamp',
    org: 'Make It Real',
    description:
      'Mentoría intensiva dedicada a guiar a los participantes en la construcción de aplicaciones web completas desde cero, cubriendo HTML, CSS, JavaScript nativo, Node.js y bases de datos relacionales y NoSQL.',
    format: 'Virtual',
    attendance: 21,
    sortKey: 202408,
    displayDate: 'Aug 2024',
  },
  {
    type: 'workshop',
    title: 'Git Workflows & Code Management',
    org: 'Make It Real',
    description:
      'Taller práctico sobre guías estructuradas para el uso colaborativo de Git en equipos, integrando revisiones de código, manejo de conflictos y automatización de lanzamientos.',
    format: 'Virtual',
    attendance: 21,
    sortKey: 202408,
    displayDate: 'Aug 2024',
  },
  {
    type: 'workshop',
    title: 'Git Merge vs. Git Rebase',
    org: 'Make It Real',
    description:
      'Sesión de análisis avanzado sobre las diferencias metodológicas, históricas y arquitectónicas en el control de versiones usando fusión y rebase en ramas complejas de producción.',
    format: 'Virtual',
    attendance: 21,
    sortKey: 202409,
    displayDate: 'Sep 2024',
  },
  {
    type: 'workshop',
    title: 'Javascript en el navegador & Eventos',
    org: 'Make It Real',
    description:
      'Talleres gemelos sobre la manipulación dinámica del DOM, el ciclo de vida del runtime del navegador, y la detección e interacción con eventos de usuario (clicks, desplazamientos, flujos asíncronos).',
    format: 'Virtual',
    attendance: 21,
    sortKey: 202409,
    displayDate: 'Sep 2024',
  },
  {
    type: 'workshop',
    title: 'Desarrollo de aplicaciones modernas para problemas de hoy en día',
    org: 'Taller de Ingeniería Medellín',
    description:
      'Workshop especializado en optimización de flujos de desarrollo utilizando Strapi como Headless CMS y Next.js para interfaces dinámicas, evitando la sobrecarga de construir stacks complejos desde cero.',
    format: 'Presencial',
    attendance: 50,
    sortKey: 202310,
    displayDate: 'Oct 2023',
  },
  {
    type: 'workshop',
    title: 'Git, Node.js, devTools, Responsive Design & ES6 (Serie 2023)',
    org: 'Workshops Presenciales Medellín',
    description:
      'Serie de cinco talleres prácticos y personalizados que abordaron: fundamentos de Git, inicialización con npm, depuración interactiva con Chrome DevTools, maquetación adaptativa con metodología BEM y CSS Grid/Flexbox, y principios de programación funcional (promesas y async/await).',
    format: 'Presencial',
    attendance: 15,
    sortKey: 202304,
    displayDate: 'Apr 2023',
  },
  {
    type: 'workshop',
    title: 'Workshop express.js',
    org: 'Taller In-Person Medellín',
    description:
      'Construcción ágil de arquitecturas de backend distribuidas con Express, definiendo rutas seguras y middleware de control de accesos.',
    format: 'Presencial',
    attendance: 53,
    sortKey: 202212,
    displayDate: 'Dec 2022',
  },
  {
    type: 'workshop',
    title: 'Serie de Mentoría React.js (Nov 2022)',
    org: 'Bootcamps de Inmersión',
    description:
      'Talleres enfocados en la implementación de React Hooks, la creación de almacenes de estado de carrito de compras usando React Context API y la gestión eficiente de flujos de datos.',
    format: 'Presencial',
    attendance: 15,
    sortKey: 202211,
    displayDate: 'Nov 2022',
  },
  {
    type: 'workshop',
    title: 'Styled Components & Intro a Testing Web',
    org: 'Talleres de Especialización',
    description:
      'Sesiones de inmersión práctica dedicadas a la adopción de CSS-in-JS en React utilizando Styled Components, y diseño de pruebas unitarias robustas mediante Jest.',
    format: 'Virtual',
    attendance: 13,
    sortKey: 202111,
    displayDate: 'Nov-Dec 2021',
  },
  {
    type: 'workshop',
    title: 'Full Stack Remoto & Fundamentos de Desarrollo',
    org: 'Programas de Mentoring',
    description:
      'Sesiones semanales de mentoría en JavaScript, CSS, HTML5, Cloud Functions (GCF) y andamiajes de Node.js orientados a la producción (Scaffolding con Passport.js y JWT).',
    format: 'Virtual',
    attendance: 13,
    sortKey: 202106,
    displayDate: 'Jun-Nov 2021',
  },
];

const POSTS: PostEntry[] = [
  // 1. Inteligencia Artificial, Agentes y el Futuro de la Web (2024-2026)
  {
    type: 'post',
    title:
      'AI-Powered Web Debugging - From Browser Runtime to Autonomous Agent',
    theme: 'Inteligencia Artificial, Agentes y el Futuro de la Web',
    description:
      'Publicación técnica que explora el uso del Model Context Protocol (MCP) para conectar agentes de IA al motor de renderizado de Chrome, permitiendo la depuración autónoma en tiempo real de fugas de memoria, cuellos de botella de rendimiento y QA automatizado.',
    url: postHref('en', 'ai-powered-web-debugging'),
    sortKey: 202605,
    displayDate: 'May 2026',
  },
  {
    type: 'post',
    title:
      'The 15 Chrome Updates from Google I/O 2026 We Actually Need to Care About',
    theme: 'Inteligencia Artificial, Agentes y el Futuro de la Web',
    description:
      'Guía práctica de novedades del ecosistema de Google I/O, destacando WebMCP, DevTools impulsados por IA, Gemini integrado nativamente en el cliente y APIs de navegación suave (Soft Navigations).',
    url: postHref('en', '15-updates-from-google-io-2026'),
    sortKey: 202605,
    displayDate: 'May 2026',
  },
  {
    type: 'post',
    title: 'The Agent Development Kit - ADK',
    theme: 'Inteligencia Artificial, Agentes y el Futuro de la Web',
    description:
      'Análisis arquitectónico del framework ADK para simplificar la creación de agentes autónomos inteligentes, detallando sus seis componentes clave: agente, ejecutor (runner), sesión, estado, memoria y herramientas personalizadas con MCP.',
    url: postHref('en', 'the-agent-development-kit-adk'),
    sortKey: 202510,
    displayDate: 'Oct 2025',
  },
  {
    type: 'post',
    title: 'The revolutionary Chrome API',
    theme: 'Inteligencia Artificial, Agentes y el Futuro de la Web',
    description:
      'Introducción de corte técnico para el uso práctico de Prompt API, permitiendo a los desarrolladores web ejecutar modelos de lenguaje integrados en el navegador (como Gemini Nano) sin latencia del servidor ni costes de infraestructura de APIs tradicionales.',
    url: postHref('en', 'the-revolutionary-prompt-api'),
    sortKey: 202508,
    displayDate: 'Aug 2025',
  },
  {
    type: 'post',
    title:
      'Desbloquea tu creatividad con Google Gemini y JavaScript: Guía práctica',
    theme: 'Inteligencia Artificial, Agentes y el Futuro de la Web',
    description:
      'Tutorial exhaustivo paso a paso para la integración fluida de modelos generativos avanzados de IA de Google de manera local empleando JavaScript nativo.',
    url: postHref(
      'en',
      'unlock-your-creativity-with-google-gemini-and-javascript-a-practical-guide'
    ),
    sortKey: 202403,
    displayDate: 'Mar 2024',
  },
  // 2. Rendimiento Web y Optimización Profesional de Interfaces (2025-2026)
  {
    type: 'post',
    title: 'Mastering Chrome DevTools for Web Performance Optimization',
    theme: 'Rendimiento Web y Optimización Profesional de Interfaces',
    description:
      'Guía avanzada para ingenieros frontend sénior sobre cómo diagnosticar rigurosamente métricas complejas de Core Web Vitals, concentrándose en la detección de retrasos en Interaction to Next Paint (INP), Largest Contentful Paint (LCP) y Cumulative Layout Shift (CLS).',
    url: postHref('en', 'mastering-chrome-devtools-for-web-performance-optimization'),
    sortKey: 202511,
    displayDate: 'Nov 2025',
  },
  {
    type: 'post',
    title: 'Demystifying Core Web Vitals & Optimizing for Speed',
    theme: 'Rendimiento Web y Optimización Profesional de Interfaces',
    description:
      'Serie de guías detalladas para analizar datos de campo reales de usuarios (CrUX) y optimizar la carga a través del hilo principal, estabilidad visual de maquetado y optimización de recursos multimedia.',
    // This entry describes a two-post series; linked to the first
    // ("Demystifying...") since a single PostEntry only carries one url —
    // the second is "optimizing-for-speed-practical-strategies-to-improve-your-core-web-vitals".
    url: postHref(
      'en',
      "demystifying-core-web-vitals:-a-developer's-guide-to-lcp-inp-and-cls"
    ),
    sortKey: 202510,
    displayDate: 'Oct-Nov 2025',
  },
  {
    type: 'post',
    title: 'Navigating the Future - Soft Navigations for SPAs',
    theme: 'Rendimiento Web y Optimización Profesional de Interfaces',
    description:
      'Explicación del funcionamiento de la nueva API de Soft Navigations de Chrome orientada a estandarizar y reportar correctamente las mediciones de rendimiento en el ciclo de vida de aplicaciones de una sola página.',
    url: postHref(
      'en',
      'navigating-the-future-understanding-and-measuring-soft-navigations-for-spas'
    ),
    sortKey: 202511,
    displayDate: 'Nov 2025',
  },
  {
    type: 'post',
    title: 'Beyond the Basics - Advanced CSS Techniques for Web Developers',
    theme: 'Rendimiento Web y Optimización Profesional de Interfaces',
    description:
      'Análisis de rendimiento del motor de renderizado de CSS de los navegadores modernos, discutiendo el coste de propiedades específicas, el uso eficiente de Container Queries, Subgrid, pseudo-clases dinámicas (:has()) y propiedades personalizadas para diseño a escala.',
    url: postHref(
      'en',
      'beyond-the-basics:-advanced-css-techniques-for-web-developers'
    ),
    sortKey: 202509,
    displayDate: 'Sep 2025',
  },
  {
    type: 'post',
    title: 'Web Components and Material Design',
    theme: 'Rendimiento Web y Optimización Profesional de Interfaces',
    description:
      'Estrategias de encapsulamiento del Shadow DOM, elementos personalizados y tokens de diseño avanzados con Lit para crear microfrontends interoperables y escalables.',
    url: postHref(
      'en',
      'web-components-and-material-design:-a-powerful-duo-for-modern-web-development'
    ),
    sortKey: 202509,
    displayDate: 'Sep 2025',
  },
  // 3. Arquitectura de Software y Ecosistema Moderno de JS (2024-2025)
  {
    type: 'post',
    title: 'The Web Stack You Cannot Ignore in 2026',
    theme: 'Arquitectura de Software y Ecosistema Moderno de JS',
    description:
      'Análisis de tendencias dominadas por APIs nativas de Fugu/PWA, autenticación sin contraseñas (Passkeys / FedCM), APIs de IA integradas y arquitecturas que minimizan el excesivo envío de JavaScript innecesario al cliente.',
    url: postHref('en', 'the-web-stack-you-cannot-ignore-in-2026'),
    sortKey: 202512,
    displayDate: 'Dec 2025',
  },
  {
    type: 'post',
    title: 'What is a 12 Factor App - a Quick Guide',
    theme: 'Arquitectura de Software y Ecosistema Moderno de JS',
    description:
      'Manual pragmático de los doce principios metodológicos para el diseño de aplicaciones modernas de software como servicio (SaaS) altamente escalables, portables y listas para integraciones Cloud continuas.',
    url: postHref('en', 'what-is-a-12-factor-app-a-quick-guide'),
    sortKey: 202501,
    displayDate: 'Jan 2025',
  },
  {
    type: 'post',
    title: 'Tech Stack 2025',
    theme: 'Arquitectura de Software y Ecosistema Moderno de JS',
    description:
      'Evaluación de balances de ingeniería para decidir el stack ideal de desarrollo web fullstack rápido y mantenible en la escena actual de producción.',
    url: postHref('en', 'tech-stack-2025'),
    sortKey: 202501,
    displayDate: 'Jan 2025',
  },
  {
    type: 'post',
    title: '¡Rust está revolucionando el desarrollo JavaScript!',
    theme: 'Arquitectura de Software y Ecosistema Moderno de JS',
    description:
      'Explicación técnica de Rspack v1.0, el empaquetador veloz escrito en Rust, compatible con el ecosistema de plugins de webpack y diseñado para acelerar de forma drástica los tiempos de compilación de aplicaciones monolíticas en entornos empresariales.',
    url: postHref('en', 'rust-is-revolutionizing-javascript-development'),
    sortKey: 202409,
    displayDate: 'Sep 2024',
  },
  {
    type: 'post',
    title: 'Server Components Vs. Server-side Rendering',
    theme: 'Arquitectura de Software y Ecosistema Moderno de JS',
    description:
      'Discusión analítica sobre la gestión de estado y el balance de renderizado entre cliente y servidor en arquitecturas modernas de React.',
    url: postHref('en', 'server-components-vs-server-side-rendering'),
    sortKey: 202401,
    displayDate: 'Jan 2024',
  },
  {
    type: 'post',
    title: 'WebContainers are having a moment',
    theme: 'Arquitectura de Software y Ecosistema Moderno de JS',
    description:
      'Reseña e implicaciones técnicas del lanzamiento de bolt.new de StackBlitz, un sandbox de desarrollo potenciado por IA que corre de manera nativa Node.js en el cliente gracias a WebAssembly.',
    url: postHref(
      'en',
      'webcontainers-at-its-best-bolt-new-combines-ai-and-full-stack-development-in-the-browser'
    ),
    sortKey: 202410,
    displayDate: 'Oct 2024',
  },
];

const ENTRIES: TimelineEntry[] = [...TALKS, ...WORKSHOPS];

// Descending by sortKey; "Sequelize 101" (sortKey: 0) naturally sorts last as the minimum value.
export const TIMELINE: TimelineEntry[] = [...ENTRIES].sort(
  (a, b) => b.sortKey - a.sortKey,
);
