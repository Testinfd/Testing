import {
  addFontFromFile,
  formatText,
  addPaperFromFile
} from './utils/helpers.mjs';
import {
  generateImages,
  downloadAsPDF,
  deleteAll
} from './generate-images.mjs';
import { setInkColor, toggleDrawCanvas } from './utils/draw.mjs';
import './utils/math-renderer.mjs'; // Load MathJax

// DOM Element Cache
const pageEl = document.querySelector('.page-a');
const paperContentEl = document.querySelector('.page-a .paper-content');
const handwritingFontSelect = document.querySelector('#handwriting-font');
const fontSizeInput = document.querySelector('#font-size');
const letterSpacingInput = document.querySelector('#letter-spacing');
const wordSpacingInput = document.querySelector('#word-spacing');
const topPaddingInput = document.querySelector('#top-padding');
const inkColorSelect = document.querySelector('#ink-color');
const paperMarginToggle = document.querySelector('#paper-margin-toggle');
const paperLineToggle = document.querySelector('#paper-line-toggle');
const pageEffectsSelect = document.querySelector('#page-effects');
const resolutionSelect = document.querySelector('#resolution');
// Add other elements as needed

// Initial Settings State
export const settingsState = {
  handwritingFont: "'Homemade Apple', cursive",
  fontSize: 10, // pt
  letterSpacing: 0, // px
  wordSpacing: 0, // px
  inkColor: '#000f55',
  topPadding: 5, // px
  paperMargin: true,
  paperLines: true,
  pageEffects: 'shadows',
  resolution: 2,
  // page size is A4 by default and not changeable by user currently
};

// Function to apply settings from state to the preview
function applySettingsToPreview() {
  document.body.style.setProperty('--handwriting-font', settingsState.handwritingFont);
  pageEl.style.fontSize = `${settingsState.fontSize}pt`;
  pageEl.style.letterSpacing = `${settingsState.letterSpacing}px`;
  pageEl.style.wordSpacing = `${settingsState.wordSpacing}px`;
  document.body.style.setProperty('--ink-color', settingsState.inkColor);
  if (paperContentEl) { // paperContentEl might not exist in tests or if HTML structure changes
    paperContentEl.style.paddingTop = `${settingsState.topPadding}px`;
  }

  if (settingsState.paperMargin) {
    pageEl.classList.add('margined');
  } else {
    pageEl.classList.remove('margined');
  }

  if (settingsState.paperLines) {
    pageEl.classList.add('lines');
  } else {
    pageEl.classList.remove('lines');
  }
  // For pageEffects and resolution, they are primarily used during image generation,
  // but if they had direct preview effects, they would be applied here.
}

// Update UI from State (e.g., on load or if state is manipulated externally)
function updateUIToReflectState() {
  if (handwritingFontSelect) handwritingFontSelect.value = settingsState.handwritingFont;
  if (fontSizeInput) fontSizeInput.value = settingsState.fontSize;
  if (letterSpacingInput) letterSpacingInput.value = settingsState.letterSpacing;
  if (wordSpacingInput) wordSpacingInput.value = settingsState.wordSpacing;
  if (topPaddingInput) topPaddingInput.value = settingsState.topPadding;
  if (inkColorSelect) inkColorSelect.value = settingsState.inkColor;
  if (paperMarginToggle) paperMarginToggle.checked = settingsState.paperMargin;
  if (paperLineToggle) paperLineToggle.checked = settingsState.paperLines;
  if (pageEffectsSelect) pageEffectsSelect.value = settingsState.pageEffects;
  if (resolutionSelect) resolutionSelect.value = settingsState.resolution;
}


/**
 * Add event listeners here, they will be automatically mapped with addEventListener later
 */
const EVENT_MAP = {
  '#generate-image-form': {
    on: 'submit',
    action: (e) => {
      e.preventDefault();
      generateImages(settingsState); // Pass current settings to generateImages
    }
  },
  '#handwriting-font': {
    on: 'change',
    action: (e) => {
      settingsState.handwritingFont = e.target.value;
      applySettingsToPreview();
    }
  },
  '#font-size': {
    on: 'change',
    action: (e) => {
      const value = parseFloat(e.target.value);
      if (value > 30) {
        alert('Font-size is too big try upto 30');
        e.target.value = settingsState.fontSize; // Reset to old value
      } else {
        settingsState.fontSize = value;
        applySettingsToPreview();
      }
    }
  },
  '#letter-spacing': {
    on: 'change',
    action: (e) => {
      const value = parseFloat(e.target.value);
      if (value > 40) {
        alert('Letter Spacing is too big try a number upto 40');
        e.target.value = settingsState.letterSpacing; // Reset to old value
      } else {
        settingsState.letterSpacing = value;
        applySettingsToPreview();
      }
    }
  },
  '#word-spacing': {
    on: 'change',
    action: (e) => {
      const value = parseFloat(e.target.value);
      if (value > 100) {
        alert('Word Spacing is too big try a number upto hundred');
        e.target.value = settingsState.wordSpacing; // Reset to old value
      } else {
        settingsState.wordSpacing = value;
        applySettingsToPreview();
      }
    }
  },
  '#top-padding': {
    on: 'change',
    action: (e) => {
      settingsState.topPadding = parseFloat(e.target.value);
      applySettingsToPreview();
    }
  },
  '#font-file': {
    on: 'change',
    action: (e) => addFontFromFile(e.target.files[0]) // This util might need adjustment if it directly manipulates styles
  },
  '#ink-color': {
    on: 'change',
    action: (e) => {
      settingsState.inkColor = e.target.value;
      applySettingsToPreview();
      setInkColor(settingsState.inkColor); // For draw canvas
    }
  },
  '#paper-margin-toggle': {
    on: 'change',
    action: (e) => {
      settingsState.paperMargin = e.target.checked;
      applySettingsToPreview();
    }
  },
  '#paper-line-toggle': {
    on: 'change',
    action: (e) => {
      settingsState.paperLines = e.target.checked;
      applySettingsToPreview();
    }
  },
   '#page-effects': {
    on: 'change',
    action: (e) => {
      settingsState.pageEffects = e.target.value;
      // No direct preview change, used at generation time
    }
  },
  '#resolution': {
    on: 'change',
    action: (e) => {
      settingsState.resolution = parseFloat(e.target.value);
      // No direct preview change, used at generation time
    }
  },
  '#draw-diagram-button': {
    on: 'click',
    action: () => {
      toggleDrawCanvas();
    }
  },
  '.draw-container .close-button': {
    on: 'click',
    action: () => {
      toggleDrawCanvas();
    }
  },
  '#download-as-pdf-button': {
    on: 'click',
    action: () => {
      downloadAsPDF();
    }
  },
  '#delete-all-button': {
    on: 'click',
    action: () => {
      deleteAll();
    }
  },
  '.page-a .paper-content': {
    on: 'paste',
    action: formatText
  },
  '#paper-file': {
    on: 'change',
    action: (e) => addPaperFromFile(e.target.files[0])
  }
};

for (const eventSelector in EVENT_MAP) {
  document
    .querySelector(eventSelector)
    .addEventListener(
      EVENT_MAP[eventSelector].on,
      EVENT_MAP[eventSelector].action
    );
}

/**
 * This makes toggles, accessible.
 */
document.querySelectorAll('.switch-toggle input').forEach((toggleInput) => {
  toggleInput.addEventListener('change', (e) => {
    if (toggleInput.checked) {
      document.querySelector(
        `label[for="${toggleInput.id}"] .status`
      ).textContent = 'on';
      toggleInput.setAttribute('aria-checked', true);
    } else {
      toggleInput.setAttribute('aria-checked', false);
      document.querySelector(
        `label[for="${toggleInput.id}"] .status`
      ).textContent = 'off';
    }
  });
});

/**
 * GitHub Contributors fetching was removed as the corresponding HTML section was removed.
 */

// Theme Toggling Logic
function toggleTheme(toggleButton) {
  if (document.body.classList.contains('dark')) {
    document.body.classList.add('fade-in-light');
    document.body.classList.remove('dark');
    document.body.classList.remove('fade-in-dark');
    window.localStorage.setItem('prefers-theme', 'light');
    if (toggleButton) {
      toggleButton.setAttribute('aria-pressed', false);
      toggleButton.setAttribute('aria-label', 'Activate Dark Mode');
    }
  } else {
    document.body.classList.add('fade-in-dark');
    document.body.classList.add('dark');
    document.body.classList.remove('fade-in-light');
    window.localStorage.setItem('prefers-theme', 'dark');
    if (toggleButton) {
      toggleButton.setAttribute('aria-pressed', true);
      toggleButton.setAttribute('aria-label', 'Activate Light Mode');
    }
  }
}

// Initialize theme based on preference
const localPreference = window.localStorage.getItem('prefers-theme');
const themeToggleButton = document.getElementById('theme-toggle-button');

if (localPreference) {
  if (localPreference === 'light') {
    document.body.classList.remove('dark');
    if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', false);
  } else {
    document.body.classList.add('dark');
    if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', true);
  }
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.body.classList.add('dark');
  if (themeToggleButton) themeToggleButton.setAttribute('aria-pressed', true);
}

// Add event listener for the theme toggle button
if (themeToggleButton) {
  themeToggleButton.addEventListener('click', () => toggleTheme(themeToggleButton));
}

import { renderLaTeXToSVG } from './utils/math-renderer.mjs'; // Import the rendering function

// Initial UI and Preview Setup on Load
document.addEventListener('DOMContentLoaded', async () => { // Make async for await
  updateUIToReflectState();
  applySettingsToPreview();
  // Initialize ink color for drawing canvas as well
  setInkColor(settingsState.inkColor);

  // Proof of Concept: Render a hardcoded LaTeX string and append to notes
  // paperContentEl is cached at the top of the file
  if (paperContentEl) {
    const latexString = 'x^2 + y^2 = z^2';
    const svgElement = await renderLaTeXToSVG(latexString);
    if (svgElement) {
      // For display math, it's often better to wrap it in a div
      const wrapperDiv = document.createElement('div');
      wrapperDiv.style.textAlign = 'center'; // Example styling
      wrapperDiv.appendChild(svgElement);
      paperContent.appendChild(wrapperDiv);

      // Add some text before and after to test layout
      const textBefore = document.createElement('p');
      textBefore.textContent = "Here is some math: ";
      paperContent.insertBefore(textBefore, wrapperDiv);

      const textAfter = document.createElement('p');
      textAfter.textContent = "And that was the math.";
      paperContent.appendChild(textAfter);

    } else {
      console.error('POC: Failed to render LaTeX string.');
    }
  }
});
