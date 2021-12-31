import * as d3 from 'd3v4';
import * as topojson from 'topojson';
import * as geo from 'd3-geo-projection';

import Viz from './viz_core';

(function () {
  'use strict';

  //#region ADATTAGOK és inicializálások

  const margin = {
    top: 75,
    left: 15,
    right: 50,
    bottom: 0,
  };

  let currentYear = 2021;

  const chartContainer = d3.select('.main--map .right');
  const tooltip = Viz.AddTooltip(chartContainer);

  const width = parseInt(chartContainer.style('width')) - margin.left - margin.right;
  const height = parseInt(chartContainer.style('height')) - margin.top - margin.bottom;

  const svg = chartContainer
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right);

  const mapHeight = 1150;

  const scaleTypes = {
    Absolute: 'Abszolút skála',
    Relative: 'Relatív skála',
  };
  let currentScale = 'Relative';
  const ABSMIN = -50;
  const ABSMAX = 210;

  const chartHolder = svg
    .append('g')
    .attr('class', 'chartHolder')
    .attr(
      'transform',
      `translate(${width / 2 - mapHeight / 2 + margin.left + margin.right}, ${margin.top * 3})`
    );

  const zoomablePart = chartHolder.append('g').attr('class', 'zoomable');

  Viz.AddBlur(svg);

  const path = d3.geoPath().projection(geo.geoNaturalEarth2().scale(275));

  const colorScale = d3
    .scaleLinear()
    .domain([ABSMIN, ABSMAX])
    .range(['#d7f3ee', Viz.COLORS['main--dark']]);

  //#endregion

  const init = () => {
    //#region FÖLDRÉSZEK

    const addLand = (function () {
      zoomablePart
        .append('g')
        .attr('class', 'lands')
        .selectAll('.land')
        .data(topojson.feature(Viz.WORLDMAP, Viz.WORLDMAP.objects.countries1).features)
        .enter()
        .append('path')
        .attr('class', 'land')
        .attr('d', path)
        .attr('fill', Viz.COLORS['grey'])
        .attr('stroke', Viz.COLORS['grey'])
        .attr('stroke-opacity', 0.1);
    })();

    //#endregion

    zoomablePart.append('g').attr('class', 'countries');

    //#region JELMAGYARÁZAT

    let legend, legendTicks, linearGradient;
    const legendWidth = 400;
    const legendHeight = 10;
    const coordinatesControls = {
      x: width / 2 - legendWidth / 2 + margin.left + margin.right,
      y: height * 0.85,
    };

    const updateLegend = function () {
      const counter = colorScale.domain()[0];
      const numOfStops = 6;
      const step = Math.floor((colorScale.domain()[1] - colorScale.domain()[0]) / numOfStops);
      let i = 0;

      const stops = linearGradient.selectAll('stop').data([
        {
          offset: '0%',
          color: colorScale(counter + step * i++),
        },
        {
          offset: '16.67%',
          color: colorScale(counter + step * i++),
        },
        {
          offset: '33.34%',
          color: colorScale(counter + step * i++),
        },
        {
          offset: '50%',
          color: colorScale(counter + step * i++),
        },
        {
          offset: '66.67%',
          color: colorScale(counter + step * i++),
        },
        {
          offset: '83.37%',
          color: colorScale(counter + step * i++),
        },
        {
          offset: '100%',
          color: colorScale(counter + step * i++),
        },
      ]);

      stops
        .enter()
        .append('stop')
        .merge(stops)
        .attr('offset', function (d) {
          return d.offset;
        })
        .attr('stop-color', function (d) {
          return d.color;
        })
        .attr('opacity', 0)
        .transition()
        .duration(Viz.TRANS_DURATION)
        .attr('opacity', 1);

      stops.exit().transition().duration(Viz.TRANS_DURATION).attr('opacity', 0).remove();

      const legendScale = d3
        .scaleLinear()
        .domain([colorScale.domain()[0], colorScale.domain()[1]])
        .range([0, legendWidth]);

      const ticks = legendTicks
        .selectAll('.legendTick')
        .data(d3.range(colorScale.domain()[0], colorScale.domain()[1] + 1, step));

      ticks
        .enter()
        .append('text')
        .attr('class', 'legendTick')
        .merge(ticks)
        .text((d) => d)
        .attr('x', legendScale)
        .attr('y', 35)
        .attr('fill', Viz.COLORS['text'])
        .attr('text-anchor', 'middle')
        .style('font-size', '1.4rem')
        .style('font-weight', '300')
        .attr('fill-opacity', '.95')
        .transition()
        .duration(Viz.TRANS_DURATION);

      ticks.exit().transition().duration(Viz.TRANS_DURATION).remove();
    };

    const makeLegend = (function () {
      linearGradient = svg
        .select('.defs')
        .append('linearGradient')
        .attr('id', 'linearGradient')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');

      legend = svg
        .append('g')
        .attr('class', 'legendWrapper')
        .attr('transform', `translate(${coordinatesControls.x}, ${coordinatesControls.y})`);
      const legendRect = legend
        .append('rect')
        .attr('class', 'legendRect')
        .attr('width', `${legendWidth}`)
        .attr('height', `${legendHeight}`)
        .style('fill', 'url(#linearGradient)')
        .attr('fill-opacity', '.95')
        .attr('rx', 5);
      const legendTitle = legend
        .append('text')
        .attr('class', 'legendTitle')
        .text('A minőség skálája')
        .style('font-size', '1.4rem')
        .style('font-weight', '400')
        .attr('fill', Viz.COLORS['text'])
        .attr('fill-opacity', '.95')
        .attr('x', legendWidth / 2)
        .attr('y', -15)
        .attr('text-anchor', 'middle');
      legendTicks = legend.append('g').attr('class', 'legendTicks');

      updateLegend();
    })();

    //#endregion

    //#region TÉRKÉP

    const makeMap = function (data) {
      const countries = zoomablePart
        .select('.countries')
        .selectAll('.country')
        .data(data, function (d) {
          return d['Code'];
        });

      countries
        .enter()
        .append('path')
        .attr('class', 'country')
        .attr('d', function (d) {
          return path(d['Geo']);
        })
        .attr('id', function (d) {
          return d['Code'];
        })
        .on('mouseenter', function (d) {
          d3.select(this).transition().duration(Viz.TRANS_DURATION).attr('stroke', Viz.COLORS['main--dark']);

          tooltip.select('.tooltip--heading').html(d['Country_HU']);
          tooltip.select('.tooltip--body').html(
            `<p>Quality of Life pontszáma</p>
          <p><span class="tooltip--circle" style="background-color: ${colorScale(
            d['Quality of Life Index']
          )};"></span> ${d['Quality of Life Index']}</p>`
          );
        })
        .on('mousemove', function (d) {
          tooltip.style('left', d3.event.pageX - parseInt(tooltip.style('width')) / 2 + 'px');
          tooltip.style('top', d3.event.pageY + parseInt(tooltip.style('height')) / 2.5 + 'px');
        })
        .on('mouseleave', function (d) {
          d3.select(this).transition().duration(Viz.TRANS_DURATION).attr('stroke', Viz.COLORS['background']);

          tooltip.style('left', '-9999px');
        })
        .attr('fill', function (d) {
          const curr = d3.select(this).attr('fill');
          return curr == null ? Viz.COLORS['grey'] : curr;
        })
        .merge(countries) // mindegyiken fuggetlenul most adodott-e hozza vagy sem
        .attr('stroke-width', '1px')
        .attr('stroke', function (d) {
          return Viz.COLORS['background'];
        })
        .transition()
        .duration(Viz.TRANS_DURATION)
        .attr('opacity', 1)
        .attr('fill', function (d) {
          return colorScale(d['Quality of Life Index']);
        });

      countries.exit().transition().duration(Viz.TRANS_DURATION).attr('opacity', 0).remove();
    };

    //#endregion

    //#region KONTROLL

    const makeControls = (function () {
      const controlsWidth = 710;
      const coordinatesControls = {
        x: width / 2 - controlsWidth / 2 + margin.left + margin.right,
        y: height,
      };

      const scaleTypesWidth = 220;
      const coordinatesTypes = {
        x: width / 2 - scaleTypesWidth / 2 + margin.left + margin.right,
        y: height * 0.93575,
      };

      const scaleTypesBounding = svg
        .append('g')
        .attr('class', 'scaleTypesBounding')
        .attr('transform', `translate(${coordinatesTypes.x}, ${coordinatesTypes.y})`);
      const types = scaleTypesBounding
        .selectAll('.scaleType')
        .data(Object.keys(scaleTypes))
        .enter()
        .append('g')
        .attr('class', 'scaleType')
        .attr('id', function (d) {
          return 't' + d;
        })
        .attr('transform', function (d, i) {
          return `translate(${i * 125}, 0)`;
        })
        .style('cursor', 'pointer')
        .on('mouseenter', function (d) {
          d3.select(this)
            .select('text')
            .style('font-weight', 500)
            .transition()
            .duration(Viz.TRANS_DURATION / 2)
            .attr('fill', Viz.COLORS['main--dark']);
          d3.select(this)
            .select('circle')
            .transition()
            .duration(Viz.TRANS_DURATION / 2)
            .attr('stroke', Viz.COLORS['main--dark']);
        })
        .on('mouseout', function (d) {
          if (d !== currentScale) {
            d3.select(this)
              .select('text')
              .style('font-weight', 300)
              .transition()
              .duration(Viz.TRANS_DURATION / 2)
              .attr('fill', Viz.COLORS['text']);
            d3.select(this)
              .select('circle')
              .transition()
              .duration(Viz.TRANS_DURATION / 2)
              .attr('stroke', Viz.COLORS['grey']);
          }
        })
        .on('click', function (d) {
          if (d === currentScale) return;

          const lastScale = currentScale;
          currentScale = d;

          const data = Viz.DATA.filter(currentYear).top(Infinity);

          if (currentScale === 'Absolute') {
            colorScale.domain([ABSMIN, ABSMAX]);
          } else {
            const [min, max] = [
              data[0]['Quality of Life Index'],
              data[data.length - 2]['Quality of Life Index'],
            ];
            colorScale.domain([Math.floor(min / 10) * 10, Math.floor(max / 10) * 10 + 10]);
          }

          makeMap(data);
          updateLegend();

          const lastControl = d3.select(`#t${lastScale}`);
          lastControl.select('text').attr('fill', Viz.COLORS['text']).style('font-weight', 300);
          lastControl.select('circle').attr('stroke', Viz.COLORS['grey']);
        });

      types
        .append('circle')
        .attr('r', 10)
        .attr('fill', 'transparent')
        .attr('stroke-width', '2px')
        .attr('stroke', function (d) {
          if (d === currentScale) return Viz.COLORS['main--dark'];
          return Viz.COLORS['grey'];
        });
      types
        .append('text')
        .text(function (d) {
          return scaleTypes[d];
        })
        .attr('x', 17)
        .attr('y', 2)
        .style('alignment-baseline', 'middle')
        .attr('fill', function (d) {
          if (d === currentScale) return Viz.COLORS['main--dark'];
          return Viz.COLORS['text'];
        })
        .style('font-size', '1.3rem')
        .style('font-weight', function (d) {
          if (d === currentScale) return 500;
          return 300;
        })
        .attr('fill-opacity', '.95');

      const controlsBounding = svg
        .append('g')
        .attr('class', 'controlsWrapper')
        .attr('transform', `translate(${coordinatesControls.x}, ${coordinatesControls.y})`);
      const controls = controlsBounding
        .selectAll('.controls')
        .data(Viz.YEARS)
        .enter()
        .append('g')
        .attr('class', 'controls')
        .attr('id', function (d) {
          return 'c' + d;
        })
        .attr('transform', function (d, i) {
          return `translate(${i * 75}, 0)`;
        })
        .style('cursor', 'pointer')
        .on('mouseenter', function (d) {
          d3.select(this)
            .select('text')
            .style('font-weight', 500)
            .transition()
            .duration(Viz.TRANS_DURATION / 2)
            .attr('fill', Viz.COLORS['main--dark']);
          d3.select(this)
            .select('circle')
            .transition()
            .duration(Viz.TRANS_DURATION / 2)
            .attr('stroke', Viz.COLORS['main--dark']);
        })
        .on('mouseout', function (d) {
          if (d !== currentYear) {
            d3.select(this)
              .select('text')
              .style('font-weight', 300)
              .transition()
              .duration(Viz.TRANS_DURATION / 2)
              .attr('fill', Viz.COLORS['text']);
            d3.select(this)
              .select('circle')
              .transition()
              .duration(Viz.TRANS_DURATION / 2)
              .attr('stroke', Viz.COLORS['grey']);
          }
        })
        .on('click', function (d) {
          if (d === currentYear) return;

          const lastYear = currentYear;
          currentYear = d;

          const data = Viz.DATA.filter(currentYear).top(Infinity);

          if (currentScale === 'Relative') {
            const [min, max] = [
              data[0]['Quality of Life Index'],
              data[data.length - 2]['Quality of Life Index'],
            ];
            colorScale.domain([Math.floor(min / 10) * 10, Math.floor(max / 10) * 10 + 10]);
            updateLegend();
          }

          makeMap(data);

          const lastControl = d3.select(`#c${lastYear}`);
          lastControl.select('text').attr('fill', Viz.COLORS['text']).style('font-weight', 300);
          lastControl.select('circle').attr('stroke', Viz.COLORS['grey']);
        });

      controls
        .append('circle')
        .attr('r', 10)
        .attr('fill', 'transparent')
        .attr('stroke-width', '2px')
        .attr('stroke', function (d) {
          if (d == currentYear) return Viz.COLORS['main--dark'];
          return Viz.COLORS['grey'];
        });
      controls
        .append('text')
        .text(function (d) {
          return d;
        })
        .attr('x', 17)
        .attr('y', 2)
        .style('alignment-baseline', 'middle')
        .attr('fill', function (d) {
          if (d === currentYear) return Viz.COLORS['main--dark'];
          return Viz.COLORS['text'];
        })
        .style('font-size', '1.3rem')
        .style('font-weight', function (d) {
          if (d === currentYear) return 500;
          return 300;
        })
        .attr('fill-opacity', '.95');

      controlsBounding
        .append('text')
        .text(
          'Kattintson az évszámra ahhoz, hogy az időbeli változást vizsgálja, relatív esetben a ~legalacsonyabb pontszámhoz viszonyítva. Rá is közelíthet!'
        )
        .attr('x', controlsWidth / 2)
        .attr('y', 45)
        .attr('text-anchor', 'middle')
        .attr('font-size', '1.2rem')
        .attr('fill', Viz.COLORS['text'])
        .attr('font-weight', 400);
    })();

    //#endregion

    chartHolder.call(
      d3
        .zoom()
        .scaleExtent([1, 4])
        .on('zoom', function () {
          const countries = d3.select('.zoomable');

          const { transform } = d3.event;

          countries.attr('transform', transform);
          countries.attr('stroke-width', 1 / transform.k);
        })
    );

    const data = Viz.DATA.filter(currentYear).top(Infinity);
    const [min, max] = [
      data[0]['Quality of Life Index'],
      data[data.length - 2]['Quality of Life Index'],
    ];
    colorScale.domain([Math.floor(min / 10) * 10, Math.floor(max / 10) * 10 + 10]);
    updateLegend();
    makeMap(data);
  };

  Viz.VIZUALIZATIONS.push(init);
})();
