import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies, increase limit for potentially large text/latex
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Simple test route
app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server is running!');
});

// --- API Routes for Rendering ---
const apiRouter = express.Router();

// Placeholder for text processing function (would eventually do the rendering)
const processTextForOutput = async (text: string, format: 'png' | 'svg' | 'pdf') => {
  // In a real implementation, this would involve:
  // 1. Setting up a canvas environment (e.g., node-canvas)
  // 2. Running MathJax in Node.js
  // 3. Applying realism algorithms
  // 4. Generating the output in the specified format
  console.log(`Backend received request to render text to ${format}: "${text.substring(0, 50)}..."`);

  if (format === 'png') {
    // For now, return a placeholder response or error
    // In a real scenario, you'd send image data with 'Content-Type: image/png'
    return { error: 'PNG rendering not yet implemented on backend', data: null };
  } else if (format === 'svg') {
    // Placeholder SVG
    return { error: null, data: `<svg width="100" height="50" xmlns="http://www.w3.org/2000/svg"><text x="10" y="30">Backend SVG: ${text.substring(0,20)}</text></svg>` };
  } else if (format === 'pdf') {
    // Placeholder for PDF
    return { error: 'PDF rendering not yet implemented on backend', data: null };
  }
  return { error: `Invalid format: ${format}`, data: null };
};

apiRouter.post('/render/:format(png|svg|pdf)', async (req: Request, res: Response) => {
  const { text } = req.body;
  const format = req.params.format as 'png' | 'svg' | 'pdf';

  if (!text) {
    return res.status(400).json({ error: 'Missing "text" in request body' });
  }

  try {
    const result = await processTextForOutput(text, format);
    if (result.error) {
      // If it's a 'not implemented' error, we might send a different status code
      // For now, sending 501 (Not Implemented) for such cases.
      if (result.error.includes("not yet implemented")) {
        return res.status(501).json({ error: result.error });
      }
      return res.status(500).json({ error: result.error });
    }

    if (format === 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      res.send(result.data);
    } else if (format === 'png') {
      // res.setHeader('Content-Type', 'image/png');
      // res.send(Buffer.from(result.data, 'base64')); // Example if data was base64
      res.status(501).json({ error: 'PNG direct response not yet implemented' });
    } else if (format === 'pdf') {
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'attachment; filename=handwriting.pdf');
      // res.send(result.data); // Example if data was PDF buffer
      res.status(501).json({ error: 'PDF direct response not yet implemented' });
    } else {
      res.status(400).json({ error: 'Invalid format specified' });
    }
  } catch (error) {
    console.error(`Error processing /render/${format}:`, error);
    res.status(500).json({ error: 'Failed to process rendering request' });
  }
});

app.use('/api', apiRouter); // Mount the API router

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`[server]: API endpoints available under /api`);
});
