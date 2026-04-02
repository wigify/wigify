import fs from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type IpcHandler = (_: unknown, data: unknown) => void;

const widgetHtml = fs.readFileSync(
  path.resolve(process.cwd(), 'widget.html'),
  'utf8',
);
const scriptMatch = widgetHtml.match(/<script>\s*([\s\S]*?)<\/script>\s*<\/body>/);

if (!scriptMatch) {
  throw new Error('Failed to load widget runtime script from widget.html');
}

const widgetRuntimeScript = scriptMatch[1];

describe('widget runtime script loading order', () => {
  let handlers: Record<string, IpcHandler>;

  beforeEach(() => {
    handlers = {};
    document.head.innerHTML = '';
    document.body.innerHTML = `
      <div class="wigify-titlebar" id="wigify-titlebar">
        <select class="wigify-refresh-select" id="wigify-refresh"></select>
        <button class="wigify-close-btn" id="wigify-close"></button>
      </div>
    `;

    (window as Window & { fetch: typeof fetch }).fetch = vi.fn();
    (window as Window & { ipcRenderer: unknown }).ipcRenderer = {
      on: (event: string, handler: IpcHandler) => {
        handlers[event] = handler;
      },
      invoke: vi.fn(() => Promise.resolve({})),
    };
  });

  it('runs source.js only after external scripts finish loading', async () => {
    eval(widgetRuntimeScript);

    const externalScriptCode = 'window.__externalLibLoaded = true;';
    const externalScriptSource = `data:text/javascript,${encodeURIComponent(externalScriptCode)}`;
    let sourceExecutedAt: string | undefined;
    const sourceExecutionPromise = new Promise<string>(resolve => {
      Object.defineProperty(window, '__sourceExecutedAt', {
        configurable: true,
        set(value) {
          sourceExecutedAt = String(value);
          resolve(sourceExecutedAt);
        },
      });
    });

    handlers.load({}, {
      type: 'widget',
      payload: {
        instanceId: 'instance-id',
        widgetName: 'test-widget',
        refreshInterval: 0,
        variables: {},
        source: {
          html: `<script src="${externalScriptSource}"></script>`,
          css: '',
          js: "window.__sourceExecutedAt = window.__externalLibLoaded ? 'after' : 'before';",
        },
      },
    });

    await expect(sourceExecutionPromise).resolves.toBe('after');
    expect(sourceExecutedAt).toBe('after');
  });
});
