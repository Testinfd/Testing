/**
 * Generates random variances for character position and rotation.
 * @returns {{x: number, y: number, rotation: number}}
 */
export const getPositionVariance = (): { x: number; y: number; rotation: number } => {
  return {
    x: (Math.random() * 0.3) - 0.15, // Small x offset
    y: (Math.random() * 0.4) - 0.2, // Small y offset
    rotation: (Math.random() * 2) - 1, // Small rotation in degrees (-1 to +1 degrees)
  };
};

/**
 * Calculates a variable line spacing.
 * @param baseSpacing The base line height.
 * @returns {number} The adjusted line height.
 */
export const getVariableLineSpacing = (baseSpacing: number): number => {
  return baseSpacing * (0.95 + (Math.random() * 0.1)); // +/- 5% variation
};

/**
 * Applies a handwriting-like effect to a canvas 2D context for drawing MathJax SVGs.
 * This tries to mimic the CSS `filter: url(#handwriting-filter); stroke: currentColor; stroke-width: 0.8; fill: none;`
 * @param ctx The canvas rendering context.
 * @param color The color for the stroke.
 */
export const applyMathHandwritingStyleToContext = (ctx: CanvasRenderingContext2D, color: string) => {
  // The `filter` property on canvas is more direct than full SVG filters.
  // It might not perfectly replicate the SVG filter but can add some distortion.
  // Example: ctx.filter = 'url(#handwriting-filter)'; // If the filter is defined in an SVG in HTML.
  // Or, for more direct canvas effects:
  // ctx.filter = 'blur(0.3px)'; // A very slight blur can sometimes help.

  // For stroke and fill:
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.8; // Corresponds to stroke-width
  // For 'fill: none;', we simply don't call ctx.fill() when drawing the paths from SVG.
  // However, when drawing an SVG image via drawImage, the SVG's internal fill/stroke are used.
  // To achieve 'fill: none' for an SVG image, the SVG itself must be styled that way.

  // Note: Applying complex SVG filters like feTurbulence directly to canvas `drawImage`
  // is not straightforward. The SVG needs to have the filter applied internally,
  // or we draw element by element if we parse the SVG.
};

/**
 * Modifies an SVG string to include handwriting styles (stroke, fill, filter).
 * @param svgString The original SVG string from MathJax.
 * @param color The stroke color.
 * @param filterId The ID of an SVG filter to apply (e.g., "handwriting-filter").
 * @returns The modified SVG string.
 */
export const styleSvgForHandwriting = (svgString: string, color: string, filterId?: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svgElement = doc.documentElement as SVGElement;

  // Apply styles to all path elements, or to the root SVG element to inherit
  // MathJax SVGs usually have a <g> element that is styled.
  const gElements = svgElement.querySelectorAll('g');
  gElements.forEach(g => {
    g.style.stroke = color;
    g.style.strokeWidth = '0.8';
    g.style.fill = 'none';
    if (filterId) {
      g.style.filter = `url(#${filterId})`;
    }
  });

  // If no <g> elements, try styling paths directly (less common for MathJax structure)
  if (gElements.length === 0) {
    const pathElements = svgElement.querySelectorAll('path');
    pathElements.forEach(path => {
      path.style.stroke = color;
      path.style.strokeWidth = '0.8';
      path.style.fill = 'none';
      if (filterId) {
        path.style.filter = `url(#${filterId})`;
      }
    });
  }


  // Make sure the main SVG element itself doesn't have conflicting fill/stroke
  svgElement.style.fill = 'none';
  // svgElement.style.stroke = 'none'; // Don't set stroke on root, let children handle it

  return new XMLSerializer().serializeToString(doc.documentElement);
};
