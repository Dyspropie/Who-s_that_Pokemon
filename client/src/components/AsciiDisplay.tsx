import React, { useEffect, useState } from 'react';
import { Copy, Check, Terminal, Loader2 } from 'lucide-react';
import type { AsciiLine } from '../utils/asciiConverter';
import { imageToAscii } from '../utils/asciiConverter';

interface AsciiDisplayProps {
  imageUrl?: string;
  isSilhouette?: boolean;
  cols?: number;
  className?: string;
}

export const AsciiDisplay: React.FC<AsciiDisplayProps> = ({
  imageUrl,
  isSilhouette = false,
  cols = 48,
  className = ''
}) => {
  const [lines, setLines] = useState<AsciiLine[]>([]);
  const [plainText, setPlainText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!imageUrl) {
      setLines([]);
      setPlainText('');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    imageToAscii(imageUrl, cols, isSilhouette)
      .then((res) => {
        if (isMounted) {
          setLines(res.lines);
          setPlainText(res.plainText);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to convert image to ASCII:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [imageUrl, cols, isSilhouette]);

  const copyToClipboard = () => {
    if (!plainText) return;
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative flex flex-col items-center justify-center overflow-hidden rounded-2xl bg-neutral-950 p-4 border-2 border-emerald-900/60 shadow-2xl crt-scanlines ${className}`}>
      {/* Terminal Title Bar */}
      <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-xs font-mono text-emerald-500/80 border-b border-emerald-900/40 pb-1">
        <div className="flex items-center gap-1.5">
          <Terminal className="h-3.5 w-3.5 text-emerald-400" />
          <span>TERMINAL_OUTPUT.TXT ({isSilhouette ? 'SILHOUETTE_MODE' : 'COLOR_RENDER'})</span>
        </div>
        <button
          onClick={copyToClipboard}
          disabled={!plainText}
          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-200 transition bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40"
          title="Copy ASCII art to clipboard"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-300" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'COPIED' : 'COPY'}</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-emerald-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="font-mono text-xs">PROCESSING ASCII MATRIX...</span>
        </div>
      ) : lines.length > 0 ? (
        <div className="mt-6 max-h-[360px] overflow-auto select-all cursor-text py-2">
          <pre className="font-mono-retro text-[8px] sm:text-[9.5px] md:text-[11px] leading-[0.72] tracking-tighter text-center whitespace-pre font-bold">
            {lines.map((line, y) => (
              <div key={y} className="flex justify-center">
                {line.map((pixel, x) => (
                  <span
                    key={x}
                    style={{
                      color: isSilhouette
                        ? 'rgb(16, 185, 129)'
                        : `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`,
                      opacity: pixel.a > 0 ? 1 : 0
                    }}
                  >
                    {pixel.char}
                  </span>
                ))}
              </div>
            ))}
          </pre>
        </div>
      ) : (
        <div className="py-12 text-center font-mono text-xs text-neutral-500">
          NO ASCII DATA AVAILABLE
        </div>
      )}
    </div>
  );
};
