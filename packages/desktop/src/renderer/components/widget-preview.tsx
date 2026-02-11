import { useEffect, useMemo, useRef, useState } from 'react';

interface WidgetPreviewProps {
  code: string;
  className?: string;
}

const DEBOUNCE_MS = 300;

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

export default function WidgetPreview({ code, className }: WidgetPreviewProps) {
  const [srcdoc, setSrcdoc] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setSrcdoc(buildSrcdoc(code));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code]);

  const sandboxAttr = useMemo(() => 'allow-scripts', []);

  return (
    <div className={className}>
      <iframe
        srcDoc={srcdoc}
        sandbox={sandboxAttr}
        className="h-full w-full border-0"
        title="Widget Preview"
      />
    </div>
  );
}
