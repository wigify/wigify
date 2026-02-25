import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { WidgetSourceFiles } from '@/types';
import { cn } from '@/renderer/lib/utils';

interface WidgetPreviewProps {
  source: WidgetSourceFiles;
  className?: string;
  debounce?: number;
  scale?: number;
}

const DEFAULT_DEBOUNCE_MS = 0;

const RESET_CSS =
  '*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n' +
  'html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }';

function buildSrcdoc({ html, css, js }: WidgetSourceFiles): string {
  const doc = [
    '<!doctype html>',
    '<html>',
    '<head>',
    `<style>${RESET_CSS}\n${css}</style>`,
    '</head>',
    `<body>${html}`,
    js ? `<script>${js}</` + 'script>' : '',
    '</body>',
    '</html>',
  ];
  return doc.join('');
}

export default function WidgetPreview({
  source,
  className,
  debounce = DEFAULT_DEBOUNCE_MS,
  scale,
}: WidgetPreviewProps) {
  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(source));
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSrcdocRef = useRef(srcdoc);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const newSrcdoc = buildSrcdoc(source);
    if (newSrcdoc === prevSrcdocRef.current) return;

    setLoading(true);

    if (debounce <= 0) {
      setSrcdoc(newSrcdoc);
      prevSrcdocRef.current = newSrcdoc;
      return;
    }

    debounceRef.current = setTimeout(() => {
      setSrcdoc(newSrcdoc);
      prevSrcdocRef.current = newSrcdoc;
    }, debounce);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [source, debounce]);

  const iframeStyle = useMemo(
    () =>
      scale
        ? {
            width: `${100 / scale}%`,
            height: `${100 / scale}%`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left' as const,
          }
        : undefined,
    [scale],
  );

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        className={cn('border-0', !scale && 'h-full w-full')}
        style={iframeStyle}
        title="Widget Preview"
        onLoad={() => setLoading(false)}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
          <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
        </div>
      )}
    </div>
  );
}
