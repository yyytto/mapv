(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.mapv = global.mapv || {})));
}(this, function (exports) { 'use strict';

  var version = "0.0.0";

  var _3d = '3d';

  /**
   * @author kyle / http://nikai.us/
   */

  function clear (context) {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  /**
   * @author kyle / http://nikai.us/
   */

  var drawPointSimple = {
      draw: function (context, data, options) {
          
          context.save();

          var size = options.size || 5;
          
          for (var i = 0; i < data.length; i++) {

              var item = data[i];

              context.beginPath();
              context.moveTo(item.x, item.y);
              context.arc(item.x, item.y, size, 0, Math.PI * 2);
              context.fill();

          };

          context.restore();

      },
      isPointInPath: function (context, point, data) {

          for (var i = 0; i < data.length; i++) {

              context.beginPath();
              context.arc(item.x, item.y, item.count, 0, Math.PI * 2);
              if (context.isPointInPath(point.x, point.y)) {
                  return data[i];
              }

          }

          return false;

      }
  }

  /**
   * @author kyle / http://nikai.us/
   */

  var drawPointBubble = {
      draw: function (context, data) {
          
          context.save();
          
          for (var i = 0; i < data.length; i++) {

              var item = data[i];

              context.beginPath();
              context.moveTo(item.x, item.y);
              context.arc(item.x, item.y, item.count, 0, Math.PI * 2);
              context.fill();

          };

          context.restore();

      }
  }

  var gradient = {
      getColor: function (value, max, gradientOptions) {
          if (value > max) {
              value = max;
          }
          gradientOptions = gradientOptions || { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"};

          var paletteCanvas = document.createElement('canvas');
          paletteCanvas.width = 256;
          paletteCanvas.height = 1;

          var paletteCtx = paletteCanvas.getContext('2d');

          var gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
          for (var key in gradientOptions) {
            gradient.addColorStop(key, gradientOptions[key]);
          }

          paletteCtx.fillStyle = gradient;
          paletteCtx.fillRect(0, 0, 256, 1);

          var index = Math.floor(value / max * (256 - 1)) * 4;
          var imageData = paletteCtx.getImageData(0, 0, 256, 1).data;
          return "rgba(" + imageData[index] + ", " + imageData[index + 1] + ", " + imageData[index + 2] + ", " + imageData[index + 3] + ")";
      }
  }

  var drawPointGrid = {
      draw: function (context, data) {

          context.save();

          var grids = {};

          var gridWidth = 50;

          for (var i = 0; i < data.length; i++) {
              var gridKey = Math.floor(data[i].x / gridWidth) + "," + Math.floor(data[i].y / gridWidth);
              if (!grids[gridKey]) {
                  grids[gridKey] = 0;
              }
              grids[gridKey] += ~~(data[i].count || 1);
          }

          for (var gridKey in grids) {
              gridKey = gridKey.split(",");

              context.beginPath();
              context.rect(gridKey[0] * gridWidth + .5, gridKey[1] * gridWidth + .5, gridWidth - 1, gridWidth - 1);
              context.fillStyle = gradient.getColor(grids[gridKey], 100);
              context.fill();
          }

          context.restore();
      }
  }

  /**
   * @author kyle / http://nikai.us/
   */

  var utilsColorPalette = {
      getImageData: function(config) {
          var gradientConfig = config.gradient || config.defaultGradient;
          var paletteCanvas = document.createElement('canvas');
          var paletteCtx = paletteCanvas.getContext('2d');

          paletteCanvas.width = 256;
          paletteCanvas.height = 1;

          var gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
          for (var key in gradientConfig) {
            gradient.addColorStop(key, gradientConfig[key]);
          }

          paletteCtx.fillStyle = gradient;
          paletteCtx.fillRect(0, 0, 256, 1);

          return paletteCtx.getImageData(0, 0, 256, 1).data;
      }
  }

  function createCircle(radius) {

      var circle = document.createElement('canvas');
      var context = circle.getContext('2d');
      var shadowBlur = 13;
      var r2 = radius + shadowBlur;
      var offsetDistance = 10000;

      circle.width = circle.height = r2 * 2;

      context.shadowBlur = shadowBlur;
      context.shadowColor = 'black';
      context.shadowOffsetX = context.shadowOffsetY = offsetDistance;

      context.beginPath();
      context.arc(r2 - offsetDistance, r2 - offsetDistance, radius, 0, Math.PI * 2, true);
      context.closePath();
      context.fill();
      return circle;
  }

  function colorize(pixels, gradient, options) {

      var maxOpacity = options.maxOpacity || 0.8;
      for (var i = 3, len = pixels.length, j; i < len; i += 4) {
          j = pixels[i] * 4; // get gradient color from opacity value

          if (pixels[i] / 256 > maxOpacity) {
              pixels[i] = 256 * maxOpacity;
          }

          pixels[i - 3] = gradient[j];
          pixels[i - 2] = gradient[j + 1];
          pixels[i - 1] = gradient[j + 2];
      }
  }

  function draw(context, data, options) {

      options = options || {};

      context.save();

      var max = options.max || 100;
      var radius = options.radius || 13;
      var circle = createCircle(radius);

      data.forEach(function(item) {

          context.globalAlpha = item.count / max;
          context.drawImage(circle, item.x - circle.width / 2, item.y - circle.height / 2);

      });

      var colored = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
      colorize(colored.data, utilsColorPalette.getImageData({
          defaultGradient: options.gradient || { 0.25: "rgb(0,0,255)", 0.55: "rgb(0,255,0)", 0.85: "yellow", 1.0: "rgb(255,0,0)"},
      }), options);

      context.putImageData(colored, 0, 0);

      context.restore();

  }

  var drawPointHeatmap = {
      draw: draw
  }

  var point = {
      draw: function (context, data, options) {

          context.save();

          for (var key in options) {
              context[key] = options[key];
          }

          switch (options.draw) {
              case 'heatmap':
                  drawPointHeatmap.draw(context, data, options);
                  break;
              case 'grid':
                  drawPointGrid.draw(context, data, options);
                  break;
              case 'bubble':
                  drawPointBubble.draw(context, data, options);
                  break;
              case 'simple':
                  drawPointSimple.draw(context, data, options);
                  break;
                  
          }

          context.restore();

      }
  }

  /**
   * @author kyle / http://nikai.us/
   */

  var drawPolylineSimple = {
      draw: function (context, data) {

          for (var i = 0, len = data.length; i < len; i++) {

              var item = data[i];
              var geo = item.geo;
              context.beginPath();
              context.moveTo(geo[0][0], geo[0][1]);
              for (var j = 1; j < geo.length; j++) {
                  context.lineTo(geo[j][0], geo[j][1]);
              }

              context.stroke();

          }
      }
  }

  var polyline = {
      draw: function (context, data, options) {

          context.save();

          for (var key in options) {
              context[key] = options[key];
          }

          drawPolylineSimple.draw(context, data, options);

          context.restore();

      }
  }

  /**
   * @author kyle / http://nikai.us/
   */

  var drawPolygonSimple = {
      draw: function (context, data, options) {

          for (var i = 0, len = data.length; i < len; i++) {

              context.beginPath();

              var item = data[i];
              var geo = item.geo;
              context.moveTo(geo[0][0], geo[0][1]);
              for (var j = 1; j < geo.length; j++) {
                  context.lineTo(geo[j][0], geo[j][1]);
              }
              context.lineTo(geo[0][0], geo[0][1]);

              if (options.strokeStyle) {
                  context.stroke();
              }

              context.closePath();
              context.fill();

          }
      }
  }

  var polygon = {
      draw: function (context, data, options) {

          context.save();

          for (var key in options) {
              context[key] = options[key];
          }

          drawPolygonSimple.draw(context, data, options);

          context.restore();

      }
  }

  /**
   * get the center by the city name
   * @author kyle / http://nikai.us/
   */

  var citycenter = {municipalities:[{n:"北京",g:"116.395645,39.929986|12"},{n:"上海",g:"121.487899,31.249162|12"},{n:"天津",g:"117.210813,39.14393|12"},{n:"重庆",g:"106.530635,29.544606|12"}],provinces:[{n:"安徽",g:"117.216005,31.859252|8",cities:[{n:"合肥",g:"117.282699,31.866942|12"},{n:"安庆",g:"117.058739,30.537898|13"},{n:"蚌埠",g:"117.35708,32.929499|13"},{n:"亳州",g:"115.787928,33.871211|13"},{n:"巢湖",g:"117.88049,31.608733|13"},{n:"池州",g:"117.494477,30.660019|14"},{n:"滁州",g:"118.32457,32.317351|13"},{n:"阜阳",g:"115.820932,32.901211|13"},{n:"淮北",g:"116.791447,33.960023|13"},{n:"淮南",g:"117.018639,32.642812|13"},{n:"黄山",g:"118.29357,29.734435|13"},{n:"六安",g:"116.505253,31.755558|13"},{n:"马鞍山",g:"118.515882,31.688528|13"},{n:"宿州",g:"116.988692,33.636772|13"},{n:"铜陵",g:"117.819429,30.94093|14"},{n:"芜湖",g:"118.384108,31.36602|12"},{n:"宣城",g:"118.752096,30.951642|13"}]},{n:"福建",g:"117.984943,26.050118|8",cities:[{n:"福州",g:"119.330221,26.047125|12"},{n:"龙岩",g:"117.017997,25.078685|13"},{n:"南平",g:"118.181883,26.643626|13"},{n:"宁德",g:"119.542082,26.656527|14"},{n:"莆田",g:"119.077731,25.44845|13"},{n:"泉州",g:"118.600362,24.901652|12"},{n:"三明",g:"117.642194,26.270835|14"},{n:"厦门",g:"118.103886,24.489231|12"},{n:"漳州",g:"117.676205,24.517065|12"}]},{n:"甘肃",g:"102.457625,38.103267|6",cities:[{n:"兰州",g:"103.823305,36.064226|12"},{n:"白银",g:"104.171241,36.546682|13"},{n:"定西",g:"104.626638,35.586056|13"},{n:"甘南州",g:"102.917442,34.992211|14"},{n:"嘉峪关",g:"98.281635,39.802397|13"},{n:"金昌",g:"102.208126,38.516072|13"},{n:"酒泉",g:"98.508415,39.741474|13"},{n:"临夏州",g:"103.215249,35.598514|13"},{n:"陇南",g:"104.934573,33.39448|14"},{n:"平凉",g:"106.688911,35.55011|13"},{n:"庆阳",g:"107.644227,35.726801|13"},{n:"天水",g:"105.736932,34.584319|13"},{n:"武威",g:"102.640147,37.933172|13"},{n:"张掖",g:"100.459892,38.93932|13"}]},{n:"广东",g:"113.394818,23.408004|8",cities:[{n:"广州",g:"113.30765,23.120049|12"},{n:"潮州",g:"116.630076,23.661812|13"},{n:"东莞",g:"113.763434,23.043024|12"},{n:"佛山",g:"113.134026,23.035095|13"},{n:"河源",g:"114.713721,23.757251|12"},{n:"惠州",g:"114.410658,23.11354|12"},{n:"江门",g:"113.078125,22.575117|13"},{n:"揭阳",g:"116.379501,23.547999|13"},{n:"茂名",g:"110.931245,21.668226|13"},{n:"梅州",g:"116.126403,24.304571|13"},{n:"清远",g:"113.040773,23.698469|13"},{n:"汕头",g:"116.72865,23.383908|13"},{n:"汕尾",g:"115.372924,22.778731|14"},{n:"韶关",g:"113.594461,24.80296|13"},{n:"深圳",g:"114.025974,22.546054|12"},{n:"阳江",g:"111.97701,21.871517|14"},{n:"云浮",g:"112.050946,22.937976|13"},{n:"湛江",g:"110.365067,21.257463|13"},{n:"肇庆",g:"112.479653,23.078663|13"},{n:"中山",g:"113.42206,22.545178|12"},{n:"珠海",g:"113.562447,22.256915|13"}]},{n:"广西",g:"108.924274,23.552255|7",cities:[{n:"南宁",g:"108.297234,22.806493|12"},{n:"百色",g:"106.631821,23.901512|13"},{n:"北海",g:"109.122628,21.472718|13"},{n:"崇左",g:"107.357322,22.415455|14"},{n:"防城港",g:"108.351791,21.617398|15"},{n:"桂林",g:"110.26092,25.262901|12"},{n:"贵港",g:"109.613708,23.103373|13"},{n:"河池",g:"108.069948,24.699521|14"},{n:"贺州",g:"111.552594,24.411054|14"},{n:"来宾",g:"109.231817,23.741166|14"},{n:"柳州",g:"109.422402,24.329053|12"},{n:"钦州",g:"108.638798,21.97335|13"},{n:"梧州",g:"111.305472,23.485395|13"},{n:"玉林",g:"110.151676,22.643974|14"}]},{n:"贵州",g:"106.734996,26.902826|8",cities:[{n:"贵阳",g:"106.709177,26.629907|12"},{n:"安顺",g:"105.92827,26.228595|13"},{n:"毕节地区",g:"105.300492,27.302612|14"},{n:"六盘水",g:"104.852087,26.591866|13"},{n:"铜仁地区",g:"109.196161,27.726271|14"},{n:"遵义",g:"106.93126,27.699961|13"},{n:"黔西南州",g:"104.900558,25.095148|11"},{n:"黔东南州",g:"107.985353,26.583992|11"},{n:"黔南州",g:"107.523205,26.264536|11"}]},{n:"海南",g:"109.733755,19.180501|9",cities:[{n:"海口",g:"110.330802,20.022071|13"},{n:"白沙",g:"109.358586,19.216056|12"},{n:"保亭",g:"109.656113,18.597592|12"},{n:"昌江",g:"109.0113,19.222483|12"},{n:"儋州",g:"109.413973,19.571153|13"},{n:"澄迈",g:"109.996736,19.693135|13"},{n:"东方",g:"108.85101,18.998161|13"},{n:"定安",g:"110.32009,19.490991|13"},{n:"琼海",g:"110.414359,19.21483|13"},{n:"琼中",g:"109.861849,19.039771|12"},{n:"乐东",g:"109.062698,18.658614|12"},{n:"临高",g:"109.724101,19.805922|13"},{n:"陵水",g:"109.948661,18.575985|12"},{n:"三亚",g:"109.522771,18.257776|12"},{n:"屯昌",g:"110.063364,19.347749|13"},{n:"万宁",g:"110.292505,18.839886|13"},{n:"文昌",g:"110.780909,19.750947|13"},{n:"五指山",g:"109.51775,18.831306|13"}]},{n:"河北",g:"115.661434,38.61384|7",cities:[{n:"石家庄",g:"114.522082,38.048958|12"},{n:"保定",g:"115.49481,38.886565|13"},{n:"沧州",g:"116.863806,38.297615|13"},{n:"承德",g:"117.933822,40.992521|14"},{n:"邯郸",g:"114.482694,36.609308|13"},{n:"衡水",g:"115.686229,37.746929|13"},{n:"廊坊",g:"116.703602,39.518611|13"},{n:"秦皇岛",g:"119.604368,39.945462|12"},{n:"唐山",g:"118.183451,39.650531|13"},{n:"邢台",g:"114.520487,37.069531|13"},{n:"张家口",g:"114.893782,40.811188|13"}]},{n:"河南",g:"113.486804,34.157184|7",cities:[{n:"郑州",g:"113.649644,34.75661|12"},{n:"安阳",g:"114.351807,36.110267|12"},{n:"鹤壁",g:"114.29777,35.755426|13"},{n:"焦作",g:"113.211836,35.234608|13"},{n:"开封",g:"114.351642,34.801854|13"},{n:"洛阳",g:"112.447525,34.657368|12"},{n:"漯河",g:"114.046061,33.576279|13"},{n:"南阳",g:"112.542842,33.01142|13"},{n:"平顶山",g:"113.300849,33.745301|13"},{n:"濮阳",g:"115.026627,35.753298|12"},{n:"三门峡",g:"111.181262,34.78332|13"},{n:"商丘",g:"115.641886,34.438589|13"},{n:"新乡",g:"113.91269,35.307258|13"},{n:"信阳",g:"114.085491,32.128582|13"},{n:"许昌",g:"113.835312,34.02674|13"},{n:"周口",g:"114.654102,33.623741|13"},{n:"驻马店",g:"114.049154,32.983158|13"}]},{n:"黑龙江",g:"128.047414,47.356592|6",cities:[{n:"哈尔滨",g:"126.657717,45.773225|12"},{n:"大庆",g:"125.02184,46.596709|12"},{n:"大兴安岭地区",g:"124.196104,51.991789|10"},{n:"鹤岗",g:"130.292472,47.338666|13"},{n:"黑河",g:"127.50083,50.25069|14"},{n:"鸡西",g:"130.941767,45.32154|13"},{n:"佳木斯",g:"130.284735,46.81378|12"},{n:"牡丹江",g:"129.608035,44.588521|13"},{n:"七台河",g:"131.019048,45.775005|14"},{n:"齐齐哈尔",g:"123.987289,47.3477|13"},{n:"双鸭山",g:"131.171402,46.655102|13"},{n:"绥化",g:"126.989095,46.646064|13"},{n:"伊春",g:"128.910766,47.734685|14"}]},{n:"湖北",g:"112.410562,31.209316|8",cities:[{n:"武汉",g:"114.3162,30.581084|12"},{n:"鄂州",g:"114.895594,30.384439|14"},{n:"恩施",g:"109.517433,30.308978|14"},{n:"黄冈",g:"114.906618,30.446109|14"},{n:"黄石",g:"115.050683,30.216127|13"},{n:"荆门",g:"112.21733,31.042611|13"},{n:"荆州",g:"112.241866,30.332591|12"},{n:"潜江",g:"112.768768,30.343116|13"},{n:"神农架林区",g:"110.487231,31.595768|13"},{n:"十堰",g:"110.801229,32.636994|13"},{n:"随州",g:"113.379358,31.717858|13"},{n:"天门",g:"113.12623,30.649047|13"},{n:"仙桃",g:"113.387448,30.293966|13"},{n:"咸宁",g:"114.300061,29.880657|13"},{n:"襄阳",g:"112.176326,32.094934|12"},{n:"孝感",g:"113.935734,30.927955|13"},{n:"宜昌",g:"111.310981,30.732758|13"}]},{n:"湖南",g:"111.720664,27.695864|7",cities:[{n:"长沙",g:"112.979353,28.213478|12"},{n:"常德",g:"111.653718,29.012149|12"},{n:"郴州",g:"113.037704,25.782264|13"},{n:"衡阳",g:"112.583819,26.898164|13"},{n:"怀化",g:"109.986959,27.557483|13"},{n:"娄底",g:"111.996396,27.741073|13"},{n:"邵阳",g:"111.461525,27.236811|13"},{n:"湘潭",g:"112.935556,27.835095|13"},{n:"湘西州",g:"109.745746,28.317951|14"},{n:"益阳",g:"112.366547,28.588088|13"},{n:"永州",g:"111.614648,26.435972|13"},{n:"岳阳",g:"113.146196,29.378007|13"},{n:"张家界",g:"110.48162,29.124889|13"},{n:"株洲",g:"113.131695,27.827433|13"}]},{n:"江苏",g:"119.368489,33.013797|8",cities:[{n:"南京",g:"118.778074,32.057236|12"},{n:"常州",g:"119.981861,31.771397|12"},{n:"淮安",g:"119.030186,33.606513|12"},{n:"连云港",g:"119.173872,34.601549|12"},{n:"南通",g:"120.873801,32.014665|12"},{n:"苏州",g:"120.619907,31.317987|12"},{n:"宿迁",g:"118.296893,33.95205|13"},{n:"泰州",g:"119.919606,32.476053|13"},{n:"无锡",g:"120.305456,31.570037|12"},{n:"徐州",g:"117.188107,34.271553|12"},{n:"盐城",g:"120.148872,33.379862|12"},{n:"扬州",g:"119.427778,32.408505|13"},{n:"镇江",g:"119.455835,32.204409|13"}]},{n:"江西",g:"115.676082,27.757258|7",cities:[{n:"南昌",g:"115.893528,28.689578|12"},{n:"抚州",g:"116.360919,27.954545|13"},{n:"赣州",g:"114.935909,25.845296|13"},{n:"吉安",g:"114.992039,27.113848|13"},{n:"景德镇",g:"117.186523,29.303563|12"},{n:"九江",g:"115.999848,29.71964|13"},{n:"萍乡",g:"113.859917,27.639544|13"},{n:"上饶",g:"117.955464,28.457623|13"},{n:"新余",g:"114.947117,27.822322|13"},{n:"宜春",g:"114.400039,27.81113|13"},{n:"鹰潭",g:"117.03545,28.24131|13"}]},{n:"吉林",g:"126.262876,43.678846|7",cities:[{n:"长春",g:"125.313642,43.898338|12"},{n:"白城",g:"122.840777,45.621086|13"},{n:"白山",g:"126.435798,41.945859|13"},{n:"吉林市",g:"126.564544,43.871988|12"},{n:"辽源",g:"125.133686,42.923303|13"},{n:"四平",g:"124.391382,43.175525|12"},{n:"松原",g:"124.832995,45.136049|13"},{n:"通化",g:"125.94265,41.736397|13"},{n:"延边",g:"129.485902,42.896414|13"}]},{n:"辽宁",g:"122.753592,41.6216|8",cities:[{n:"沈阳",g:"123.432791,41.808645|12"},{n:"鞍山",g:"123.007763,41.118744|13"},{n:"本溪",g:"123.778062,41.325838|12"},{n:"朝阳",g:"120.446163,41.571828|13"},{n:"大连",g:"121.593478,38.94871|12"},{n:"丹东",g:"124.338543,40.129023|12"},{n:"抚顺",g:"123.92982,41.877304|12"},{n:"阜新",g:"121.660822,42.01925|14"},{n:"葫芦岛",g:"120.860758,40.74303|13"},{n:"锦州",g:"121.147749,41.130879|13"},{n:"辽阳",g:"123.172451,41.273339|14"},{n:"盘锦",g:"122.073228,41.141248|13"},{n:"铁岭",g:"123.85485,42.299757|13"},{n:"营口",g:"122.233391,40.668651|13"}]},{n:"内蒙古",g:"114.415868,43.468238|5",cities:[{n:"呼和浩特",g:"111.660351,40.828319|12"},{n:"阿拉善盟",g:"105.695683,38.843075|14"},{n:"包头",g:"109.846239,40.647119|12"},{n:"巴彦淖尔",g:"107.423807,40.76918|12"},{n:"赤峰",g:"118.930761,42.297112|12"},{n:"鄂尔多斯",g:"109.993706,39.81649|12"},{n:"呼伦贝尔",g:"119.760822,49.201636|12"},{n:"通辽",g:"122.260363,43.633756|12"},{n:"乌海",g:"106.831999,39.683177|13"},{n:"乌兰察布",g:"113.112846,41.022363|12"},{n:"锡林郭勒盟",g:"116.02734,43.939705|11"},{n:"兴安盟",g:"122.048167,46.083757|11"}]},{n:"宁夏",g:"106.155481,37.321323|8",cities:[{n:"银川",g:"106.206479,38.502621|12"},{n:"固原",g:"106.285268,36.021523|13"},{n:"石嘴山",g:"106.379337,39.020223|13"},{n:"吴忠",g:"106.208254,37.993561|14"},{n:"中卫",g:"105.196754,37.521124|14"}]},{n:"青海",g:"96.202544,35.499761|7",cities:[{n:"西宁",g:"101.767921,36.640739|12"},{n:"果洛州",g:"100.223723,34.480485|11"},{n:"海东地区",g:"102.085207,36.51761|11"},{n:"海北州",g:"100.879802,36.960654|11"},{n:"海南州",g:"100.624066,36.284364|11"},{n:"海西州",g:"97.342625,37.373799|11"},{n:"黄南州",g:"102.0076,35.522852|11"},{n:"玉树州",g:"97.013316,33.00624|14"}]},{n:"山东",g:"118.527663,36.09929|8",cities:[{n:"济南",g:"117.024967,36.682785|12"},{n:"滨州",g:"117.968292,37.405314|12"},{n:"东营",g:"118.583926,37.487121|12"},{n:"德州",g:"116.328161,37.460826|12"},{n:"菏泽",g:"115.46336,35.26244|13"},{n:"济宁",g:"116.600798,35.402122|13"},{n:"莱芜",g:"117.684667,36.233654|13"},{n:"聊城",g:"115.986869,36.455829|12"},{n:"临沂",g:"118.340768,35.072409|12"},{n:"青岛",g:"120.384428,36.105215|12"},{n:"日照",g:"119.50718,35.420225|12"},{n:"泰安",g:"117.089415,36.188078|13"},{n:"威海",g:"122.093958,37.528787|13"},{n:"潍坊",g:"119.142634,36.716115|12"},{n:"烟台",g:"121.309555,37.536562|12"},{n:"枣庄",g:"117.279305,34.807883|13"},{n:"淄博",g:"118.059134,36.804685|12"}]},{n:"山西",g:"112.515496,37.866566|7",cities:[{n:"太原",g:"112.550864,37.890277|12"},{n:"长治",g:"113.120292,36.201664|12"},{n:"大同",g:"113.290509,40.113744|12"},{n:"晋城",g:"112.867333,35.499834|13"},{n:"晋中",g:"112.738514,37.693362|13"},{n:"临汾",g:"111.538788,36.099745|13"},{n:"吕梁",g:"111.143157,37.527316|14"},{n:"朔州",g:"112.479928,39.337672|13"},{n:"忻州",g:"112.727939,38.461031|12"},{n:"阳泉",g:"113.569238,37.869529|13"},{n:"运城",g:"111.006854,35.038859|13"}]},{n:"陕西",g:"109.503789,35.860026|7",cities:[{n:"西安",g:"108.953098,34.2778|12"},{n:"安康",g:"109.038045,32.70437|13"},{n:"宝鸡",g:"107.170645,34.364081|12"},{n:"汉中",g:"107.045478,33.081569|13"},{n:"商洛",g:"109.934208,33.873907|13"},{n:"铜川",g:"108.968067,34.908368|13"},{n:"渭南",g:"109.483933,34.502358|13"},{n:"咸阳",g:"108.707509,34.345373|13"},{n:"延安",g:"109.50051,36.60332|13"},{n:"榆林",g:"109.745926,38.279439|12"}]},{n:"四川",g:"102.89916,30.367481|7",cities:[{n:"成都",g:"104.067923,30.679943|12"},{n:"阿坝州",g:"102.228565,31.905763|15"},{n:"巴中",g:"106.757916,31.869189|14"},{n:"达州",g:"107.494973,31.214199|14"},{n:"德阳",g:"104.402398,31.13114|13"},{n:"甘孜州",g:"101.969232,30.055144|15"},{n:"广安",g:"106.63572,30.463984|13"},{n:"广元",g:"105.819687,32.44104|13"},{n:"乐山",g:"103.760824,29.600958|13"},{n:"凉山州",g:"102.259591,27.892393|14"},{n:"泸州",g:"105.44397,28.89593|14"},{n:"南充",g:"106.105554,30.800965|13"},{n:"眉山",g:"103.84143,30.061115|13"},{n:"绵阳",g:"104.705519,31.504701|12"},{n:"内江",g:"105.073056,29.599462|13"},{n:"攀枝花",g:"101.722423,26.587571|14"},{n:"遂宁",g:"105.564888,30.557491|12"},{n:"雅安",g:"103.009356,29.999716|13"},{n:"宜宾",g:"104.633019,28.769675|13"},{n:"资阳",g:"104.63593,30.132191|13"},{n:"自贡",g:"104.776071,29.359157|13"}]},{n:"西藏",g:"89.137982,31.367315|6",cities:[{n:"拉萨",g:"91.111891,29.662557|13"},{n:"阿里地区",g:"81.107669,30.404557|11"},{n:"昌都地区",g:"97.185582,31.140576|15"},{n:"林芝地区",g:"94.349985,29.666941|11"},{n:"那曲地区",g:"92.067018,31.48068|14"},{n:"日喀则地区",g:"88.891486,29.269023|14"},{n:"山南地区",g:"91.750644,29.229027|11"}]},{n:"新疆",g:"85.614899,42.127001|6",cities:[{n:"乌鲁木齐",g:"87.564988,43.84038|12"},{n:"阿拉尔",g:"81.291737,40.61568|13"},{n:"阿克苏地区",g:"80.269846,41.171731|12"},{n:"阿勒泰地区",g:"88.137915,47.839744|13"},{n:"巴音郭楞",g:"86.121688,41.771362|12"},{n:"博尔塔拉州",g:"82.052436,44.913651|11"},{n:"昌吉州",g:"87.296038,44.007058|13"},{n:"哈密地区",g:"93.528355,42.858596|13"},{n:"和田地区",g:"79.930239,37.116774|13"},{n:"喀什地区",g:"75.992973,39.470627|12"},{n:"克拉玛依",g:"84.88118,45.594331|13"},{n:"克孜勒苏州",g:"76.137564,39.750346|11"},{n:"石河子",g:"86.041865,44.308259|13"},{n:"塔城地区",g:"82.974881,46.758684|12"},{n:"图木舒克",g:"79.198155,39.889223|13"},{n:"吐鲁番地区",g:"89.181595,42.96047|13"},{n:"五家渠",g:"87.565449,44.368899|13"},{n:"伊犁州",g:"81.297854,43.922248|11"}]},{n:"云南",g:"101.592952,24.864213|7",cities:[{n:"昆明",g:"102.714601,25.049153|12"},{n:"保山",g:"99.177996,25.120489|13"},{n:"楚雄州",g:"101.529382,25.066356|13"},{n:"大理州",g:"100.223675,25.5969|14"},{n:"德宏州",g:"98.589434,24.44124|14"},{n:"迪庆州",g:"99.713682,27.831029|14"},{n:"红河州",g:"103.384065,23.367718|11"},{n:"丽江",g:"100.229628,26.875351|13"},{n:"临沧",g:"100.092613,23.887806|14"},{n:"怒江州",g:"98.859932,25.860677|14"},{n:"普洱",g:"100.980058,22.788778|14"},{n:"曲靖",g:"103.782539,25.520758|12"},{n:"昭通",g:"103.725021,27.340633|13"},{n:"文山",g:"104.089112,23.401781|14"},{n:"西双版纳",g:"100.803038,22.009433|13"},{n:"玉溪",g:"102.545068,24.370447|13"}]},{n:"浙江",g:"119.957202,29.159494|8",cities:[{n:"杭州",g:"120.219375,30.259244|12"},{n:"湖州",g:"120.137243,30.877925|12"},{n:"嘉兴",g:"120.760428,30.773992|13"},{n:"金华",g:"119.652576,29.102899|12"},{n:"丽水",g:"119.929576,28.4563|13"},{n:"宁波",g:"121.579006,29.885259|12"},{n:"衢州",g:"118.875842,28.95691|12"},{n:"绍兴",g:"120.592467,30.002365|13"},{n:"台州",g:"121.440613,28.668283|13"},{n:"温州",g:"120.690635,28.002838|12"},{n:"舟山",g:"122.169872,30.03601|13"}]}],other:[{n:"香港",g:"114.186124,22.293586|11"},{n:"澳门",g:"113.557519,22.204118|13"},{n:"台湾",g:"120.961454,23.80406|8"}]};

  function getCenter(g) {
      var item = g.split("|");
      item[0] = item[0].split(",");
      return {
          lng: parseFloat(item[0][0]),
          lat: parseFloat(item[0][1])
      }
  }

  var cityCenter = {
      getCenterByCityName: function(name) {
          for (var i = 0; i < citycenter.municipalities.length; i++) {
              if (citycenter.municipalities[i].n == name) {
                  return getCenter(citycenter.municipalities[i].g);
              }
          }

          var provinces  = citycenter.provinces;
          for (var i = 0; i < provinces.length; i++) {
              if (provinces[i].n == name) {
                  return getCenter(provinces[i].g);
              }
              var cities = provinces[i].cities;
              for (var j = 0; j < cities.length; j++) {
                  if (cities[j].n == name) {
                      return getCenter(cities[j].g);
                  }
              }
          }
          return null;
      }
  }

  /**
   * @author kyle / http://nikai.us/
   */

  var size = {
      /**
       * @param Number value 
       * @param Number max of value
       * @param Number max of size
       * @param Object other options
       */
      getSizeByPercent: function (value, maxValue, maxSize, options) {
          var size = 0;

          if (value > maxValue) {
              value = maxValue;
          }

          size = value / maxValue * maxSize;

          return size;
      }
  }

  /* 
  FDEB algorithm implementation [www.win.tue.nl/~dholten/papers/forcebundles_eurovis.pdf].

  Author:  (github.com/upphiminn)
  2013

  */
    
  var ForceEdgeBundling = function(){
      var data_nodes = {},        // {'nodeid':{'x':,'y':},..}
              data_edges = [],        // [{'source':'nodeid1', 'target':'nodeid2'},..]
              compatibility_list_for_edge = [],
              subdivision_points_for_edge = [],
              K = 0.1,                // global bundling constant controling edge stiffness
              S_initial = 0.1,        // init. distance to move points
              P_initial = 1,          // init. subdivision number
              P_rate    = 2,          // subdivision rate increase
              C = 6,                  // number of cycles to perform
              I_initial = 70,         // init. number of iterations for cycle
              I_rate = 0.6666667,     // rate at which iteration number decreases i.e. 2/3
              compatibility_threshold = 0.6,
              invers_quadratic_mode  = false,
              eps = 1e-8;
               

          /*** Geometry Helper Methods ***/
          function vector_dot_product(p, q){
              return p.x * q.x + p.y * q.y;
          }

          function edge_as_vector(P){
              return {'x': data_nodes[P.target].x - data_nodes[P.source].x,
                      'y': data_nodes[P.target].y - data_nodes[P.source].y}
          }

          function edge_length(e){
              return Math.sqrt(Math.pow(data_nodes[e.source].x-data_nodes[e.target].x, 2) +
                               Math.pow(data_nodes[e.source].y-data_nodes[e.target].y, 2));
          }

          function custom_edge_length(e){
              return Math.sqrt(Math.pow(e.source.x - e.target.x, 2) + Math.pow(e.source.y - e.target.y, 2));
          }

          function edge_midpoint(e){
              var middle_x = (data_nodes[e.source].x + data_nodes[e.target].x) / 2.0;
              var middle_y = (data_nodes[e.source].y + data_nodes[e.target].y) / 2.0;
              return {'x': middle_x, 'y': middle_y};
          }

          function compute_divided_edge_length(e_idx){
              var length = 0;
              for(var i = 1; i < subdivision_points_for_edge[e_idx].length; i++){
                  var segment_length = euclidean_distance(subdivision_points_for_edge[e_idx][i],
                                                          subdivision_points_for_edge[e_idx][i-1]);
                  length += segment_length;
              }
              return length;
          }

          function euclidean_distance(p, q){
              return Math.sqrt(Math.pow(p.x-q.x, 2) + Math.pow(p.y-q.y, 2));
          }

          function project_point_on_line(p, Q)
          {   
              var L = Math.sqrt((Q.target.x - Q.source.x) * (Q.target.x - Q.source.x) + (Q.target.y - Q.source.y) * (Q.target.y - Q.source.y));
              var r = ((Q.source.y - p.y) * (Q.source.y - Q.target.y) - (Q.source.x - p.x) * (Q.target.x - Q.source.x)) / (L * L);
              
              return  {'x':(Q.source.x + r * (Q.target.x - Q.source.x)), 'y':(Q.source.y + r * (Q.target.y - Q.source.y))};
          }

          /*** ********************** ***/

          /*** Initialization Methods ***/
          function initialize_edge_subdivisions()
          {
              for(var i = 0; i < data_edges.length; i++)
               if(P_initial == 1)
                  subdivision_points_for_edge[i] = []; //0 subdivisions
               else{
                  subdivision_points_for_edge[i] = [];
                  subdivision_points_for_edge[i].push(data_nodes[data_edges[i].source]);
                  subdivision_points_for_edge[i].push(data_nodes[data_edges[i].target]);
              }
          }

          function initialize_compatibility_lists()
          {
              for(var i = 0; i < data_edges.length; i++)
                  compatibility_list_for_edge[i] = []; //0 compatible edges.
          }

          function filter_self_loops(edgelist){
              var filtered_edge_list = [];
              for(var e=0; e < edgelist.length; e++){
                  if(data_nodes[edgelist[e].source].x != data_nodes[edgelist[e].target].x  &&
                     data_nodes[edgelist[e].source].y != data_nodes[edgelist[e].target].y ){ //or smaller than eps
                      filtered_edge_list.push(edgelist[e]);

                  }
              }

              return filtered_edge_list;
          }
          /*** ********************** ***/

          /*** Force Calculation Methods ***/
          function apply_spring_force(e_idx, i, kP){

              var prev = subdivision_points_for_edge[e_idx][i-1];
              var next = subdivision_points_for_edge[e_idx][i+1];
              var crnt = subdivision_points_for_edge[e_idx][i];

              var x = prev.x - crnt.x + next.x - crnt.x;
              var y = prev.y - crnt.y + next.y - crnt.y;
              
              x *= kP;
              y *= kP;
              
              return {'x' : x, 'y' : y};
          }

          function apply_electrostatic_force(e_idx, i , S){
              var sum_of_forces         = { 'x' : 0, 'y' : 0};
              var compatible_edges_list = compatibility_list_for_edge[e_idx];
              
              for(var oe = 0; oe < compatible_edges_list.length; oe++){
                  var force = {'x': subdivision_points_for_edge[compatible_edges_list[oe]][i].x - subdivision_points_for_edge[e_idx][i].x,
                               'y': subdivision_points_for_edge[compatible_edges_list[oe]][i].y - subdivision_points_for_edge[e_idx][i].y};

                  
                  if((Math.abs(force.x) > eps)||(Math.abs(force.y) > eps)){
                  
                  var diff = ( 1 / Math.pow(custom_edge_length({'source':subdivision_points_for_edge[compatible_edges_list[oe]][i],
                                                                'target':subdivision_points_for_edge[e_idx][i]}),1));
                  
                  sum_of_forces.x += force.x*diff;
                  sum_of_forces.y += force.y*diff;
                  }
              } 
              return sum_of_forces;
          }


          function apply_resulting_forces_on_subdivision_points(e_idx, P, S){
              var kP = K/(edge_length(data_edges[e_idx])*(P+1)); // kP=K/|P|(number of segments), where |P| is the initial length of edge P.
                          // (length * (num of sub division pts - 1))
              var resulting_forces_for_subdivision_points = [{'x':0, 'y':0}];
              for(var i = 1; i < P+1; i++){ // exclude initial end points of the edge 0 and P+1
                  var resulting_force     = {'x' : 0, 'y' : 0};
                  
                  var spring_force            = apply_spring_force(e_idx, i , kP);
                  var electrostatic_force     = apply_electrostatic_force(e_idx, i, S);
                  
                  resulting_force.x   = S*(spring_force.x + electrostatic_force.x);
                  resulting_force.y   = S*(spring_force.y + electrostatic_force.y);

                  resulting_forces_for_subdivision_points.push(resulting_force);
              }
              resulting_forces_for_subdivision_points.push({'x':0, 'y':0});
              return resulting_forces_for_subdivision_points;
          }
          /*** ********************** ***/

          /*** Edge Division Calculation Methods ***/
          function update_edge_divisions(P){
              for(var e_idx=0; e_idx < data_edges.length; e_idx++){

                  if( P == 1 ){
                      subdivision_points_for_edge[e_idx].push(data_nodes[data_edges[e_idx].source]); // source
                      subdivision_points_for_edge[e_idx].push(edge_midpoint(data_edges[e_idx])); // mid point
                      subdivision_points_for_edge[e_idx].push(data_nodes[data_edges[e_idx].target]); // target
                  }else{

                      var divided_edge_length = compute_divided_edge_length(e_idx);
                      var segment_length      = divided_edge_length / (P+1);
                      var current_segment_length = segment_length;
                      var new_subdivision_points = [];
                      new_subdivision_points.push(data_nodes[data_edges[e_idx].source]); //source

                      for(var i = 1; i < subdivision_points_for_edge[e_idx].length; i++){
                          var old_segment_length = euclidean_distance(subdivision_points_for_edge[e_idx][i], subdivision_points_for_edge[e_idx][i-1]);

                          while(old_segment_length > current_segment_length){
                              var percent_position = current_segment_length / old_segment_length;
                              var new_subdivision_point_x = subdivision_points_for_edge[e_idx][i-1].x;
                              var new_subdivision_point_y = subdivision_points_for_edge[e_idx][i-1].y;

                              new_subdivision_point_x += percent_position*(subdivision_points_for_edge[e_idx][i].x - subdivision_points_for_edge[e_idx][i-1].x);
                              new_subdivision_point_y += percent_position*(subdivision_points_for_edge[e_idx][i].y - subdivision_points_for_edge[e_idx][i-1].y);
                              new_subdivision_points.push( {'x':new_subdivision_point_x, 
                                                            'y':new_subdivision_point_y });
                              
                              old_segment_length     -= current_segment_length;
                              current_segment_length  = segment_length;
                          }
                          current_segment_length -= old_segment_length;
                      }
                      new_subdivision_points.push(data_nodes[data_edges[e_idx].target]); //target
                      subdivision_points_for_edge[e_idx] = new_subdivision_points;
                  }
              }
          }
          /*** ********************** ***/

          /*** Edge compatibility measures ***/
          function angle_compatibility(P, Q){
              var result = Math.abs(vector_dot_product(edge_as_vector(P),edge_as_vector(Q))/(edge_length(P)*edge_length(Q)));
              return result;
          }

          function scale_compatibility(P, Q){
              var lavg = (edge_length(P) + edge_length(Q))/2.0;
              var result = 2.0/(lavg/Math.min(edge_length(P),edge_length(Q)) + Math.max(edge_length(P), edge_length(Q))/lavg);
              return result;
          }

          function position_compatibility(P, Q){
              var lavg = (edge_length(P) + edge_length(Q))/2.0;
              var midP = {'x':(data_nodes[P.source].x + data_nodes[P.target].x)/2.0,
                          'y':(data_nodes[P.source].y + data_nodes[P.target].y)/2.0};
              var midQ = {'x':(data_nodes[Q.source].x + data_nodes[Q.target].x)/2.0,
                          'y':(data_nodes[Q.source].y + data_nodes[Q.target].y)/2.0};
              var result = lavg/(lavg + euclidean_distance(midP, midQ));
              return result;
          }

          function edge_visibility(P, Q){
              var I0 = project_point_on_line(data_nodes[Q.source], {'source':data_nodes[P.source],
                                                                    'target':data_nodes[P.target]});
              var I1 = project_point_on_line(data_nodes[Q.target], {'source':data_nodes[P.source], 
                                                                    'target':data_nodes[P.target]}); //send acutal edge points positions
              var midI = {'x':(I0.x + I1.x)/2.0, 
                          'y':(I0.y + I1.y)/2.0};
              var midP = {'x':(data_nodes[P.source].x + data_nodes[P.target].x)/2.0, 
                          'y':(data_nodes[P.source].y + data_nodes[P.target].y)/2.0};
              var result = Math.max(0, 1 - 2 * euclidean_distance(midP,midI)/euclidean_distance(I0,I1));
              return result;
          }

          function visibility_compatibility(P, Q){
              return Math.min(edge_visibility(P,Q), edge_visibility(Q,P));
          }

          function compatibility_score(P, Q){
              var result = (angle_compatibility(P,Q) * scale_compatibility(P,Q) * 
                            position_compatibility(P,Q) * visibility_compatibility(P,Q));

              return result;
          }

          function are_compatible(P, Q){
              //console.log('compatibility ' + P.source +' - '+ P.target + ' and ' + Q.source +' '+ Q.target);
              return (compatibility_score(P,Q) >= compatibility_threshold);
          }

          function compute_compatibility_lists()
          {
              for(var e = 0; e < data_edges.length - 1; e++){
                  for( var oe = e + 1 ; oe < data_edges.length; oe++){ // don't want any duplicates
                      if(e == oe)
                          continue;
                      else{
                          if(are_compatible(data_edges[e],data_edges[oe])){
                              compatibility_list_for_edge[e].push(oe);
                              compatibility_list_for_edge[oe].push(e);
                          }
                      }
                  }
              }
          }

          /*** ************************ ***/

          /*** Main Bundling Loop Methods ***/ 
          var forcebundle = function(){
              var S = S_initial;
              var I = I_initial;
              var P = P_initial;
              
              initialize_edge_subdivisions();
              initialize_compatibility_lists();
              update_edge_divisions(P);
              compute_compatibility_lists();
              for(var cycle=0; cycle < C; cycle++){
                  for (var iteration = 0; iteration < I; iteration++){
                      var forces = [];
                      for(var edge = 0; edge < data_edges.length; edge++){
                          forces[edge] = apply_resulting_forces_on_subdivision_points(edge, P, S);
                      }
                      for(var e = 0; e < data_edges.length; e++){
                          for(var i=0; i < P + 1;i++){
                              subdivision_points_for_edge[e][i].x += forces[e][i].x;
                              subdivision_points_for_edge[e][i].y += forces[e][i].y;
                          }
                      }
                  }
                  //prepare for next cycle
                  S = S / 2;
                  P = P * 2;
                  I = I_rate * I;
                  
                  update_edge_divisions(P);
                  console.log('C' + cycle);
                  console.log('P' + P);
                  console.log('S' + S);
              }
              return subdivision_points_for_edge;
          }
          /*** ************************ ***/


          /*** Getters/Setters Methods ***/ 
          forcebundle.nodes = function(nl){
              if(arguments.length == 0){
                  return data_nodes;
              }
              else{
                  data_nodes = nl;
              }
              return forcebundle;
          }

          forcebundle.edges = function(ll){
              if(arguments.length == 0){
                  return data_edges;
              }
              else{
                  data_edges = filter_self_loops(ll); //remove edges to from to the same point
              }
              return forcebundle;
          }

          forcebundle.bundling_stiffness = function(k){
              if(arguments.length == 0){
                  return K;
              }
              else{
                  K = k;
              }
              return forcebundle;
          }

          forcebundle.step_size = function(step){
              if(arguments.length == 0){
                  return S_initial;
              }
              else{
                  S_initial = step;
              }
              return forcebundle;
          }

          forcebundle.cycles = function(c){
              if(arguments.length == 0){
                  return C;
              }
              else{
                  C = c;
              }
              return forcebundle;
          }

          forcebundle.iterations = function(i){
              if(arguments.length == 0){
                  return I_initial;
              }
              else{
                  I_initial = i;
              }
              return forcebundle;
          }

          forcebundle.iterations_rate = function(i){
              if(arguments.length == 0){
                  return I_rate;
              }
              else{
                  I_rate = i;
              }
              return forcebundle;
          }

          forcebundle.subdivision_points_seed = function(p){
              if(arguments.length == 0){
                  return P;
              }
              else{
                  P = p;
              }
              return forcebundle;
          }

          forcebundle.subdivision_rate = function(r){
              if(arguments.length == 0){
                  return P_rate;
              }
              else{
                  P_rate = r;
              }
              return forcebundle;
          }

          forcebundle.compatbility_threshold = function(t){
              if(arguments.length == 0){
                  return compatbility_threshold;
              }
              else{
                  compatibility_threshold = t;
              }
              return forcebundle;
          }

          /*** ************************ ***/

      return forcebundle;
  }

  /**
   * 一直覆盖在当前地图视野的Canvas对象
   *
   * @author nikai (@胖嘟嘟的骨头, nikai@baidu.com)
   *
   * @param 
   * {
   *     map 地图实例对象
   * }
   */ 
      
  function CanvasLayer(options){
      this.options = options || {};
      this.paneName = this.options.paneName || 'labelPane';
      this.zIndex = this.options.zIndex || 0;
      this._map = options.map;
      this._lastDrawTime = null;
      this.show();
  }

  if (window.BMap) {

      CanvasLayer.prototype = new BMap.Overlay();

      CanvasLayer.prototype.initialize = function(map){
          this._map = map;
          var canvas = this.canvas = document.createElement("canvas");
          canvas.style.cssText = "position:absolute;"
                                  + "left:0;" 
                                  + "top:0;"
                                  + "z-index:" + this.zIndex + ";";
          this.adjustSize();
          map.getPanes()[this.paneName].appendChild(canvas);
          var that = this;
          map.addEventListener('resize', function () {
              that.adjustSize();
              that._draw();
          });
          return this.canvas;
      }

      CanvasLayer.prototype.adjustSize = function(){
          var size = this._map.getSize();
          var canvas = this.canvas;
          canvas.width = size.width;
          canvas.height = size.height;
          canvas.style.width = canvas.width + "px";
          canvas.style.height = canvas.height + "px";
      }

      CanvasLayer.prototype.draw = function(){
          if (!this._lastDrawTime || new Date() - this._lastDrawTime > 10) {
              this._draw();
          }
          this._lastDrawTime = new Date();
      }

      CanvasLayer.prototype._draw = function(){
          var map = this._map;
          var size = map.getSize();
          var center = map.getCenter();
          if (center) {
              var pixel = map.pointToOverlayPixel(center);
              this.canvas.style.left = pixel.x - size.width / 2 + 'px';
              this.canvas.style.top = pixel.y - size.height / 2 + 'px';
              this.dispatchEvent('draw');
              this.options.update && this.options.update.call(this);
          }
      }

      CanvasLayer.prototype.getContainer = function(){
          return this.canvas;
      }

      CanvasLayer.prototype.show = function(){
          if (!this.canvas) {
              this._map.addOverlay(this);
          }
          this.canvas.style.display = "block";
      }

      CanvasLayer.prototype.hide = function(){
          this.canvas.style.display = "none";
          //this._map.removeOverlay(this);
      }

      CanvasLayer.prototype.setZIndex = function(zIndex){
          this.canvas.style.zIndex = zIndex;
      }

      CanvasLayer.prototype.getZIndex = function(){
          return this.zIndex;
      }

  }

  exports.version = version;
  exports.X = _3d;
  exports.canvasClear = clear;
  exports.canvasPoint = point;
  exports.canvasPolyline = polyline;
  exports.canvasPolygon = polygon;
  exports.canvasDrawPointSimple = drawPointSimple;
  exports.utilCityCenter = cityCenter;
  exports.utilDataRangeSize = size;
  exports.utilDataRangeGradient = gradient;
  exports.utilForceEdgeBundling = ForceEdgeBundling;
  exports.baiduMapCanvasLayer = CanvasLayer;

}));