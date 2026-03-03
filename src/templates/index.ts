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

import currencyConverterHtml from '../../widget-templates/currency-converter/widget.html?raw';
import currencyConverterCss from '../../widget-templates/currency-converter/style.css?raw';
import currencyConverterJs from '../../widget-templates/currency-converter/script.js?raw';

import githubActivityHtml from '../../widget-templates/github-activity/widget.html?raw';
import githubActivityCss from '../../widget-templates/github-activity/style.css?raw';
import githubActivityJs from '../../widget-templates/github-activity/script.js?raw';

import worldClocksHtml from '../../widget-templates/world-clocks/widget.html?raw';
import worldClocksCss from '../../widget-templates/world-clocks/style.css?raw';
import worldClocksJs from '../../widget-templates/world-clocks/script.js?raw';

import cryptoTickerHtml from '../../widget-templates/crypto-ticker/widget.html?raw';
import cryptoTickerCss from '../../widget-templates/crypto-ticker/style.css?raw';
import cryptoTickerJs from '../../widget-templates/crypto-ticker/script.js?raw';

import habitTrackerHtml from '../../widget-templates/habit-tracker/widget.html?raw';
import habitTrackerCss from '../../widget-templates/habit-tracker/style.css?raw';
import habitTrackerJs from '../../widget-templates/habit-tracker/script.js?raw';

import networkSpeedHtml from '../../widget-templates/network-speed/widget.html?raw';
import networkSpeedCss from '../../widget-templates/network-speed/style.css?raw';
import networkSpeedJs from '../../widget-templates/network-speed/script.js?raw';

import wordOfDayHtml from '../../widget-templates/word-of-day/widget.html?raw';
import wordOfDayCss from '../../widget-templates/word-of-day/style.css?raw';
import wordOfDayJs from '../../widget-templates/word-of-day/script.js?raw';

import ipInfoHtml from '../../widget-templates/ip-info/widget.html?raw';
import ipInfoCss from '../../widget-templates/ip-info/style.css?raw';
import ipInfoJs from '../../widget-templates/ip-info/script.js?raw';

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
  {
    name: 'currency-converter',
    title: toTitle('currency-converter'),
    source: {
      html: currencyConverterHtml,
      css: currencyConverterCss,
      js: currencyConverterJs,
    },
  },
  {
    name: 'github-activity',
    title: toTitle('github-activity'),
    source: {
      html: githubActivityHtml,
      css: githubActivityCss,
      js: githubActivityJs,
    },
  },
  {
    name: 'world-clocks',
    title: toTitle('world-clocks'),
    source: {
      html: worldClocksHtml,
      css: worldClocksCss,
      js: worldClocksJs,
    },
  },
  {
    name: 'crypto-ticker',
    title: toTitle('crypto-ticker'),
    source: {
      html: cryptoTickerHtml,
      css: cryptoTickerCss,
      js: cryptoTickerJs,
    },
  },
  {
    name: 'habit-tracker',
    title: toTitle('habit-tracker'),
    source: {
      html: habitTrackerHtml,
      css: habitTrackerCss,
      js: habitTrackerJs,
    },
  },
  {
    name: 'network-speed',
    title: toTitle('network-speed'),
    source: {
      html: networkSpeedHtml,
      css: networkSpeedCss,
      js: networkSpeedJs,
    },
  },
  {
    name: 'word-of-day',
    title: toTitle('word-of-day'),
    source: {
      html: wordOfDayHtml,
      css: wordOfDayCss,
      js: wordOfDayJs,
    },
  },
  {
    name: 'ip-info',
    title: toTitle('ip-info'),
    source: {
      html: ipInfoHtml,
      css: ipInfoCss,
      js: ipInfoJs,
    },
  },
];
