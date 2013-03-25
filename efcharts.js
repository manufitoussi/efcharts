/*jshint globalstrict: true */
(function (window) {
  "use strict";
  window.EfCharts = function (container, data) {
    this.init_(container, data);
  };

  EfCharts.VERSION = '0.1';
  EfCharts.NAME = 'EfCharts';
  EfCharts.AUTHOR = 'Emmanuel Fitoussi';

  EfCharts.DEFAULT_WIDTH = 480;
  EfCharts.DEFAULT_HEIGHT = 320;

  EfCharts.prototype.init_ = function (container, data) {

    if (!container) {
      // error
      console.error('container must be set.');
      return;
    }

    this.container_ = container;
    this.data_ = data;

    this.parseData_();
    this.preRender_();
    this.render_();
  };

  EfCharts.prototype.xDomToValue = function (xDom) {
    console.error('not implemented.');
    return null;
  };

  EfCharts.prototype.yDomToValue = function (yDom) {
    console.error('not implemented.');
    return null;
  };

  EfCharts.prototype.xValueToDom = function (xValue) {
    var xDom = 0;
    var width = EfCharts.DEFAULT_WIDTH;
    var range = this.getXRange();
    xDom = (xValue - range[0]) / (range[1] - range[0]) * width;
    return xDom;
  };

  EfCharts.prototype.yValueToDom = function (yValue) {
    var yDom = 0;
    var height = EfCharts.DEFAULT_HEIGHT;
    var range = this.getYRange();
    yDom = (1 - (yValue - range[0]) / (range[1] - range[0])) * height;
    return yDom;
  };

  EfCharts.prototype.getXRange = function () {
    var max = -Infinity;
    var min = Infinity;
    var data = this.data_;
    var i;
    for (i = 0; i < data.length; i++) {
      min = Math.min(min, data[i][0]);
      max = Math.max(max, data[i][0]);
    }

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

  EfCharts.isIntNullOrUndefined = function (integer) {
    return isNaN(parseInt(integer, 10));
  };

  EfCharts.prototype.parseData_ = function () {
    this.seriesCollection_ = [];
    var data = this.data_;
    var i, j;

    // verify number of columns
    for (i = 0; i < data.length; i++) {
      if (!EfCharts.isIntNullOrUndefined(this._seriesCount)
            && this._seriesCount !== data[i].length) {
        console.error('data is not valid. Number of columns are not constant.');
        return;
      }

      this._seriesCount = data[i].length;
      this._rowsCount = data.length;
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

  EfCharts.prototype.preRender_ = function () {
    // delete previous constructions
    this.container_.innerHtml = '';
    this.canvases_ = [];
  };

  EfCharts.prototype.render_ = function () {
    var i, j;
    this.container_.style.height = EfCharts.DEFAULT_HEIGHT + 'px';
    this.container_.style.width = EfCharts.DEFAULT_WIDTH + 'px';

    for (j = 1; j < this.seriesCollection_.length; j++) {
      var canvas = document.createElement('canvas');

      canvas.height = EfCharts.DEFAULT_HEIGHT;
      canvas.width = EfCharts.DEFAULT_WIDTH;
      canvas.style.position = 'absolute';

      var ctx = canvas.getContext('2d');

      ctx.lineWidth = 1.0;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      // first point
      var point = {
        x: this.seriesCollection_[0].values[0],
        y: this.seriesCollection_[j].values[0]
      };
      ctx.moveTo(this.xValueToDom(point.x), this.yValueToDom(point.y));
      for (i = 0; i < this._rowsCount - 1; i++) {
        point = {
          x: this.seriesCollection_[0].values[i + 1],
          y: this.seriesCollection_[j].values[i + 1]
        };
        ctx.lineTo(this.xValueToDom(point.x), this.yValueToDom(point.y));
      }

      ctx.stroke();

      this.container_.appendChild(canvas);
      this.canvases_.push(canvas);
    }
  };
}(window));
