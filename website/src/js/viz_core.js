import * as d3 from 'd3v4';
import * as topojson from 'topojson';

export default class Viz {

  //#region STATIKUS OSZTÁLYELEMEK

  static DATA = {};
  static WORLDMAP = {};
  static TRANS_DURATION = 250;
  static COLORS = {
    'main': '#d3c6c6',
    'main--dark': '#985356',
    'secondary': '#574249',
    'grey': '#efefef',
    'background': '#FAFAFA',
    'text': '#333'
  }
  static FILTER = null;
  static YEARS = d3.range(2012, 2021);
  static ANTARCTICA = null;

  static VIZUALIZATIONS = [];

  //#endregion

  //#region STATIKUS SEGÉDMETÓDUSOK

  static PrepareData = () => {
    const countries = topojson.feature(Viz.WORLDMAP, Viz.WORLDMAP.objects.countries).features;
    const nameToCountry = {};
    countries.forEach((c) => nameToCountry[c.properties.name] = c);

    Viz.DATA.top(Infinity).forEach((d) => {
      d['Geo'] = nameToCountry[d['Country_EN']];
    });

    Viz.ANTARCTICA = nameToCountry['Antarctica'];
  };

  static AddBlur = (svg) => {
    let defs = svg.select('defs');
    if (!defs.empty()) {
      return console.warn("Defs-ek már meghatározásra kerültek.")
    }

    defs = svg.append('defs').attr('class', 'defs');
    const filter = defs.append('filter').attr('id', 'glow'),
      feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '1.1').attr('result', 'coloredBlur'),
      feMerge = filter.append('feMerge'),
      feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
      feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  static AddTooltip = (container) => {
    let tooltip = container.select('.tooltip');
    if (!tooltip.empty()) {
      return console.warn('Tooltip már létezik.');
    }

    tooltip = container.append('div').attr('class', 'tooltip');
    tooltip.append('h3').attr('class', 'tooltip--heading');
    tooltip.append('div').attr('class', 'tooltip--body');

    return tooltip;
  }

  //#endregion

  constructor() {
    Viz.VIZUALIZATIONS.forEach((v) => {
      v();
    });
  }

}