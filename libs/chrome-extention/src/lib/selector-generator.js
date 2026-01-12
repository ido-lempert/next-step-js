// CSS Selector Generator
// Generates unique, stable CSS selectors for DOM elements

/**
 * Generate a CSS selector for an element
 * Priority: ID > data attributes > unique classes > nth-child path
 */
export function generateSelector(element) {
  if (!element || !(element instanceof Element)) {
    return '';
  }

  // Try ID first (most stable)
  if (element.id) {
    const selector = `#${CSS.escape(element.id)}`;
    if (isUnique(selector)) {
      return selector;
    }
  }

  // Try data attributes (very stable for modern apps)
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-')) {
      const selector = `[${attr.name}="${CSS.escape(attr.value)}"]`;
      if (isUnique(selector)) {
        return selector;
      }
    }
  }

  // Try unique class combination
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(Boolean);
    if (classes.length > 0) {
      const selector = '.' + classes.map((c) => CSS.escape(c)).join('.');
      if (isUnique(selector)) {
        return selector;
      }
    }
  }

  // Try combining tag with classes
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(Boolean);
    if (classes.length > 0) {
      const tag = element.tagName.toLowerCase();
      const selector = tag + '.' + classes.map((c) => CSS.escape(c)).join('.');
      if (isUnique(selector)) {
        return selector;
      }
    }
  }

  // Fallback: build path with nth-child (least stable but always works)
  return buildNthChildPath(element);
}

/**
 * Check if a selector is unique in the document
 */
function isUnique(selector) {
  try {
    return document.querySelectorAll(selector).length === 1;
  } catch {
    // Invalid selector
    return false;
  }
}

/**
 * Build a selector path using nth-child (fallback method)
 */
function buildNthChildPath(element) {
  const path = [];
  let current = element;

  while (current && current !== document.body && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase();
    
    // If element has an ID, use it and stop
    if (current.id) {
      path.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    // Calculate nth-child index
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => child.tagName === current.tagName
      );
      const index = siblings.indexOf(current) + 1;
      
      if (siblings.length > 1) {
        path.unshift(`${tag}:nth-of-type(${index})`);
      } else {
        path.unshift(tag);
      }
    } else {
      path.unshift(tag);
    }

    current = parent;
  }

  return path.join(' > ');
}

/**
 * Get meaningful text content from an element
 */
export function getElementText(element) {
  // For input elements, try to get label or placeholder
  if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
    // Try aria-label
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }
    
    // Try placeholder
    if (element.placeholder) {
      return element.placeholder;
    }
    
    // Try associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label && label.textContent) {
        return label.textContent.trim();
      }
    }
    
    // Try parent label
    const parentLabel = element.closest('label');
    if (parentLabel && parentLabel.textContent) {
      return parentLabel.textContent.trim();
    }
    
    return element.name || element.type || 'input field';
  }

  // For buttons and links, get text content
  if (element.tagName === 'BUTTON' || element.tagName === 'A') {
    const text = element.textContent?.trim();
    if (text) {
      return text;
    }
    
    // Try aria-label
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }
    
    // Try title
    if (element.title) {
      return element.title;
    }
  }

  // For other elements, get text content
  const text = element.textContent?.trim();
  if (text && text.length < 50) {
    return text;
  }

  // Fallback to tag name
  return element.tagName.toLowerCase();
}

/**
 * Validate that a selector still works and is unique
 */
export function validateSelector(selector) {
  try {
    const elements = document.querySelectorAll(selector);
    return elements.length === 1;
  } catch {
    return false;
  }
}
