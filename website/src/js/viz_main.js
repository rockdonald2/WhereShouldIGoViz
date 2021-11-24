import crossfilter from 'crossfilter2';
import * as d3 from 'd3v4';

import Viz from './viz_core';

(function () {
  'use strict';

  d3.queue()
    .defer(d3.csv, 'assets/normalized.csv')
    .defer(d3.json, 'assets/worldMap.json')
    .await(ready);

  function ready(error, data, worldmap) {
    if (error) {
      return console.warn(error);
    }

    Viz.FILTER = crossfilter(data);
    Viz.DATA = Viz.FILTER.dimension(function (o) {
      return o['Year'];
    });
    Viz.WORLDMAP = worldmap;

    Viz.PrepareData();

    new Viz(); // init
  };

})();