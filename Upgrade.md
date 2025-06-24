**Project Modernization Request: Text-to-Handwriting Tool with Scientific Notation Support**

**Core Objectives:**
1. Modernize legacy HTML/CSS/Java stack using contemporary frameworks
2. Add robust math/science notation support (LaTeX-based)
3. Enhance handwriting realism through controlled inconsistencies
4. Maintain core functionality while upgrading architecture
5. Create self-contained test cases for scientific content

**Technical Specifications:**

**1. Tech Stack Migration:**
- Replace legacy Java with **Node.js + Express** backend
- Implement modern frontend using **React + TypeScript** (Vite build system)
- Use **CSS-in-JS** (Emotion/Styled Components) for styling
- Containerize with **Docker** for portability

**2. Math Rendering System:**
- Implement **MathJax v3** with SVG output (prioritize font adaptability)
- Support both inline (`$...$`) and display (`$$...$$`) LaTeX math
- Create custom handwriting-matching CSS for rendered math:
  ```css
  .mathjax-svg {
    filter: url(#handwriting-filter);
    stroke: currentColor;
    stroke-width: 0.8;
    fill: none;
  }
  ```

**3. Realism Enhancements:**
- Implement variability algorithms:
  ```ts
  // Character position randomization
  const getPositionVariance = () => ({
    x: (Math.random() * 0.3) - 0.15,
    y: (Math.random() * 0.4) - 0.2,
    rotation: (Math.random() * 6) - 3
  });
  
  // Line spacing variability
  const lineSpacing = baseSpacing * (0.9 + (Math.random() * 0.2));
  ```

**4. Feature Retention & Optimization:**
- Preserve core text-to-image conversion logic
- Implement canvas-based rendering instead of DOM manipulation
- Add export options: SVG, PNG, and PDF with resolution controls

**5. Test Case Requirements:**
- Create `/test/sample_physics.md` containing:
  ```latex
  ### Quantum Mechanics Assignment
  Solve Schrödinger's equation for $\Psi(x,t)$:
  
  $$i\hbar\frac{\partial}{\partial t}\Psi(x,t) = \left[ -\frac{\hbar^2}{2m}\nabla^2 + V(x,t) \right]\Psi(x,t)$$
  
  Calculate expectation values for $\langle x \rangle$ and $\langle p \rangle$ given:
  $$\Psi(x,0) = \sqrt{\frac{1}{a\sqrt{\pi}}} e^{-x^2/2a^2}$$
  
  [Additional physics problems...]
  ```

**Implementation Guidelines:**
1. Phase 1: Create modern project scaffolding
2. Phase 2: Migrate core conversion logic with TypeScript refactoring
3. Phase 3: Integrate MathJax with handwriting styling
4. Phase 4: Implement realism algorithms
5. Phase 5: Build export pipeline and testing harness

**MathJax Configuration Rationale:**
- Prioritize SVG output for CSS manipulability
- Enable font adaptation via `chtml` output when needed
- Use web fonts instead of image-based math rendering
- Implement caching for LaTeX compilation

**Deliverables:**
1. Modernized codebase in dedicated repository
2. Realistic handwriting output with math support
3. Test suite including scientific notations
4. Dockerized build environment
5. Performance benchmark vs original implementation
   
