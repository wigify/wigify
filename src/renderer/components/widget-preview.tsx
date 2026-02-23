import { useEffect, useRef, useState } from 'react';

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

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
    <div className={className}>
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts"
        className="h-full w-full border-0"
        title="Widget Preview"
      />
    </div>
  );
}
