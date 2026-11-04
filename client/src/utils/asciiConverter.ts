// Character ramp from darkest to brightest
const ASCII_CHARS = ' .:-=+*#%@';

export interface AsciiPixel {
  char: string;
  r: number;
  g: number;
  b: number;
  a: number;
}

export type AsciiLine = AsciiPixel[];

/**
 * Converts an image URL to an ASCII matrix using an offscreen canvas.
 * @param imageUrl The URL of the image to convert
 * @param cols Number of character columns (e.g. 48 or 60)
 * @param isSilhouette Whether to render as an enigmatic silhouette
 */
export async function imageToAscii(
  imageUrl: string,
  cols: number = 44,
  isSilhouette: boolean = false
): Promise<{ lines: AsciiLine[]; plainText: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      try {
        const aspectRatio = img.height / img.width;
        // Monospace fonts are typically ~2x taller than wide, so we halve vertical samples
        const rows = Math.floor(cols * aspectRatio * 0.52);

        const canvas = document.createElement('canvas');
        canvas.width = cols;
        canvas.height = rows;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, cols, rows);
        const imgData = ctx.getImageData(0, 0, cols, rows);
        const data = imgData.data;

        const lines: AsciiLine[] = [];
        let plainText = '';

        for (let y = 0; y < rows; y++) {
          const currentLine: AsciiLine = [];
          for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            // If transparent
            if (a < 30) {
              currentLine.push({ char: ' ', r: 0, g: 0, b: 0, a: 0 });
              plainText += ' ';
              continue;
            }

            if (isSilhouette) {
              // Silhouette: uniform solid character with dark tone
              const char = '█';
              currentLine.push({ char, r: 16, g: 185, b: 129, a: 255 }); // Retro phosphor tone
              plainText += char;
            } else {
              // Luminance formula
              const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              const charIndex = Math.floor(brightness * (ASCII_CHARS.length - 1));
              const char = ASCII_CHARS[charIndex] || '#';

              currentLine.push({ char, r, g, b, a });
              plainText += char;
            }
          }
          lines.push(currentLine);
          plainText += '\n';
        }

        resolve({ lines, plainText });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(e);
    img.src = imageUrl;
  });
}
