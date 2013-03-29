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
    var width = this.width_;
    var range = this.axes_['x'].range;
    xDom = (xValue - range[0]) / (range[1] - range[0]) * width;
    return xDom;
  };

  EfCharts.prototype.yValueToDom = function (yValue, opt_axisId) {
    var yDom = 0;
    var height = this.height_;
    opt_axisId =EfCharts.isIntNullOrUndefined( opt_axisId)? 1 : opt_axisId;
    var range = this.axes_['y' + opt_axisId].range;
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
  
  EfCharts.isStringNullEmptyOrUndefined = function (str) {
    return str === null || str === undefined || str === '';
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
    var i,
        j,
        series, 
        canvas,
        point,
        min,
        max,
        currentXDom, 
        yIn,
        yOut,
        nb;
    var xSeries = this.seriesCollection_[0];
    var round = function(val) {
      return  Math.ceil(val);// Math.ceil(Math.round(val*10)/5) * 5/10;
    };
    
    // TODO: test size of container.
    if(EfCharts.isStringNullEmptyOrUndefined(this.container_.style.height)) {
      this.container_.style.height = EfCharts.DEFAULT_HEIGHT + 'px';
    }
    
    if(EfCharts.isStringNullEmptyOrUndefined(this.container_.style.width)) {
      this.container_.style.width = EfCharts.DEFAULT_WIDTH + 'px';
    }
    
    this.width_ = parseInt(this.container_.style.width, 10);
    this.height_ = parseInt(this.container_.style.height, 10);
    console.log('points drawing...');
    
    for (j = 1; j < this.seriesCollection_.length; j++) {
      canvas = document.createElement('canvas');
      series = this.seriesCollection_[j];

      canvas.height = this.height_;
      canvas.width = this.width_;
      canvas.style.position = 'absolute';

      var ctx = canvas.getContext('2d');

      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      ctx.beginPath();

     // first point
      point = {
        x: xSeries.values[0],
        y: series.values[0],
        xDom : this.xValueToDom(xSeries.values[0])
      };
      
      ctx.moveTo(currentXDom, this.yValueToDom(point.y));
      min = point.y;
      max = point.y;
      yIn = point.y;
      yOut = point.y;
      nb = 1;
      currentXDom = round(point.xDom);
      
      ctx.moveTo(currentXDom, this.yValueToDom(point.y));
      var sd = new Date();
      for (i = 1; i < this._rowsCount; i++) {
         point = {
          x: xSeries.values[i],
          y: series.values[i],
          xDom : this.xValueToDom(xSeries.values[i])
        };
        
        if(currentXDom === round(point.xDom)) {
          if(max < point.y) {
            max = point.y;
          }
          
          if(min > point.y) {
            min = point.y;
          }
          
          yOut = point.y;
          nb++;
        } else {
          // draw column
          ctx.lineTo(currentXDom, this.yValueToDom(yIn));
          ctx.moveTo(currentXDom, this.yValueToDom(min));
          ctx.lineTo(currentXDom, this.yValueToDom(max));
          ctx.moveTo(currentXDom, this.yValueToDom(yOut));
          
          // reset stats
          min = point.y;
          max = point.y;
          currentXDom = round(point.xDom);
          yIn = point.y;
          yOut = point.y;
          nb = 1;
        }
        
        //ctx.lineTo(point.xDom, this.yValueToDom(point.y));
         
      }

       var ed = new Date();
       console.log(ed.getTime() -sd.getTime());
      ctx.stroke();
     
      
      this.container_.appendChild(canvas);
      this.canvases_.push(canvas);
    }
    
    console.log('points drawn.');
  };
}(window));
