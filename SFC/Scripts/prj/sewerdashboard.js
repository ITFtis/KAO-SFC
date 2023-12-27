$(document).ready(function () {
    window.defaultPinOpacity = .9;
    var isfromsensorshowInfoWindow;
    var $_sewerpinctrl, $_waterpinctrl, $_rainpinctrl, $_fsensorpinctrl, $_cctvpinctrl;
    var data = data || {};
    data.currentSewer = undefined;
    data.currentWater = undefined;
    data.currentRain = undefined;
    data.currentFsensor = undefined;
    data.currentCctv = undefined;
    data.sewer = [];
    data.water;
    data.rain;
    data.fsensor;
    data.cctv;
    var $_sewercontent = $('.main-content > .display-cell > .sewer-content');
    var $_watercontent = $('.main-content > .display-cell > .water-content');
    var $_raincontent = $('.main-content > .display-cell > .rain-content');
    var $_fsensorcontent = $('.main-content > .display-cell > .fsensor-content');
    var $_cctvcontent = $('.main-content > .display-cell > .cctv-content');
    var _sewerchart, _waterchart, _rainchart, _fsensorchart;
    var querySewerId = helper.misc.getRequestParas()['sid'];

    setTimeout(function () {
        if (querySewerId)
            $('.resize-ctrl').trigger('click');
    });

    $('<div id="basemapDiv">').appendTo($('body')).hide();
    mapHelper.createMap('leaflet', function () {
        //if (querySewerId)
        //    $('.resize-ctrl').trigger('click');
        initSewer();
        initCctv(); //cctv資料載入較久，先行下載
    });

    //改變下水道
    var changeSewer = function (s, c) {
        console.log(JSON.stringify(s));
        data.currentSewer = s;
        if ($_sewerpinctrl) {
            //if (isfromsensorshowInfoWindow)
                $_sewerpinctrl.instance.__pinctrl.instance._mapctrl.offFocusRowIndex();
            if (c)
                app.map.flyTo([s.lat, s.lon]);
            $.each(data.sewer, function (_i, _d) {
                if (_d.StationID == data.currentSewer.StationID) {
                    if (isfromsensorshowInfoWindow) {
                        var tr = $(".pin-list-container .fixed-table-body tbody tr[data-index=" + _i + "]:eq(0)");
                        if (tr && tr.length > 0)
                            tr.addClass("meter-active");
                    }
                    else {
                        $_sewerpinctrl.instance.__pinctrl.instance._mapctrl.onFocusRowIndex(_i);
                    }
                }
            });
        }

       
        isfromsensorshowInfoWindow = false;
        if (data.water)
            changeWater(findnearest(s, data.water));
        if (data.rain)
            changeRain(findnearest(s, data.rain, 'Long', 'Lat'));
        if (data.fsensor)
            changeFSensor(findnearest(s, data.fsensor, 'Point.Longitude', 'Point.Latitude'));
        if (data.cctv)
            changeCctv(findnearest(s, data.cctv));

        sewerChart(s);
        showActivedpin($_sewerpinctrl, s, 'StationID', 100);
    }

    var showActivedpin = function ( pinctrl, s, sf, z) {
        var plusclass = ' actived-pin';
        $.each(pinctrl.instance.__pinctrl.instance._mapctrl.graphics, function () {
            var _icon = this.getIcon() || this;//g.getIcon() 20220915加入， 解決_icon.options.iconSize==null(因該新版leafleft問題), pin label位置一直動
            //_icon.shadowUrl = "http://localhost:54188/Scripts/gis/images/camera.png";
            var cns = _icon.options.className;//.replace(plusclass);
            var c = cns.indexOf(plusclass) >= 0 || this.attributes[sf] == s[sf];
            cns = cns.replace(plusclass, '');

            if (this.attributes[sf] == s[sf]) {
                cns += plusclass;
                //this.setZIndexOffset(window.pinLeafletMaxZIndex++);
                this.setZIndexOffset(window.pinLeafletMaxZIndex+100000+(z || 0));
            }
            if (c) {
                _icon.options.className = cns;
                this.setIcon(_icon);
            }
        })
    }

    var sewerChart = function (s) {
        var $_c = $_sewercontent.empty();
        s.qsdt = new Date().addHours(-24).DateFormat("yyyy-MM-ddTHH:mm:ss");
        s.qedt = new Date().DateFormat("yyyy-MM-ddTHH:mm:ss");
        datahelper.getSewerSerInfo(s, function (ds) {
            var seriesdef = {
                level: {
                    name: '水位', color: '#0000FF', type: 'line', dt: "datatime", info: "val", unit: 'm', turboThreshold: 20000
                },
                warn: [
                    { name: '一級', color: '#FF0000', info: 'WarningLine1', turboThreshold: 5000 },
                    { name: '二級', color: '#FFA500', info: 'WarningLine2', turboThreshold: 5000 },
                    { name: '三級', color: '#FFFF00', info: 'WarningLine3', turboThreshold: 5000 },
                ],
                wave: { enabled: false }
            }
            //if (app.flood24hr && app.flood24hr.length > 1000)//turboThreshold預設1000，超過整個series就不會呈現
            //    seriesdef.level.turboThreshold = app.flood24hr.length;
            _sewerchart =charthelper.showMeterChart($_c, s, ds, s.CName+'-水位歷線圖', '水深(cm)', 0, seriesdef, function (chartoptions) {
                chartoptions.legend.enabled = false;
            }, function (idx, x, y, p) {
                charthelper.chartGearingByX(x, [_fsensorchart, _waterchart, _rainchart]);
            });
        });
    }

    //改變水位站
    var changeWater = function (s) {
        console.log('water:' + JSON.stringify(s));
        data.currentWater = s;
        var $_c = $_watercontent.empty();
        if (s == null)
            return;
        s.qsdt = new Date().addHours(-24).DateFormat("yyyy-MM-ddTHH:mm:ss");
        s.qedt = new Date().DateFormat("yyyy-MM-ddTHH:mm:ss");
        _waterchart = datahelper.getWaterSerInfo(s, function (ds) {
            var seriesdef = {
                level: {
                    name: '水位', color: '#0000FF', type: 'line', dt: "time", info: "stage", unit: 'm', turboThreshold: 5000
                },
                warn: [
                    { name: '一級', color: '#FF0000', info: 'WarningLine1', turboThreshold: 5000 },
                    { name: '二級', color: '#FFA500', info: 'WarningLine2', turboThreshold: 5000 },
                    { name: '三級', color: '#FFFF00', info: 'WarningLine3', turboThreshold: 5000 },
                ],
                wave: { enabled: false }
            }
            //if (app.flood24hr && app.flood24hr.length > 1000)//turboThreshold預設1000，超過整個series就不會呈現
            //    seriesdef.level.turboThreshold = app.flood24hr.length;
            _waterchart = charthelper.showMeterChart($_c, s, ds, s.CName + '-水位歷線圖', '水深(cm)', 0, seriesdef, function (chartoptions) {
                chartoptions.legend.enabled = false;
            }, function (idx, x, y, p) {
                charthelper.chartGearingByX(x, [_sewerchart, _fsensorchart, _rainchart]);
            });
        });
        showActivedpin($_waterpinctrl, s, 'StationID');
    }
    //改變雨量站
    var changeRain = function (s) {
        console.log('rain:' + JSON.stringify(s));
        data.currentRain = s;
        var $_c = $_raincontent.empty();
        if (s == null)
            return;
        s.qsdt = new Date().addHours(-24).DateFormat("yyyy-MM-ddTHH:mm:ss");
        s.qedt = new Date().DateFormat("yyyy-MM-ddTHH:mm:ss");
        datahelper.getRainSerInfo(s, function (ds) {
            var cds = $.grep(ds, function (d) { if (d.M10 < 0) d.M10 = 0; return d.M10 >= 0; });
            var seriesdef = {
                warn: [],
                level: { name: '雨量', color: '#0000FF', type: 'column', yAxis: 1, dt: 'DATE', info: 'M10', unit: 'mm', turboThreshold: 5000 },
                sumlevel: { name: '累計雨量', color: '#FF0000', type: 'line', threshold: 0, unit: 'mm', marker: { enabled: true, states: { hover: { enabled: false }, turboThreshold: 5000 } } },
                wave: { enabled: false }
            }
            //if (app.flood24hr && app.flood24hr.length > 1000)//turboThreshold預設1000，超過整個series就不會呈現
            //    seriesdef.level.turboThreshold = app.flood24hr.length;
            _rainchart = charthelper.showMeterChart($_c, s, cds, s.NAME_C + '-雨量歷線圖', '雨量(mm)', 0, seriesdef,
                function (chartoptions) {
                    chartoptions.legend.enabled = false;
                    //console.log(infos);
                    chartoptions.yAxis.title.margin = 0;
                    chartoptions.yAxis.title.tickPixelInterval = 40;
                    chartoptions.xAxis.labels.formatter = function () {
                        var ff = function (s) {
                            return helper.format.paddingLeft(s, '0', 2);
                        }
                        var _date = new Date(this.value);
                        return ff(_date.getHours()) + ':' + ff(_date.getMinutes());
                    }

                    chartoptions.chart.backgroundColor = undefined;
                    chartoptions.shared = false;
                    chartoptions.crosshairs = false;


                    chartoptions.legend.itemMarginBottom = 3;
                    chartoptions.legend.itemMarginTop = 1;

                    var _max1H = 0, _sum = 0;
                    $.each(ds, function () {
                        var _r = this['M10'] < 0 ? 0 : this['M10'];
                        _max1H = _max1H < _r ? _r : _max1H;
                        _sum += _r;
                    });
                    chartoptions.xAxis = [chartoptions.xAxis, { lineWidth: 1, opposite: true }];
                    chartoptions.yAxis = [{
                        title: {
                            text: '累計雨量(mm)',
                            margin: 4
                        },
                        labels: {
                            x: -4,
                            formatter: function () {
                                //return this.value < _sum + this.axis.tickInterval ? this.value : '';
                                return this.value < _sum + (_sum % this.axis.tickInterval == 0 ? 0 : this.axis.tickInterval) ? this.value : '';
                            }
                        },
                        max: _sum == 0 ? 1 : _sum * 2.1,
                        min: 0,
                        lineWidth: 1,
                        gridLineWidth: 0,
                        gridLineDashStyle: 'dash',
                        startOnTick: false,
                        endOnTick: false,
                        //minTickInterval: 1,
                        //tickAmount: 4,
                    },
                    {
                        title: {
                            text: '雨量(mm)',
                            margin: 4
                        },
                        labels: {
                            x: 4,
                            formatter: function () {
                                return this.value < _max1H + (_max1H % this.axis.tickInterval == 0 ? 0 : this.axis.tickInterval) ? this.value : '';
                            }
                        },
                        max: _max1H == 0 ? 1 : _max1H * 2.1,
                        min: 0,
                        lineWidth: 1,
                        reversed: true,
                        gridLineWidth: 0,
                        gridLineDashStyle: 'dash',
                        startOnTick: false,
                        endOnTick: false,
                        opposite: true,
                        //tickAmount: 12
                    }
                    ];
                }, function (idx, x, y, p) {

                    charthelper.chartGearingByX(x, [_sewerchart, _waterchart, _fsensorchart]);
                }
            );
        });
        showActivedpin($_rainpinctrl, s,'StationID');
    }
    //改變淹水感測雨量站
    var changeFSensor = function (s) {
        console.log('fsensor:' + JSON.stringify(s));
        data.currentFsensor = s;
        if (s == null)
            return;
        var $_c = $_fsensorcontent.empty();
        s.qsdt = new Date().addHours(-24).DateFormat("yyyy-MM-ddTHH:mm:ss");
        s.qedt = new Date().DateFormat("yyyy-MM-ddTHH:mm:ss");
        datahelper.getFHYFloodSensorInfoByDuration(s, function (ds) {
        //datahelper.getFHYFloodSensorInfoLast24Hours(s.SensorUUID, function (ds) {
            if (ds) {
                ds = ds.sort(function (a, b) { return JsonDateStr2Datetime(a.SourceTime).getTime() - JsonDateStr2Datetime(b.SourceTime).getTime(); });
            }
            var seriesdef = {
                level: {
                    name: '水深', color: '#0000FF', type: 'line', dt: 'SourceTime', info: 'Depth', unit: 'cm'
                }, warn: [{ name: '警戒', color: '#FF0000', info: 10 }], wave: { enabled: false }
            }
            _fsensorchart = charthelper.showMeterChart($_c, undefined, ds, s.SensorName +'-水位歷線圖', '水深(cm)', 0, seriesdef, function (chartoptions) {
                chartoptions.legend.enabled = false;
            }, function (idx, x, y, p) {
                charthelper.chartGearingByX(x, [_sewerchart, _waterchart, _rainchart]);
            });
        });
        showActivedpin($_fsensorpinctrl, s, 'SensorUUID');
    }
    //改變CCTV
    var ctimerflag;
    window.cctvViedoContainer = 'img';//meterImpl._即時監視影像CCTVCtrl_pinInfoContent
    var changeCctv = function (s) {
        console.log('cctv:' + JSON.stringify(s));
        data.currentCctv = s;
        clearInterval(ctimerflag);
        var $_c = $_cctvcontent.empty();
        if (s == null)
            return;

        var sd = $_cctvpinctrl.instance.settings.pinInfoContent.call($_cctvpinctrl.instance, s);
        $(sd).appendTo($_c);

        showActivedpin($_cctvpinctrl, s, 'id');
    }
    //找出最近點(確定source, targets得座標欄位是lon,lat)
    var findnearest = function (source, targets, lon, lat) {
        if (!source || !targets)
            return null;
        lon = lon || 'lon';
        lat = lat || 'lat';
        var r = null;
        var d = 9999999999;
        $.each(targets, function () {
            var t = this;
            var _d = helper.gis.pointDistance([source.lon, source.lat], [eval('this.' + lon), eval('this.' + lat)]);
            if (_d < d) {
                d = _d;
                r = t;
            }
        });
        return r;
    }

    //******資料初始化*******
    //下水道
    helper.misc.showBusyIndicator($_sewercontent);
    var isInitSewer = false;
    var initSewer = function () {
        //$_sewerpinctrl = $('<div>').appendTo('body').hide().sewer({ map: app.map, defaultShowAllStatus: true, autoReload: { auto: true, interval: 5 * 60 * 1000 } }).on('get-data-complete', function (e, ds) {
        $_sewerpinctrl = $('.popu-ctrl-container > .meter').sewer({ map: app.map, defaultShowAllStatus: true, autoReload: { auto: true, interval: 5*60 * 1000 }}).on('get-data-complete', function (e, ds) {
            data.sewer = ds;/*$_fsta.fsta('setSewerData', ds);*/
            if (!isInitSewer) {
                $_sewerpinctrl.WaterCtrl('fitBounds', { padding: [20, 20] });
                initWater();
                initRain();
                initFSensor();
                //initCctv();
                //預設呈現資料
                var temps;
                if (querySewerId) 
                    temps = $.grep(ds, function (d) { return d.StationID == querySewerId; });
                    

                if (!temps || temps.length == 0)
                    temps = ds;
                changeSewer(temps[0], true);
                $('.fix-popu-ctrl-toleft').removeClass('fixed-show');
                helper.misc.hideBusyIndicator($_sewercontent);
            }
            else {
                showActivedpin($_sewerpinctrl, data.currentSewer, 'StationID');
            }

            $('.query-time').text(new Date().DateFormat('yyyy/MM/dd HH:mm:ss'));

            isInitSewer = true;
            
        }).sewer('getPinCtrlInstance');
        //$_sewerpinctrl = $(this).find('.pinctrl');
        $_sewerpinctrl.instance.__pinctrl.instance._mapctrl.showInfoWindow = function (g, c) { //點選清單後會觸發
            isfromsensorshowInfoWindow = true;
            changeSewer(g.attributes, c);
            //$('.fix-popu-ctrl-toleft').removeClass('fixed-show');
        }
    }
    //初始水位站
    helper.misc.showBusyIndicator($_watercontent);
    var isInitWater = false;
    var initWater = function () {
        $_waterpinctrl = $('<div>').appendTo('body').water({ map: app.map, defaultShowAllStatus: true }).on('get-data-complete', function (e, ds) {
            data.water = ds;
            if (!isInitWater) {
                $_waterpinctrl.find('.legend-disable').trigger('click');
                changeWater(findnearest(data.currentSewer, ds));
                helper.misc.hideBusyIndicator($_watercontent);
            }
            else {
                showActivedpin($_waterpinctrl, data.currentWater, 'StationID');
            }
            isInitWater = true;
        }).water('getPinCtrlInstance').hide();
        $_waterpinctrl.instance.__pinctrl.instance._mapctrl.showInfoWindow = function (g, c) { //點選清單後會觸發
            changeWater(g.attributes);
        }
    }
    //初始雨量站
    helper.misc.showBusyIndicator($_raincontent);
    var isInitRain = false;
    var initRain = function () {
        $_rainpinctrl = $('<div class="meter">').appendTo('body').rain({ map: app.map }).on('get-data-complete', function (e, ds) {
            data.rain = $.grep(ds, function (r) { return r.Source == "氣象署"; });
            
            data.rain.forEach(r => r.Fhy = true);
            if (!isInitRain) {
                $_rainpinctrl.find('.legend-disable').trigger('click');
                changeRain(findnearest(data.currentSewer, ds, 'Long', 'Lat'));
                helper.misc.hideBusyIndicator($_raincontent);
            }
            else
                showActivedpin($_rainpinctrl, data.currentRain, 'StationID');
            isInitRain = true;
        }).rain('getPinCtrlInstance').hide();;
        $_rainpinctrl.instance.__pinctrl.instance._mapctrl.showInfoWindow = function (g, c) { //點選清單後會觸發
            changeRain(g.attributes);
        }
    }
    //初始淹水感測
    helper.misc.showBusyIndicator($_fsensorcontent);
    var isInitFSensor = false;
    var initFSensor = function () {
        $_fsensorpinctrl = $('<div class="meter">').appendTo('body').fsensor({ map: app.map }).on('get-data-complete', function (e, ds) {
            data.fsensor = ds;
            if (!isInitFSensor) {
                $_fsensorpinctrl.find('.legend-disable').trigger('click');
                changeFSensor(findnearest(data.currentSewer, ds, 'Point.Longitude', 'Point.Latitude'));
                helper.misc.hideBusyIndicator($_fsensorcontent);
            }
            else
                showActivedpin($_fsensorpinctrl, data.currentFsensor, 'SensorUUID');
            isInitFSensor = true;
        }).fsensor('getPinCtrlInstance').hide();
        $_fsensorpinctrl.instance.__pinctrl.instance._mapctrl.showInfoWindow = function (g, c) { //點選清單後會觸發
            changeFSensor(g.attributes);
        }
    }
    //初始CCTV
    helper.misc.showBusyIndicator($_cctvcontent);
    helper.misc.showBusyIndicator($('#map'));
    var isInitCctv = false;
    var initCctv = function () {
        //$_cctvpinctrl = Init即時監視影像CCTVCtrl($('<div class="meter">').appendTo('body')).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
        $_cctvpinctrl = InitAllCCTVCtrl($('<div class="meter">').appendTo('body')).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $_cctvpinctrl.find('.pinswitch').prop('checked', true).trigger('change');
        }).on($.BasePinCtrl.eventKeys.afterSetdata, function (e, ds, dds) {
            data.cctv = ds;
            if (!isInitCctv) {
                changeCctv(findnearest(data.currentSewer, ds));
                helper.misc.hideBusyIndicator($_cctvcontent);
                helper.misc.hideBusyIndicator($('#map'));
            }
            else
                showActivedpin($_cctvpinctrl, data.currentCctv, 'id');
            isInitCctv = true;
        }).hide();
        $_cctvpinctrl.instance.__pinctrl.instance._mapctrl.showInfoWindow = function (g, c) { //點選清單後會觸發
            changeCctv(g.attributes);
        }
    }
});