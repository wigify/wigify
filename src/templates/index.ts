import blankCode from '../../widget-templates/blank.html?raw';
import statCode from '../../widget-templates/stat.html?raw';

export interface Template {
  name: string;
  title: string;
  code: string;
}

function toTitle(filename: string): string {
  return filename
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const templates: Template[] = [
  { name: 'blank', title: toTitle('blank'), code: blankCode },
  { name: 'stat', title: toTitle('stat'), code: statCode },
];
