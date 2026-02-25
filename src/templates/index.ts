import type { WidgetSourceFiles } from '@/types';

import blankHtml from '../../widget-templates/blank/widget.html?raw';
import blankCss from '../../widget-templates/blank/style.css?raw';
import blankJs from '../../widget-templates/blank/script.js?raw';

import chartHtml from '../../widget-templates/chart/widget.html?raw';
import chartCss from '../../widget-templates/chart/style.css?raw';
import chartJs from '../../widget-templates/chart/script.js?raw';

import countdownHtml from '../../widget-templates/countdown/widget.html?raw';
import countdownCss from '../../widget-templates/countdown/style.css?raw';
import countdownJs from '../../widget-templates/countdown/script.js?raw';

import digitalClockHtml from '../../widget-templates/digital-clock/widget.html?raw';
import digitalClockCss from '../../widget-templates/digital-clock/style.css?raw';
import digitalClockJs from '../../widget-templates/digital-clock/script.js?raw';

import statHtml from '../../widget-templates/stat/widget.html?raw';
import statCss from '../../widget-templates/stat/style.css?raw';
import statJs from '../../widget-templates/stat/script.js?raw';

import visualizerHtml from '../../widget-templates/visualizer/widget.html?raw';
import visualizerCss from '../../widget-templates/visualizer/style.css?raw';
import visualizerJs from '../../widget-templates/visualizer/script.js?raw';

import weatherHtml from '../../widget-templates/weather/widget.html?raw';
import weatherCss from '../../widget-templates/weather/style.css?raw';
import weatherJs from '../../widget-templates/weather/script.js?raw';

export interface Template {
  name: string;
  title: string;
  source: WidgetSourceFiles;
}

function toTitle(filename: string): string {
  return filename
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const templates: Template[] = [
  {
    name: 'blank',
    title: toTitle('blank'),
    source: { html: blankHtml, css: blankCss, js: blankJs },
  },
  {
    name: 'stat',
    title: toTitle('stat'),
    source: { html: statHtml, css: statCss, js: statJs },
  },
  {
    name: 'weather',
    title: toTitle('weather'),
    source: { html: weatherHtml, css: weatherCss, js: weatherJs },
  },
  {
    name: 'chart',
    title: toTitle('chart'),
    source: { html: chartHtml, css: chartCss, js: chartJs },
  },
  {
    name: 'visualizer',
    title: toTitle('visualizer'),
    source: { html: visualizerHtml, css: visualizerCss, js: visualizerJs },
  },
  {
    name: 'countdown',
    title: toTitle('countdown'),
    source: { html: countdownHtml, css: countdownCss, js: countdownJs },
  },
  {
    name: 'digital-clock',
    title: toTitle('digital-clock'),
    source: {
      html: digitalClockHtml,
      css: digitalClockCss,
      js: digitalClockJs,
    },
  },
];
