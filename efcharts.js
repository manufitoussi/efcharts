/*jslint indent: 2, maxlen: 80, maxerr: 50, browser: true,
devel: true, vars: true, nomen: true, plusplus: true */
/*global EfCharts:false */

// TODO(ef): create draw layout with size.
(function () {
  "use strict";
  window.EfCharts = function (container, data) {

    this.canvasTicksX_ = null;
    this.canvasTicksY_ = null;
    this.canvasOver_ = null;
    this.canvases = null;
    this.container_ = null;
    this.data_ = null;
    this.width_ = null;
    this.height_ = null;
    this.axes_ = null;
    this.seriesCollection_ = null;
    this._seriesCount = null;
    this.rowsCount_ = null;
    this.xTicks_ = null;
    this.yTicks_ = null;

    this.init_(container, data);
  };

  EfCharts.VERSION = '0.1';
  EfCharts.NAME = 'EfCharts';
  EfCharts.AUTHOR = 'Emmanuel Fitoussi';

  EfCharts.DEFAULT_WIDTH = 480;
  EfCharts.DEFAULT_HEIGHT = 320;
  EfCharts.DEFAULT_TICKS_SIZE = 30;

  EfCharts.DEBUG = true;

  /**
  *
  */
  EfCharts.log = function (message, opt_type) {
    if (EfCharts.DEBUG) {
      if (console.log === undefined) {
        // do nothing if log doesn't exist.
        console.log = function () {};
      }

      if (typeof (message) === 'object' ||
          opt_type === undefined) {
        // default log.
        console.log(message);
      } else if (console[opt_type] !== undefined) {
        console[opt_type](message);
      } else {
        console.log('[' + opt_type + ']' + message);
      }
    }
  };

  EfCharts.debug = function (message) {
    EfCharts.log(message, 'debug');
  };

  EfCharts.warn = function (message) {
    EfCharts.log(message, 'warn');
  };

  EfCharts.info = function (message) {
    EfCharts.log(message, 'info');
  };

  EfCharts.error = function (message) {
    EfCharts.log(message, 'error');
  };

  /**
  *
  */
  EfCharts.time = function (flag) {
    if (EfCharts.DEBUG) {
      if (typeof (console.time) === 'function') {
        console.time(flag);
      } else {
        if (EfCharts.timeFlags_ === undefined) {
          EfCharts.timeFlags_ = {};
        } else {
          EfCharts.timeFlags_[flag] = new Date();
        }
      }
    }
  };

  /**
  *
  */
  EfCharts.timeEnd = function (flag) {
    if (EfCharts.DEBUG) {
      if (typeof (console.timeEnd) === 'function') {
        console.timeEnd(flag);
      } else {
        if (EfCharts.timeFlags_ !== undefined &&
            EfCharts.timeFlags_.hasOwnProperty(flag)) {
          EfCharts.debug(
            flag + ': ' +
              (new Date().getTime() - EfCharts.timeFlags_[flag].getTime()) +
                'ms'
          );
        }
      }
    }
  };

  EfCharts.isIntNullNaNOrUndefined = function (integer) {
    return isNaN(parseInt(integer, 10));
  };

  EfCharts.isIntNullOrUndefined = function (integer) {
    return isNaN(parseInt(integer, 10));
  };

  EfCharts.isStringNullEmptyOrUndefined = function (str) {
    return str === null || str === undefined || str === '';
  };

  EfCharts.log10 = function (value) {
    return Math.log(value) / Math.LN10;
  };

  EfCharts.prototype.init_ = function (container, data) {

    if (!container) {
      // error
      EfCharts.error('container must be set.');
      return;
    }

    this.container_ = container;
    this.data_ = data;

    this.parseData_();
    this.setupTicks_();
    this.preRender_();
    this.render_();
  };

  EfCharts.prototype.getYTicksWidth = function () {
    // TODO(ef): make this a per-axis parameter.
    return EfCharts.DEFAULT_TICKS_SIZE;
  };
  
  EfCharts.prototype.getXTicksHeight = function () {
    // TODO(ef): make this a parameter.
    return EfCharts.DEFAULT_TICKS_SIZE;
  };
  
  EfCharts.prototype.xDomToValue = function (xDom) {
    EfCharts.error('not implemented.');
    return null;
  };

  EfCharts.prototype.yDomToValue = function (yDom) {
    EfCharts.error('not implemented.');
    return null;
  };

  EfCharts.prototype.xValueToDom = function (xValue) {
    if (!this.axes_.hasOwnProperty('x')) {
      EfCharts.error('x axis is not defined.');
      return;
    }

    var xDom = 0;
    // one axis here
    var width = this.width_ - this.getYTicksWidth();
    var range = this.axes_.x.range;
    xDom = this.getYTicksWidth() + (xValue - range[0]) / (range[1] - range[0]) * width;
    return xDom;
  };

  EfCharts.prototype.yValueToDom = function (yValue, opt_axisId) {
    opt_axisId = EfCharts.isIntNullOrUndefined(opt_axisId) ? 1 : opt_axisId;
    if (!this.axes_.hasOwnProperty('y' + opt_axisId)) {
      EfCharts.error('y' + opt_axisId + ' axis is not defined.');
      return;
    }

    var yDom = 0;
    var height = this.height_ - this.getXTicksHeight();
    var range = this.axes_['y' + opt_axisId].range;
    yDom = (1 - (yValue - range[0]) / (range[1] - range[0])) * height;
    return yDom;
  };

  EfCharts.prototype.getXRange = function () {
    var data = this.data_;
    var min = data[0][0];
    var max = data[data.length - 1][0];
    return [min, max];
  };

  EfCharts.prototype.getYRange = function () {
    var max = -Infinity;
    var min = Infinity;
    var data = this.data_;
    var i, j;
    for (i = 0; i < data.length; i++) {
      for (j = 1; j < data[0].length; j++) {
        min = Math.min(min, data[i][j]);
        max = Math.max(max, data[i][j]);
      }
    }

    return [min, max];
  };

  EfCharts.prototype.parseData_ = function () {
    this.seriesCollection_ = [];
    var data = this.data_;
    var i, j;

    // verify number of columns
    for (i = 0; i < data.length; i++) {
      if (!EfCharts.isIntNullNaNOrUndefined(this._seriesCount) &&
          this._seriesCount !== data[i].length) {
        EfCharts.error(
          'data is not valid. Number of columns are not constant.'
        );
        return;
      }

      this._seriesCount = data[i].length;
      this.rowsCount_ = data.length;
    }

    var xSeries = { values: [], title: '', axis: 'x' };
    this.seriesCollection_.push(xSeries);
    // creates x axis values
    for (i = 0; i < data.length; i++) {
      xSeries.values.push(data[i][0]);
    }

    // creates seriesCollection.
    for (j = 1; j < this._seriesCount; j++) {
      var series = { values: [], title: '', axis: 'y1', context : {} };
      this.seriesCollection_.push(series);
      for (i = 0; i < data.length; i++) {
        series.values.push(data[i][j]);
      }
    }

    // creates y axes:
    this.axes_ = {};
    var axis = { range: this.getYRange(), title: '' };
    this.axes_.y1 = axis;

    // creates absisse:
    var xAxis = { range: this.getXRange(), title: '' };
    this.axes_.x = xAxis;

  };

  EfCharts.calculateStepFromRange = function (start, end) {
    var delta = end - start;
    var decile = delta / 10;
    var order = -Math.floor(EfCharts.log10(decile));
    var power = Math.pow(10, order);
    var step = Math.round(decile * power);
    if (step  !== 2 && step % 5 !== 0 && step !== 1) {
      step = Math.ceil(step / 5.0) * 5;
    }

    step = step / power;
    return step;
  };

  EfCharts.calculateTicksFromRange = function (start, end) {
    var tick;
    var ticks = [];
    var xStep = EfCharts.calculateStepFromRange(start, end);
    start = Math.ceil(start / xStep) * xStep;
    for (tick = start; tick <= end; tick += xStep) {
      ticks.push(tick);
    }
    return ticks;
  };

  EfCharts.prototype.setupTicks_ = function () {
    // TODO(ef): test presence of ticks.
    var xRange = this.axes_.x.range;
    var yRange = this.axes_.y1.range;
    this.xTicks_ = EfCharts.calculateTicksFromRange(xRange[0], xRange[1]);
    this.yTicks_ = EfCharts.calculateTicksFromRange(yRange[0], yRange[1]);
  };

  EfCharts.prototype.eventToDomCoords = function (event) {

    // offset for all browsers
    // layer for firefox
    var x = event.offsetX === undefined ? event.layerX : event.offsetX;
    var y = event.offsetY === undefined ? event.layerY : event.offsetY;
    return [x, y];
  };

  EfCharts.prototype.preRender_ = function () {
    // delete previous constructions
    this.container_.innerHtml = '';
    this.canvases_ = [];
    var container = this.container_;

    // TODO(ef): do tests.
    var onMouseMove = function (e) {
      var domCoords = this.eventToDomCoords(e);
      var canvas = this.canvasOver_;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = 'blue';
      ctx.moveTo(domCoords[0], 0);
      ctx.lineTo(domCoords[0], canvas.height - this.getXTicksHeight());
      ctx.stroke();
    }.bind(this);

    // TODO(ef): do tests.
    var onMouseOut = function (e) {
      var canvas = this.canvasOver_;
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }.bind(this);

    container.addEventListener('mousemove', onMouseMove, false);
    container.addEventListener('mouseout', onMouseOut, false);
  };

  EfCharts.prototype.newCanvas_ = function (id) {
    var canvas = document.createElement('canvas');
    canvas.id = id;
    canvas.height = this.height_;
    canvas.width = this.width_;
    canvas.style.position = 'absolute';
    return canvas;
  };

  EfCharts.prototype.render_ = function () {
    var i,
      j,
      series,
      canvas,
      point,
      column,
      columns,
      ctx;
    var xSeries = this.seriesCollection_[0];
    var round = function (val) {
      return Math.floor(val);
    };

    var createPoint = function (chart, xSeries, series, xIdx) {
      return {
        x: xSeries.values[xIdx],
        y: series.values[xIdx],
        xDom : chart.xValueToDom(xSeries.values[xIdx])
      };
    };
    var drawColumn = function (chart, ctx, column) {
      ctx.moveTo(column.xDom, chart.yValueToDom(column.yMin));
      ctx.lineTo(column.xDom, chart.yValueToDom(column.yMax));
    };

    var drawConnection = function (chart, ctx, column) {
      ctx.lineTo(column.xDom, chart.yValueToDom(column.yIn));
      ctx.moveTo(column.xDom, chart.yValueToDom(column.yOut));
    };

    var resetColumn = function (point) {
      return {
        yMin : point.y,
        yMax : point.y,
        yIn : point.y,
        yOut : point.y,
        nb : 1,
        xDom : round(point.xDom)
      };
    };

    var updateColumn = function (column, point) {
      if (column.yMax < point.y) {
        column.yMax = point.y;
      }

      if (column.yMin > point.y) {
        column.yMin = point.y;
      }

      column.yOut = point.y;
      column.nb++;
    };

    if (EfCharts.isStringNullEmptyOrUndefined(this.container_.style.height)) {
      this.container_.style.height = EfCharts.DEFAULT_HEIGHT + 'px';
    }

    if (EfCharts.isStringNullEmptyOrUndefined(this.container_.style.width)) {
      this.container_.style.width = EfCharts.DEFAULT_WIDTH + 'px';
    }

    this.width_ = parseInt(this.container_.style.width, 10);
    this.height_ = parseInt(this.container_.style.height, 10);

    EfCharts.info('x ticks drawing...');
    this.canvasTicksX_ = this.newCanvas_('x-ticks');
    ctx = this.canvasTicksX_.getContext('2d');
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#aaa';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (i = 0; i < this.xTicks_.length; i++) {
      var xDom = this.xValueToDom(this.xTicks_[i]);
      ctx.moveTo(xDom, this.height_- this.getXTicksHeight());
      ctx.lineTo(xDom, 0);
      ctx.fillText(this.xTicks_[i], xDom, this.height_);
    }

    ctx.stroke();
    this.container_.appendChild(this.canvasTicksX_);
    EfCharts.info('x ticks drawn.');

    EfCharts.info('y ticks drawing...');
    this.canvasTicksY_ = this.newCanvas_('y-ticks');
    ctx = this.canvasTicksY_.getContext('2d');
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#aaa';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'red';
    ctx.beginPath();
    for (i = 0; i < this.yTicks_.length; i++) {
      var yDom = this.yValueToDom(this.yTicks_[i]);
      ctx.moveTo(this.getYTicksWidth(), yDom);
      ctx.lineTo(this.width_, yDom);
      ctx.fillText(this.yTicks_[i], 0, yDom);
    }

    ctx.stroke();
    this.container_.appendChild(this.canvasTicksY_);
    EfCharts.info('y ticks drawn.');


    EfCharts.info('points drawing...');

    for (j = 1; j < this.seriesCollection_.length; j++) {
      series = this.seriesCollection_[j];
      canvas = this.newCanvas_('series-' + j);
      ctx = canvas.getContext('2d');

      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      columns = [];

      EfCharts.time('draw points of series [' + j + ']');

      // draw points
      for (i = 0; i < this.rowsCount_; i++) {

        point = createPoint(this, xSeries, series, i);

        if (i === 0) {
          // first point
          // create the first column.
          column = resetColumn(point);
        } else {
          if (column.xDom === round(point.xDom)) {
            // same column.
            // update stats.
            updateColumn(column, point);
          } else {
            // another column
            // draw the previous and create the new one.
            drawColumn(this, ctx, column);
            columns.push(column);
            column = resetColumn(point);
          }

          if (i === (this.rowsCount_ - 1)) {
            // force drawing the last point.
            drawColumn(this, ctx, column);
            columns.push(column);
          }
        }
      }

      ctx.stroke();

      // draw conections
      // using columns.
      ctx.beginPath();
      for (i = 0; i < columns.length; i++) {
        column = columns[i];
        drawConnection(this, ctx, column);
      }

      ctx.stroke();
      EfCharts.timeEnd('draw points of series [' + j + ']');

      this.container_.appendChild(canvas);
      this.canvases_.push(canvas);
    }

    EfCharts.info('points drawn.');

    this.canvasOver_ = this.newCanvas_('over');
    this.container_.appendChild(this.canvasOver_);
  };
}());
