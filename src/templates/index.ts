import blankManifest from '@/templates/blank/manifest.json';
import statManifest from '@/templates/stat/manifest.json';
import blankCode from '@/templates/blank/widget.html?raw';
import statCode from '@/templates/stat/widget.html?raw';

export interface TemplateManifest {
  name: string;
  version: string;
  title: string;
  description: string;
  author: string;
  size: {
    width: number;
    height: number;
  };
  resizable: boolean;
  variables: unknown[];
}

export interface Template {
  name: string;
  manifest: TemplateManifest;
  code: string;
}

export const templates: Template[] = [
  {
    name: 'blank',
    manifest: blankManifest as TemplateManifest,
    code: blankCode,
  },
  {
    name: 'stat',
    manifest: statManifest as TemplateManifest,
    code: statCode,
  },
];

export function getTemplate(name: string): Template | undefined {
  return templates.find(t => t.name === name);
}

export function listTemplates(): Template[] {
  return templates;
}
