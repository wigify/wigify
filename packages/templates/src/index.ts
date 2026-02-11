import blankManifest from "./blank/manifest.json";
import statManifest from "./stat/manifest.json";

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
}

export const templates: Template[] = [
  {
    name: "blank",
    manifest: blankManifest as TemplateManifest,
  },
  {
    name: "stat",
    manifest: statManifest as TemplateManifest,
  },
];

export function getTemplate(name: string): Template | undefined {
  return templates.find((t) => t.name === name);
}

export function listTemplates(): Template[] {
  return templates;
}
