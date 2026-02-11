import { useRef, useCallback, useEffect, useState } from 'react';
import Editor, {
  loader,
  type OnMount,
  type Monaco,
} from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.0/min/vs',
  },
});

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
}

function configureJavaScript(monaco: Monaco): void {
  const { javascriptDefaults } = monaco.languages.typescript;

  javascriptDefaults.setCompilerOptions({
    target: 99,
    module: 99,
    jsx: 2,
    allowNonTsExtensions: true,
    allowJs: true,
    checkJs: false,
  });

  javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
}

function configureEditor(editorInstance: editor.IStandaloneCodeEditor): void {
  editorInstance.updateOptions({
    fontSize: 13,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontLigatures: true,
    lineHeight: 20,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    renderLineHighlight: 'all',
    padding: { top: 12, bottom: 12 },
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    bracketPairColorization: { enabled: true },
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    acceptSuggestionOnEnter: 'on',
    quickSuggestions: {
      other: true,
      comments: false,
      strings: true,
    },
    parameterHints: { enabled: true },
  });
}

function defineThemes(monaco: Monaco): void {
  monaco.editor.defineTheme('wigify-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6A9955' },
      { token: 'keyword', foreground: 'C586C0' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'function', foreground: 'DCDCAA' },
      { token: 'variable', foreground: '9CDCFE' },
    ],
    colors: {
      'editor.background': '#0a0a0a',
      'editor.foreground': '#D4D4D4',
      'editor.lineHighlightBackground': '#1a1a1a',
      'editor.selectionBackground': '#264F78',
      'editorCursor.foreground': '#AEAFAD',
      'editorLineNumber.foreground': '#5A5A5A',
      'editorLineNumber.activeForeground': '#C6C6C6',
    },
  });

  monaco.editor.defineTheme('wigify-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '008000' },
      { token: 'keyword', foreground: 'AF00DB' },
      { token: 'string', foreground: 'A31515' },
      { token: 'number', foreground: '098658' },
      { token: 'type', foreground: '267F99' },
      { token: 'function', foreground: '795E26' },
      { token: 'variable', foreground: '001080' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#000000',
      'editor.lineHighlightBackground': '#f5f5f5',
      'editor.selectionBackground': '#ADD6FF',
      'editorCursor.foreground': '#000000',
      'editorLineNumber.foreground': '#999999',
      'editorLineNumber.activeForeground': '#000000',
    },
  });
}

function useSystemTheme(): 'dark' | 'light' {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return theme;
}

export default function MonacoEditor({
  value,
  onChange,
  readOnly = false,
  className,
}: MonacoEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const systemTheme = useSystemTheme();

  useEffect(() => {
    if (monacoRef.current) {
      const themeName = systemTheme === 'dark' ? 'wigify-dark' : 'wigify-light';
      monacoRef.current.editor.setTheme(themeName);
    }
  }, [systemTheme]);

  const handleMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance;
      monacoRef.current = monaco;
      configureJavaScript(monaco);
      configureEditor(editorInstance);
      defineThemes(monaco);

      const themeName = systemTheme === 'dark' ? 'wigify-dark' : 'wigify-light';
      monaco.editor.setTheme(themeName);
    },
    [systemTheme],
  );

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (onChange && newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  return (
    <Editor
      className={className}
      defaultLanguage="javascript"
      defaultPath="file:///widget.jsx"
      value={value}
      onChange={handleChange}
      onMount={handleMount}
      options={{
        readOnly,
        domReadOnly: readOnly,
      }}
      loading={
        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
          Loading editor...
        </div>
      }
    />
  );
}
