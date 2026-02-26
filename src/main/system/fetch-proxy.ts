import { ipcMain, net } from 'electron';

interface FetchRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

interface FetchResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}

export function registerFetchProxyIpc(): void {
  ipcMain.handle(
    'fetch:request',
    async (_, request: FetchRequest): Promise<FetchResponse> => {
      if (!request?.url || typeof request.url !== 'string') {
        return {
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          body: 'Invalid or missing URL',
        };
      }

      try {
        const response = await net.fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body ?? undefined,
        });

        const headers: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        const body = await response.text();

        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers,
          body,
        };
      } catch {
        return {
          ok: false,
          status: 0,
          statusText: '',
          headers: {},
          body: 'Network request failed',
        };
      }
    },
  );
}
