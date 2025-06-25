import { mathjax } from 'mathjax-full/js/mathjax';
import { TeX } from 'mathjax-full/js/input/tex';
import { SVG } from 'mathjax-full/js/output/svg';
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html';

// Initialize MathJax
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: {'[+]': ['ams', 'newcommand', 'configmacros']},
  inlineMath: [['$', '$'], ['\\(', '\\)']],
  displayMath: [['$$', '$$'], ['\\[', '\\]']],
  processEscapes: true,
});

const svg = new SVG({
  fontCache: 'global', // 'local', 'global', or 'none'
  // exFactor: 0.5, // Adjust if baseline is off with custom fonts
});

export const mathjaxDocument = mathjax.document('', {
  InputJax: tex,
  OutputJax: svg,
});

/**
 * Typesets a LaTeX string into an SVG string.
 * @param latex The LaTeX string to typeset.
 * @param isDisplay True for display math, false for inline math.
 * @returns Promise<string> An SVG string.
 */
export const typesetLatexToSvgString = async (latex: string, isDisplay: boolean): Promise<string> => {
  const node = mathjaxDocument.convert(latex, {
    display: isDisplay,
    em: 16, // em-size in pixels
    ex: 8,  // ex-size in pixels
    containerWidth: 80 * 16, // width of container in pixels
  });
  return adaptor.innerHTML(node);
};

/**
 * Applies the handwriting filter CSS to MathJax SVG elements.
 * This is intended if you were to render SVGs directly into the DOM.
 * For canvas, this styling needs to be replicated by canvas operations.
 */
export const getMathJaxHandwritingStyle = () => `
  .mathjax-svg- handwriting { /* Custom class for our purpose */
    filter: url(#handwriting-filter); /* You'll need to define this SVG filter */
    stroke: currentColor; /* Or a specific color */
    stroke-width: 0.8;
    fill: none;
  }
`;

// Example of an SVG filter (you might need to adjust this)
// This should ideally be placed in your main App or an SVG definitions area
export const getHandwritingFilterDef = () => `
  <svg style="display:none;">
    <defs>
      <filter id="handwriting-filter">
        <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="1" result="turbulence"/>
        <feDisplacementMap in2="turbulence" in="SourceGraphic" scale="1.5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>
  </svg>
`;

// Function to convert SVG string to a data URL for use in canvas
export const svgStringToDataURL = (svgString: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // For a direct SVG string, we need to make sure it's properly encoded and formed for a data URL
    const completeSvg = `<svg xmlns="http://www.w3.org/2000/svg">${svgString}</svg>`;
    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(completeSvg)))}`;
    resolve(dataUrl);

    // Alternative: If MathJax output includes <svg> tags already, use that directly:
    // const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    // resolve(dataUrl);
  });
};

// Function to load an image from a data URL
export const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = dataUrl;
  });
};
console.log('MathJax service initialized');
mathjaxDocument.options.outputJax.setScale(1); // Try to keep scale normal
mathjax.startup = {
  typesetClear() {
    this.document.clear();
    this.document.updateDocument();
  },
  typesetPromise(elements = null) { // elements is not used in this custom setup
    this.document.reset();
    this.document.render();
    return Promise.resolve();
  }
};

// Call ready method (not strictly necessary for this manual setup but good practice)
mathjax.ready();
console.log('MathJax ready method called.');

// The default MathJax packages (concatenated)
// We might need to adjust this based on what `mathjax-full/js/input/tex/AllPackages.js` includes
// For now, using what's in the TeX config: {'[+]': ['ams', 'newcommand', 'configmacros']}
// If specific packages are missing, errors will appear in console or rendering.
// Example: tex: { packages: AllPackages.concat(['require', 'autoload']) }
// from https://github.com/mathjax/MathJax-demos-node/blob/master/direct/tex2svg
// For now, the above TeX config should be sufficient.
