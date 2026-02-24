import blankCode from '../../widget-templates/blank.html?raw';
import chartCode from '../../widget-templates/chart.html?raw';
import countdownCode from '../../widget-templates/countdown.html?raw';
import digitalClockCode from '../../widget-templates/digital-clock.html?raw';
import statCode from '../../widget-templates/stat.html?raw';
import visualizerCode from '../../widget-templates/visualizer.html?raw';
import weatherCode from '../../widget-templates/weather.html?raw';

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
  { name: 'weather', title: toTitle('weather'), code: weatherCode },
  { name: 'chart', title: toTitle('chart'), code: chartCode },
  { name: 'visualizer', title: toTitle('visualizer'), code: visualizerCode },
  { name: 'countdown', title: toTitle('countdown'), code: countdownCode },
  {
    name: 'digital-clock',
    title: toTitle('digital-clock'),
    code: digitalClockCode,
  },
];
