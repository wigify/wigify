import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/renderer/lib/utils';

interface WidgetPreviewProps {
  code: string;
  className?: string;
  debounce?: number;
  scale?: number;
}

const DEFAULT_DEBOUNCE_MS = 0;

function buildSrcdoc(source: string): string {
  return `<!doctype html>
<html>
<head>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
</style>
</head>
<body>${source}</body>
</html>`;
}

export default function WidgetPreview({
  code,
  className,
  debounce = DEFAULT_DEBOUNCE_MS,
  scale,
}: WidgetPreviewProps) {
  const [srcdoc, setSrcdoc] = useState(() => buildSrcdoc(code));
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setLoading(true);

    if (debounce <= 0) {
      setSrcdoc(buildSrcdoc(code));
      return;
    }

    debounceRef.current = setTimeout(() => {
      setSrcdoc(buildSrcdoc(code));
    }, debounce);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, debounce]);

  const iframeStyle = scale
    ? {
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: `scale(${scale})`,
        transformOrigin: 'top left' as const,
      }
    : undefined;

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
