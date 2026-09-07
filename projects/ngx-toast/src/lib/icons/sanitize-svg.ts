/** Attributes that can execute script no matter what element they sit on. */
const EVENT_HANDLER = /^on/i;

/** Values that smuggle script into an otherwise inert attribute. */
const SCRIPT_URL = /^\s*javascript:/i;

/** Elements that can execute script or embed arbitrary HTML inside an SVG document. */
const FORBIDDEN_ELEMENTS = new Set(['script', 'foreignobject']);

/** Elements whose href may reach outside the document, and so has to be a local fragment. */
const REFERENCING_ELEMENTS = new Set(['use', 'image', 'a']);

const HREF_ATTRIBUTES = ['href', 'xlink:href'];

/**
 * Parses remote SVG markup and strips anything script-capable: `<script>`, `<foreignObject>`,
 * `on*` handlers, `javascript:` values, and references that leave the document.
 *
 * Returns null when the input is not a well-formed `<svg>` document, so callers can fall back
 * to the built-in icon rather than rendering something half-parsed.
 */
export function sanitizeSvg(markup: string): string | null {
  const document = new DOMParser().parseFromString(markup, 'image/svg+xml');

  if (document.querySelector('parsererror')) {
    return null;
  }

  const root = document.documentElement;

  if (!root || root.nodeName.toLowerCase() !== 'svg') {
    return null;
  }

  scrub(root);

  return new XMLSerializer().serializeToString(root);
}

/** Depth-first removal of every script-capable element and attribute. */
function scrub(element: Element): void {
  for (const child of Array.from(element.children)) {
    if (FORBIDDEN_ELEMENTS.has(child.nodeName.toLowerCase())) {
      child.remove();
      continue;
    }

    scrub(child);
  }

  const isReferencing = REFERENCING_ELEMENTS.has(element.nodeName.toLowerCase());

  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();

    if (EVENT_HANDLER.test(name) || SCRIPT_URL.test(attribute.value)) {
      element.removeAttribute(attribute.name);
      continue;
    }

    // A <use href="#symbol"> is the whole point of an SVG sprite; anything else can fetch.
    if (isReferencing && HREF_ATTRIBUTES.includes(name) && !attribute.value.startsWith('#')) {
      element.removeAttribute(attribute.name);
    }
  }
}
