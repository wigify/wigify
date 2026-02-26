import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const FETCH_OVERRIDE = `(function(){
  var pending={};var id=0;
  window.fetch=function(input,init){
    var url=typeof input==='string'?input:input instanceof URL?input.toString():input instanceof Request?input.url:String(input);
    if(url.startsWith('data:')||url.startsWith('blob:'))return Object.getPrototypeOf(window).fetch.call(window,input,init);
    var method=(init&&init.method)||'GET';
    var headers={};
    if(init&&init.headers){
      if(init.headers instanceof Headers)init.headers.forEach(function(v,k){headers[k]=v;});
      else if(Array.isArray(init.headers))init.headers.forEach(function(p){headers[p[0]]=p[1];});
      else headers=Object.assign({},init.headers);
    }
    var bodyP=init&&init.body!=null?(typeof init.body==='string'?Promise.resolve(init.body):init.body instanceof Blob?init.body.text():Promise.resolve(String(init.body))):Promise.resolve(null);
    return bodyP.then(function(body){
      return new Promise(function(resolve,reject){
        var rid=++id;
        pending[rid]={resolve:resolve,reject:reject};
        parent.postMessage({type:'wigify-fetch',id:rid,url:url,method:method.toUpperCase(),headers:headers,body:body},'*');
      });
    });
  };
  window.addEventListener('message',function(e){
    if(!e.data||e.data.type!=='wigify-fetch-response')return;
    var cb=pending[e.data.id];if(!cb)return;
    delete pending[e.data.id];
    if(e.data.error)cb.reject(new Error(e.data.error));
    else cb.resolve(new Response(e.data.body,{status:e.data.status,statusText:e.data.statusText,headers:e.data.headers}));
  });
})();`;

function buildSrcdoc({ html, css, js }: WidgetSourceFiles): string {
  const doc = [
    '<!doctype html>',
    '<html>',
    '<head>',
    `<style>${RESET_CSS}\n${css}</style>`,
    `<script>${FETCH_OVERRIDE}</` + 'script>',
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const handleFetchProxy = useCallback((e: MessageEvent) => {
    if (!e.data || e.data.type !== 'wigify-fetch') return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow || e.source !== iframe.contentWindow) return;

    const { id, url, method, headers, body } = e.data;
    window.ipcRenderer
      .invoke<{
        ok: boolean;
        status: number;
        statusText: string;
        headers: Record<string, string>;
        body: string;
      }>('fetch:request', { url, method, headers, body })
      .then(res => {
        iframe.contentWindow?.postMessage(
          {
            type: 'wigify-fetch-response',
            id,
            ok: res.ok,
            status: res.status,
            statusText: res.statusText,
            headers: res.headers,
            body: res.body,
          },
          '*',
        );
      })
      .catch(err => {
        iframe.contentWindow?.postMessage(
          { type: 'wigify-fetch-response', id, error: err.message },
          '*',
        );
      });
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleFetchProxy);
    return () => window.removeEventListener('message', handleFetchProxy);
  }, [handleFetchProxy]);

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
        ref={iframeRef}
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
