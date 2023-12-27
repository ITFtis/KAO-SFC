var classes_non_public = 'non-public';
var InitRainCtrl = function ($_container, options, onlycwb) {
    onlycwb = onlycwb == undefined ? false : onlycwb;

    var fs = [];//.concat($.RainCtrl.defaultSettings.infoFields);
    $.each($.RainCtrl.defaultSettings.infoFields, function () {
        fs.push(this);
    });
    $.BasePinCtrl.helper.getField(fs,'R10M').title = "10分鐘";
    $.BasePinCtrl.helper.getField(fs, 'CName').formatter = function (v) { return v; }
    if (!onlycwb) //全台雨量站(僅水利署)
        fs.splice(1, 0, { field: 'Source', title: '單位' });

    $.BasePinCtrl.helper.getField(fs, 'R1H').title = "1小時";
    $.BasePinCtrl.helper.getField(fs,'R3H').title = "3小時";
    $.BasePinCtrl.helper.getField(fs,'R6H').title = "6小時";
    $.BasePinCtrl.helper.getField(fs,'R12H').title = "12小時";
    $.BasePinCtrl.helper.getField(fs,'R24H').title = "24小時";
    $.BasePinCtrl.helper.getField(fs,'R1H').showInList =
        $.BasePinCtrl.helper.getField(fs,'R3H').showInList =
    $.BasePinCtrl.helper.getField(fs,'R6H').showInList =
    $.BasePinCtrl.helper.getField(fs,'R12H').showInList =
        $.BasePinCtrl.helper.getField(fs, 'R24H').showInList = true;
    $.BasePinCtrl.helper.getField(fs, 'R1H').sortable =
        $.BasePinCtrl.helper.getField(fs, 'R3H').sortable =
    $.BasePinCtrl.helper.getField(fs, 'R6H').sortable =
    $.BasePinCtrl.helper.getField(fs, 'R12H').sortable =
    $.BasePinCtrl.helper.getField(fs, 'R24H').sortable = true;
    

    $_container.RainCtrl($.extend({
        map: app.map,
        classes: onlycwb? classes_non_public:'',
        enabledStatusFilter: true,
        canFullInfowindow: true,
        listContainer: 'inner',
        listTheme: 'none',
        autoReload: true,
        loadBase: datahelper.getRainBase,
        loadInfo: datahelper.getRainRt,
        infoFields:fs,
        legendIcons: [
            { 'name': '正常', 'url': app.siteRoot + 'images/pin/雨量站_正常.png', 'classes': 'rain_normal', disabled: !onlycwb },
            { 'name': '大雨', 'url': app.siteRoot +'images/pin/雨量站_大雨.png', 'classes': 'rain_heavy' },
            { 'name': '豪雨', 'url': app.siteRoot +'images/pin/雨量站_豪雨.png', 'classes': 'rain_extremely' },
            { 'name': '大豪雨', 'url': app.siteRoot +'images/pin/雨量站_大豪雨.png', 'classes': 'rain_torrential' },
            { 'name': '超大豪雨', 'url': app.siteRoot +'images/pin/雨量站_超大豪雨.png', 'classes': 'rain_exttorrential' },
            { 'name': '無資料', 'url': app.siteRoot + 'images/pin/雨量站_無資料.png', 'classes': 'rain_nodata', disabled: !onlycwb }
        ],
        hourlyFieldsInfo: { DateTime: "DATE", RQ: "M10" },
        getDurationOptions: function (data) { //{hourlyFieldsInfo:{DateTime:"DATE", WaterLevel:"Info"},}
            //this指的是 current
            var result = {
                seriespara:
                {
                    warn: [],
                    level: { name: '雨量', color: '#0000FF', type: 'column', yAxis: 0, dt: this.settings.hourlyFieldsInfo.DateTime, info: this.settings.hourlyFieldsInfo.RQ, unit: 'mm', turboThreshold: 5000 },
                    //level: { name: '雨量', color: '#0000FF', type: 'column', yAxis: 1, dt: this.settings.hourlyFieldsInfo.DateTime, info: this.settings.hourlyFieldsInfo.RQ, unit: 'mm' },
                    //sumlevel: { name: '累計雨量', color: '#FF0000', type: 'line', threshold: 0, unit: 'mm', marker: { enabled: true, states: { hover: { enabled: false } } } },
                    wave: { enabled: false }
                },
                chartoptions: function (_options) {
                    _options.chart.zoomType = 'x';
                    _options.xAxis[0].labels.formatter = function () {
                        var ff = function (s) {
                            return helper.format.paddingLeft(s, '0', 2);
                        }
                        var _date = new Date(this.value);
                        return ff(_date.getMonth() + 1) + '/' + ff(_date.getDate())+'<br>' +ff(_date.getHours()) + ':' + ff(_date.getMinutes());
                    }
                    //改僅show阻體圖+改seriespara
                    _options.xAxis = [_options.xAxis[0]];
                    _options.yAxis[1].max = _options.yAxis[1].max == 1?1: undefined; //1:沒資料或全<0
                    _options.yAxis[1].min = 0;
                    _options.yAxis[1].reversed = false;
                    _options.yAxis[1].opposite = false;
                    _options.yAxis[1].labels.x = -4;
                    _options.yAxis = [_options.yAxis[1]];
                    _options.tooltip.formatter = function (evt) {
                        var _r = ['日期:' + new Date(this.x).DateFormat('MM/dd HH:mm')];
                        $.each(this.points, function () {
                            var thisp = this;
                            
                            _r.push(this.series.name + ':' + (this.y != undefined ? (this.y).toFixed(2) + ' ' + (this.series.userOptions.unit || 'mm') : '-'));
                        });
                        if (this.points[0].y < 0)
                            return false;
                        return _r.join('<br>');
                    }
                }
            }

            result.startdt = new Date(data["Datetime"]).addHours(-24);
            result.enddt = new Date(data["Datetime"]);
            result.stationNo = data["StationID"]
            result.getDurationData = datahelper.getRainSerInfo;
            return result;
        }
    }, options));
}

var InitWaterCtrl = function ($_container, options) {
    $_container.WaterCtrl($.extend({
        name: "水位站",
        map: app.map,
        enabledStatusFilter: true,
        canFullInfowindow:true,
        autoReload: true,
        listContainer: 'inner',
        listTheme: 'none',
        loadBase: function (callback) { callback([])},
        loadInfo: datahelper.getWaterRt,
        legendIcons: [
            { name: '正常', url: app.siteRoot +'images/pin/水位站_正常.png', classes: 'green_status', disabled:true },
            { name: '一級', url: app.siteRoot + 'images/pin/水位站_一級.png', classes: 'red_status' },
            { name: '二級', url: app.siteRoot + 'images/pin/水位站_二級.png', classes: 'orange_status' },
            { name: '三級', url: app.siteRoot + 'images/pin/水位站_三級.png', classes: 'yellow_status' },
            { name: '無資料', url: app.siteRoot + 'images/pin/水位站_無資料.png', classes: 'gray_status', disabled: true }],
        transformData: WatertransformData,
        //    function (_base, _info) {
        //    var datas = [];
        //    var ntime = Date.now();
        //    $.each(_info, function (idxb, i) {
        //        //var d = $.extend({}, $.WaterCtrl.defaultData);
        //        i.CName = i.stn_name;
        //        i.StationID = i.stn_no;
        //        //d.TopLine = b.TopLine;
        //        i.WarningLine1 = i.warn_Level1;
        //        i.WarningLine2 = i.warn_level2;
        //        i.WarningLine3 = i.warn_level3;
        //        i.X = i.lon;
        //        i.Y = i.lat;
        //        i.Status = $.BasePinCtrl.pinIcons.water.normal.name;
        //        i.Datetime = JsonDateStr2Datetime(i.time);
        //        i.WaterLevel = i.stage;
        //        if (i.WaterLevel != undefined && i.Datetime != undefined) {
        //            var dtime = ntime - JsonDateStr2Datetime(i.Datetime).getTime();
        //            if (dtime >= 6 * 60 * 60 * 1000)
        //                i.Status = $.BasePinCtrl.pinIcons.water.noData.name;
        //            else if (i.WarningLine1 != undefined && i.WaterLevel >= i.WarningLine1)
        //                i.Status = $.BasePinCtrl.pinIcons.water.warnLevel1.name;
        //            else if (i.WarningLine2 != undefined && i.WaterLevel >= i.WarningLine2)
        //                i.Status = $.BasePinCtrl.pinIcons.water.warnLevel2.name;
        //            else if (i.WarningLine3 != undefined && i.WaterLevel >= i.WarningLine3)
        //                i.Status = $.BasePinCtrl.pinIcons.water.warnLevel3.name;
        //        }
        //        else
        //            i.Status = $.BasePinCtrl.pinIcons.water.noData.name;
        //    });
        //    //console.log(JSON.stringify(datas));
        //    return _info;
        //},
        getDurationOptions: function (data) { //{hourlyFieldsInfo:{DateTime:"DATE", WaterLevel:"Info"},}
            //this指的是 current
            var result = {
                seriespara:
                {
                    level: {
                        name: '水位', color: '#0000FF', type: 'line', dt: "time", info: "stage", unit: 'm', turboThreshold: 5000
                    },
                    warn: [
                        { name: '一級', color: '#FF0000', info: 'WarningLine1' },
                        { name: '二級', color: '#FFA500', info: 'WarningLine2' },
                        { name: '三級', color: '#FFFF00', info: 'WarningLine3' },
                    ],
                    wave: { enabled: false }
                },
                chartoptions: function (_options) {
                    _options.chart.zoomType = 'x';
                    _options.xAxis.labels.formatter = function () {
                        var ff = function (s) {
                            return helper.format.paddingLeft(s, '0', 2);
                        }
                        var _date = new Date(this.value);
                        return ff(_date.getMonth() + 1) + '/' + ff(_date.getDate()) + '<br>' + ff(_date.getHours()) + ':' + ff(_date.getMinutes());
                    }
                }
            };

            result.startdt = new Date(data["Datetime"]).addHours(-24);
            result.enddt = new Date(data["Datetime"]);
            result.stationNo = data["StationID"]
            result.getDurationData = datahelper.getWaterSerInfo;
            return result;
        }
    }, options));
}
var WatertransformData= function (_base, _info) {
    var datas = [];
    var ntime = Date.now();
    $.each(_info, function (idxb, i) {
        //var d = $.extend({}, $.WaterCtrl.defaultData);
        i.CName = i.stn_name;
        i.StationID = i.stn_no;
        //d.TopLine = b.TopLine;
        i.WarningLine1 = i.warn_Level1;
        i.WarningLine2 = i.warn_level2;
        i.WarningLine3 = i.warn_level3;
        i.X = i.lon;
        i.Y = i.lat;
        i.Status = $.BasePinCtrl.pinIcons.water.normal.name;
        i.Datetime = JsonDateStr2Datetime(i.time);
        i.WaterLevel = i.stage;
        if (i.WaterLevel != undefined && i.Datetime != undefined) {
            var dtime = ntime - JsonDateStr2Datetime(i.Datetime).getTime();
            if (dtime >= 6 * 60 * 60 * 1000)
                i.Status = $.BasePinCtrl.pinIcons.water.noData.name;
            else if (i.WarningLine1 != undefined && i.WaterLevel >= i.WarningLine1)
                i.Status = $.BasePinCtrl.pinIcons.water.warnLevel1.name;
            else if (i.WarningLine2 != undefined && i.WaterLevel >= i.WarningLine2)
                i.Status = $.BasePinCtrl.pinIcons.water.warnLevel2.name;
            else if (i.WarningLine3 != undefined && i.WaterLevel >= i.WarningLine3)
                i.Status = $.BasePinCtrl.pinIcons.water.warnLevel3.name;
        }
        else
            i.Status = $.BasePinCtrl.pinIcons.water.noData.name;
    });
    //console.log(JSON.stringify(datas));
    return _info;
 }
var InitSewerCtrl = function ($pinctrl, options, defaultShowAllStatus) {
    var options =$.extend({
        loadInfo: datahelper.getSewerRt,
        pinInfoLabelMinWidth: '66px',
        infoFields: [
            { field: 'CName', title: '站名' },
            { //新增行政區
                field: 'd', title: '行政區', formatter(v, d) {
                    var dis = '-';
                    if (d.X) {
                        for (var i = 0; i < app.khdistrictInfo.length; i++) {
                            var t = app.khdistrictInfo[i];
                            if (helper.gis.pointInPolygon([d.X, d.Y], t.coors)) {
                                dis = t.Name;
                                break;
                            }
                        }
                    }
                    return dis;
                }
            },
            { field: 'dev_id', title: '設備代號', showInInfo : false , showInList:false, isNewDev : true},
            { field: 'manhole_num', title: '人孔編號', showInInfo: false, showInList: false, isNewDev : true},
            { field: 'manhole_depth', title: '人孔深度', showInInfo: false, showInList: false, unit: "公尺", isNewDev : true },
            { field: 'base_elev', title: '基準高程', showInInfo: false, showInList: false, unit: "公尺", isNewDev : true},
            { field: 'abs_elev', title: '渠底高程', showInInfo: false, showInList: false, unit: "公尺", isNewDev : true},
            { field: 'Datetime', title: '時間', formatter: $.waterFormatter.datetime },
            { field: 'WaterLevel', title: '水位', halign: 'center', align: 'right', formatter: $.waterFormatter.float, unit: "公尺", sortable: true },
            { field: 'WarningLine1', title: '一級', visible: false, formatter: $.waterFormatter.float, unit: "公尺", showInList: false },
            { field: 'WarningLine2', title: '二級', visible: false, halign: 'center', align: 'right', formatter: $.waterFormatter.float, unit: "公尺", showInList: false },
        ],
        legendIcons: [
            { 'name': '正常', 'url': app.siteRoot + 'images/pin/下水道_正常.png', 'classes': 'green_status', disabled: !defaultShowAllStatus },
            { 'name': '二級', 'url': app.siteRoot + 'images/pin/下水道_二級.png', 'classes': 'blue_status' },
            { 'name': '一級', 'url': app.siteRoot + 'images/pin/下水道_一級.png', 'classes': 'orange_status' },
            { 'name': '滿管', 'url': app.siteRoot + 'images/pin/下水道_滿管.png', 'classes': 'red_status' },//purple_status' },
            { 'name': '無資料', 'url': app.siteRoot + 'images/pin/下水道_無資料.png', 'classes': 'gray_status', disabled: !defaultShowAllStatus }
        ],
        pinInfoContent: function (data, infofields) {
            var _nDevshowInInfo = data && data['dev_id'] ? true : false;
            $.each(this.settings.infoFields, function () {
                if (this.isNewDev) //新建Sensor
                    this.showInInfo = _nDevshowInInfo;
            });
            return appendQueryDurationPinInfoContent.call(this, data, infofields, $.WaterCtrl.defaultSettings.pinInfoContent, $pinctrl, "StationID", "CName", "下水道")
        },
        displayChartDatas:function (ds) {
            this.exportdatas = $.map(ds, function (d) { return { datatime: helper.format.JsonDateStr2Datetime(d.datatime).DateFormat('yyyy/MM/dd HH:mm:ss'), val: d.val } });
            return ds;
        },
        getDurationOptions: function (data) { //{hourlyFieldsInfo:{DateTime:"DATE", WaterLevel:"Info"},}
            //this指的是 current
            var result = {
                seriespara:
                {
                    level: {
                        name: '水位', color: '#0000FF', type: 'line', dt: "datatime", info: "val", unit: 'm', turboThreshold: 20000
                    },
                    warn: [
                        { name: '一級', color: '#FF0000', info: 'WarningLine1' },
                        { name: '二級', color: '#FFA500', info: 'WarningLine2' },
                        { name: '三級', color: '#FFFF00', info: 'WarningLine3' },
                    ],
                    wave: { enabled: false }
                },
                chartoptions: function (_options) {
                    _options.chart.zoomType = 'x';
                    _options.xAxis.labels.formatter = function () {
                        var ff = function (s) {
                            return helper.format.paddingLeft(s, '0', 2);
                        }
                        var _date = new Date(this.value);
                        return ff(_date.getMonth() + 1) + '/' + ff(_date.getDate()) + '<br>' + ff(_date.getHours()) + ':' + ff(_date.getMinutes());
                    }
                    try {
                        _options.chart.zooming = {
                            resetButton: { position: { y: -10 } }
                        };
                    } catch (e) { }
                    //_options.lang.resetZoom = 'asssa';
                }
            };
            if (data.base_elev != undefined)
                result.seriespara.warn.push({ name: '基準高程', color: '#800080', info: 'base_elev' });
            result.startdt = new Date(data["Datetime"]).addHours(-24);
            result.enddt = new Date(data["Datetime"]);
          
            result.getDurationData = datahelper.getSewerSerInfo;
            return result;
        },
        transformData: function (_base, _info) {
            WatertransformData(_base, _info);
            $.each(_info, function (idxb, i) {
                if (i.Status != $.BasePinCtrl.pinIcons.water.noData.name && i.base_elev != undefined && i.WaterLevel >= i.base_elev) {
                    i.Status = "滿管";
                }
            });
            return _info;
        }
    }, options);

    
    InitWaterCtrl($pinctrl, options);
}

var InitFloodSensor = function ($_container, options) {
    FloodSensorOptions.map = FloodSensorOptions.map || app.map;
    //$_container.PinCtrl($.extend(FloodSensorOptions, options));
    $_container.WaterCtrl($.extend({},FloodSensorOptions, options));
}

var InitReportDisaster = function ($_container, options) {
    $_container.PinCtrl($.extend(floodPinOptions, { map: app.map, enabledStatusFilter: true, autoReload: true, listContainer: 'inner', listTheme:'none'}, options));
}

var FloodSensorOptions = {
    stTitle: function (d) { return d.SensorName },
    useTimeSeriesData: true, enabledStatusFilter: true, autoReload: true,
    listContainer: 'inner',
    classes:'flood-sensor-pin',
    listTheme: 'none',
    //autoReload: { auto: true, interval: 20 * 1000 },
    pinInfoLabelMinWidth: '68px;vertical-align: top',
    name: '淹水感測設備',
    canFullInfowindow : true,
    infoFields: [
        //{ field: 'SensorUUID', title: 'ID' },
        { field: 'SensorName', title: '站名' },
        { field: 'SourceTime', title: '時間', formatter: function (v, r) { return v ? JsonDateStr2Datetime(v).DateFormat('MM/dd HH:mm') : '-' } },
        { field: 'Depth', title: '淹水深度', formatter: function (v, r) { return (v != undefined ? v.toFixed(0) : '-') + '公分'; } },
        {
            field: 'Operator', title: '單位', formatter: function (v, r) {
                var r = '--';
                if (v != undefined) {
                    var _us = $.grep(AllUnitCodes, function (u) {
                        return u.id == v;
                    });
                    if (_us.length > 0) r = _us[0].name;
                }
                return r;
            }
        },
        {
            field: 'TownCode', title: '行政區', formatter: function (v, r) {
                return datahelper.getFHYTownNameByCode(v);
            }
        },
        {
            field: 'Address', title: '地點', formatter: function (v, r) {
                //var td = $.grep(window.alltown, function (t) {
                //    return t.TownCode == r.TownCode;
                //});
                //if (td.length > 0)
                //    return td[0].CityName + td[0].Town + v;
                //else
                    return v;
            }
        }
    ],
    legendIcons: [{ name: '正常', url: app.siteRoot + 'images/pin/Flood_b_7.png', classes: 'blue_status', disabled: true },
        { name: '淹水', url: app.siteRoot + 'images/pin/Flood_r_7.png', classes: 'red_status' },
        { name: '淹水10↑', url: app.siteRoot + 'images/pin/fsensor_10.png', classes: 'red_status' },
        { name: '淹水30↑', url: app.siteRoot + 'images/pin/fsensor_30.png', classes: 'red_status' },
        { name: '淹水50↑', url: app.siteRoot + 'images/pin/fsensor_50.png', classes: 'red_status' },
        { name: '待檢核', url: app.siteRoot + 'images/pin/Flood_y_7.png', classes: 'yellow_status', disabled: true  },
        { name: '無資料', url: app.siteRoot + 'images/pin/Flood_g_7.png', classes: 'gray_status', disabled: true  }],
    checkDataStatus: function (data, index) {
        var _i = 0;
        if (!data.SourceTime)// || (Date.now() - JsonDateStr2Datetime(data.SourceTime).getTime()) >= 24 * 60 * 60 * 1000)
            _i = 6;
        else if (data.ToBeConfirm == true)
            _i = 5;
        else if (data.Depth && data.Depth >= 50)
            _i = 4;
        else if (data.Depth && data.Depth >= 30)
            _i = 3;
        else if (data.Depth && data.Depth >= 10)
            _i = 2;
        else if (data.Depth && data.Depth >= 0)
            _i = 1;
        return this.settings.legendIcons[_i];
    },
    loadBase: window.datahelper.getFHYFloodSensorStation,
    loadInfo: window.datahelper.getFHYFloodSensorInfoRt,
    transformData: function (_base, _info) {
        var that = this;
        var datas = [];
        $.each(_base, function () {
            var _i = JSON.parse(JSON.stringify(this));
            if (this.Point && this.Point.Latitude != undefined) {
                _i.X = this.Point.Longitude;
                _i.Y = this.Point.Latitude;
            }
            var _if = $.grep(_info, function (_in) { return _in.SensorUUID == _i.SensorUUID });
            if (_if.length > 0)
                _i = $.extend(_i, _if[0]);
            datas.push(_i);
        });
        datas.sort(function (a, b) {
            var av = a.Depth, bv = b.Depth;
            if (!a.SourceTime || (Date.now() - JsonDateStr2Datetime(a.SourceTime).getTime()) >= 24 * 60 * 60 * 1000)
                av = -999;
            if (!b.SourceTime || (Date.now() - JsonDateStr2Datetime(b.SourceTime).getTime()) >= 24 * 60 * 60 * 1000)
                bv = -999;
            return bv - av; //清單淹水的在前面
        });
        window.pinLeafletMaxZIndex += datas.length;
        $.each(datas, function (idx, d) { //淹水的pin pinZIndex越大，才會在上面
            d.pinZIndex = window.pinLeafletMaxZIndex - idx;
        });
        window.ALLDATAS = datas;//選鄉鎮select filter
        return datas;
    },
    pinInfoContent: function (data) {
        var that = this;
        //var $_c = $($.BasePinCtrl.defaultSettings.pinInfoContent.call(this, data));
        var $_c = $($.WaterCtrl.defaultSettings.pinInfoContent.call(this, data));
        var eurl = encodeURI(app.CSgdsRoot + 'FDashboard.html?sensoruuid=' + data.SensorUUID);
        console.log();
        console.log("eurl:" + eurl);
        var $_info = $('<div style="font-size:1.4rem;padding:0 2rem 0 .4rem;text-align:end;"></div>').appendTo($_c);
        $('<a href="' + eurl + '" target="_FDashboard"><sapn class="glyphicon glyphicon-info-sign" title="淹水感測整合資訊"></a>').appendTo($_info);
        if (data.Depth && data.Depth >= 10 && !data.floodarea) {
            var _gid = 'cal-' + helper.misc.geguid();
            $('<sapn id="' + _gid + '" style="font-size:1.2rem;margin-right:1rem;cursor:pointer" class="glyphicon glyphicon-alert" title="淹水範圍推估"></span>').prependTo($_info);
            setTimeout(function () {
                if (_gid) {
                    $('#' + _gid).on('click', function () {
                        var $_this = $(this);
                        $_this.off('click').css('opacity', .3)[0].style.cursor = 'not-allowed';//.addClass('btn disabled');

                        helper.misc.showBusyIndicator($_this.closest('.meterInfoTemplateContent'), { content: '演算中...' });
                        datahelper.estimateFloodingComputeForLightweightDatas([{
                            PK_ID: data.SensorUUID + Date.now(),
                            X: data.Point.Longitude,
                            Y: data.Point.Latitude,
                            DATE: helper.format.JsonDateStr2Datetime(data.SourceTime),
                            CREATE_DATE: helper.format.JsonDateStr2Datetime(data.SourceTime),
                            Sources: "淹水感測器即時推估_KHSFC",
                            EMISTYPE: '淹水感測器',
                            DEPTH: data.Depth,
                            SourceCode: 7,
                            TOWN_NAME: data.TownCode,
                            LOCATION_DESCRIPTION: data.Address,
                            Described: '-'
                        }], function (fds) {
                            helper.misc.hideBusyIndicator($_this.closest('.meterInfoTemplateContent'));
                            if (fds && fds.floodarea.length > 0) {
                                //console.log(fds.floodarea[0]);
                                if (fds.floodarea == undefined || fds.floodarea.length == 0 || fds.floodarea[0].Image_Data == undefined)
                                    return;
                                data.floodarea = fds.floodarea[0];
                                that.$element.trigger('add-floodarea', [data]);
                                return;
                                var fa = fds.floodarea[0];

                                data._floodImageOverlay = L.imageOverlay(app.CSgdsRoot + fa.Image_Data.Url, [[fa.Image_Data.MaxY, fa.Image_Data.MaxX], [fa.Image_Data.MinY, fa.Image_Data.MinX]], { interactive: true, zIndex: 201 }).addTo(app.map);
                                data._floodImageOverlay.on('click', function (e) {
                                    var popup = data._floodImageOverlay.unbindPopup().bindPopup('<div class="leaflet-infowindow-title  status-blue">' + data.SensorName + '</div>' + "<div>" + floodPinOptions.pinInfoContent.call({ settings: floodPinOptions }, fa) + "</div>",
                                        $.extend({ closeOnClick: true, autoClose: true, className: 'leaflet-infowindow', minWidth: 250 },
                                            {}))
                                        .openPopup(e.latlng).getPopup();

                                    var _color = '#0000FF';
                                    var $_pop = $(popup.getElement());
                                    var _statusstyle = window.getComputedStyle($_pop.find('.leaflet-infowindow-title')[0]);
                                    var $_title = $_pop.find('.leaflet-infowindow-title');
                                    var _cbtn = $_pop.find('.leaflet-popup-close-button')[0];
                                    var _content = $_pop.find('.leaflet-popup-content')[0];
                                    $_title.css('background-color', _color).css('color', '#fff').css('box-shadow', $_title.css('box-shadow').replace('#999', _color).replace('rgb(153, 153, 153)', _color));
                                    _content.style.borderColor = _cbtn.style.borderColor = _cbtn.style.color = _color;
                                    $_pop.find('.leaflet-popup-tip')[0].style.boxShadow = " 3px 3px 15px " + _color;
                                });
                            }
                        });
                    })
                }
            });
        }
        //$('<form style="font-size:1.75em;padding:0px 8px 0 6px;text-align:end;" action="FDashboard.html" target="_FDashboard"  method="post"><a href="javascript:;" onclick="parentNode.submit();"><sapn class="glyphicon glyphicon-info-sign" title="淹水感測整合資訊"></span></a><input type="hidden" name="sensoruuid" value="' + data.SensorUUID + '"/></form>').appendTo($_c);

        //歷史資料 chart
        //var $_dc = $(
        //    //'<table id="table_' + _id + '" class="history-table">'+
        //    '<div class="date-dur-ctrl row">' +
        //    '<div class="input-group col"><span class="input-group-text">開始時間</span><input type="date" class="form-control"></div>' +
        //    '<div class="input-group col"><span class="input-group-text">結束時間</span><input type="date" class="form-control"></div>' +
        //    '<span class="btn btn-sm btn-default glyphicon glyphicon-search col-2">查詢</span>' +
        //    '<span class="btn btn-link glyphicon glyphicon-cloud-download col-2">下載</span></div>'
        //).appendTo($_c);

        //if (!data.qedt) {
        //    data.qsdt = new Date().addHours(-6 * 24).DateFormat('yyyy-MM-dd');
        //    data.qedt = new Date().addHours(24).DateFormat('yyyy-MM-dd');
        //    data['hdata'] = undefined;
        //}
        //$_dc.find('input:eq(0)').attr('value', data.qsdt);
        //$_dc.find('input:eq(1)').attr('value', data.qedt);


        //var cdata = data;

        return $_c[0].outerHTML;
    },
    getDurationOptions: function (data) { //{hourlyFieldsInfo:{DateTime:"DATE", WaterLevel:"Info"},}
        //this指的是 current
        var result = {
            seriespara:
            {
                level: {
                    name: '水位', color: '#0000FF', type: 'line', dt: "SourceTime", info: "Depth", unit: 'cm', turboThreshold:5000
                },
                wave: { enabled: false }
            },
            chartoptions: function (_options) {
                _options.chart.zoomType = 'x';
                _options.yAxis.title.text="水深cm"
                _options.yAxis.minRange = 1; //如全0就不會畫在中間
                _options.yAxis.min = 0;
                _options.xAxis.labels.formatter = function () {
                    var ff = function (s) {
                        return helper.format.paddingLeft(s, '0', 2);
                    }
                    var _date = new Date(this.value);
                    return ff(_date.getMonth() + 1) + '/' + ff(_date.getDate()) + '<br>' + ff(_date.getHours()) + ':' + ff(_date.getMinutes());
                }
            }
        };
        
        result.startdt = helper.format.JsonDateStr2Datetime( JSON.parse( JSON.stringify( data["SourceTime"]))).addHours(-24);
        result.enddt = helper.format.JsonDateStr2Datetime(data["SourceTime"]);
        result.stationNo = data["SensorUUID"]
        result.getDurationData = datahelper.getFHYFloodSensorInfoByDuration;
        return result;
    }
};

var Init河川水位CCTVCtrl = function ($_container, options) {
    return Init高雄自建CCTV($_container, $.extend({ name: '河川水位', loadBase: datahelper.get河川水位CCTV}, options))
}
var Init滯洪池CCTVCtrl = function ($_container, options) {
    return Init高雄自建CCTV($_container, $.extend({ name: '滯洪池', loadBase: datahelper.get滯洪池CCTV, timerInterval: 10000, classes:classes_non_public }, options))
}
var Init抽水截流站CCTVCtrl = function ($_container, options) {
    return Init高雄自建CCTV($_container, $.extend({ name: '抽水截流站', loadBase: datahelper.get抽水截流站CCTV, classes: classes_non_public }, options))
}
var Init車行地下道CCTVCtrl = function ($_container, options) {
    return Init高雄自建CCTV($_container, $.extend({ name: '車行地下道', loadBase: datahelper.get車行地下道CCTV, classes: classes_non_public }, options))
}
var Init高雄自建CCTV = function ($_container, options) {
    var $_p = $('<div class="row kh-cctv-ctrl"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.CctvCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.stn_name }, timerInterval: 5000, canFullInfowindow:true,
        listTheme: 'success',
        infoFields: [
            { field: 'stn_name', title: '名稱' },
            { field: 'basin', title: '流域' },
            { field: 'town', title: '鄉鎮區' },
            { field: 'type', title: '數量', formatter: function (v, r) { return r.urls.length} }
        ],
        legendIcons: [
            { 'name': '攝影機', 'url': app.siteRoot+'images/pin/cctv-on.png', 'classes': 'blue_status' }
        ],
        snapshotUrl: cctvKhSnapshotUrl
        //    function (u) { //{id:"", name: "", url: "" }
        //    var r = 'https://floodinfo.kcg.gov.tw//service/api/cctv/wrs/image/' + u.id + '?jwt=' + datahelper.getKhfloodinfoToke() + '&guid=' + geguid();
        //    return r;
        //}
    }, options));
    return $_p;
}
var cctvKhSnapshotUrl = function (u) {
    if (u.iskh) //自件站
        return 'https://floodinfo.kcg.gov.tw//service/api/cctv/wrs/image/' + u.id + '?jwt=' + datahelper.getKhfloodinfoToke() + '&guid=' + geguid();
    else
        return $.CctvCtrl.defaultSettings.snapshotUrl( u); //Fmg or other

}
var Init即時監視影像CCTVCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.CctvCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.name }, timerInterval: 5000, canFullInfowindow: true,
        name: '即時監視影像',
        listTheme: 'success',
        //classes: classes_non_public,
        loadBase: datahelper.get即時監視影像CCTV,
        boundary:app.hkbounds,
        infoFields: [
            { field: 'name', title: '名稱' },
            { field: 'town_name', title: '鄉鎮區' },
            { field: 'source_name', title: '來源' }
        ],
        pinInfoContent: _即時監視影像CCTVCtrl_pinInfoContent,

        legendIcons: [
            { 'name': '攝影機', 'url': app.siteRoot + 'images/pin/cctv-on.png', 'classes': 'rain_normal' }]
            
    }, options));
    return $_p;
}
var InitAllCCTVCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.CctvCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.name }, timerInterval: 5000, canFullInfowindow: true,
        name: '即時監視影像',
        listTheme: 'success',
        loadBase: datahelper.getAllCCTV,
        infoFields: [
            { field: 'name', title: '名稱' }
        ],
        legendIcons: [
            { 'name': '攝影機', 'url': app.siteRoot+'images/pin/cctv-on.png', 'classes': 'rain_normal' }],
        pinInfoContent: function (d) {
            if (d.type === 1 || d.type === 99)
                return _即時監視影像CCTVCtrl_pinInfoContent.call(this, d);
            else
                return $.CctvCtrl.defaultSettings.pinInfoContent.call(this, d);
        },
        snapshotUrl: cctvKhSnapshotUrl
        //pinInfoContent: _即時監視影像CCTVCtrl_pinInfoContent
    }, options));
    return $_p;
}
var _即時監視影像CCTVCtrl_pinInfoContent = function (data, infofields) {
    if (data.isvideo) {
        return '<'+(window.cctvViedoContainer || 'iframe')+' class="video-iframe" src="' + data.url + '" data-name="' + data.name + '">';
    } else {
        if (data.type == 1 && !data.urls || data.urls.length == 0) {
            var r = datahelper.getFmgOneCCTV(data.id, data.sourceid);
            //data.urls = [];
            //if (r.cctvs.length > 0) {
            if (r) {
                var _cameras = $.grep(r.cameras, function (_c) {
                    return _c.images && _c.images.length > 0;
                });
                data.urls = $.map(_cameras, function (_c) {
                    var _u = _c.images[_c.images.length - 1];
                    var _si = _u.lastIndexOf('/');
                    var _ei = _u.lastIndexOf('.');
                    var _ts = _u.substr(_si + 1, _ei - _si - 1);
                    return { id: _c.id, name: _c.cctv_name, url: _u.replace(_ts, 'new') }
                });
            }
        }
        return $.CctvCtrl.defaultSettings.pinInfoContent.call(this, data, infofields);
    }
    
}

//各機電設備資料及即時資料merge
var mechanicalMergeInfo = function (bs, ifos, f) {
    $.each(bs, function () {
        var _bs = this;
        var fs = $.grep(ifos, function (_d) { return _bs[f] == _d[f] });
        if (fs.length > 0)
            $.extend(this, fs[0]);
    });
}
var mmm = {
    device: {
        status: {
            nodata: '<div class="mechanical-status status-no"></div>', //無資料
            status: '<div class="mechanical-status status-no"></div>',//無資料eval用
            statusundefined: '<div class="mechanical-status status-no"></div>',//無資料eval用
            status1: '<div class="mechanical-status status-1"></div>',
            status0: '<div class="mechanical-status status-0"></div>',
            listdispaly: function (ms) {//抽水機及閘門狀態清單表示
                var ss = $.map(ms, function (m) {
                    return eval('mmm.device.status.status' + m.status);
                });
                return ss.join('');
            },
            listdispaly_pump: function (v,r) {
                return mmm.device.status.listdispaly(mmm.device.get.bytype(v, r, '抽水機'));
            },
            listdispaly_gate: function (v,r) {
                return mmm.device.status.listdispaly(mmm.device.get.bytype(v, r, '閘門'));
            },
            listdispaly_dam: function (v, r) { //橡皮壩
                return mmm.device.status.listdispaly(mmm.device.get.bytype(v, r, '橡皮壩'));
            },
            listdispaly_power_tw: function (v, r) { //車行地下道-電力(台電)
                var ds = $.grep(v, function (d) { return d.eqpt_type == '電力' && d.name == '台電' })
                return mmm.device.status.listdispaly(ds);
            },
            listdispaly_power_dynamo: function (v, r) { //車行地下道-電力(發電機)
                var ds = $.grep(v, function (d) { return d.eqpt_type == '電力' && d.name == '發電機' })
                return mmm.device.status.listdispaly(ds);
            },
            listdispaly_wlevel: function (v, r) { //車行地下道-水位
                var w =mmm.device.get.bytype(v, r, '水位')
                var ws= mmm.device.get.water_status(w[0].description); //液位
                return mmm.device.status.listdispaly(w)+ws;
            }
        },
        get: {
            bytype: function (ds, base, t) {//從device中取指定種類
                if (!ds)
                    return undefined;
                if (base.stn_type == '橡皮壩') {
                    if (t == '橡皮壩')
                        return $.grep(ds, function (d) { return d.name == t })
                    else
                        return $.grep(ds, function (d) { return d.eqpt_type == t && d.name != '橡皮壩' })
                }
                else
                    return $.grep(ds, function (d) { return d.eqpt_type == t })
                
            },
            water_status: function (descript) { //車行地下第取'液位'描述
                if (!descript)
                    return undefined;
                var sidx = descript.indexOf('浮球');
                var eidx = descript.indexOf('液位');
                if (sidx < 0 || eidx < 0)
                    return '';
                else
                    return descript.substr(sidx + 2, eidx - sidx);
            }
        },
        infodisplay_pump: function ($_c, s, base) {
            mmm.device._infodisplay_cmm($_c, s, base, '抽水機');
        },
        infodisplay_gate: function ($_c, s, base) {
            mmm.device._infodisplay_cmm($_c, s, base, '閘門');
        },
        infodisplay_dam: function ($_c, s, base) { //橡皮壩
            mmm.device._infodisplay_cmm($_c, s, base, '橡皮壩');
        },
        infodisplay_wlevel: function ($_c, s, base) { //車行地下道
            mmm.device._infodisplay_cmm($_c, s, base, '水位');
        },
        infodisplay_power: function ($_c, s, base) { //車行地下道
            mmm.device._infodisplay_cmm($_c, s, base, '電力');
        },
        _infodisplay_cmm: function ($_c, s, base, t) {
            if (s && s.length > 0) {
                var gs = mmm.device.get.bytype(s,base, t);
                if (gs && gs.length > 0) {
                    var tds = $.map(gs, function (_s) { //t == '水位'>>車行地下道
                        return { name: _s.name, val: eval('mmm.device.status.status' + _s.status) + (t == '水位' ? mmm.device.get.water_status(_s.description):''), time: _s.time }
                        //return { name: _s.name, val: eval('mmm.device.status.status' + _s.status) , time: _s.time }
                    });
                    var statusdesc = mmm.device.status.status1 + '開啟 / ' + mmm.device.status.status0 + '關閉 / ' + mmm.device.status.nodata + '異常';
                    if (t == '橡皮壩')
                        statusdesc = mmm.device.status.status1 + '起立 / ' + mmm.device.status.status0 + '伏倒 / ' + mmm.device.status.nodata + '異常';
                    else if (t == '水位')
                        statusdesc = mmm.device.status.status1 + '警戒 / ' + mmm.device.status.status0 + '未警戒 / ' + mmm.device.status.nodata + '異常';
                    mmm._infodisplay($_c, s, tds, t, statusdesc);
                }
            }
        }
    },
    stage: {
        get: {
            //bytype: function (sts, t) {//取內外水位
            //    return $.grep(sts, function (s) { return s.water_type.indexOf(t) > 0 });
            //},
            valuebytype: function (sts, t) {////取內外水位值
                if (!sts)
                    return '-';
                var ss = $.grep(sts, function (s) { return s.water_type.indexOf(t) >= 0 });
                if (ss.length > 0)
                    return ss[0].stage == undefined ? '-' : helper.format.formatNumber(ss[0].stage, 3);
                else return '-';
            },
            invalue: function (v, d) {//取內水位值formatter
                var k = '內';
                if (d.stn_type == '截流站' && d.stn_name == '寶珠溝')
                    k = '愛河內水位';
                if (d.stn_type == '橡皮壩' && d.stn_name == '二號站')
                    k = '二號橡皮壩下游水位';
                return mmm.stage.get.valuebytype(v, k);
            },
            outvalue: function (v, d) {//取外水位值formatter
                var k = '外';
                if (d.stn_type == '截流站' && d.stn_name == '寶珠溝')
                    k = '愛河外水位';
                if (d.stn_type == '橡皮壩' && d.stn_name == '二號站')
                    k = '二號橡皮壩上游水位';
                return mmm.stage.get.valuebytype(v,k);
            }
        },
        infodisplay: function ($_c, s) {
            if (s && s.length > 0) {
                var tds = $.map(s, function (_s) {
                    return { name: _s.water_type, val: helper.format.formatNumber(_s.stage, 3), time: _s.time }
                });
                mmm._infodisplay($_c, s, tds, '水位', '單位:mm');
            }
        }
    },
    table: function ($_c,ds) {
        $('<table>').appendTo($_c).bootstrapTable({
            striped: true, showHeader: false,
            classes: 'table table-bordered table-striped table-sm',
            columns: [
                { field: 'name', title: '站名' },
                { field: 'val', title: 'val', width: 50, align:'center',class:'ps-0 pe-0' },
                { field: 'time', title: 'time', width: 98, formatter: function (v) { return !v ? '-' : JsonDateStr2Datetime(v).DateFormat('MM-dd HH:mm:ss'); } },
            ],
            data: ds
        });
    },
    _infodisplay: function($_c,sts, tds,mtitle, statusdesc) {
        if (sts && sts.length > 0) {
            var $_oc = $('<div class="device-stage-type-info">').appendTo($_c);
            var $_title = $('<div class="info-title d-flex justify-content-between">').appendTo($_oc);
            $('<span class="text-start">' + mtitle+':</span>').appendTo($_title);
            $('<span class="text-end">' + statusdesc+'</span>').appendTo($_title);
            //var tds = $.map(s, function (_s) {
            //    return { name: _s.water_type, val: helper.format.formatNumber(_s.stage, 3), time: _s.time }
            //});
            mmm.table($_oc, tds);
        }
    }
}

var Init抽水站Ctrl = function ($_container, options) {
    return InitMechanicalCtrl($_container, $.extend({
        name: '抽水站',
        classes: classes_non_public,
        loadBase: datahelper.get抽水站base,
        loadInfo: datahelper.get抽水站Rt,
        legendIcons: [
            { 'name': '待命', 'url': app.siteRoot + 'images/pin/抽水站_待命.png', 'classes': 'blue_status' },
            { 'name': '抽水中', 'url': app.siteRoot + 'images/pin/抽水站_抽水中.png', 'classes': 'green_status' }
        ]
    }, options));
}
var Init截流站Ctrl = function ($_container, options) {
    return InitMechanicalCtrl($_container, $.extend({
        name: '截流站',
        classes: classes_non_public,
        infoFields: [
            { field: 'stn_name', title: '站名' },
            { field: 'town', title: '行政區' },
            { field: 'stage', title: '外水位', formatter: mmm.stage.get.outvalue },
            { field: 'stage', title: '內水位', formatter: mmm.stage.get.invalue },
            { field: 'device', title: '閘門', formatter: mmm.device.status.listdispaly_gate },
            { field: 'status_name', title: '狀態' }
        ],
        loadBase: datahelper.get截流站base,
        loadInfo: function (dt, callback) {
            datahelper.get截流站Rt(dt, callback);
            var that = this;
            datahelper.get寶珠溝即時資訊info(function (ds) {
                that.settings.bcinfos = ds;
                that.$element[0].bcinfos = ds;
            });
        },
        legendIcons: [
            { 'name': '待命', 'url': app.siteRoot + 'images/pin/截流站_待命.png', 'classes': 'blue_status' },
            { 'name': '運作', 'url': app.siteRoot + 'images/pin/截流站_運作.png', 'classes': 'red_status' },
            { 'name': '無狀態', 'url': app.siteRoot + 'images/pin/截流站_無狀態.png', 'classes': 'gray_status' }
        ],
        transformData: function (_b, _i) {

            var rs = helper.misc.cloneObj(_b);
            $.each(rs, function () {
                this.X = this.lon;
                this.Y = this.lat;
                mechanicalMergeInfo(this.device, _i.device, 'eqpt_series');
                mechanicalMergeInfo(this.stage, _i.stage, 'stage_series');
                var opens = $.grep(this.device, function (d) { return d.eqpt_type == '閘門' && d.status == 1 });
                this.status_name = this.device.length == 0 ? '無狀態' : (opens.length > 0 ? '運作' : '待命');
            });
            return rs;
        },
        checkDataStatus: function (d, i) {
            if (d.stn_name == "寶珠溝")
                return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, '待命');
            else
                return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, d.status_name);
        },
        pinInfoContent: function (d, infofields) {
            if ("寶珠溝" == d.stn_name) {
                var _id = 'id_' + helper.misc.geguid();
                //datahelper.get寶珠溝即時資訊info(function (ds) {
                var that = this;
                setTimeout(function () {
                    var _d = $.grep(that.$element[0].bcinfos, function (s) { return s.Id == 'ks224'; })[0];
                    var $_t = MechanicalInfoContent(_d.MechanicalInfos);
                    $_t.appendTo($('#' + _id));
                }, 1);
                //});
                return '<div id="' + _id + '" style="width:300px;">';
            }
            var $_r = $('<div class="mechanical-info-container">');
            mmm.stage.infodisplay($_r, d.stage, d);
            mmm.device.infodisplay_pump($_r, d.device, d);
            mmm.device.infodisplay_gate($_r, d.device, d);
            mmm.device.infodisplay_dam($_r, d.device, d);      //橡皮壩用
            mmm.device.infodisplay_wlevel($_r, d.device, d);   //車行地下道用
            mmm.device.infodisplay_power($_r, d.device, d);    //車行地下道用

            return $_r.prop("outerHTML");
        }
    }, options));
}
var Init滯洪池Ctrl = function ($_container, options) {
    return InitMechanicalCtrl($_container, $.extend({
        name: '滯洪池',
        classes: classes_non_public,
        infoFields: [
            { field: 'stn_name', title: '站名' },
            { field: 'town', title: '行政區' },
            { field: 'device', title: '抽水機', formatter: mmm.device.status.listdispaly_pump },
            { field: 'device', title: '閘門', formatter: mmm.device.status.listdispaly_gate },
            { field: 'overflow_stage', title: '外水位', formatter: function (v) { return v && v.stage != undefined ? v.stage.toFixed(2) : '-' } },
            { field: 'overflow_stage', title: '溢流堰', formatter: function (v) {return v && v.overflow_stage != undefined ? v.overflow_stage:'-'} },
            { field: 'status_name', title: '狀態' }
        ],
        loadBase: datahelper.get滯洪池base,
        loadInfo: function (dt, callback) {
            datahelper.get滯洪池Rt(dt, callback);
            var that = this;
            datahelper.get寶珠溝即時資訊info(function (ds) {
                that.settings.bcinfos = ds;
                that.$element[0].bcinfos = ds;
            });
        },
        legendIcons: [
            { 'name': '滯洪', 'url': app.siteRoot + 'images/pin/滯洪池_滯洪.png', 'classes': 'green_status' },
            { 'name': '排洪', 'url': app.siteRoot + 'images/pin/滯洪池_排洪.png', 'classes': 'red_status' },
            { 'name': '無狀態', 'url': app.siteRoot + 'images/pin/滯洪池_無狀態.png', 'classes': 'gray_status' }
        ],
        transformData: function (_b, _i) {

            var rs = helper.misc.cloneObj(_b);
            $.each(rs, function () {
                this.X = this.lon;
                this.Y = this.lat;
                mechanicalMergeInfo(this.device, _i.device, 'eqpt_series');
                mechanicalMergeInfo(this.stage, _i.stage, 'stage_series');
                
                var max_overflow_stage = undefined;
                $.each(this.stage, function () {
                    if (this.overflow_stage != undefined) {
                        if (max_overflow_stage == undefined || this.overflow_stage > max_overflow_stage.overflow_stage)
                            max_overflow_stage = this;
                    }
                });
                this.overflow_stage = max_overflow_stage;
                this.status_name = !max_overflow_stage || max_overflow_stage.stage == undefined ? '無狀態' : (max_overflow_stage.overflow_stage > max_overflow_stage.stage? '排洪' : '滯洪');
            });
            return rs;
        },
        checkDataStatus: function (d, i) {
            if (d.stn_name == "十全")
                return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, '滯洪');
            else
                return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, d.status_name);
        },
        pinInfoContent: function (d, infofields) {
            if (d.stn_name == "十全") {
                var _id = 'id_' + helper.misc.geguid();
                //datahelper.get寶珠溝即時資訊info(function (ds) {
                var that = this;
                setTimeout(function () {
                    var _d = $.grep(that.$element[0].bcinfos, function (s) { return s.Id == 'ks245';})[0];
                    var $_t = MechanicalInfoContent(_d.MechanicalInfos);
                    $_t.appendTo($('#' + _id));
                },1);
                //});
                return '<div id="' + _id + '" style="width:300px;">';
            }
            var $_r = $('<div class="mechanical-info-container">');
            mmm.stage.infodisplay($_r, d.stage, d);
            mmm.device.infodisplay_pump($_r, d.device, d);
            mmm.device.infodisplay_gate($_r, d.device, d);
            mmm.device.infodisplay_dam($_r, d.device, d);      //橡皮壩用
            mmm.device.infodisplay_wlevel($_r, d.device, d);   //車行地下道用
            mmm.device.infodisplay_power($_r, d.device, d);    //車行地下道用

            return $_r.prop("outerHTML");
        }

    }, options));
}
var Init橡皮壩Ctrl = function ($_container, options) {
    return InitMechanicalCtrl($_container, $.extend({
        name: '橡皮壩',
        classes: classes_non_public,
        infoFields: [
            { field: 'stn_name', title: '站名' },
            { field: 'town', title: '行政區' },
            { field: 'stage', title: '上游水位', formatter: mmm.stage.get.outvalue },
            { field: 'stage', title: '下游水位', formatter: mmm.stage.get.invalue },
            { field: 'device', title: '閘門', formatter: mmm.device.status.listdispaly_gate },
            { field: 'device', title: '橡皮壩', formatter: mmm.device.status.listdispaly_dam}
        ],
        loadBase: datahelper.get橡皮壩base,
        loadInfo: datahelper.get橡皮壩Rt,
        legendIcons: [
            { 'name': '倒伏', 'url': app.siteRoot + 'images/pin/橡皮壩_倒伏.png', 'classes': 'green_status' },
            { 'name': '起立', 'url': app.siteRoot + 'images/pin/橡皮壩_起立.png', 'classes': 'red_status' },
            { 'name': '無狀態', 'url': app.siteRoot + 'images/pin/橡皮壩_無狀態.png', 'classes': 'gray_status' }
        ],
        transformData: function (_b, _i) {

            var rs = helper.misc.cloneObj(_b);
            $.each(rs, function () {
                this.X = this.lon;
                this.Y = this.lat;
                mechanicalMergeInfo(this.device, _i.device, 'eqpt_series');
                mechanicalMergeInfo(this.stage, _i.stage, 'stage_series');
                
                var ds = mmm.device.get.bytype(this.device, this, '橡皮壩');

                //var opens = $.grep(this.device, function (d) { return d.eqpt_type == '閘門' && d.status == 1 });
                this.status_name = ds.length == 0 ? '無狀態' : (ds[0].status == 1 ? '起立' : '倒伏');
            });
            return rs;
        }
    }, options));
}
var Init車行地下道Ctrl = function ($_container, options) {
    return InitMechanicalCtrl($_container, $.extend({
        name: '車行地下道',
        classes: classes_non_public,
        infoFields: [
            { field: 'stn_name', title: '站名' },
            { field: 'town', title: '行政區' },
            { field: 'device', title: '水位資訊', formatter: function (v, r) { return mmm.device.status.listdispaly_wlevel(v, r) } },
            { field: 'device', title: '抽水機', formatter: mmm.device.status.listdispaly_pump },
            { field: 'device', title: '台電', formatter: mmm.device.status.listdispaly_power_tw },
            { field: 'device', title: '發電機', formatter: mmm.device.status.listdispaly_power_dynamo }
        ],
        loadBase: datahelper.get車行地下道base,
        loadInfo: datahelper.get車行地下道Rt,
        legendIcons: [
            { 'name': '正常', 'url': app.siteRoot + 'images/pin/車行地下道_藍.png', 'classes': 'blue_status' },
            { 'name': '警戒', 'url': app.siteRoot + 'images/pin/車行地下道_紅.png', 'classes': 'red_status' }
        ],
        transformData: function (_b, _i) {

            var rs = helper.misc.cloneObj(_b);
            $.each(rs, function () {
                this.X = this.lon;
                this.Y = this.lat;
                mechanicalMergeInfo(this.device, _i.device, 'eqpt_series');
                mechanicalMergeInfo(this.stage, _i.stage, 'stage_series');
            });
            return rs;
        },
        checkDataStatus: function (d, i) {
            var w = $.grep(d.device, function (d) {
                return d.eqpt_type == "水位";
            });
            if(w.length>0)
                return this.settings.legendIcons[w[0].status]; //status:0-正常，1-警戒
            else
                return this.settings.legendIcons[0];
        }
    }, options));
}

var InitMechanicalCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.PinCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.stn_name },
        listTheme: 'primary',
        //enabledStatusFilter: true,
        autoReload: true,
        infoFields: [
            { field: 'stn_name', title: '站名' },
            { field: 'town', title: '行政區' },
            { field: 'stage', title: '外水位', formatter: mmm.stage.get.outvalue },
            { field: 'stage', title: '內水位', formatter: mmm.stage.get.invalue },
            { field: 'device', title: '抽水機', formatter: mmm.device.status.listdispaly_pump },
            { field: 'device', title: '閘門', formatter: mmm.device.status.listdispaly_gate },
            { field: 'status_name', title: '狀態' }
        ],
        checkDataStatus: function (d, i) {
            return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, d.status_name);
        },
        transformData: function (_b, _i) {

            var rs = helper.misc.cloneObj(_b);
            $.each(rs, function () {
                this.X = this.lon;
                this.Y = this.lat;
                mechanicalMergeInfo(this.device, _i.device, 'eqpt_series');
                mechanicalMergeInfo(this.stage, _i.stage, 'stage_series');
                var opens = $.grep(this.device, function (d) { return d.eqpt_type == '抽水機' && d.status == 1 });
                this.status_name = opens.length > 0 ? '抽水中' : '待命';
            });
            return rs;
        },
        pinInfoContent: function (d, infofields) {
            var $_r = $('<div class="mechanical-info-container">');
            mmm.stage.infodisplay($_r, d.stage, d);
            mmm.device.infodisplay_pump($_r, d.device, d);
            mmm.device.infodisplay_gate($_r, d.device, d);
            mmm.device.infodisplay_dam($_r, d.device, d);      //橡皮壩用
            mmm.device.infodisplay_wlevel($_r, d.device, d);   //車行地下道用
            mmm.device.infodisplay_power($_r, d.device, d);    //車行地下道用
            
            return $_r.prop("outerHTML");
        },
    }, options));
    return $_p;
}

var InitReservoirCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.PinCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.StationName },
        name: '水庫水情',
        classes: classes_non_public,
        //enabledStatusFilter: true,
        autoReload: true,
        listTheme: 'gbright',
        loadBase: datahelper.getReservoirBase,
        loadInfo: datahelper.getReservoirRt,
        infoFields: [
            { field: 'StationName', title: '水庫名稱' },
            { field: 'Time', title: '時間', formatter: function (v, r) { return v ? JsonDateStr2Datetime(v).DateFormat('yyyy/MM/dd HH:mm') : '-' } },
            { field: 'WaterHeight', title: '水位', unit: '公尺', formatter: function (v) { return v || '-' }},
            { field: 'EffectiveStorage', title: '有效蓄水量', unit: '萬噸', formatter: function (v) { return v || '-' }},
            { field: 'PercentageOfStorage', title: '蓄水量百分比', unit: '%', formatter: function (v) { return v || '-' }},
            { field: 'Discharge', title: '放流量', unit: 'CMS', formatter: function (v) { return v || '-' } },
            { field: 'StatusN', title: '狀態'}
        ],
        legendIcons: [
            { 'name': '未放水', 'url': app.siteRoot + 'images/pin/水庫_未放水.png', 'classes': 'blue_status' },
            { 'name': '預計放水', 'url': app.siteRoot + 'images/pin/水庫_預計放水.png', 'classes': 'orange_status' },
            { 'name': '放水中', 'url': app.siteRoot + 'images/pin/水庫_放水中.png', 'classes': 'red_status' }
        ],
        checkDataStatus: function (d, i) {
            return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, d.StatusN);
        },
        baseInfoMerge: {
            basekey: 'StationNo', infokey: 'StationNo', xfield: 'Point.Longitude', yfield: 'Point.Latitude', aftermerge: function (d) { d.StatusN = (d.Status == 0 ? '預計放水' : (d.Status == 1 ? '放水中' : '未放水'))}
        }
    }, options));
    return $_p;
}

var InitMovingPumpCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.PinCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.pump_id },
        name: '移動式抽水機',
        classes:classes_non_public,
        listTheme: 'gbright',
        enabledStatusFilter: true,
        autoReload: true,
        canFullInfowindow: true,
        loadBase: function (callback) { callback([]) },
        loadInfo: datahelper.getMovingPump,
        infoFields: [
            { field: 'pump_id', title: '編號' },
            { field: 'time', title: '時間', formatter: function (v, r) { return v ? JsonDateStr2Datetime(v).DateFormat('yyyy/MM/dd HH:mm') : '-' } },
            { field: 'statusN', title: '狀態' },
            {
                field: 'oil', title: '油料', formatter: function (v, r) {
                    return v == undefined ? '-' : (v > 100 ? '油位異常' : (v > 75 ? '高油位' : (v > 50 ? '中高油位' : (v > 20 ? '中油位' : '低油位'))));
                }
            },
            {
                field: 'voltage', title: '電力', formatter: function (v, r) {
                    return v == undefined ? '-' : (v > 3 ? '正常' :'低電壓');
                }
            },
            { field: 'distirct', title: '行政區' }
        ],
        legendIcons: [
            { 'name': '待命', 'url': app.siteRoot + 'images/pin/抽水機_待命.png', 'classes': 'green_status'},
            { 'name': '抽水中', 'url': app.siteRoot + 'images/pin/抽水機_抽水中.png', 'classes': 'red_status' },
            { 'name': '運送中', 'url': app.siteRoot + 'images/pin/抽水機_運送中.png', 'classes': 'blue_status' },
            { 'name': '機具異常', 'url': app.siteRoot + 'images/pin/抽水機_機具異常.png', 'classes': 'orange_status' },
            { 'name': '其他', 'url': app.siteRoot + 'images/pin/抽水機_其他.png', 'classes': 'gray_status' }
        ],
        checkDataStatus: function (d, i) {
            return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, d.statusN);
        },
        baseInfoMerge: {
            xfield: 'lon', yfield: 'lat', aftermerge: function (i) {
                var ntime = Date.now();
                if (i.status == 5 || (i.time && (ntime - helper.format.JsonDateStr2Datetime(i.time).getTime()) >= 24 * 60 * 60 * 1000))
                    i.statusN = '機具異常';
                else if (i.status == 1 || i.status == 3)
                    i.statusN = '待命';
                else if (i.status == 2)
                    i.statusN = '抽水';
                else if (i.status == 4)
                    i.statusN = '運送';
                else
                    i.statusN = '其他';
                var _distirct = '-';
                if (i.X && i.Y) {
                    boundary.helper.GetBoundaryData(boundary.data.Town, function (bs) {
                        $.each(bs, function () {
                            if (this.Other.indexOf("高雄市") < 0)
                                return;
                            if (helper.gis.pointInPolygon([i.X, i.Y], this.coors)) {
                                _distirct = this.Name;
                                return false;
                            }
                        })
                    });
                }
                i.distirct = _distirct;
            }
        },
        transformDasta: function (_base, _info, checkdt) {
            if (checkdt == undefined)
                checkdt = true;
            var ntime = Date.now();
            $.each(_info, function (idxb, i) {
                i.X = i.lon;
                i.Y = i.lat;

                if (i.status == 5 || (checkdt && i.time && (ntime - helper.format.JsonDateStr2Datetime(i.time).getTime()) >= 24 * 60 * 60 * 1000))
                    i.statusN = '機具異常';
                else if (i.status == 1 || i.status == 3)
                    i.statusN = '待命';
                else if (i.status == 2)
                    i.statusN = '抽水';
                else if (i.status == 4)
                    i.statusN = '運送';
                else
                    i.statusN = '其他';
                var _distirct = '-';
                if (this.lon && this.lat) {
                    var _x = this.lon, _y = this.lat;
                    boundary.helper.GetBoundaryData(boundary.data.Town, function (bs) {
                        $.each(bs, function () {
                            if (this.Other.indexOf("高雄市") < 0)
                                return;
                            if (helper.gis.pointInPolygon([_x, _y], this.coors)) {
                                _distirct = this.Name;
                                return false;
                            }
                        })
                    });
                }
                i.distirct = _distirct;
            });
            return _info;
        },
        pinInfoContent: function (data, infofields) {
            var that = this;
            var _id = 'Id_' + helper.misc.geguid();
            var $_c = $($.BasePinCtrl.defaultSettings.pinInfoContent.call(this, data, infofields)).attr('id', _id);

            $('<table id="table_' + _id + '" class="history-table">').appendTo($_c);
            var $_dc = $(
                //'<table id="table_' + _id + '" class="history-table">'+
                '<div class="date-dur-ctrl row">' +
                '<div class="input-group col"><span class="input-group-text">開始時間</span><input type="date" class="form-control"></div>' +
                '<div class="input-group col"><span class="input-group-text">結束時間</span><input type="date" class="form-control"></div>' +
                '<span class="btn btn-sm btn-default glyphicon glyphicon-search col-2">查詢</span>' +
                '<span class="btn btn-link glyphicon glyphicon-cloud-download col-2">下載</span></div>' 
                ).appendTo($_c);
            
            if (!data.qedt) {
                data.qsdt = new Date().addHours(-6 * 24).DateFormat('yyyy-MM-dd');
                data.qedt = new Date().addHours(24).DateFormat('yyyy-MM-dd');
                data['hdata'] = undefined;
            }
            $_dc.find('input:eq(0)').attr('value', data.qsdt);
            $_dc.find('input:eq(1)').attr('value', data.qedt);
            
            
            var cdata = data;
            
            setTimeout(function () {
                $_c = $('#' + _id);
                var painttbale = function () {
                    $_c.find('.history-table').bootstrapTable('destroy').bootstrapTable({
                        data: data.hdata,
                        height: 300,
                        columns: [
                            $.BasePinCtrl.helper.getField(that.settings.infoFields, 'time'),
                            $.BasePinCtrl.helper.getField(that.settings.infoFields, 'statusN'),
                            $.BasePinCtrl.helper.getField(that.settings.infoFields, 'oil'),
                            $.BasePinCtrl.helper.getField(that.settings.infoFields, 'voltage'),
                            { title: '經度', field: 'lon' },
                            { title: '緯度', field: 'lat' }
                        ],
                        formatNoMatches: function () {
                            return '無資料';
                        }
                    });
                }
                var queryHistory = function () {
                    cdata.qsdt = $_c.find('.date-dur-ctrl input:eq(0)').val();
                    cdata.qedt = $_c.find('.date-dur-ctrl input:eq(1)').val();
                    datahelper.getMovingPumpSerInfo(cdata, function (ds, dd) {
                        data.hdata = that.settings.transformDasta(undefined,  ds,false);
                        painttbale();
                    });
                }

                that.$element.off('abc____').on('abc____', function () { //來置放大
                    if (!data.hdata)
                        queryHistory();
                    else
                        painttbale();
                });
                $_c.find('.date-dur-ctrl .glyphicon-search').on('click', function () {
                    queryHistory();
                });
                $_c.find('.date-dur-ctrl .glyphicon-cloud-download').on('click', function () {
                    helper.misc.tableToExcel($_c.find('.fixed-table-body .history-table'),[ cdata.pump_id], '「' + cdata.pump_id + '」移動抽水機紀錄(' + cdata.qsdt + '_' + cdata.qedt + ')')
                });
            });
            return $_c[0].outerHTML;
            //return appendQueryDurationPinInfoContent.call(this, data, infofields, $.WaterCtrl.defaultSettings.pinInfoContent)
        },
    }, options)).on($.BasePinCtrl.eventKeys.fullInfowindowChange, function (e, er, z) {
        if(z)
            $(this).trigger('abc____')
    });
    return $_p;
}

var InitTideCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.WaterCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.id + '(' + d.name + ')' },
        name: '潮位站',
        classes: classes_non_public,
        canFullInfowindow:true,
        autoReload: true,
        listTheme: 'gbright',
        loadBase: datahelper.getTideBase,
        loadInfo: datahelper.getTideRt,
        infoFields: [
            { field: 'id', title: '站名', formatter: function (v, r) { return v + '('+r.name+')' }},
            { field: 'time', title: '時間', formatter: function (v, r) { return v ? JsonDateStr2Datetime(v).DateFormat('yyyy/MM/dd HH:mm') : '-' } },
            { field: 'height', title: '潮高', unit: 'm' },
            { field: 'status', title: '漲退潮'}
        ],
        legendIcons: [
            { 'name': '待命', 'url': app.siteRoot + 'images/pin/潮位站.png', 'classes': 'blue_status' }
        ],
        checkDataStatus: function (d, i) {
            return this.settings.legendIcons[0];
        },
        baseInfoMerge: {basekey: 'id', infokey: 'id', xfield: 'lon', yfield: 'lat'},
        getDurationOptions: function (data) { //{hourlyFieldsInfo:{DateTime:"DATE", WaterLevel:"Info"},}
            //this指的是 current
            var result = {
                seriespara:
                {
                    level: {
                        name: '潮位', color: '#0000FF', type: 'line', dt: "time", info: "height", unit: 'm'
                    },
                    warn: [],
                    wave: { enabled: false }
                }
            };

            result.startdt = new Date(data["time"]).addHours(-24);
            result.enddt = new Date(data["time"]);
            result.stationNo = data["id"]
            result.getDurationData = function (_d,callback) {
                callback( data.sers);
            };
            return result;
        }
    }, options));
    return $_p;
}

var Init雷達迴波圖 = function ($_meter) {
    var _layer = undefined;
    var $_silder = undefined;
    var _timer = Date.now();
    var $_legend = $('#rader-legend');
    var _legendColorDef = [{ min: 65, max: 9999, color: "#FFFFFF" },
        { min: 60, max: 65, color: "#9C31CE" }, { min: 55, max: 60, color: "#FF00FF" },
        { min: 50, max: 55, color: "#D50000" }, { min: 45, max: 50, color: "#FF6363" },
        { min: 40, max: 45, color: "#FF9400" }, { min: 35, max: 40, color: "#E7C600" },
        { min: 30, max: 35, color: "#FFFF00" }, { min: 25, max: 30, color: "#009400" },
        { min: 20, max: 25, color: "#00B400" }, { min: 15, max: 20, color: "#00E900" },
        { min: 10, max: 15, color: "#005BFF" }, { min: 5, max: 10, color: "#00B6FF" }, {min: 0, max: 5, color: "#00FFFF" }];

    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_meter);
    $_p.PinCtrl({
        map: app.map, name: '雷達迴波圖', useLabel: false, useList: false, autoReload: { auto: false, interval: 10 * 1000 }
    }).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
        var _timerflag = undefined;
        var timerreload = function () {
            clearInterval(_timerflag);
            _timerflag = setInterval(function () {
                $_p.find('.pinswitch').trigger('change');
            }, 5*60 * 1000);
        }
        $_p.find('.pinswitch').off('change').on('change', function () {
            var s = $(this).is(':checked');
            if (Date.now() - _timer >= 60 * 1000) {
                if (_layer) {
                    _layer.remove();
                    _layer = null;
                    $_silder.remove();
                }
                _timer = Date.now();
            }
            if (!_layer && s) {
                helper.misc.showBusyIndicator();
                //$.getJSON('https://cwbopendata.s3.ap-northeast-1.amazonaws.com/MSC/O-A0058-005.json', function (r) {
                //    helper.misc.hideBusyIndicator();
                //    var url = r.cwbopendata.dataset.resource.uri;
                //    var time = r.cwbopendata.dataset.time.obsTime;
                //    var x1 = parseFloat(r.cwbopendata.dataset.datasetInfo.parameterSet.parameter[1].parameterValue.split('-')[0]);
                //    var x2 = parseFloat(r.cwbopendata.dataset.datasetInfo.parameterSet.parameter[1].parameterValue.split('-')[1]);
                //    var y1 = parseFloat(r.cwbopendata.dataset.datasetInfo.parameterSet.parameter[2].parameterValue.split('-')[0]);
                //    var y2 = parseFloat(r.cwbopendata.dataset.datasetInfo.parameterSet.parameter[2].parameterValue.split('-')[1]);

                //    var imageBounds = [[y1, x1], [y2, x2]];
                //    app.map.createPane('cloudimage1').style.zIndex = 350;
                //    //var newOverlay = new google.maps.GroundOverlay(url, imageBounds, { map: this.map, opacity: this.currentOpacity }); //1.東南亞imageBounds對不齊??;2.GroundOverlay zoom in out會卡卡的
                //    _layer = L.imageOverlay(url, imageBounds, { opacity: 1, pane: 'cloudimage1' }).addTo(app.map);
                //    $_silder = bindSilder($_p, _layer);
                //    $("#other-layer-info .rader-layer").removeClass('offdisplay');
                //    $("#other-layer-info .rader-layer-time").text(helper.format.JsonDateStr2Datetime(time).DateFormat('MM/dd HH:mm:ss'));
                //    $_legend.empty().show();
                //    L.DouLayer.Qqesums.genLegend($_legend, _legendColorDef, 24, 16, '毫米(mm)', '雷達迴波');
                //});
                var gparas = JSON.parse(JSON.stringify(L.DouLayer.Qqesums.DefaulParas));
                gparas.url = app.siteRoot + 'api/rad/rt';
                gparas.parser = L.DouLayer.Qqesums.Parser.sqpe;
                $.getJSON(gparas.url, function (r) {
                    helper.misc.hideBusyIndicator();
                    if (!r) {
                        $("#other-layer-info .rader-layer").removeClass('offdisplay');//.text(_linfo);
                        $("#other-layer-info .rader-layer-time").text('-無資料');
                        return;
                    }
                    gparas.parser(gparas, r.Content);

                    _layer = L.DouLayer.gridRectCanvas({ 'opacity': 1, ycellsize: gparas.ycellsize, xcellsize: gparas.xcellsize, noMask: true });//.addTo(app.map);
                    _layer.on('mousemove', function (evt) {
                        if (!L.Browser.mobile)
                            _layer.bindTooltip('dBZ:' + evt.griddata.val, { className: "qpesums_tooltip" }).openTooltip(evt.latlng);
                    }).on('mouseout', function (evt) {
                        if (!L.Browser.mobile && _layer.getTooltip() != null)
                            _layer.closeTooltip();
                    });
                    //用$.map 資料太大會有Maximum call stack size exceeded
                    var gs = L.DouLayer.Qqesums.gridData2cellData(gparas.datas, gparas.colorDef);//$.map(gdata.datas, function (val, i) {return { lng: val[0], lat: val[1], color: getcolor(gdata.colorDef, val[2]) }});

                    $_legend.empty().show();
                    L.DouLayer.Qqesums.genLegend($_legend, gparas.colorDef, 24, 16, 'dBZ', '雷達迴波');
                    _layer.setData(gs);
                    $_silder = bindSilder($_p, _layer);

                    $("#other-layer-info .rader-layer").removeClass('offdisplay');//.text(_linfo);
                    $("#other-layer-info .rader-layer-time").text(helper.format.JsonDateStr2Datetime(r.Datetime).DateFormat('MM/dd HH:mm:ss'));
                    _layer.addTo(app.map);
                });
                timerreload();
            } else {
                if (_layer) {
                    if (s) {
                        _layer.addTo(app.map);
                        $_silder.removeClass('offdisplay');
                        $("#other-layer-info .rader-layer").removeClass('offdisplay');
                    }
                    else {
                        _layer.remove();
                        $_silder.addClass('offdisplay');
                        $("#other-layer-info .rader-layer").addClass('offdisplay');
                    }
                }
                else
                    $("#other-layer-info .rader-layer").addClass('offdisplay');
            }
            if ($("#other-layer-info .rader-layer").hasClass('offdisplay'))
                $_legend.hide();
            else
                $_legend.show();
        });
    });
   

    return $_p;
}

var Init累積雨量圖 = function ($_meter) {
    //https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0040-003.kmz
    var _layer = undefined;
    var $_silder = undefined;
    var _timer = Date.now();
    var $_legend = $('#dayrainfall-legend');
    var _legendColorDef = [{ min: 300, max: 5000, color: "#FFD6FE" }, { min: 200, max: 300, color: "#FE38FB" },
    { min: 150, max: 200, color: "#DB2DD2" }, { min: 130, max: 150, color: "#AB1FA2" },
    { min: 110, max: 130, color: "#AA1801" }, { min: 90, max: 110, color: "#D92203" },
    { min: 70, max: 90, color: "#FF2A06" }, { min: 50, max: 70, color: "#FFA81D" },
    { min: 40, max: 50, color: "#FFD328" }, { min: 30, max: 40, color: "#FEFD31" },
    { min: 20, max: 30, color: "#00FB30" }, { min: 15, max: 20, color: "#26A31B" },
    { min: 10, max: 15, color: "#0177FC" }, { min: 6, max: 10, color: "#00A5FE" },
    { min: 2, max: 6, color: "#01D2FD" }, { min: 1, max: 2, color: "#9EFDFF" }, { min: 0, max: 1, color: "#EDEDE6" }];
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_meter);
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_meter);
    $_p.PinCtrl({
        map: app.map, name: '累積雨量圖', useLabel: false, useList: false
    }).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
        var _timerflag = undefined;
        var timerreload = function () {
            clearInterval(_timerflag);
            _timerflag = setInterval(function () {
                $_p.find('.pinswitch').trigger('change');
            }, 5*60 * 1000);
        }
        $_p.find('.pinswitch').off('change').on('change', function () {
            var s = $(this).is(':checked');
            if (Date.now() - _timer >= 60 * 1000) {
                if (_layer) {
                    _layer.remove();
                    _layer = null;
                    $_silder.remove();
                }
                _timer = Date.now();
            }
            if (!_layer && s) {
                helper.misc.showBusyIndicator();
                $.getJSON(app.siteRoot + 'api/rain/img/dayrainfall', function (r) {
                    helper.misc.hideBusyIndicator();
                    var url = r.Url;
                    //var time = r.cwbopendata.dataset.time.obsTime;
                    var x1 = r.MaxX;
                    var x2 = r.MinX;
                    var y1 = r.MaxY;
                    var y2 = r.MinY;
                    var _linfo = (r.Time ? helper.format.JsonDateStr2Datetime(r.Time).DateFormat('MM/dd HH:mm:ss') : '');

                    var imageBounds = [[y1, x1], [y2, x2]];
                    app.map.createPane('cloudimage1').style.zIndex = 350;
                    //var newOverlay = new google.maps.GroundOverlay(url, imageBounds, { map: this.map, opacity: this.currentOpacity }); //1.東南亞imageBounds對不齊??;2.GroundOverlay zoom in out會卡卡的
                    _layer = L.imageOverlay(url, imageBounds, { opacity: 1, pane: 'cloudimage1' }).addTo(app.map);
                    $_silder = bindSilder($_p, _layer);
                    $("#other-layer-info .sum-rainfall-layer").removeClass('offdisplay');//.text(_linfo);
                    $("#other-layer-info .sum-rainfall-layer-time").text(_linfo);
                    $_legend.empty().show();

                    L.DouLayer.Qqesums.genLegend($_legend, _legendColorDef, 24, 16, '毫米(mm)', '累積雨量');
                });
                timerreload();
            } else {
                if (_layer) {
                    if (s) {
                        _layer.addTo(app.map);
                        $_silder.removeClass('offdisplay');
                        $("#other-layer-info .sum-rainfall-layer").removeClass('offdisplay');
                    }
                    else {
                        _layer.remove();
                        $_silder.addClass('offdisplay');
                        $("#other-layer-info .sum-rainfall-layer").addClass('offdisplay');
                    }
                }
                else
                    $("#other-layer-info .rader-layer").addClass('offdisplay');
            }
            if ($("#other-layer-info .sum-rainfall-layer").hasClass('offdisplay'))
                $_legend.hide();
            else
                $_legend.show();
        });
    });

    return $_p;
}

var InitQpf060minRt = function ($_meter) {
    //https://cwbopendata.s3.ap-northeast-1.amazonaws.com/DIV2/O-A0040-003.kmz
    var _layer = undefined;
    var $_silder = undefined;
    var _timer = Date.now();
    var $_legend = $('#qpesums-legend');
    var $_p = $('<div class="row non-public"><div class="col-md-12"></div></div>').appendTo($_meter);
    $_p.PinCtrl({
        map: app.map, name: '預報1小時降雨', useLabel: false, useList: false
    }).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
        var _timerflag = undefined;
        var timerreload = function () {
            clearInterval(_timerflag);
            _timerflag = setInterval(function () {
                $_p.find('.pinswitch').trigger('change');
            }, 5 * 60 * 1000);
        }
        $_p.find('.pinswitch').off('change').on('change', function () {
            var s = $(this).is(':checked');
            if (Date.now() - _timer >= 60 * 1000) {
                if (_layer) {
                    _layer.remove();
                    _layer = null;
                    $_silder.remove();
                }
                _timer = Date.now();
            }
            if (!_layer && s) {
                helper.misc.showBusyIndicator();
                var gparas = JSON.parse(JSON.stringify(L.DouLayer.Qqesums.DefaulParas));
                gparas.url = app.siteRoot + 'api/qpesums/qpf060min/rt';
                gparas.parser = L.DouLayer.Qqesums.Parser.sqpe;
                $.getJSON(gparas.url, function (r) {
                    helper.misc.hideBusyIndicator();
                    if (!r) {
                        $("#other-layer-info .qpfqpe60-layer").removeClass('offdisplay');//.text(_linfo);
                        $("#other-layer-info .qpfqpe60-layer-time").text('-無資料');
                        return;
                    }
                    gparas.parser(gparas, r.Content);

                    _layer = L.DouLayer.gridRectCanvas({ 'opacity': 1, ycellsize: gparas.ycellsize, xcellsize: gparas.xcellsize, noMask: true });//.addTo(app.map);
                    _layer.on('mousemove', function (evt) {
                        if (!L.Browser.mobile)
                            _layer.bindTooltip('降雨量:' + evt.griddata.val, { className:"qpesums_tooltip"}).openTooltip(evt.latlng);
                            //_layer.bindTooltip(JSON.stringify(evt.latlng) + "<br>" + JSON.stringify(evt.griddata)).openTooltip(evt.latlng);
                    }).on('mouseout', function (evt) {
                        if (!L.Browser.mobile && _layer.getTooltip() != null)
                            _layer.closeTooltip();
                    });
                    //用$.map 資料太大會有Maximum call stack size exceeded
                    var gs = L.DouLayer.Qqesums.gridData2cellData(gparas.datas, gparas.colorDef);//$.map(gdata.datas, function (val, i) {return { lng: val[0], lat: val[1], color: getcolor(gdata.colorDef, val[2]) }});
                    //_layer._map = app.map;
                    //_layer.addTo(app.map);

                    $_legend.empty().show();
                    L.DouLayer.Qqesums.genLegend($_legend, gparas.colorDef, 24, 16, '毫米(mm)', '預報雨量');
                    _layer.setData(gs);
                    $_silder = bindSilder($_p, _layer);

                    $("#other-layer-info .qpfqpe60-layer").removeClass('offdisplay');//.text(_linfo);
                    $("#other-layer-info .qpfqpe60-layer-time").text(helper.format.JsonDateStr2Datetime( r.Datetime).DateFormat('MM/dd HH:mm:ss'));
                    _layer.addTo(app.map);
                });

                timerreload();
            } else {
                if (_layer) {
                    if (s) {
                        _layer.addTo(app.map);
                        $_silder.removeClass('offdisplay');
                        //$_legend.removeClass('offdisplay');
                        $("#other-layer-info .qpfqpe60-layer").removeClass('offdisplay');
                    }
                    else {
                        _layer.remove();
                        $_silder.addClass('offdisplay');
                        //$_legend.addClass('offdisplay');
                        $("#other-layer-info .qpfqpe60-layer").addClass('offdisplay');
                    }
                }
                else
                    $("#other-layer-info .rader-layer").addClass('offdisplay');
            }
            if ($("#other-layer-info .qpfqpe60-layer").hasClass('offdisplay'))
                $_legend.hide();
            else
                $_legend.show();
        });
    });

    return $_p;
}

var bindSilder = function ($_c, g) {
    $_c.find('.opacity-container').remove();
    $_oslider = $('<div class="col-12 opacity-container"><div class="opacity-slider" title="透明度"></div></div>').appendTo($_c).find('.opacity-slider')
        .gis_layer_opacity_slider({
            map: app.map,
            range: "min",
            max: 100,
            min: 5,
            value: $_c[0].currentOpacity || 90,
            setOpacity: function (_op) {
                $_c[0].currentOpacity = _op * 100;
                g.setOpacity(_op);
            }
        });//.addClass('offdisplay');
    return $_oslider;
}

var InitDistrictCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    var tboundary = undefined;
    $_p.PinCtrl($.extend({
        map: app.map, useLabel: false, useList: false,name: '行政區'
    }, options)).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
        $_p.find('.pinswitch').off('change').on('change', function () {
            var s = $(this).is(':checked');
            if (tboundary)
                tboundary.clear();
            if (s) {
                //高雄市boundary
                tboundary = new boundary.LineBoundary({
                    map: app.map, data: boundary.data.Town, ids: function (b) { return b.Other.indexOf('高雄市') >= 0; }, autoFitBounds: false,
                    style: {
                        strokeWeight: 2, dashArray: '2, 6', strokeColor: "#888888"
                    }
                });
            }
        });
    });
}
var Init寶珠溝邊線Ctrl = function ($_container, options, changeBaseLayer) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.KmlCtrl($.extend({
        map: app.map, useLabel: false, useList: false, clickable: false, useSilder: false, name: '寶珠溝範圍', type: $.BasePinCtrl.type.polygon,
        classes:classes_non_public,
        polyStyles: [{ name: '寶珠溝', strokeColor: '#0000FF', strokeOpacity: 1, strokeWeight: 4, fillColor: '#FF0000', fillOpacity: 0, dashArray:'2, 6', classes: 'water_normal' }],
        checkDataStatus: function (data, index) { return this.settings.polyStyles[0] },
        url: app.siteRoot +"Data/寶珠溝集水區.kmz"
    }, options))
    //.on($.BasePinCtrl.eventKeys.pinShowChange, function (e, s) {
    .on($.BasePinCtrl.eventKeys.afterSetdata, function (e, s) {
        if (s) {
            var roptions =  !window.fullbc &&  $('body').width() > 1000 ? { paddingTopLeft: [200, 0], paddingBottomRight: [0, 0] } : {};
            try {
                $_p.KmlCtrl('fitBounds', roptions);
            } catch {
                setTimeout(function () {
                    $_p.KmlCtrl('fitBounds', roptions);
                },500)
            }
            //$_p.KmlCtrl('fitBounds');//
            if (changeBaseLayer != false)
                $('#basemapDiv').MapBaseLayer('setDisplayLayer', '銀白');
        }
    });
    return $_p;
}
var InitBCD網格Ctrl = function ($_container, options, changeBaseLayer) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.KmlCtrl($.extend({
        map: app.map, useLabel: true, useList: false, clickable: true, useSilder: false, name: '寶珠溝剖面線位置帶', type: $.BasePinCtrl.type.polygon,
        classes: classes_non_public,
        //polyStyles: [{ name: '寶珠溝', strokeColor: '#0000FF', strokeOpacity: 1, strokeWeight: 2, fillColor: '#FF0000', classes: 'water_normal' }],
        //checkDataStatus: function (data, index) { return this.settings.polyStyles[0] },
        url: app.siteRoot + "Data/寶珠溝剖面線位置帶.kmz"
    }, options))
        .on($.BasePinCtrl.eventKeys.pinShowChange, function (e, s) {
            //if (s) {
            //    var roptions = !window.fullbc && $('body').width() > 1000 ? { paddingTopLeft: [200, 0], paddingBottomRight: [0, 0] } : {};
            //    $_p.KmlCtrl('fitBounds', roptions);
            //    if (changeBaseLayer != false)
            //        $('#basemapDiv').MapBaseLayer('setDisplayLayer', '銀白');
            //}
        });
    return $_p;
}
var InitBCDCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.PinCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.Name },
        name: '寶珠溝示範',
        autoReload: true,
        listTheme: 'gbright',
        loadBase: function (callback) { callback([])},
        loadInfo: datahelper.getBCDinfo,
        infoFields: [
            { field: 'Name', title: '名稱', showInInfo:false },
            { field: 'Type', title: '類型' },
            { field: 'Rt', title: '水位', unit: '公尺', formatter: function (v) { return v==undefined?'-':v } },
            { field: 'Time', title: '時間', formatter: function (v, r) { return v ? JsonDateStr2Datetime(v).DateFormat('MM/dd HH:mm') : '-' } },
            { field: 'Warn', title: '警戒', unit: '公尺', formatter: function (v) { return v == undefined ? '-' : v  } },
            { field: 'Top', title: '堤頂/路面高', unit: '公尺', formatter: function (v) { return v == undefined ? '-' : v  } },
            { field: 'F1H', title: '預報1H水位', unit: '公尺', formatter: function (v) { return v == undefined ? '-' : v  } },
        ],
        legendIcons: [
            { 'name': '區排', 'url': app.siteRoot + 'images/pin/區排_正常.png', 'classes': 'green_status' },
            { 'name': '區排_警戒', 'url': app.siteRoot + 'images/pin/區排_警戒.png', 'classes': 'red_status' },
            { 'name': '抽水站', 'url': app.siteRoot + 'images/pin/抽水站_待命.png', 'classes': 'green_status' },
            { 'name': '滯洪池', 'url': app.siteRoot + 'images/pin/滯洪池_滯洪.png', 'classes': 'green_status' },
            { 'name': '下水道水位', 'url': app.siteRoot + 'images/pin/下水道_正常.png', 'classes': 'green_status' },
            { 'name': '放水中', 'url': app.siteRoot + 'images/pin/水庫_放水中.png', 'classes': 'red_status' }
        ],
        checkDataStatus: function (d, i) {
            return $.BasePinCtrl.helper.getDataStatusLegendIcon(this.settings.legendIcons, d.Type);
        },
        transformData: function (b, i) {
            return $.BasePinCtrl.defaultSettings.transformData(b,i);
        }
    }, options));
    return $_p;
}

var InitSopdCtrl = function ($_container, options) {
    var $_p = $('<div class="row"><div class="col-md-12"></div></div>').appendTo($_container);
    $_p.PinCtrl($.extend({
        map: app.map, stTitle: function (d) { return d.Name },
        clickable: false,
        name: '施操作提醒',
        autoReload: true,
        listTheme: 'gbright',
        loadBase: function (callback) { callback([]) },
        loadInfo: datahelper.getSopdRtinfo,
        legendIcons: [
            { 'name': '區排', 'url': app.siteRoot + 'images/pin/T.png', 'classes': 'red_status' }
        ],
    }, options));
    return $_p;
}
var dfd = 1;
//雨量、水位....區間查詢用
var appendQueryDurationPinInfoContent = function (data, infofields, oldPinInfoContent, $_pinctrl, idf, namef, dname, canselecttime) {
    if (canselecttime == undefined)
        canselecttime =  true;
    var that = this;
    if (!oldPinInfoContent)
        return;
    var $_c = $(oldPinInfoContent.call(this, data, infofields)).addClass('history-data-chart');
    var $_dc = $('<div class="date-dur-ctrl row">' +
        '<div class="input-group  col"><span class="input-group-text">開始時間</span><input type="date" class="form-control"></div>' +
        '<div class="input-group  col"><span class="input-group-text">結束時間</span><input type="date" class="form-control"></div>' +
        '<span class="btn btn-sm btn-default glyphicon glyphicon-search  col-2">查詢</span>' +
        '<span class="btn btn-link glyphicon glyphicon-cloud-download  col-2">下載</span></div>').appendTo($_c.find('.carousel-item:eq(1)'));
    if (!data.qedt) {
        data.qsdt = new Date().addHours(-6 * 24).DateFormat('yyyy-MM-dd');
        data.qedt = new Date().addHours(24).DateFormat('yyyy-MM-dd');
    }
    if (!canselecttime) {
        $_dc.find('.input-group,.glyphicon-search').hide();
    }
    $_dc.find('input:eq(0)').attr('value', data.qsdt);
    $_dc.find('input:eq(1)').attr('value', data.qedt);

    var _carouselId = $_c.attr('id');
    var cdata = data;
    setTimeout(function () {
        var $_carousel = $('#' + _carouselId);

        var queryHistory = function () {
            cdata.qsdt = $_carousel.find('.date-dur-ctrl input:eq(0)').val();
            cdata.qedt = $_carousel.find('.date-dur-ctrl input:eq(1)').val();
            $_carousel.find('.carousel-item').addClass('active');
            
            $_carousel.trigger('slide.bs.carousel');
            setTimeout(function () {
                $_carousel.trigger('slid.bs.carousel');
            }, 100);
        }

        $_carousel.find('.date-dur-ctrl .glyphicon-search').on('click', function () {
            queryHistory();
        });

        that.$element.off('abc____').on('abc____', function () { //來置放大
                queryHistory();
        });
        $_carousel.find('.date-dur-ctrl .glyphicon-cloud-download').on('click', function () {
            var wb = {
                SheetNames: [data[idf]],//, 'Sheet4'],
                //Sheets: { Sheet1: XLSX.utils.json_to_sheet(sdata.data), Sheet4: XLSX.utils.json_to_sheet(ldata.data) },
                Sheets: {},
                Props: {}
            };
            wb.Sheets[data[idf]] = XLSX.utils.json_to_sheet(that.exportdatas, { skipHeader: true });//sdata.data);
            XLSX.writeFile(wb, '[' + data[idf] + ']測站' + dname+'觀測(' + cdata.qsdt + '_' + cdata.qedt + ')' + '.xlsx', { cellStyles: true, compression: true });
        });
    });
    if ($_pinctrl)
        $_pinctrl.off($.BasePinCtrl.eventKeys.fullInfowindowChange).on($.BasePinCtrl.eventKeys.fullInfowindowChange, function (e, er, z) {
            if (z)
                $(this).trigger('abc____')
        })
    return $_c[0].outerHTML;
}

var MechanicalInfoContent = function (infos) {
    var $_t = $('<table>').bootstrapTable({
        striped: true, //showHeader: false,
        classes: 'table table-bordered table-striped table-sm',
        columns: [
            { field: 'Name', title: '監控項目' },
            //{ field: 'Value', title: '狀態/資料', align: 'center', class: 'ps-0 pe-0', formatter: function (v) { return v == 'Other' ? v + 'm' : v; }   },
            { field: 'Status', title: '狀態/資料', align: 'center', class: 'ps-0 pe-0', formatter: function (v, d) { return v == '999' ? '<lable ' + (d.Name.indexOf('H') >= 0 ? ' class="text-danger"' : '') + '>' + d.Value + 'm</lable>' : '<div class="mechanical-status bbg-' + v + '"></div>'; } },
            { field: 'Time', title: '資料時間', align: 'center', formatter: function (v) { return !v ? '-' : JsonDateStr2Datetime(v).DateFormat('MM-dd HH:mm'); } },
        ],
        data: infos
    });
    return $_t;
}
