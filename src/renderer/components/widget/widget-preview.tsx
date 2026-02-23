import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/renderer/lib/utils';

interface WidgetPreviewProps {
  code: string;
  className?: string;
  debounce?: number;
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

  return (
    <div className={cn('relative', className)}>
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        className="h-full w-full border-0"
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
