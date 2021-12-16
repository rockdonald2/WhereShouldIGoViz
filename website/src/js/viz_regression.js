import * as d3 from 'd3v4';
import * as regression from 'd3-regression';

import Viz from './viz_core';

(function () {
  'use strict';

  //#region ADATTAGOK ÉS INICIALIZÁLÁS

  const margin = {
    'top': 55,
    'left': 45,
    'right': 75,
    'bottom': 125
  };

  let currentYear = 2020;
  let currentRegressionFunc = null;

  const formatter = new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency: 'USD'
  });

  const chartContainer = d3.select('.main--regression .right');
  const tooltip = Viz.AddTooltip(chartContainer);

  const width = parseInt(chartContainer.style('width')) - margin.left - margin.right;
  const height = parseInt(chartContainer.style('height')) - margin.top - margin.bottom;

  const svg = chartContainer.append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right);

  const chartHolder = svg.append('g')
    .attr('class', 'chartHolder')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  Viz.AddBlur(svg);

  const scaleX = d3.scaleLinear().range([0, width]);
  const scaleY = d3.scaleLinear().range([height, 0]);
  const radius = 8;

  const polynomialRegression = regression.regressionPoly()
    .x(function (d) {
      return parseFloat(d['GDP']);
    })
    .y(function (d) {
      return parseInt(d['Quality of Life Index']);
    })
    .order(2);
  const linePolynomial = d3.line()
    .x(function (d) {
      return scaleX(d[0]);
    })
    .y(function (d) {
      return scaleY(d[1]);
    });

  //#endregion

  const init = () => {
    //#region JELMAGYARÁZAT

    const makeLegend = function () {
      const controlsWidth = 650;
      const coordinates = {
        'x': width / 2 - controlsWidth / 2 + margin.left + margin.right,
        'y': margin.top
      };

      const controlsBounding = svg.append('g').attr('class', 'controlsWrapper')
        .attr('transform', `translate(${coordinates.x}, ${coordinates.y})`);
      const controls = controlsBounding.selectAll('.controls')
        .data(Viz.YEARS).enter().append('g')
        .attr('class', 'controls')
        .attr('id', function (d) {
          return 'ccc' + d;
        })
        .attr('transform', function (d, i) {
          return `translate(${i * 75}, 0)`;
        })
        .style('cursor', 'pointer')
        .on('mouseenter', function (d) {
          d3.select(this).select('text').style('font-weight', 500).transition()
            .duration(Viz.TRANS_DURATION / 2).attr('fill', Viz.COLORS['main--dark']);
          d3.select(this).select('circle').transition()
            .duration(Viz.TRANS_DURATION / 2).attr('stroke', Viz.COLORS['main--dark']);
        })
        .on('mouseout', function (d) {
          if (d != currentYear) {
            d3.select(this).select('text').style('font-weight', 300).transition()
              .duration(Viz.TRANS_DURATION / 2).attr('fill', Viz.COLORS['text']);
            d3.select(this).select('circle').transition()
              .duration(Viz.TRANS_DURATION / 2).attr('stroke', Viz.COLORS['grey']);
          }
        })
        .on('click', function (d) {
          if (d == currentYear) return;

          const lastYear = currentYear;
          currentYear = d;

          const data = Viz.DATA.filter(currentYear).top(Infinity);

          makeChart(data);
          makeAxis();

          const lastControl = d3.select(`#ccc${lastYear}`);
          lastControl.select('text').attr('fill', Viz.COLORS['text']).style('font-weight', 300);
          lastControl.select('circle').attr('stroke', Viz.COLORS['grey']);
        });

      controls.append('circle').attr('r', 10).attr('fill', 'transparent')
        .attr('stroke-width', '2px').attr('stroke', function (d) {
          if (d == currentYear) return Viz.COLORS['main--dark'];
          return Viz.COLORS['grey'];
        });
      controls.append('text').text(function (d) {
          return d;
        })
        .attr('x', 17)
        .attr('y', 2)
        .style('alignment-baseline', 'middle')
        .attr('fill', function (d) {
          if (d == currentYear) return Viz.COLORS['main--dark'];
          return Viz.COLORS['text'];
        })
        .style('font-size', '1.3rem').style('font-weight', function (d) {
          if (d == currentYear) return 500;
          return 300;
        })
        .attr('fill-opacity', '.95');
    }();

    //#endregion

    //#region TENGELYEK

    const xAxis = chartHolder.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margin.left}, ${margin.top + height})`);
    const yAxis = chartHolder.append('g')
      .attr('class', 'y-axis')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const makeAxis = function () {
      xAxis.selectAll('.x-ticks').remove();

      const xTicks = xAxis.selectAll('.x-ticks')
        .data(d3.range(0, scaleX.domain()[1] + 1, 12500));

      const pairs = function (raw) {
        let i = 0;
        const pairs = {};

        for (let i = 0; i < raw.length - 1; ++i) {
          pairs[raw[i] + ' - ' + raw[i + 1]] = Math.round(((raw[i] + raw[i + 1]) / 2));
        }

        return pairs;
      }(d3.range(0, scaleX.domain()[1] + 1, 12500));

      xTicks.enter().append('g').attr('class', 'x-ticks')
        .call(function (t) {
          t.append('line').attr('x1', function (d) {
              return scaleX(d);
            })
            .attr('x2', function (d) {
              return scaleX(d);
            })
            .attr('y1', -6).attr('y2', 6)
            .attr('stroke-width', '2px')
            .attr('stroke', Viz.COLORS['main']);
        });

      const xLabels = xAxis.selectAll('.x-labels')
        .data(Object.keys(pairs));

      xLabels.enter()
        .append('text')
        .attr('class', 'x-labels')
        .merge(xLabels)
        .attr('x', function (d) {
          return scaleX(pairs[d]);
        })
        .attr('y', 0)
        .text(function (d) {
          return d;
        })
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', '1.2rem')
        .attr('font-weight', 400)
        .attr('fill', Viz.COLORS['text']);

      xLabels.exit().remove();
      xTicks.exit().remove();

      yAxis.selectAll('.y-ticks').remove();

      const yTicks = yAxis.selectAll('.y-ticks')
        .data(d3.range(scaleY.domain()[0], scaleY.domain()[1], 25));

      yTicks.enter().append('g').attr('class', 'y-ticks')
        .merge(yTicks)
        .call(function (t) {
          t.append('line')
            .attr('x1', function (d) {
              if (d === scaleY.domain()[0]) return -6;

              return -6;
            })
            .attr('x2', function (d) {
              if (d === scaleY.domain()[0]) return 6;

              return width + margin.right;
            })
            .attr('y1', function (d) {
              return scaleY(d);
            })
            .attr('y2', function (d) {
              return scaleY(d);
            })
            .attr('stroke-width', '2px')
            .attr('stroke', Viz.COLORS['main'])
            .attr('stroke-dasharray', function (d) {
              if (d === scaleY.domain()[0]) return;

              return '5px';
            });

          t.append('text')
            .text(function (d) {
              if (d === scaleY.domain()[0]) return;

              return d;
            })
            .attr('x', -6)
            .attr('y', function (d) {
              return scaleY(d) - 10;
            })
            .attr('alignment-baseline', 'middle')
            .attr('font-size', '1.2rem')
            .attr('fill', Viz.COLORS['text'])
            .attr('font-weight', 400);
        });

      yTicks.exit().remove();
    }

    //#endregion

    //#region CÍMKÉK

    const addLabels = function () {
      const xTitle = chartHolder.append('text')
        .text('GDP').attr('fill', Viz.COLORS['text'])
        .attr('x', margin.left + width / 2)
        .attr('y', height + margin.top + 45)
        .attr('font-size', '1.6rem')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle');

      const yTitle = chartHolder.append('text')
        .text('Quality of Life').attr('fill', Viz.COLORS['text'])
        .attr('x', -margin.top - height / 2)
        .attr('transform', 'rotate(-90)')
        .attr('y', 10)
        .attr('font-size', '1.6rem')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle');
    }();

    //#endregion

    //#region ÁBRA

    chartHolder.append('g').attr('class', 'circles')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    chartHolder.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .append('path').attr('class', 'regression').attr('fill', 'none')
      .attr('stroke', Viz.COLORS['main']).attr('stroke-width', 10)
      .attr('opacity', .5)
      .on('mousemove', function () {
        tooltip.select('.tooltip--heading').html('Regressziós elemek');
        tooltip.select('.tooltip--body')
          .html(`<p>R<sup>2</sup> = ${currentRegressionFunc.rSquared.toFixed(2)}</p>
          <p>QoL = &beta;<sub>0</sub>(${currentRegressionFunc.coefficients[0].toFixed(2)}) + 
          &beta;<sub>1</sub>(${currentRegressionFunc.coefficients[1].toFixed(5)}) &times; GDP<sup>1</sup> + 
          &beta;<sub>2</sub>(${currentRegressionFunc.coefficients[2].toFixed(8)}) &times; GDP<sup>2</sup></p>`);

        tooltip.style('left', (d3.event.pageX - parseInt(tooltip.style('width')) / 2) + 'px');
        tooltip.style('top', (d3.event.pageY + parseInt(tooltip.style('height')) / 2.5) + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('left', '-9999px');
      });

    const makeChart = function (data) {
      scaleX.domain([0, d3.max(data, function (d) {
        return Math.round(parseFloat(d['GDP']));
      })]);

      const min = d3.min(data, function (d) {
        return Math.round(parseFloat(d['Quality of Life Index']));
      });

      scaleY.domain([min > 0 ? 0 : min - 10, d3.max(data, function (d) {
        return Math.round(parseFloat(d['Quality of Life Index']));
      })]);

      const circles = chartHolder.select('.circles')
        .selectAll('.circle')
        .data(data, function (d) {
          return d['Code'];
        });

      circles.enter().append('circle')
        .attr('class', 'circle')
        .attr('id', function (d) {
          return d['Code'];
        })
        .attr('r', 0)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .on('mousemove', function (d) {
          d3.selectAll('.circle').transition().duration(Viz.TRANS_DURATION / 4)
            .attr('opacity', .5);
          d3.select(this).transition().duration(Viz.TRANS_DURATION / 4)
            .attr('opacity', 1);

          tooltip.select('.tooltip--heading').html(d['Country_HU']);
          tooltip.select('.tooltip--body')
            .html('<p>GDP: ' + formatter.format(d['GDP']) + '</p><p>Quality of Life: ' + d['Quality of Life Index'] + '</p>');

          tooltip.style('left', (d3.event.pageX - parseInt(tooltip.style('width')) / 2) + 'px');
          tooltip.style('top', (d3.event.pageY + parseInt(tooltip.style('height')) / 2.5) + 'px');
        })
        .on('mouseout', function (d) {
          d3.selectAll('.circle').transition().duration(Viz.TRANS_DURATION / 4)
            .attr('opacity', 1);
          tooltip.style('left', '-9999px');
        })
        .merge(circles)
        .transition()
        .duration(Viz.TRANS_DURATION)
        .attr('r', radius)
        .attr('cx', function (d) {
          return scaleX(d['GDP']);
        })
        .attr('cy', function (d) {
          return scaleY(d['Quality of Life Index']);
        })
        .attr('fill', function (d) {
          if (d['GDP']) {
            return Viz.COLORS['main--dark']
          }

          return 'transparent';
        });

      circles.exit().transition().duration(Viz.TRANS_DURATION).attr('opacity', 0).remove();

      currentRegressionFunc = polynomialRegression(data);
      chartHolder.select('.regression')
        .datum(currentRegressionFunc)
        .transition().duration(Viz.TRANS_DURATION)
        .attr('d', linePolynomial);
    };

    //#endregion

    makeChart(Viz.DATA.filter(currentYear).top(Infinity));
    makeAxis();
    chartHolder.select('.regression').raise();
    chartHolder.select('.circles').raise();
  };

  Viz.VIZUALIZATIONS.push(init);

})();