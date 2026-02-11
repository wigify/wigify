import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { compileWidgetSource } from '../lib/widget-runtime';

interface WidgetPreviewProps {
  code: string;
  className?: string;
}

interface PreviewState {
  component: React.ComponentType | null;
  error: string | null;
}

const DEBOUNCE_MS = 300;

export default function WidgetPreview({ code, className }: WidgetPreviewProps) {
  const [state, setState] = useState<PreviewState>({
    component: null,
    error: null,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const transpileAndExecute = useCallback((sourceCode: string) => {
    const result = compileWidgetSource(sourceCode);
    setState(result);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      transpileAndExecute(code);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [code, transpileAndExecute]);

  const renderedWidget = useMemo(() => {
    if (state.error) {
      return (
        <div className="flex h-full w-full items-center justify-center p-3">
          <span className="text-destructive text-center text-xs">
            {state.error}
          </span>
        </div>
      );
    }

    if (!state.component) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <span className="text-muted-foreground text-xs">Loading...</span>
        </div>
      );
    }

    try {
      const Component = state.component;
      return <Component />;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Render error occurred';
      return (
        <div className="flex h-full w-full items-center justify-center p-3">
          <span className="text-destructive text-center text-xs">
            {errorMessage}
          </span>
        </div>
      );
    }
  }, [state]);

  return (
    <div className={className}>
      <ErrorBoundary>{renderedWidget}</ErrorBoundary>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('Widget render error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-3">
          <span className="text-destructive text-center text-xs">
            {this.state.error}
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}
