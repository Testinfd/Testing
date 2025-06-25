# Text-to-Handwriting Modernization Project

This project is a modernized version of a text-to-handwriting tool, designed to convert typed text, including mathematical and scientific notations (via LaTeX), into a realistic handwritten image.

## Features

*   **Modern Tech Stack:**
    *   Backend: Node.js with Express
    *   Frontend: React with TypeScript, built with Vite
    *   Styling: CSS-in-JS (Emotion)
*   **Math & Science Notation:** Robust LaTeX support using MathJax v3 for both inline (`$...$`) and display (`$$...$$`) math.
*   **Realistic Handwriting:**
    *   Uses handwriting-style web fonts.
    *   Applies character position and rotation randomization.
    *   Implements variable line spacing.
    *   Styles MathJax output to match the handwritten aesthetic.
*   **Canvas-Based Rendering:** Text and math are rendered onto an HTML canvas for dynamic image generation.
*   **Export Options:**
    *   PNG: Export the current view as a PNG image.
    *   SVG: Export the current view as an SVG document (text elements + embedded MathJax SVGs).
    *   PDF: Export the current view as a PDF document (canvas content rendered as an image).
*   **Containerized:** Dockerized frontend and backend services orchestrated with Docker Compose.

## Project Structure

```
.
├── client/         # React/TypeScript frontend application
│   ├── public/
│   ├── src/
│   ├── Dockerfile  # Dockerfile for client
│   └── ...
├── server/         # Node.js/Express backend application
│   ├── src/
│   ├── Dockerfile  # Dockerfile for server
│   └── ...
├── test/
│   └── sample_physics.md # Sample file with LaTeX for testing
├── AGENTS.md       # Instructions for AI development agents
├── docker-compose.yml # Docker Compose configuration
└── README.md       # This file
```

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm
*   Docker Desktop (or Docker Engine + Docker Compose)

### Development Setup

1.  **Clone the repository (if applicable).**

2.  **Backend Setup:**
    ```bash
    cd server
    npm install
    npm run dev
    ```
    The backend server will start, typically on `http://localhost:3001`.

3.  **Frontend Setup:**
    ```bash
    cd client
    npm install
    npm run dev
    ```
    The frontend development server will start, typically on `http://localhost:5173` (Vite's default) or another port if configured.

### Running with Docker

This is the recommended way to run the application for a production-like environment or for easy setup.

1.  **Ensure Docker is running.**
2.  **Build and run the services using Docker Compose:**
    From the project root directory:
    ```bash
    docker-compose up --build
    ```
    *   The `--build` flag is only needed the first time or if you make changes to Dockerfiles or dependencies.
    *   To run in detached mode (in the background): `docker-compose up -d --build`

3.  **Access the application:**
    *   Frontend: Open your browser and navigate to `http://localhost:3000` (or the port mapped in `docker-compose.yml`).
    *   Backend API (if accessed directly): Available at `http://localhost:3001`.

    **Note on Frontend-Backend Communication in Docker:**
    The frontend (served by Nginx on port 3000) makes API calls to the backend. When running via Docker Compose, if these calls are made from the user's browser to `http://localhost:3001`, it will correctly reach the backend container due to port mapping. If future changes involve the frontend *server* (Nginx) needing to proxy or directly call the backend, the URL `http://backend:3001` should be used (referring to the service name in `docker-compose.yml`).

### Using the Application

1.  Open the application in your browser.
2.  Type or paste text into the input area.
    *   For inline math, use `$ ... $`. Example: `Einstein's equation is $E=mc^2$.`
    *   For display math, use `$$ ... $$`. Example: `$$ \int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi} $$`
3.  The handwritten output will appear in the preview area.
4.  Use the "Export as PNG", "Export as SVG", or "Export as PDF" buttons to download the generated image.

### Test Content

A sample file with various LaTeX examples is available at `/test/sample_physics.md`. You can copy-paste content from this file into the application to test the rendering capabilities.

## Future Enhancements (Potential)

*   **Backend API for Rendering:** Move core rendering logic to the backend for improved performance with large inputs and to support users with less powerful devices.
*   **Font Selection:** Allow users to choose from multiple handwriting fonts.
*   **Color Options:** Allow users to customize text and background colors.
*   **Advanced Export Controls:** More options for PNG/PDF resolution, SVG scaling.
*   **Saving/Loading:** Ability to save work and load it later.
*   **Formal Test Suite:** Implementation of unit and integration tests.

## Contributing

Contributions are welcome! Please follow the guidelines in `AGENTS.md` if you are an AI agent, or standard open-source contribution practices if you are a human.
(Further details on contributing can be added here, e.g., code of conduct, pull request process).
