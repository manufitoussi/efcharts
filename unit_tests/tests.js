/*jshint globalstrict: true */
/*global EfCharts:false, test:false, ok:false, deepEqual:false,
  strictEqual:false*/
(function () {
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
    strictEqual(EfCharts.isIntNullNaNOrUndefined(0), false, '0');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(0.0), false, '0.0');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(5), false, '5');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(5.0), false, '5.0');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(-4), false, '-4');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(-4.0), false, '-4.0');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(NaN), true, 'NaN');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(null), true, 'null');
    strictEqual(EfCharts.isIntNullNaNOrUndefined(undefined), true, 'undefined');
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
	
	test('getStepFromRange', function() {
		var testRange = function(start, end, result) {
			strictEqual(EfCharts.getStepFromRange(start, end), result, '[' + start +',' + end  +'] -> ' + result);
		};
		testRange(0.4,0.6, 0.02);
		testRange(0,0.6, 0.1);
		testRange(0,4.1, 0.5);
		testRange(1,9, 1);
		testRange(1,10, 1);
		testRange(0,12,1);
		testRange(0,21,2);
		testRange(0,25,5);
		testRange(0,31,5);
		testRange(0,51,5);
		testRange(0,1501,200);
		testRange(1300,1501,20);
	});
	
	test('getTicksFromRange', function() {
		var testRange = function(start, end, result) {
			deepEqual(EfCharts.getTicksFromRange(start, end), result, '[' + start +',' + end  +'] -> ok');
		};
    
		testRange(0,4.1, [0,0.5,1,1.5,2,2.5,3,3.5,4]);
		testRange(1,9,[1,2,3,4,5,6,7,8,9]);
		testRange(1,10, [1,2,3,4,5,6,7,8,9,10]);
		testRange(0,12,[0,1,2,3,4,5,6,7,8,9,10,11,12]);
		testRange(0,25,[0,5,10,15,20,25]);
		testRange(0,34,[0,5,10,15,20,25,30]);
		testRange(-2.3,51,[0,5,10,15,20,25,30,35,40,45,50]);
		testRange(0,1501,[0,200,400,600,800,1000,1200,1400]);
		testRange(1300,1501,[1300,1320,1340,1360,1380,1400,1420,1440,1460,1480,1500]);

	});
	
}());