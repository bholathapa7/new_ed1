import Chart from 'chart.js';
/**
 * @desc NPM published Crosshair plugin is outdated, but 'snap' is implemented in the repo
 *  so I just copied the repo in order to put it directly to the chartjs
 */

/* eslint-disable no-magic-numbers */
const defaultOptions = {
  line: {
    color: '#F66',
    width: 0.5,
    dashPattern: [5, 5],
  },
  sync: {
    enabled: true,
    group: 1,
    suppressTooltips: false,
  },
  zoom: {
    enabled: true,
    zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',
    zoomboxBorderColor: '#48F',
    zoomButtonText: 'Reset Zoom',
    zoomButtonClass: 'reset-zoom',
  },
  snap: {
    enabled: false,
  },
  callbacks: {
  },
};

const helpers = Chart.helpers;

export const crosshairPlugin = {
  afterInit(chart: any) {
    if (chart.config.options.scales.xAxes.length === 0) {
      return;
    }


    const xScaleType = chart.config.options.scales.xAxes[0].type;

    if (xScaleType !== 'linear' && xScaleType !== 'time' && xScaleType !== 'category') {
      return;
    }

    chart.crosshair = {
      enabled: false,
      x: null,
      originalData: [],
      originalXRange: {},
      dragStarted: false,
      dragStartX: null,
      dragEndX: null,
      suppressTooltips: false,
      reset: () => {
        this.resetZoom(chart);
      },
    };

    const syncEnabled = this.getOption(chart, 'sync', 'enabled');
    if (syncEnabled) {
      chart.crosshair.syncEventHandler = (e: any) => {
        this.handleSyncEvent(chart, e);
      };

      chart.crosshair.resetZoomEventHandler = (e: any) => {
        const syncGroup = this.getOption(chart, 'sync', 'group');

        if (e.chartId !== chart.id && e.syncGroup === syncGroup) {
          this.resetZoom(chart);
        }
      };

      window.addEventListener('sync-event', chart.crosshair.syncEventHandler);
      window.addEventListener('reset-zoom-event', chart.crosshair.resetZoomEventHandler);
    }
  },

  destroy(chart: any) {
    const syncEnabled = this.getOption(chart, 'sync', 'enabled');
    if (syncEnabled) {
      window.removeEventListener('sync-event', chart.crosshair.syncEventHandler);
      window.removeEventListener('reset-zoom-event', chart.crosshair.resetZoomEventHandler);
    }
  },

  getOption(chart: any, category: any, name: any): any {
    return helpers.getValueOrDefault(chart.options.plugins.crosshair[category] ?
      chart.options.plugins.crosshair[category][name] : undefined, (defaultOptions as any)[category][name]);
  },

  getXScale(chart: any) {
    return chart.data.datasets.length ? chart.scales[chart.getDatasetMeta(0).xAxisID] : null;
  },
  getYScale(chart: any) {
    return chart.scales[chart.getDatasetMeta(0).yAxisID];
  },

  handleSyncEvent(chart: any, e: any) {
    const syncGroup = this.getOption(chart, 'sync', 'group');

    // stop if the sync event was fired from this chart
    if (e.chartId === chart.id) {
      return;
    }

    // stop if the sync event was fired from a different group
    if (e.syncGroup !== syncGroup) {
      return;
    }

    const xScale = this.getXScale(chart);

    if (!xScale) {
      return;
    }

    // Safari fix
    let buttons = (e.original.native.buttons === undefined ? e.original.native.which : e.original.native.buttons);
    if (e.original.type === 'mouseup') {
      buttons = 0;
    }

    const newEvent = {
      type: e.original.type,
      chart,
      x: xScale.getPixelForValue(e.xValue),
      y: e.original.y,
      native: {
        buttons,
      },
      stop: true,
    };
    chart.controller.eventHandler(newEvent);
  },

  afterEvent(chart: any, e: any) {
    if (chart.config.options.scales.xAxes.length === 0) {
      return;
    }


    const xScaleType = chart.config.options.scales.xAxes[0].type;

    if (xScaleType !== 'linear' && xScaleType !== 'time' && xScaleType !== 'category') {
      return;
    }

    const xScale = this.getXScale(chart);


    if (!xScale) {
      return;
    }


    // fix for Safari
    let buttons = (e.native.buttons === undefined ? e.native.which : e.native.buttons);
    if (e.native.type === 'mouseup') {
      buttons = 0;
    }

    const syncEnabled = this.getOption(chart, 'sync', 'enabled');
    const syncGroup = this.getOption(chart, 'sync', 'group');

    // fire event for all other linked charts
    if (!e.stop && syncEnabled) {
      const event: any = new CustomEvent('sync-event');
      event.chartId = chart.id;
      event.syncGroup = syncGroup;
      event.original = e;
      event.xValue = xScale.getValueForPixel(e.x);
      window.dispatchEvent(event);
    }

    // suppress tooltips for linked charts
    const suppressTooltips = this.getOption(chart, 'sync', 'suppressTooltips');

    chart.crosshair.suppressTooltips = e.stop && suppressTooltips;

    chart.crosshair.enabled = (e.type !== 'mouseout' && (e.x > xScale.getPixelForValue(xScale.min) && e.x < xScale.getPixelForValue(xScale.max)));

    if (!chart.crosshair.enabled) {
      if (e.x > xScale.getPixelForValue(xScale.max)) {
        chart.update();
      }

      return true;
    }

    // handle drag to zoom
    const zoomEnabled = this.getOption(chart, 'zoom', 'enabled');

    if (buttons === 1 && !chart.crosshair.dragStarted && zoomEnabled) {
      chart.crosshair.dragStartX = e.x;
      chart.crosshair.dragStarted = true;
    }

    // handle drag to zoom
    if (chart.crosshair.dragStarted && buttons === 0) {
      chart.crosshair.dragStarted = false;

      chart.update();
    }

    chart.crosshair.x = e.x;


    chart.draw();

    return;
  },

  afterDraw(chart: any) {
    if (!chart.crosshair.enabled) {
      return;
    }

    if (chart.crosshair.dragStarted) {
      this.drawZoombox(chart);
    } else {
      this.drawTraceLine(chart);
      this.interpolateValues(chart);
      this.drawTracePoints(chart);
    }

    return true;
  },

  beforeTooltipDraw(chart: any) {
    // suppress tooltips on dragging
    return !chart.crosshair.dragStarted && !chart.crosshair.suppressTooltips;
  },

  resetZoom(chart: any) {
    const stop = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    const update = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

    if (update) {
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let datasetIndex = 0; datasetIndex < chart.data.datasets.length; datasetIndex++) {
        const dataset = chart.data.datasets[datasetIndex];
        dataset.data = chart.crosshair.originalData.shift(0);
      }

      let range = 'ticks';

      if (chart.options.scales.xAxes[0].time) {
        range = 'time';
      }
      // reset original xRange
      if (chart.crosshair.originalXRange.min) {
        chart.options.scales.xAxes[0][range].min = chart.crosshair.originalXRange.min;
        chart.crosshair.originalXRange.min = null;
      } else {
        delete chart.options.scales.xAxes[0][range].min;
      }
      if (chart.crosshair.originalXRange.max) {
        chart.options.scales.xAxes[0][range].max = chart.crosshair.originalXRange.max;
        chart.crosshair.originalXRange.max = null;
      } else {
        delete chart.options.scales.xAxes[0][range].max;
      }
    }

    if (chart.crosshair.button && chart.crosshair.button.parentNode) {
      chart.crosshair.button.parentNode.removeChild(chart.crosshair.button);
      chart.crosshair.button = false;
    }

    const syncEnabled = this.getOption(chart, 'sync', 'enabled');

    if (!stop && update && syncEnabled) {
      const syncGroup = this.getOption(chart, 'sync', 'group');

      const event: any = new CustomEvent('reset-zoom-event');
      event.chartId = chart.id;
      event.syncGroup = syncGroup;
      window.dispatchEvent(event);
    }
    if (update) {
      const anim = chart.options.animation;
      chart.options.animation = false;
      chart.update();
      chart.options.animation = anim;
    }
  },

  drawZoombox(chart: any) {
    const yScale = this.getYScale(chart);

    const borderColor = this.getOption(chart, 'zoom', 'zoomboxBorderColor');
    const fillColor = this.getOption(chart, 'zoom', 'zoomboxBackgroundColor');

    chart.ctx.beginPath();
    chart.ctx.rect(
      chart.crosshair.dragStartX, yScale.getPixelForValue(yScale.max),
      chart.crosshair.x - chart.crosshair.dragStartX,
      yScale.getPixelForValue(yScale.min) - yScale.getPixelForValue(yScale.max),
    );
    chart.ctx.lineWidth = 1;
    chart.ctx.strokeStyle = borderColor;
    chart.ctx.fillStyle = fillColor;
    chart.ctx.fill();
    chart.ctx.fillStyle = '';
    chart.ctx.stroke();
    chart.ctx.closePath();
  },

  drawTraceLine(chart: any) {
    const yScale = this.getYScale(chart);

    const lineWidth = this.getOption(chart, 'line', 'width');
    const color = this.getOption(chart, 'line', 'color');
    const dashPattern = this.getOption(chart, 'line', 'dashPattern');
    const snapEnabled = this.getOption(chart, 'snap', 'enabled');

    let lineX = chart.crosshair.x;
    const isHoverIntersectOff = chart.config.options.hover.intersect === false;

    if (snapEnabled && isHoverIntersectOff && chart.active.length) {
      lineX = chart.active[0]._view.x;
    }

    chart.ctx.beginPath();
    chart.ctx.setLineDash(dashPattern);
    chart.ctx.moveTo(lineX, yScale.getPixelForValue(yScale.max));
    chart.ctx.lineWidth = lineWidth;
    chart.ctx.strokeStyle = color;
    chart.ctx.lineTo(lineX, yScale.getPixelForValue(yScale.min));
    chart.ctx.stroke();
    chart.ctx.setLineDash([]);
  },

  drawTracePoints(chart: any) {
    for (let chartIndex = 0; chartIndex < chart.data.datasets.length; chartIndex++) {
      const dataset = chart.data.datasets[chartIndex];
      const meta = chart.getDatasetMeta(chartIndex);

      const yScale = chart.scales[meta.yAxisID];

      if (meta.hidden || !dataset.interpolate) {
        continue;
      }

      chart.ctx.beginPath();
      chart.ctx.arc(chart.crosshair.x, yScale.getPixelForValue(dataset.interpolatedValue), 3, 0, 2 * Math.PI, false);
      chart.ctx.fillStyle = 'white';
      chart.ctx.lineWidth = 2;
      chart.ctx.strokeStyle = dataset.borderColor;
      chart.ctx.fill();
      chart.ctx.stroke();
    }
  },

  interpolateValues(chart: any) {
    for (let chartIndex = 0; chartIndex < chart.data.datasets.length; chartIndex++) {
      const dataset = chart.data.datasets[chartIndex];

      const meta = chart.getDatasetMeta(chartIndex);

      const xScale = chart.scales[meta.xAxisID];
      const xValue = xScale.getValueForPixel(chart.crosshair.x);

      if (meta.hidden || !dataset.interpolate) {
        continue;
      }

      const data = dataset.data;
      const index = data.findIndex((o: any) => o.x >= xValue);
      const prev = data[index - 1];
      const next = data[index];

      if (chart.data.datasets[chartIndex].steppedLine && prev) {
        dataset.interpolatedValue = prev.y;
      } else if (prev && next) {
        const slope = (next.y - prev.y) / (next.x - prev.x);
        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        dataset.interpolatedValue = prev.y + (xValue - prev.x) * slope;
      } else {
        dataset.interpolatedValue = NaN;
      }
    }
  },
};
