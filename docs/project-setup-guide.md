# Electron + React + Bun Application Architecture Guide

This document describes the architecture, patterns, and best practices used in this codebase. Use it as a reference when building a new Electron application.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Configuration Files](#configuration-files)
4. [Main Process Architecture](#main-process-architecture)
5. [Renderer Process Architecture](#renderer-process-architecture)
6. [IPC Communication](#ipc-communication)
7. [State Management](#state-management)
8. [Component Patterns](#component-patterns)
9. [Native Integration (Swift Daemon)](#native-integration-swift-daemon)
10. [Testing](#testing)
11. [Build & Development](#build--development)
12. [Code Style Guidelines](#code-style-guidelines)
13. [Best Practices](#best-practices)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Bun |
| Framework | Electron 39+ |
| UI | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI + Shadcn pattern |
| Icons | Lucide React |
| Testing | Vitest |
| Language | TypeScript (strict mode) |
| Native | Swift (for macOS-specific features) |

---

## Project Structure

```
your-app/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts        # Entry point
│   │   ├── [feature]/     # Feature modules
│   │   ├── settings/      # App configuration
│   │   ├── system/        # System integration
│   │   ├── utils/         # Shared utilities
│   │   └── daemon/        # Native code integration (optional)
│   │
│   ├── renderer/          # React renderer process
│   │   ├── main.tsx       # React entry point
│   │   ├── App.tsx        # Root component with routing
│   │   ├── windows/       # Window-specific components
│   │   ├── components/
│   │   │   ├── ui/        # Base UI components (Shadcn)
│   │   │   ├── shared/    # Shared feature components
│   │   │   └── [feature]/ # Feature-specific components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities (cn, etc.)
│   │   ├── styles/        # CSS files
│   │   └── utils/         # Renderer utilities
│   │
│   ├── preload/           # Electron preload scripts
│   │   └── preload.ts     # IPC bridge
│   │
│   └── types/             # Shared TypeScript types
│       ├── settings.ts
│       ├── [feature].ts
│       └── index.ts
│
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── helpers/           # Test utilities & mocks
│
├── build/                 # Build assets (icons, entitlements)
├── docs/                  # Documentation
├── scripts/               # Build scripts
├── dist/                  # Vite build output
└── dist-electron/         # Electron build output
```

### Key Principles

1. **Separation of Concerns**: Main process handles system operations, renderer handles UI
2. **Shared Types**: Types in `src/types/` are accessible to both processes
3. **Feature-based Organization**: Group related code by feature, not by type
4. **Modular Design**: Each feature is self-contained with its own handlers, utilities, and types

---

## Configuration Files

### package.json

```json
{
  "name": "your-app",
  "version": "1.0.0",
  "main": "dist-electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build && electron-builder",
    "build-mac": "tsc && vite build && electron-builder --mac --universal",
    "build-mac:local": "tsc && vite build && CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --mac",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write \"src/**/*.{ts,tsx}\"",
    "pre-commit": "bun lint && bun test && bun format"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@build/*": ["./build/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### vite.config.mts

```typescript
import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'src/main/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'src/preload/preload.ts'),
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@build': path.resolve(__dirname, './build'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        // Add additional HTML entries for separate windows
        // history: path.resolve(__dirname, 'history.html'),
      },
    },
  },
});
```

### electron-builder.json5

```json5
{
  $schema: "https://raw.githubusercontent.com/electron-userland/electron-builder/master/packages/app-builder-lib/scheme.json",
  appId: "com.yourcompany.yourapp",
  productName: "Your App",
  directories: {
    output: "release/${version}",
  },
  files: [
    "dist",
    "dist-electron",
  ],
  mac: {
    target: [
      {
        target: "dmg",
        arch: ["universal"],
      },
    ],
    icon: "build/icon.icns",
    category: "public.app-category.productivity",
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: "build/entitlements.mac.plist",
    entitlementsInherit: "build/entitlements.mac.plist",
    minimumSystemVersion: "15.0",
  },
  dmg: {
    sign: false,
  },
  afterSign: "scripts/notarize.js",
  // Extra resources (native binaries, assets)
  extraResources: [
    {
      from: "build/bin",
      to: "bin",
      filter: ["**/*"],
    },
  ],
}
```

### .prettierrc

```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### .eslintrc.cjs

```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'dist-electron', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

---

## Main Process Architecture

### Entry Point (main.ts)

```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initializeSettings } from './settings';
import { registerGlobalShortcuts } from './system/shortcuts';
import { registerAllHandlers } from './ipc';

let mainWindow: BrowserWindow | null = null;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(async () => {
  // Initialize modules
  await initializeSettings();
  registerAllHandlers();
  registerGlobalShortcuts();
  
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

### Feature Module Pattern

Each feature should be self-contained:

```
src/main/[feature]/
├── index.ts           # Module entry, exports public API
├── handlers.ts        # IPC handlers
├── utils.ts           # Feature-specific utilities
└── types.ts           # Feature-specific types (if not shared)
```

Example feature module:

```typescript
// src/main/documents/index.ts
import { ipcMain } from 'electron';
import { getDocuments, saveDocument, deleteDocument } from './handlers';

export function initDocuments(): void {
  ipcMain.handle('documents:list', getDocuments);
  ipcMain.handle('documents:save', (_, doc) => saveDocument(doc));
  ipcMain.handle('documents:delete', (_, id) => deleteDocument(id));
}

export { getDocuments, saveDocument, deleteDocument };
```

### Settings Module

```typescript
// src/main/settings/index.ts
import { app, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import type { AppSettings } from '@/types/settings';

const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

let config: AppSettings;

export function getConfig(): AppSettings {
  return config;
}

export function updateConfig(updates: Partial<AppSettings>): void {
  config = { ...config, ...updates };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function initializeSettings(): void {
  // Load or create config
  if (fs.existsSync(CONFIG_FILE)) {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
  } else {
    config = getDefaultSettings();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }

  // Register IPC handlers
  ipcMain.handle('settings:get', () => getConfig());
  ipcMain.handle('settings:update', (_, updates) => {
    updateConfig(updates);
    return getConfig();
  });
}
```

---

## Renderer Process Architecture

### React Entry Point

```typescript
// src/renderer/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Multi-Window Routing Pattern

```typescript
// src/renderer/App.tsx
import { lazy, Suspense, useEffect, useState } from 'react';

// Lazy load window components
const MainWindow = lazy(() => import('./windows/main-window'));
const SettingsWindow = lazy(() => import('./windows/settings-window'));
const EditorWindow = lazy(() => import('./windows/editor-window'));

interface WindowData {
  type: 'main' | 'settings' | 'editor';
  payload?: unknown;
}

export default function App() {
  const [windowData, setWindowData] = useState<WindowData | null>(null);

  useEffect(() => {
    const handleLoad = (_: unknown, data: WindowData) => {
      setWindowData(data);
    };

    window.ipcRenderer.on('load', handleLoad);
    return () => {
      window.ipcRenderer.off('load', handleLoad);
    };
  }, []);

  if (!windowData) {
    return <LoadingScreen />;
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {windowData.type === 'main' && <MainWindow />}
      {windowData.type === 'settings' && <SettingsWindow />}
      {windowData.type === 'editor' && <EditorWindow data={windowData.payload} />}
    </Suspense>
  );
}
```

### Window Components

```typescript
// src/renderer/windows/settings-window.tsx
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/renderer/components/ui/tabs';
import GeneralSettings from '@/renderer/components/settings/general';
import AppearanceSettings from '@/renderer/components/settings/appearance';
import ShortcutsSettings from '@/renderer/components/settings/shortcuts';
import type { AppSettings } from '@/types/settings';

export default function SettingsWindow() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    window.ipcRenderer.invoke('settings:get').then(setSettings);
  }, []);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const updated = await window.ipcRenderer.invoke('settings:update', updates);
    setSettings(updated);
  };

  if (!settings) return null;

  return (
    <div className="flex h-screen flex-col">
      <Tabs defaultValue="general" className="flex-1">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettings settings={settings} onUpdate={updateSettings} />
        </TabsContent>
        <TabsContent value="appearance">
          <AppearanceSettings settings={settings} onUpdate={updateSettings} />
        </TabsContent>
        <TabsContent value="shortcuts">
          <ShortcutsSettings settings={settings} onUpdate={updateSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## IPC Communication

### Preload Script

```typescript
// src/preload/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

type IpcCallback = (event: IpcRendererEvent, ...args: unknown[]) => void;

contextBridge.exposeInMainWorld('ipcRenderer', {
  on: (channel: string, callback: IpcCallback) => {
    ipcRenderer.on(channel, callback);
  },
  off: (channel: string, callback: IpcCallback) => {
    ipcRenderer.off(channel, callback);
  },
  send: (channel: string, ...args: unknown[]) => {
    ipcRenderer.send(channel, ...args);
  },
  invoke: <T>(channel: string, ...args: unknown[]): Promise<T> => {
    return ipcRenderer.invoke(channel, ...args);
  },
});
```

### Type Declaration

```typescript
// src/types/electron.d.ts
import type { IpcRendererEvent } from 'electron';

type IpcCallback = (event: IpcRendererEvent, ...args: unknown[]) => void;

declare global {
  interface Window {
    ipcRenderer: {
      on: (channel: string, callback: IpcCallback) => void;
      off: (channel: string, callback: IpcCallback) => void;
      send: (channel: string, ...args: unknown[]) => void;
      invoke: <T>(channel: string, ...args: unknown[]) => Promise<T>;
    };
  }
}

export {};
```

### IPC Naming Convention

Use colon-separated, lowercase names with dashes:

```typescript
// Good
'settings:get'
'settings:update'
'documents:save-as'
'editor:toggle-toolbar'

// Bad
'getSettings'
'settings_update'
'documentsSaveAs'
```

### Handler Registration Pattern

```typescript
// src/main/ipc/index.ts
import { initDocumentsHandlers } from './documents';
import { initSettingsHandlers } from './settings';
import { initEditorHandlers } from './editor';

export function registerAllHandlers(): void {
  initDocumentsHandlers();
  initSettingsHandlers();
  initEditorHandlers();
}
```

### Modular Handler Files

```typescript
// src/main/ipc/documents.ts
import { ipcMain, dialog } from 'electron';
import fs from 'fs/promises';

export function initDocumentsHandlers(): void {
  ipcMain.handle('documents:open', handleOpen);
  ipcMain.handle('documents:save', handleSave);
  ipcMain.handle('documents:save-as', handleSaveAs);
}

async function handleOpen() {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'Documents', extensions: ['json'] }],
  });
  
  if (result.canceled) return null;
  
  const content = await fs.readFile(result.filePaths[0], 'utf-8');
  return JSON.parse(content);
}

async function handleSave(_: unknown, { path, content }: { path: string; content: unknown }) {
  await fs.writeFile(path, JSON.stringify(content, null, 2));
  return true;
}

async function handleSaveAs(_: unknown, content: unknown) {
  const result = await dialog.showSaveDialog({
    filters: [{ name: 'Documents', extensions: ['json'] }],
  });
  
  if (result.canceled) return null;
  
  await fs.writeFile(result.filePath!, JSON.stringify(content, null, 2));
  return result.filePath;
}
```

---

## State Management

### Philosophy

- **No global state library** - Use React's built-in hooks
- **Custom hooks** for reusable stateful logic
- **IPC for persistence** - Settings and data persist through main process

### Custom Hook Pattern

```typescript
// src/renderer/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import type { AppSettings } from '@/types/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.ipcRenderer.invoke<AppSettings>('settings:get')
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = await window.ipcRenderer.invoke<AppSettings>('settings:update', updates);
    setSettings(updated);
    return updated;
  }, []);

  return { settings, loading, updateSettings };
}
```

### History Hook (Undo/Redo)

```typescript
// src/renderer/hooks/useHistory.ts
import { useState, useCallback } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export function useHistory<T>(initialState: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const set = useCallback((newState: T | ((prev: T) => T)) => {
    setState(current => {
      const newPresent = typeof newState === 'function'
        ? (newState as (prev: T) => T)(current.present)
        : newState;
      
      return {
        past: [...current.past, current.present],
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState(current => {
      if (current.past.length === 0) return current;
      
      const previous = current.past[current.past.length - 1];
      const newPast = current.past.slice(0, -1);
      
      return {
        past: newPast,
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(current => {
      if (current.future.length === 0) return current;
      
      const next = current.future[0];
      const newFuture = current.future.slice(1);
      
      return {
        past: [...current.past, current.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
```

### Composed State Hook

```typescript
// src/renderer/hooks/useEditorState.ts
import { useState, useCallback, useEffect } from 'react';
import { useHistory } from './useHistory';
import { useSettings } from './useSettings';

export function useEditorState() {
  const { state: document, set: setDocument, undo, redo, canUndo, canRedo } = useHistory(null);
  const { settings } = useSettings();
  
  const [selectedTool, setSelectedTool] = useState('select');
  const [zoom, setZoom] = useState(1);

  // Persist preferences
  useEffect(() => {
    if (selectedTool) {
      window.ipcRenderer.invoke('editor:update-preferences', { lastTool: selectedTool });
    }
  }, [selectedTool]);

  return {
    document,
    setDocument,
    undo,
    redo,
    canUndo,
    canRedo,
    selectedTool,
    setSelectedTool,
    zoom,
    setZoom,
    settings,
  };
}
```

---

## Component Patterns

### UI Components (Shadcn Pattern)

```typescript
// src/renderer/components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/renderer/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### cn Utility

```typescript
// src/renderer/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Feature Component Structure

```typescript
// src/renderer/components/[feature]/index.ts
export { default as FeatureMain } from './feature-main';
export { default as FeatureToolbar } from './feature-toolbar';
export { default as FeatureSidebar } from './feature-sidebar';
export * from './hooks';
export * from './types';
```

### Component with Props Interface

```typescript
// src/renderer/components/editor/toolbar.tsx
import { Button } from '@/renderer/components/ui/button';
import { Pencil, Square, Circle, Type } from 'lucide-react';

interface ToolbarProps {
  selectedTool: string;
  onToolChange: (tool: string) => void;
  disabled?: boolean;
}

export default function Toolbar({ selectedTool, onToolChange, disabled }: ToolbarProps) {
  const tools = [
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'ellipse', icon: Circle, label: 'Ellipse' },
    { id: 'text', icon: Type, label: 'Text' },
  ];

  return (
    <div className="flex gap-1 rounded-lg bg-secondary p-1">
      {tools.map(tool => (
        <Button
          key={tool.id}
          variant={selectedTool === tool.id ? 'default' : 'ghost'}
          size="icon"
          disabled={disabled}
          onClick={() => onToolChange(tool.id)}
          title={tool.label}
        >
          <tool.icon className="h-4 w-4" />
        </Button>
      ))}
    </div>
  );
}
```

---

## Native Integration (Swift Daemon)

For macOS-specific features that can't be done in JavaScript, use a Swift daemon that communicates via JSON-RPC over stdin/stdout.

### Protocol

```json
// Request
{
  "id": "unique-id",
  "module": "module-name",
  "method": "method-name",
  "params": { "key": "value" }
}

// Success Response
{
  "id": "unique-id",
  "success": true,
  "result": { "key": "value" }
}

// Error Response
{
  "id": "unique-id",
  "success": false,
  "error": "Error message"
}

// Event (server -> client)
{
  "event": "event-name",
  "data": { "key": "value" }
}
```

### TypeScript Client

```typescript
// src/main/daemon/index.ts
import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { app } from 'electron';
import { v4 as uuid } from 'uuid';

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

export class NativeDaemon extends EventEmitter {
  private process: ChildProcess | null = null;
  private pendingRequests = new Map<string, PendingRequest>();

  async start(): Promise<void> {
    const binaryPath = app.isPackaged
      ? path.join(process.resourcesPath, 'bin', 'daemon')
      : path.join(__dirname, '../../build/bin/daemon');

    this.process = spawn(binaryPath, [], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    this.process.stdout?.on('data', data => this.handleOutput(data.toString()));
    this.process.stderr?.on('data', data => console.error('[Daemon]', data.toString()));
  }

  private handleOutput(data: string): void {
    const lines = data.trim().split('\n');
    for (const line of lines) {
      try {
        const message = JSON.parse(line);
        
        if (message.event) {
          this.emit(message.event, message.data);
        } else if (message.id) {
          const pending = this.pendingRequests.get(message.id);
          if (pending) {
            this.pendingRequests.delete(message.id);
            if (message.success) {
              pending.resolve(message.result);
            } else {
              pending.reject(new Error(message.error));
            }
          }
        }
      } catch {
        // Ignore non-JSON output
      }
    }
  }

  async call<T>(module: string, method: string, params?: Record<string, unknown>): Promise<T> {
    const id = uuid();
    const request = { id, module, method, params };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.process?.stdin?.write(JSON.stringify(request) + '\n');
    });
  }

  stop(): void {
    this.process?.kill();
    this.process = null;
  }
}

export const daemon = new NativeDaemon();
```

### Swift Module Structure

```swift
// Sources/Daemon/Core/Module.swift
protocol Module {
    var name: String { get }
    func handle(method: String, params: [String: AnyCodable]?, requestId: String)
}

// Sources/Daemon/Modules/SystemInfo.swift
class SystemInfoModule: Module {
    let name = "system-info"
    
    func handle(method: String, params: [String: AnyCodable]?, requestId: String) {
        switch method {
        case "getVersion":
            let version = ProcessInfo.processInfo.operatingSystemVersionString
            Router.shared.sendSuccess(requestId: requestId, result: ["version": version])
        default:
            Router.shared.sendError(requestId: requestId, error: "Unknown method: \(method)")
        }
    }
}
```

---

## Testing

### Test Configuration (vitest.config.ts)

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Mocking Electron

```typescript
// tests/helpers/electron-mock.ts
import { vi } from 'vitest';

export const mockIpcMain = {
  handle: vi.fn(),
  on: vi.fn(),
  removeHandler: vi.fn(),
};

export const mockApp = {
  getPath: vi.fn(() => '/mock/path'),
  isPackaged: false,
  whenReady: vi.fn(() => Promise.resolve()),
};

export const mockDialog = {
  showOpenDialog: vi.fn(),
  showSaveDialog: vi.fn(),
  showMessageBox: vi.fn(),
};

vi.mock('electron', () => ({
  app: mockApp,
  ipcMain: mockIpcMain,
  dialog: mockDialog,
  BrowserWindow: vi.fn(),
}));
```

### Test Example

```typescript
// tests/unit/settings.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';

vi.mock('fs');
vi.mock('electron', () => ({
  app: { getPath: () => '/mock/user-data' },
  ipcMain: { handle: vi.fn() },
}));

describe('Settings Module', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('should load settings from file', async () => {
    const mockSettings = { theme: 'dark', language: 'en' };
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockSettings));

    const { getConfig, initializeSettings } = await import('@/main/settings');
    initializeSettings();

    expect(getConfig()).toEqual(mockSettings);
  });

  it('should create default settings if file does not exist', async () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const { initializeSettings } = await import('@/main/settings');
    initializeSettings();

    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});
```

---

## Build & Development

### Development

```bash
# Start development server
bun dev

# Run in parallel terminals if needed
bun dev         # Terminal 1: Vite + Electron
bun test:watch  # Terminal 2: Test watcher
```

### Production Build

```bash
# Full build with signing (macOS)
bun build-mac

# Local build without signing
bun build-mac:local

# Windows build
bun build-win

# Linux build
bun build-linux
```

### Quality Checks

```bash
# Run before committing
bun pre-commit

# Individual commands
bun lint      # ESLint
bun format    # Prettier
bun test      # Vitest
```

### Scripts Directory

```bash
scripts/
├── notarize.js      # macOS notarization
├── build-daemon.sh  # Build native daemon
└── release.sh       # Release automation
```

---

## Code Style Guidelines

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (components) | kebab-case | `settings-window.tsx` |
| Files (utilities) | kebab-case | `format-date.ts` |
| Functions/Variables | camelCase | `getUserSettings` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `AppSettings` |
| React Components | PascalCase | `SettingsWindow` |

### Import Order

```typescript
// 1. External packages
import { useState, useEffect } from 'react';
import { Dialog } from '@radix-ui/react-dialog';

// 2. Components
import { Button } from '@/renderer/components/ui/button';
import Toolbar from '@/renderer/components/editor/toolbar';

// 3. Hooks
import { useSettings } from '@/renderer/hooks/useSettings';

// 4. Types
import type { AppSettings } from '@/types/settings';

// 5. Utilities
import { formatDate } from '@/renderer/utils/format';
```

### Type-Only Imports

```typescript
// Good
import type { AppSettings } from '@/types/settings';

// Bad
import { AppSettings } from '@/types/settings';
```

### Early Returns

```typescript
// Good
function processData(data: Data | null) {
  if (!data) return null;
  if (!data.isValid) return null;
  
  return transform(data);
}

// Bad
function processData(data: Data | null) {
  if (data) {
    if (data.isValid) {
      return transform(data);
    }
  }
  return null;
}
```

### Switch Over If-Else Chains

```typescript
// Good
switch (status) {
  case 'pending':
    return handlePending();
  case 'active':
    return handleActive();
  case 'completed':
    return handleCompleted();
  default:
    return handleUnknown();
}

// Bad
if (status === 'pending') {
  return handlePending();
} else if (status === 'active') {
  return handleActive();
} else if (status === 'completed') {
  return handleCompleted();
} else {
  return handleUnknown();
}
```

### Tailwind Classes

```typescript
// Good - Use built-in values
<div className="p-4 text-sm gap-2">

// Bad - Avoid arbitrary values
<div className="p-[16px] text-[14px] gap-[8px]">
```

---

## Best Practices

### General

1. **No code comments** - Write self-documenting code with clear naming
2. **Modular design** - Break large files into smaller, focused modules
3. **Reusable components** - Prefer composition over duplication
4. **Type safety** - Use TypeScript strictly, avoid `any`
5. **Error handling** - Use null-checking and graceful error handling

### Performance

1. **Lazy loading** - Use `React.lazy()` for window components
2. **Minimize bundle size** - Be mindful of dependencies
3. **useCallback/useMemo** - For expensive computations and stable references
4. **Avoid re-renders** - Use proper dependency arrays in hooks

### Electron-Specific

1. **Context isolation** - Always use preload scripts
2. **No nodeIntegration** - Keep renderer process sandboxed
3. **Frameless windows** - Use `transparent: false` with `backgroundColor` to avoid dark border artifacts
4. **IPC validation** - Validate all data crossing process boundaries

### File Operations

1. **Use promises** - Avoid sync file operations in main process
2. **Handle errors** - Always catch file operation errors
3. **Clean up** - Remove temporary files when done

### Window Management

1. **Single source of truth** - Main process owns window state
2. **Graceful cleanup** - Handle window close events properly
3. **Memory management** - Set references to null after closing

---

## Checklist for New Features

- [ ] Create feature directory with proper structure
- [ ] Define types in `src/types/`
- [ ] Implement main process handlers
- [ ] Register IPC handlers in `registerAllHandlers()`
- [ ] Create React components following Shadcn patterns
- [ ] Add custom hooks for stateful logic
- [ ] Write tests for critical functionality
- [ ] Run `bun pre-commit` before committing
- [ ] Update documentation if needed

---

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Vitest Documentation](https://vitest.dev)
