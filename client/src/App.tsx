import { useState, useRef, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { jsPDF } from 'jspdf';
import { typesetLatexToSvgString, svgStringToDataURL, loadImage, getHandwritingFilterDef } from './mathjax-service';
import { getPositionVariance, getVariableLineSpacing, styleSvgForHandwriting } from './realism-service';

// Removed reactLogo import as it's not used in the new layout
// import reactLogo from './assets/react.svg'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  padding: 20px;
  box-sizing: border-box;
`;

const Title = styled.h1`
  color: #333;
  font-family: 'Arial', sans-serif;
`;

const TextArea = styled.textarea`
  width: 80%;
  max-width: 600px;
  height: 150px;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 16px;
`;

const OutputArea = styled.div`
  width: 80%;
  max-width: 600px;
  height: 400px;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto; // For scroll if content is too large
`;

const Controls = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const StyledCanvas = styled.canvas`
  display: block; // Prevents extra space below canvas
`;

// Helper to parse text into segments of plain text and LaTeX
const parseTextSegments = (text: string): Array<{ type: 'text' | 'latex'; content: string; display: boolean }> => {
  const segments: Array<{ type: 'text' | 'latex'; content: string; display: boolean }> = [];
  // Regex to find $...$ (inline) or $$...$$ (display)
  // It needs to be non-greedy and handle escaped delimiters if necessary (not handled here for simplicity)
  const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add preceding text segment
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.substring(lastIndex, match.index), display: false });
    }
    // Add LaTeX segment
    const latexContent = match[0];
    const isDisplay = latexContent.startsWith('$$');
    segments.push({
      type: 'latex',
      content: latexContent.substring(isDisplay ? 2 : 1, latexContent.length - (isDisplay ? 2 : 1)),
      display: isDisplay,
    });
    lastIndex = regex.lastIndex;
  }

  // Add any remaining text segment
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.substring(lastIndex), display: false });
  }
  return segments;
};


function App() {
  const [text, setText] = useState(
    "Hello, world! Let's try some inline math: $E = mc^2$.\n" +
    "And now for some display math:\n" +
    "$$ \sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6} $$\n" +
    "Text can continue after display math. And more inline: $\\alpha + \\beta = \\gamma$."
  );
  const [useServerSideRendering, setUseServerSideRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputAreaRef = useRef<HTMLDivElement | null>(null);
  const svgFilterDefinition = getHandwritingFilterDef(); // Get the SVG filter string
  const baseFontSize = 22; // Slightly larger for handwriting
  const baseFontFamily = "'Gloria Hallelujah', cursive";

  const drawOnCanvas = useCallback(async (exportMode?: 'svg') => {
    const outputDiv = outputAreaRef.current;
    if (!outputDiv) return "";

    const { width: sceneWidth, height: sceneHeight } = outputDiv.getBoundingClientRect();
    let svgElements: string[] = [];
    const textStyle = `font-family: ${baseFontFamily}; font-size: ${baseFontSize}px; fill: black; white-space: pre;`;
    let ctx: CanvasRenderingContext2D | null = null;

    if (exportMode === 'svg') {
      svgElements.push(`<defs>${svgFilterDefinition}</defs>`);
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return "";
      ctx = canvas.getContext('2d');
      if (!ctx) return "";

      canvas.width = sceneWidth;
      canvas.height = sceneHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.font = `${baseFontSize}px ${baseFontFamily}`;
      ctx.textBaseline = 'top';
    }

    const lines = text.split('\n');
    let currentX = 10;
    let currentY = 10;
    const baseLineHeight = baseFontSize * 1.5;

    for (const line of lines) {
      const currentLineHeight = getVariableLineSpacing(baseLineHeight);
      const segments = parseTextSegments(line);
      currentX = 10;

      for (const segment of segments) {
        if (segment.type === 'text') {
          const chars = segment.content.split('');
          for (const char of chars) {
            const variance = getPositionVariance();
            let charWidth = baseFontSize * 0.6; // Estimate
            if (ctx) { // Get actual width if drawing on canvas
                charWidth = ctx.measureText(char).width;
            } else if (typeof document !== 'undefined') { // Estimate for SVG if no canvas ctx
                // This is a rough estimation for SVG, ideally measure with a hidden SVG element if precision is critical
                const tempSpan = document.createElement("span");
                tempSpan.style.fontFamily = baseFontFamily;
                tempSpan.style.fontSize = `${baseFontSize}px`;
                tempSpan.innerText = char;
                document.body.appendChild(tempSpan);
                charWidth = tempSpan.getBoundingClientRect().width;
                document.body.removeChild(tempSpan);
            }


            if (currentX + charWidth > sceneWidth - 10 && currentX > 10) {
              currentX = 10;
              currentY += currentLineHeight;
            }

            if (exportMode === 'svg') {
              const escChar = char.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
              svgElements.push(
                `<text x="0" y="0" transform="translate(${currentX + variance.x}, ${currentY + variance.y}) rotate(${variance.rotation})" style="${textStyle}">${escChar}</text>`
              );
            } else if (ctx) {
              ctx.save();
              ctx.translate(currentX + variance.x, currentY + variance.y);
              ctx.rotate(variance.rotation * Math.PI / 180);
              ctx.fillText(char, 0, 0);
              ctx.restore();
            }
            currentX += charWidth;
          }
        } else if (segment.type === 'latex') {
          try {
            let rawMathJaxSvgString = await typesetLatexToSvgString(segment.content, segment.display);
            let styledMathJaxSvgString = styleSvgForHandwriting(rawMathJaxSvgString, 'black', 'handwriting-filter');

            const tempDiv = document.createElement('div'); // Used to parse the SVG string
            tempDiv.innerHTML = styledMathJaxSvgString;
            const svgNode = tempDiv.firstChild as SVGElement;
            if (!svgNode) throw new Error("Failed to parse MathJax SVG");

            const viewBox = svgNode.getAttribute('viewBox') || `0 0 ${parseFloat(svgNode.getAttribute('width') || '0')} ${parseFloat(svgNode.getAttribute('height') || '0')}`;
            let imgWidth = parseFloat(svgNode.getAttribute('width') || '0');
            let imgHeight = parseFloat(svgNode.getAttribute('height') || '0');

            if (viewBox && (!imgWidth || !imgHeight || imgWidth === 0 || imgHeight === 0)) {
                const parts = viewBox.split(' ');
                if (parts.length === 4) {
                    imgWidth = parseFloat(parts[2]);
                    imgHeight = parseFloat(parts[3]);
                }
            }

            const scale = baseFontSize / 10;
            imgWidth *= scale;
            imgHeight *= scale;

            const variance = getPositionVariance();
            const yOffset = (currentLineHeight - imgHeight) / 2 + (baseFontSize * 0.05);

            if (currentX + imgWidth > sceneWidth - 10 && currentX > 10) {
              currentX = 10;
              currentY += currentLineHeight;
            }

            if (exportMode === 'svg') {
              const cleanedMathSvgContent = svgNode.innerHTML;
              const mathSvgAttributes = Array.from(svgNode.attributes)
                .filter(attr => attr.name !== 'xmlns' && attr.name !== 'xmlns:xlink' && attr.name !== 'version' && !attr.name.startsWith('style'))
                .map(attr => `${attr.name}="${attr.value.replace(/"/g, '&quot;')}"`) // Escape quotes in attribute values
                .join(' ');

              svgElements.push(
                `<g transform="translate(${currentX + variance.x}, ${currentY + yOffset + variance.y}) rotate(${variance.rotation})">` +
                // Use the style from styleSvgForHandwriting directly on the embedded <svg>
                `<svg ${mathSvgAttributes} width="${imgWidth}" height="${imgHeight}" style="${svgNode.style.cssText}">` +
                cleanedMathSvgContent +
                `</svg></g>`
              );
            } else if (ctx) {
              const dataUrl = await svgStringToDataURL(styledMathJaxSvgString); // Use the full styled SVG for canvas image
              const img = await loadImage(dataUrl);
              ctx.save();
              ctx.translate(currentX + variance.x, currentY + yOffset + variance.y);
              ctx.rotate(variance.rotation * Math.PI / 180);
              ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
              ctx.restore();
            }
            currentX += imgWidth + 5;
          } catch (error) {
            console.error('Error rendering MathJax:', error);
            const errorMsg = `[Error rendering: ${segment.content.substring(0, 20)}${segment.content.length > 20 ? "..." : ""}]`;
             if (exportMode === 'svg') {
                svgElements.push(`<text x="${currentX}" y="${currentY}" fill="red" style="${textStyle}">${errorMsg}</text>`);
            } else if (ctx) {
                ctx.fillStyle = 'red';
                ctx.fillText(`[Error]`, currentX, currentY);
                ctx.fillStyle = 'black';
            }
            // Estimate width of error message
            const errorWidth = "[Error]".length * baseFontSize * 0.6;
            currentX += errorWidth;
          }
        }
      }
      currentY += currentLineHeight;
    }

    if (exportMode === 'svg') {
      return `<svg width="${sceneWidth}" height="${sceneHeight}" xmlns="http://www.w3.org/2000/svg" style="font-family: ${baseFontFamily}; font-size: ${baseFontSize}px;">${svgElements.join('')}</svg>`;
    }
    return "";
  }, [text, outputAreaRef, canvasRef, baseFontFamily, svgFilterDefinition]); // Removed exportMode from deps, it's a param


  useEffect(() => {
    drawOnCanvas(); // Draw on canvas by default
  }, [drawOnCanvas]);

  const API_BASE_URL = 'http://localhost:3001/api'; // Assuming backend runs on 3001

  const handleExportPNG = async () => {
    if (useServerSideRendering) {
      try {
        const response = await fetch(`${API_BASE_URL}/render/png`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Backend error: ${response.status}`);
        }
        // Assuming backend sends blob or data url for PNG
        // This part needs backend to be fully implemented for PNG
        alert("Server-side PNG export initiated (backend needs full implementation).");
        // const blob = await response.blob();
        // const url = URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.download = 'handwriting_server.png';
        // link.href = url;
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // URL.revokeObjectURL(url);
      } catch (error: any) {
        console.error("Server-side PNG export error:", error);
        alert(`Failed to export PNG from server: ${error.message}`);
      }
    } else {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'handwriting_client.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportSVG = async () => {
    if (useServerSideRendering) {
      try {
        const response = await fetch(`${API_BASE_URL}/render/svg`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Backend error: ${response.status}`);
        }
        const svgText = await response.text();
        const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'handwriting_server.svg';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error: any) {
        console.error("Server-side SVG export error:", error);
        alert(`Failed to export SVG from server: ${error.message}`);
      }
    } else {
      const svgString = await drawOnCanvas('svg');
      if (svgString && typeof svgString === 'string') {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = 'handwriting_client.svg';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        alert("Could not generate client-side SVG. See console for errors.");
        console.error("Client SVG Export: drawOnCanvas did not return a valid SVG string", svgString);
      }
    }
  };

  const handleExportPDF = async () => {
    if (useServerSideRendering) {
      try {
        const response = await fetch(`${API_BASE_URL}/render/pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Backend error: ${response.status}`);
        }
        // Assuming backend sends blob for PDF
        // This part needs backend to be fully implemented for PDF
        alert("Server-side PDF export initiated (backend needs full implementation).");
        // const blob = await response.blob();
        // const url = URL.createObjectURL(blob);
        // const link = document.createElement('a');
        // link.download = 'handwriting_server.pdf';
        // link.href = url;
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
        // URL.revokeObjectURL(url);
      } catch (error: any) {
        console.error("Server-side PDF export error:", error);
        alert(`Failed to export PDF from server: ${error.message}`);
      }
    } else {
      const canvas = canvasRef.current;
      if (!canvas) {
        alert("Canvas not found for client-side PDF export.");
        return;
      }
      try {
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = canvas.width * 0.264583;
        const pdfHeight = canvas.height * 0.264583;
        const orientation = pdfWidth > pdfHeight ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('handwriting_client.pdf');
      } catch (error) {
        console.error("Client-side PDF export error:", error);
        alert("Failed to export client-side PDF. See console for details.");
      }
    }
  };


  return (
    <Container>
      {/* Render the SVG filter definition so it's available in the DOM */}
      <div dangerouslySetInnerHTML={{ __html: svgFilterDefinition }} style={{ display: 'none' }} />
      <Title>Text-to-Handwriting</Title>
      <TextArea
        placeholder="Enter text here (LaTeX supported for math, e.g., $E=mc^2$ or $$ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} $$)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <OutputArea ref={outputAreaRef}>
        <StyledCanvas ref={canvasRef} />
      </OutputArea>
      <Controls>
        <Button onClick={handleExportSVG}>Export as SVG</Button>
        <Button onClick={handleExportPNG}>Export as PNG</Button>
        <Button onClick={handleExportPDF}>Export as PDF</Button>
      </Controls>
      <div style={{ marginTop: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={useServerSideRendering}
            onChange={(e) => setUseServerSideRendering(e.target.checked)}
          />
          Use Server-Side Rendering (Experimental)
        </label>
      </div>
    </Container>
  );
}
      return;
    }

    try {
      const imgData = canvas.toDataURL('image/png');
      // const { jsPDF } = require('jspdf'); // Using direct import now

      // Determine PDF page size based on canvas dimensions
      // Default unit for jsPDF is 'mm'. 1px approx 0.264583 mm
      const pdfWidth = canvas.width * 0.264583;
      const pdfHeight = canvas.height * 0.264583;

      // Create PDF with orientation based on aspect ratio
      const orientation = pdfWidth > pdfHeight ? 'l' : 'p'; // landscape or portrait
      const pdf = new jsPDF(orientation, 'mm', [pdfWidth, pdfHeight]);

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('handwriting.pdf');
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. See console for details.");
    }
  };


  return (
    <Container>
      {/* Render the SVG filter definition so it's available in the DOM */}
      <div dangerouslySetInnerHTML={{ __html: svgFilterDefinition }} style={{ display: 'none' }} />
      <Title>Text-to-Handwriting</Title>
      <TextArea
        placeholder="Enter text here (LaTeX supported for math, e.g., $E=mc^2$ or $$ \int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2} $$)"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <OutputArea ref={outputAreaRef}>
        <StyledCanvas ref={canvasRef} />
      </OutputArea>
      <Controls>
        <Button onClick={handleExportSVG}>Export as SVG</Button>
        <Button onClick={handleExportPNG}>Export as PNG</Button>
        <Button onClick={handleExportPDF}>Export as PDF</Button>
      </Controls>
    </Container>
  );
}

export default App;
