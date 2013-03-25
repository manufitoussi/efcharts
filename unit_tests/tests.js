/*jshint globalstrict: true */
/*global EfCharts:false, test:false, ok:false, deepEqual:false,
  strictEqual:false*/
(function (window) {
  "use strict";

  EfCharts.prototype.getAllSeries = function () {
    return this.seriesCollection_;
  };

  EfCharts.prototype.getCanvases = function () {
    return this.canvases_;
  };

  EfCharts.prototype.getAxes = function () {
    return this.axes_;
  };

  EfCharts.Tests = {};
  EfCharts.Tests.data = [
    [0, 10, 50, 60],
    [1, 20, 40, 40],
    [2, 15, 30, 20],
    [3, 25, 20, -5]
  ];

  test('isIntNullOrUndefined', function () {
    strictEqual(EfCharts.isIntNullOrUndefined(0), false, '0');
    strictEqual(EfCharts.isIntNullOrUndefined(0.0), false, '0.0');
    strictEqual(EfCharts.isIntNullOrUndefined(5), false, '5');
    strictEqual(EfCharts.isIntNullOrUndefined(5.0), false, '5.0');
    strictEqual(EfCharts.isIntNullOrUndefined(-4), false, '-4');
    strictEqual(EfCharts.isIntNullOrUndefined(-4.0), false, '-4.0');
    strictEqual(EfCharts.isIntNullOrUndefined(NaN), true, 'NaN');
    strictEqual(EfCharts.isIntNullOrUndefined(null), true, 'null');
    strictEqual(EfCharts.isIntNullOrUndefined(undefined), true, 'undefined');
  });

  test('efcharts creation', function () {
    var div = document.getElementById('efcharts');
    var charts = new EfCharts(div, EfCharts.Tests.data);
    ok(charts, 'Created!');
  });

  test('ranges', function () {
    var div = document.getElementById('efcharts');
    var charts = new EfCharts(div, EfCharts.Tests.data);
    var xRange = charts.getXRange();
    var yRange = charts.getYRange();
    deepEqual(xRange, [0, 3], 'xRange');
    deepEqual(yRange, [-5, 60], 'yRange');

  });

  test('xValueToDom', function () {
    var div = document.getElementById('efcharts');
    var charts = new EfCharts(div, EfCharts.Tests.data);
    var xRange = charts.getXRange();
    var x;
    for (x = -2; x < (EfCharts.Tests.data.length + 2); x++) {
      strictEqual(charts.xValueToDom(x),
                  (x - xRange[0]) / (xRange[1] - xRange[0])
                    * EfCharts.DEFAULT_WIDTH,
                  'test ' + x);
    }
  });

  test('yValueToDom', function () {
    var div = document.getElementById('efcharts');
    var charts = new EfCharts(div, EfCharts.Tests.data);
    var yRange = charts.getYRange();
    var y;
    for (y = yRange[0] - 20; y < yRange[1] + 20; y += 10) {
      strictEqual(charts.yValueToDom(y),
                  (1 - (y - yRange[0]) / (yRange[1] - yRange[0]))
                    * EfCharts.DEFAULT_HEIGHT,
                  'test ' + y);
    }
  });

  test('series count', function () {
    var div = document.getElementById('efcharts');
    var charts = new EfCharts(div, EfCharts.Tests.data);
    var count = EfCharts.Tests.data[0].lenght;
    strictEqual(charts.getAllSeries().lenght, count, 'nb of series');
    strictEqual(charts.getCanvases().lenght, count, 'nb of canvas');
    ok(charts.getAxes().x, 'axis x is present');
    ok(charts.getAxes().y1, 'axis y1 is present');
  });
}(window));