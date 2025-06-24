// This will load MathJax and configure it for TeX input and SVG output.
// It makes the MathJax global object available.
import 'mathjax/es5/tex-svg.js';

// Basic function to convert a LaTeX string to an SVG string or element
// This will need to be asynchronous as MathJax rendering is typically async.
export async function renderLaTeXToSVG(latexString, isDisplayMode = true) {
  if (!window.MathJax || !window.MathJax.tex2svgPromise) {
    console.error('MathJax or tex2svgPromise not available. Waiting for startup...');
    // Wait for MathJax to be fully initialized
    if (window.MathJax && window.MathJax.startup && window.MathJax.startup.promise) {
      await window.MathJax.startup.promise;
    } else {
      // Fallback delay if startup.promise isn't immediately available, or retry mechanism
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait a bit and hope it initializes
      if (!window.MathJax || !window.MathJax.tex2svgPromise) {
        console.error('MathJax still not initialized after delay.');
        return null;
      }
    }
  }

  try {
    const mathJaxNode = await window.MathJax.tex2svgPromise(latexString, { display: isDisplayMode });
    // mathJaxNode is an HTML <mjx-container> element containing the SVG.
    const svgElement = mathJaxNode.querySelector('svg');
    if (svgElement) {
      // Optionally, set some attributes to help with styling or identification
      svgElement.setAttribute('class', 'rendered-math-svg');
      svgElement.style.maxWidth = '100%'; // Ensure it's responsive
      // The default fill color for MathJax SVG output is 'currentColor'.
      // So, it should inherit the text color from its parent in the handwriting preview.
      // We can refine styling later in Phase 3.
      return svgElement; // Return the DOM element
    }
    console.warn('SVG element not found in MathJax output for:', latexString);
    return null;
  } catch (error) {
    console.error('Error rendering LaTeX with MathJax:', error, 'Input:', latexString);
    return null;
  }
}

// Example of how to get it configured (usually done by the imported script)
// We might need to access MathJax.startup.promise to ensure it's fully ready
// before first render, or to re-configure if needed.

/*
MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    packages: {'[+]': ['ams', 'newcommand', 'require', 'unicode', 'color']} // Add packages as needed
  },
  svg: {
    fontCache: 'global', // or 'local' or 'none'
    scale: 1,            // Global scaling factor for all expressions
    minScale: .5         // Smallest scaling factor to use
  },
  startup: {
    ready: () => {
      console.log('MathJax is ready to go!');
      MathJax.startup.defaultReady();
    }
  }
};
*/

// The import 'mathjax/es5/tex-svg.js' should handle the default configuration.
// We can override MathJax.config before this import or use MathJax.startup.promise.then(() => MathJax.config Amerikaanse...)

console.log('math-renderer.mjs loaded, MathJax should be initializing...');

// Placeholder for more advanced configuration if needed
export function configureMathJax(options) {
  if (window.MathJax && window.MathJax.config) {
    // Potentially merge options into MathJax.config
    // This is complex and needs to be done carefully, usually before MathJax fully starts.
    // For now, we rely on the defaults from tex-svg.js.
    console.log('MathJax config exists, advanced configuration would go here.');
  }
}
