import * as d3 from 'd3v4';
import crossfilter from 'crossfilter2';

import Viz from './viz_core';

(function () {
  'use strict';

  //#region ADATTAGOK ÉS INICIALIZÁLÁS

  const margin = {
    top: 100,
    left: 15,
    right: 15,
    bottom: 15,
  };
  const upper = 100;

  let currentYear = 2021;

  const chartContainer = d3.select('.main--components .right');
  const tooltip = Viz.AddTooltip(chartContainer);

  const width = parseInt(chartContainer.style('width')) - margin.left - margin.right;
  const height = parseInt(chartContainer.style('height')) - margin.top - margin.bottom;

  const svg = chartContainer
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right);

  const chartHolder = svg
    .append('g')
    .attr('class', 'chartHolder')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const associations = {
    'Purchasing Power Index': 'Vásárlóerő Index',
    'Safety Index': 'Biztonsági Index',
    'Health Care Index': 'Egészségügy Index',
    'Cost of Living Index': 'Megélhetési Index',
    'Property Price to Income Ratio': 'Jövedelem ingatlanár arány',
    'Traffic Commute Time Index': 'Ingázási idő Index',
    'Pollution Index': 'Szennyezettségi Index',
    'Climate Index': 'Klíma Index',
  };

  const weights = {
    'Purchasing Power Index': '+',
    'Property Price to Income Ratio': '-',
    'Cost of Living Index': '-',
    'Safety Index': '+',
    'Health Care Index': '+',
    'Traffic Commute Time Index': '-',
    'Pollution Index': '-',
    'Climate Index': '+',
  };

  Viz.AddBlur(svg);

  const scaleX = d3
    .scaleLinear()
    .domain([-180, 180])
    .range([0, width - 15]);
  const scaleY = d3
    .scaleBand()
    .domain(Object.keys(associations))
    .rangeRound([0, height - upper])
    .paddingInner(0)
    .paddingOuter(0.08);

  //#endregion

  const getCountries = function (data) {
    const countries = [];

    data.forEach((c) => {
      countries.push(c['Country_HU']);
    });

    return countries.sort();
  };

  const init = () => {
    const dropdown = d3.select('.main--components__dropdown');
    const chart = chartHolder.append('g').attr('transform', `translate(${margin.left}, ${upper * .75})`);

    //#region JELMAGYARÁZAT

    const makeLegend = (function () {
      const legendWidth = 710;
      const legendHeight = 75;
      const coordinates = {
        x: width / 2 - legendWidth / 2 + margin.left + margin.right,
        y: -margin.top + 15,
      };

      const legend = chartHolder
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${coordinates.x}, ${coordinates.y})`);
      const controls = legend
        .selectAll('.controls')
        .data(Viz.YEARS)
        .enter()
        .append('g')
        .attr('class', 'controls')
        .attr('id', function (d) {
          return 'cc' + d;
        })
        .attr('transform', function (d, i) {
          return `translate(${i * 75}, 0)`;
        })
        .style('cursor', 'pointer')
        .attr('transform', function (d, i) {
          return `translate(${i * 75}, 0)`;
        })
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
          if (d != currentYear) {
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
          if (d == currentYear) return;

          const lastYear = currentYear;
          currentYear = d;

          makeChart(Viz.DATA.filter(currentYear).top(Infinity));

          const lastControl = d3.select(`#cc${lastYear}`);
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
          if (d == currentYear) return Viz.COLORS['main--dark'];
          return Viz.COLORS['text'];
        })
        .style('font-size', '1.3rem')
        .style('font-weight', function (d) {
          if (d == currentYear) return 500;
          return 300;
        })
        .attr('fill-opacity', '.95');
    })();

    //#endregion

    //#region TENGELYEK

    const makeAxis = (function () {
      const makeX = (function () {
        const xAxis = chartHolder
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(${margin.left}, ${upper})`);
        const xTicks = xAxis
          .selectAll('.x-ticks')
          .data(d3.range(scaleX.domain()[0], scaleX.domain()[1] + 1, 30))
          .enter()
          .append('g')
          .attr('class', 'x-ticks');

        xTicks
          .append('line')
          .attr('x1', scaleX)
          .attr('x2', scaleX)
          .attr('y1', function (d) {
            if (d === 0) return -upper + 15;

            return -6;
          })
          .attr('y2', function (d) {
            if (d === 0) return height - upper;

            return 6;
          })
          .attr('stroke-width', '2px')
          .attr('stroke', Viz.COLORS['main'])
          .attr('stroke-dasharray', function (d) {
            if (d === 0) return '12px';

            return null;
          });

        xTicks
          .append('text')
          .text(function (d) {
            return d;
          })
          .attr('x', scaleX)
          .style('text-anchor', 'middle')
          .attr('y', function (d) {
            if (d === 0) return -upper + 3;

            return -15;
          })
          .attr('font-size', '1.2rem')
          .attr('font-weight', 400)
          .attr('fill', Viz.COLORS['text']);

        svg
          .select('.defs')
          .append('marker')
          .attr('id', 'marker')
          .attr('markerHeight', 10)
          .attr('markerWidth', 10)
          .attr('refX', 6)
          .attr('refY', 3)
          .attr('orient', 'auto')
          .append('path')
          .attr('d', 'M0,0L9,3L0,6Z')
          .attr('fill', Viz.COLORS['main']);

        xAxis
          .append('g')
          .attr('transform', `translate(${width / 2 - 25}, ${-upper + 25})`)
          .call(function (g) {
            g.append('text')
              .text('Csökkenti a pontszámot')
              .style('font-size', '1.4rem')
              .attr('fill', Viz.COLORS['text'])
              .style('alignment-baseline', 'middle')
              .attr('dy', '.1em')
              .style('text-anchor', 'end');
          })
          .call(function (g) {
            g.append('line')
              .attr('x1', -180)
              .attr('x2', -210)
              .attr('stroke', Viz.COLORS['main'])
              .attr('marker-end', 'url(#marker)');
          });

        xAxis
          .append('g')
          .attr('transform', `translate(${width / 2 + 10}, ${-upper + 25})`)
          .call(function (g) {
            g.append('text')
              .text('Növeli a pontszámot')
              .style('font-size', '1.4rem')
              .attr('fill', Viz.COLORS['text'])
              .style('alignment-baseline', 'middle')
              .attr('dy', '.1em')
              .style('text-anchor', 'start');
          })
          .call(function (g) {
            g.append('line')
              .attr('x1', 155)
              .attr('x2', 185)
              .attr('stroke', Viz.COLORS['main'])
              .attr('marker-end', 'url(#marker)');
          });
      })();

      const makeFilledRects = (function () {
        const rects = chart
          .selectAll('.filledRectAxis')
          .data(Object.keys(associations), function (d) {
            return d;
          });

        rects
          .enter()
          .append('rect')
          .attr('class', '.filledRectAxis')
          .attr('x', scaleX(scaleX.domain()[0]))
          .attr('y', function (d) {
            return scaleY(d) + scaleY.bandwidth() / 2;
          })
          .attr('fill', Viz.COLORS['grey'])
          .attr('rx', 3)
          .attr('height', scaleY.bandwidth() / 2)
          .style('filter', 'url(#glow)')
          .transition()
          .duration(Viz.TRANS_DURATION)
          .attr('width', scaleX(scaleX.domain()[1]));
      })();
    })();

    //#endregion

    //#region CÍMKÉK

    const addLabels = (function () {
      const labels = chartHolder
        .append('g')
        .attr(
          'transform',
          `translate(${scaleX(0) + margin.left}, ${upper * .75 + scaleY.bandwidth() / 4})`
        );

      labels
        .selectAll('label')
        .data(Object.keys(associations))
        .enter()
        .append('text')
        .attr('id', function (d) {
          return `d${d.split(' ')[0]}`;
        })
        .text(function (d) {
          return associations[d];
        })
        .attr('text-anchor', function (d) {
          return weights[d] === '-' ? 'start' : 'end';
        })
        .attr('y', function (d) {
          return scaleY(d) + scaleY.bandwidth() / 2;
        })
        .attr('dx', function (d) {
          return weights[d] === '-' ? '1em' : '-1em';
        })
        .attr('alignment-baseline', 'middle')
        .style('font-size', '1.2rem')
        .attr('fill', Viz.COLORS['text']);
    })();

    //#endregion

    //#region ÁBRA

    const makeChart = function (data) {
      data = crossfilter(data).dimension(function (o) {
        return o['Country_HU'];
      });

      const countries = getCountries(data.top(Infinity));
      const options = dropdown
        .selectAll('.main--components__options')
        .data(countries, function (d) {
          return d;
        });

      options
        .enter()
        .append('option')
        .attr('class', 'main--components__options')
        .merge(options)
        .text(function (d) {
          return d;
        })
        .attr('value', function (d) {
          return d;
        });

      options.exit().remove();

      const currentCountry = dropdown.node().value;
      const displayedData = data.filter(currentCountry).top(1)[0];

      const components = chart
        .selectAll('.component')
        .data(Object.keys(associations), function (d) {
          return d;
        });

      components
        .enter()
        .append('rect')
        .attr('class', 'component')
        .attr('id', function (d) {
          return d;
        })
        .attr('x', scaleX(0))
        .style('filter', 'url(#glow)')
        .merge(components)
        .on('mouseenter', function (d) {
          d3.select(this).transition().duration(Viz.TRANS_DURATION).attr('opacity', 1);
          d3.select(`#d${d.split(' ')[0]}`)
            .transition()
            .duration(Viz.TRANS_DURATION)
            .attr('fill', Viz.COLORS['main--dark'])
            .style('font-weight', 500);

          tooltip.select('.tooltip--heading').html('');
          const html = `<p>${displayedData[d]}</p>`;
          tooltip.select('.tooltip--body').html(html);
          const pos =
            weights[d] === '+'
              ? scaleX(0) + (scaleX(displayedData[d]) - scaleX(0)) / 2 + 'px'
              : scaleX(0) - (scaleX(0) - scaleX(displayedData[d] * -1)) / 2 + 'px';
          tooltip.style('left', pos);
          tooltip.style(
            'top',
            scaleY(d) + margin.top + upper + scaleY.bandwidth() + scaleY.bandwidth() / 2 + 'px'
          );
        })
        .on('mouseleave', function (d) {
          d3.select(this).transition().duration(Viz.TRANS_DURATION).attr('opacity', 0.5);
          d3.select(`#d${d.split(' ')[0]}`)
            .transition()
            .duration(Viz.TRANS_DURATION)
            .attr('fill', Viz.COLORS['text'])
            .style('font-weight', 400);

          tooltip.style('left', -9999 + 'px');
        })
        .attr('y', function (d) {
          return scaleY(d) + scaleY.bandwidth() / 2;
        })
        .attr('fill', Viz.COLORS['main--dark'])
        .attr('opacity', 0.5)
        .attr('rx', 3)
        .attr('height', scaleY.bandwidth() / 2)
        .transition()
        .duration(Viz.TRANS_DURATION)
        .attr('x', function (d) {
          if (weights[d] === '-') {
            return scaleX(displayedData[d] * -1);
          }

          return scaleX(0);
        })
        .attr('width', function (d) {
          const tmp = scaleX(displayedData[d]) - scaleX(0);
          return tmp < 0 ? tmp * -1 : tmp;
        });
    };

    //#endregion

    dropdown.on('change', function () {
      makeChart(Viz.DATA.filter(currentYear).top(Infinity));
    });

    makeChart(Viz.DATA.filter(currentYear).top(Infinity));
  };

  Viz.VIZUALIZATIONS.push(init);
})();
