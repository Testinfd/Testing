## Agent Instructions for Text-to-Handwriting Project

Welcome, Agent! This document provides guidance for working on the Text-to-Handwriting modernization project.

### Project Overview

The goal is to modernize a legacy text-to-handwriting application using a modern tech stack (Node.js/Express backend, React/TypeScript frontend) and enhance it with features like MathJax support for scientific notation and improved handwriting realism.

### Coding Conventions

1.  **TypeScript:**
    *   Use TypeScript for both frontend (`client/`) and backend (`server/`).
    *   Enable strict mode and aim for strong typing. Avoid `any` where possible.
    *   Follow standard TypeScript best practices.
2.  **React (Frontend):**
    *   Use functional components with Hooks.
    *   Use Emotion for CSS-in-JS. Ensure styled components are clearly named and co-located or organized logically.
    *   Keep components focused and reusable.
3.  **Node.js/Express (Backend):**
    *   Organize routes and controllers logically.
    *   Use async/await for asynchronous operations.
    *   Implement proper error handling.
4.  **Code Style:**
    *   Follow a consistent code style. ESLint and Prettier are set up (or should be if not already). Please ensure your contributions adhere to the linting rules.
    *   Write clear and concise comments where necessary, especially for complex logic.
5.  **Commit Messages:**
    *   Follow conventional commit message formats (e.g., `feat: Add SVG export functionality`, `fix: Correct alignment of inline math`).
6.  **Testing:**
    *   The file `/test/sample_physics.md` is provided for manual testing of text and MathJax rendering. Use it to verify changes.
    *   When adding new features or fixing bugs, consider if unit or integration tests are appropriate. (Formal test suite setup is a future step).

### Key Architectural Points

*   **Client-Side Rendering First:** The initial implementation focuses on client-side rendering of handwriting on an HTML canvas.
*   **MathJax:** MathJax v3 is used for LaTeX rendering. It's configured to output SVGs, which are then drawn onto the canvas or embedded in SVG exports.
*   **Realism:** Handwriting realism is achieved through:
    *   Handwriting-style fonts (e.g., "Gloria Hallelujah").
    *   Random character position and rotation variance.
    *   Variable line spacing.
    *   Styling MathJax SVGs (stroke, fill) to mimic a drawn look.
*   **Export Formats:** PNG, SVG, and PDF export are supported.
    *   PNG: Direct canvas data URL.
    *   SVG: Scene reconstructed as an SVG string with text elements and embedded MathJax SVGs.
    *   PDF: Canvas content drawn as an image onto a PDF page using `jsPDF`.
*   **Docker:** The application is containerized with Docker and Docker Compose for both frontend (Nginx serving static React build) and backend (Express server).

### Working with the Code

*   **Frontend:** Located in `client/`. Run `npm run dev` for development.
*   **Backend:** Located in `server/`. Run `npm run dev` for development.
*   **Docker:** Use `docker-compose up --build` from the project root to build and run both services.
    *   Frontend accessible at `http://localhost:3000`.
    *   Backend (if API is called directly) at `http://localhost:3001`.

### Backend API (Future Enhancement)

Currently, most logic is client-side. A future enhancement will be to move more processing to the backend:
*   An API endpoint to take text (with LaTeX) and return image data or parameters for rendering.
*   This will be important for performance with very long texts or for users with less powerful devices.
*   When implementing backend APIs, ensure they are clearly defined and documented.

### Important Considerations

*   **Performance:** Rendering character-by-character variations can be performance-intensive. Monitor for performance issues, especially with long texts.
*   **Cross-Browser Compatibility:** Test features across modern browsers.
*   **SVG Filter Effects:** The visual impact of complex SVG filters (like `feDisplacementMap`) can vary across SVG viewers/browsers. Prioritize stroke/fill styling for consistent MathJax appearance.
*   **Accessibility:** While the output is an image, consider ARIA attributes or alternative text descriptions if the application were to be deployed more widely.

If you have any questions or need clarification, please ask!
