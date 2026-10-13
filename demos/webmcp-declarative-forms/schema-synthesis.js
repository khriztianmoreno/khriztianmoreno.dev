/**
 * OUR APPROXIMATION of "input schema synthesis": turning a <form> and its
 * form-associated elements into the JSON Schema an agent fills in.
 *
 * The declarative API explainer says the exact algorithm is TODO/TBD, and
 * that Chromium is trialing "a loose version" of it. Nothing below is spec.
 * It is a reasonable reading of what each HTML attribute already means, so
 * you can see what the agent would plausibly get from your markup.
 */

// Controls that are not something an agent should fill in.
const SKIP_TYPES = new Set(['submit', 'reset', 'button', 'image', 'hidden', 'file']);

const attr = (el, name) => (el.hasAttribute(name) ? el.getAttribute(name) : null);

function stringConstraints(el) {
  const schema = {};
  const pattern = attr(el, 'pattern');
  const minLength = attr(el, 'minlength');
  const maxLength = attr(el, 'maxlength');
  // HTML anchors `pattern` implicitly; JSON Schema doesn't, so we anchor it.
  if (pattern) schema.pattern = `^(?:${pattern})$`;
  if (minLength !== null) schema.minLength = Number(minLength);
  if (maxLength !== null) schema.maxLength = Number(maxLength);
  return schema;
}

function numberSchema(el) {
  const step = attr(el, 'step');
  const min = attr(el, 'min');
  const max = attr(el, 'max');
  const stepValue = step === 'any' ? null : Number(step ?? 1); // HTML's default step is 1
  const integer = stepValue !== null && Number.isInteger(stepValue) && (min === null || Number.isInteger(Number(min)));

  const schema = { type: integer ? 'integer' : 'number' };
  if (min !== null) schema.minimum = Number(min);
  if (max !== null) schema.maximum = Number(max);
  if (stepValue !== null && stepValue !== 1) schema.multipleOf = stepValue;
  return schema;
}

function inputSchema(el) {
  switch (el.type) {
    case 'checkbox':
      return { type: 'boolean' };
    case 'number':
    case 'range':
      return numberSchema(el);
    case 'date': {
      const range = [attr(el, 'min') && `min ${el.min}`, attr(el, 'max') && `max ${el.max}`].filter(Boolean);
      return {
        type: 'string',
        format: 'date',
        // JSON Schema has no standard keyword for a date range.
        ...(range.length ? { $comment: `HTML ${range.join(', ')}` } : {}),
      };
    }
    case 'email':
      return { type: 'string', format: 'email', ...stringConstraints(el) };
    case 'url':
      return { type: 'string', format: 'uri', ...stringConstraints(el) };
    default:
      return { type: 'string', ...stringConstraints(el) };
  }
}

function selectSchema(el) {
  // A required <select> with an empty placeholder option: the placeholder isn't a real choice.
  const options = [...el.options].filter((o) => !(o.value === '' && el.required));
  return { type: 'string', oneOf: options.map((o) => ({ const: o.value, title: o.label.trim() })) };
}

function controlSchema(el) {
  if (el.localName === 'select') return selectSchema(el);
  if (el.localName === 'textarea') return { type: 'string', ...stringConstraints(el) };
  if (el.localName === 'input') return inputSchema(el);
  if (el.localName.includes('-')) {
    // Form-associated custom elements ARE form-associated elements per HTML,
    // but the explainer doesn't say how they map to a schema. Inference only.
    return {
      type: 'string',
      $comment: 'Form-associated custom element: mapping unspecified. This approximation treats it as an opaque string.',
    };
  }
  return { type: 'string' };
}

export function synthesizeInputSchema(form) {
  const properties = {};
  const required = [];

  // form.elements = the form's listed elements, form-associated custom elements included.
  for (const el of form.elements) {
    if (!el.name || el.disabled || SKIP_TYPES.has(el.type)) continue;
    if (['fieldset', 'output', 'object'].includes(el.localName)) continue;

    const description = el.getAttribute('toolparamdescription');
    properties[el.name] = { ...(description ? { description } : {}), ...controlSchema(el) };
    if (el.required) required.push(el.name);
  }

  return { type: 'object', properties, ...(required.length ? { required } : {}) };
}
