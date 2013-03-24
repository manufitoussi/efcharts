var EfCharts = {};


EfCharts = function (container, data) {
  this._init(container, data);
};

EfCharts.VERSION = '0.1.0';
EfCharts.NAME = 'EfCharts';
EfCharts.AUTHOR = 'Emmanuel Fitoussi';

EfCharts.DEFAULT_WIDTH = 480;
EfCharts.DEFAULT_HEIGHT = 320;

EfCharts.prototype._init = function (container, data) {

  if (!container) {
    // error
    console.error('container must be set.');
    return;
  }

  this._container = container;
  this._data = data;

  this._predraw();
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
  xDom = (xValue - 0) / (range[1] - range[0]) * width;
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
  var data = this._data;

  for (var i = 0; i < data.length; i++) {
      min = Math.min(min, data[i][0]);
      max = Math.max(max, data[i][0]);
  }

  return [min, max];
};
EfCharts.prototype.getYRange = function () {
  var max = -Infinity;
  var min = Infinity;
  var data = this._data;

  for (var i = 0; i < data.length; i++) {
    for (var j = 1; j < data[0].length; j++) {
      min = Math.min(min, data[i][j]);
      max = Math.max(max, data[i][j]);
    }
  }

  return [min, max];
};

EfCharts.prototype._predraw = function () {
  // delete previous constructions
  this._container.innerHtml = '';

  this._container.style.height = EfCharts.DEFAULT_HEIGHT + 'px';
  this._container.style.width = EfCharts.DEFAULT_WIDTH + 'px';

  this._canvases = [];

  var data = this._data;
  for (var j = 1; j < data[0].length; j++) {
    var canvas = document.createElement('canvas');

    canvas.height = EfCharts.DEFAULT_HEIGHT;
    canvas.width = EfCharts.DEFAULT_WIDTH;
    canvas.style.position = 'absolute';

    var ctx = canvas.getContext('2d');

    ctx.lineWidth = 5.0;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    // first point
    ctx.moveTo(this.xValueToDom(data[0][0]), this.yValueToDom(data[0][j]));
    for (var i = 1; i < data.length - 1; i++) {
      ctx.lineTo(this.xValueToDom(data[i + 1][0]), this.yValueToDom(data[i + 1][j]));
    }

    ctx.stroke();

    this._container.appendChild(canvas);
    this._canvases.push(canvas);
  }
};

