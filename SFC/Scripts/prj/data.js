window.app = window.app || {};
if (!app.siteRoot)
    app.siteRoot = helper.misc.getScriptPath("Scripts/gis/Main").indexOf('localhost') >= 0 ? "http://140.116.66.35/SGDS/" : helper.misc.getScriptPath("Scripts/gis/Main");
app.CSgdsRoot = "https://www.dprcflood.org.tw/SGDS/";
app.KhFloodInfoRoot = 'https://floodinfo.kcg.gov.tw//service/api/db/sta_info/';
app.KhFloodTokenUrl = 'https://floodinfo.kcg.gov.tw/service/api/login';

//console.log("2>>>>" + app.siteRoot);
//console.log("3>>>>" + app.CSgdsRoot);
var fmgcctvtoken = 'eXysP97yhN';
var fmgcctvsource = 'https://fmg.wra.gov.tw/swagger/api/';


(function (window) {

    var getData = function (url, paras, callback, option) {
        var _ajaxoptions = $.extend({
            url: url,
            type: "GET",
            dataType: "json",
            contentType: "application/json; charset=utf-8", //加contentType IE有問題，但放在server同一domain是OK的
            //async: _async,
            data: paras
        }, option);

        //console.log(url + '參數:' + JSON.stringify(paras));
        $.ajax(_ajaxoptions)
            .done(function (dat, status) {
                var d = dat.d ? dat.d : (dat.Data ? dat.Data : dat);
                d = d.Data ? d.Data: d;
                callback(d); //dat.Data是fly v2
            }).fail(function (dat, status) {
                console.log('error:' + dat.responseText);
            });
    };

    //土地利用類型
    var getLandUseType = function () {
        if (!window.landUseType) {
            getData(app.CSgdsRoot + "WS/FloodComputeWS.asmx/LandUseType", undefined, function (d) {
                window.landUseType = d;
            }, { type: "POST", async: false });
        }
        return window.landUseType;
    };
    //取水利署事件清單 >>災情資訊查詢用
    var loadWraEvents = function (callback) {
        if (!window.waEvents) {
            getData(app.CSgdsRoot + "WS/FloodComputeWS.asmx/WraEvents", undefined, function (d) {
                window.waEvents = d;
                callback(window.waEvents);
            }, { type: "POST", async: false });
        }
        else
            callback(window.waEvents);
    }
    
    //取單一演算結果DTM
    var loadDEMCalculateData = function (_FloodingClass, callback) {
        var _cd = $.extend({}, _FloodingClass);
        _cd.DATE = JsonDateStr2Datetime(_cd.DATE);
        if (_cd.Recession_DATE) _cd.Recession_DATE = JsonDateStr2Datetime(_cd.Recession_DATE);
        if (_cd.CREATE_DATE) _cd.CREATE_DATE = JsonDateStr2Datetime(_cd.CREATE_DATE);
        if (_cd.MODIFY_DATE) _cd.MODIFY_DATE = JsonDateStr2Datetime(_cd.MODIFY_DATE);
        getData(app.CSgdsRoot + "WS/FloodComputeWS.asmx/GetDEMCalculateData", JSON.stringify({ computeDistance: 500, ds: _cd }), function (d) {
            callback(d);
        }, { type: "POST"});
    };

    var convertFloodToUiObject = function (ds) {
        console.log('淹水點:' + ds.length);
        //flood:來至水利署(同一網格只用淹水+高程最大資料取代影響戶數及土地利用); floodarea:同一網格只用淹水+高程最大資料; handdrawflood:人工圈繪; statistics:僅用來至水利署且同一網格只用淹水+高程最大資料
        var _r = { flood: [], floodarea: [], handdrawflood: [], statistics: [] };
        var _floodkey = [];
        var _floodGroup = [];
        var _handdrawfloodkey = [];
        var _handdrawfloodGroup = [];

        var _handdrawfloodGridId = [];
        $.each(ds, function () {
            if (!this.NOTIFICATION_Data) {
                console.log(this.EffectAddress);
                return;
            }
            $.extend(this, this.NOTIFICATION_Data);
            this.Described = this.NOTIFICATION_Data.Described;

            var _key = (this.GridId == 0 ? this.PK_ID : this.GridId) + this.COUNTY_NAME + this.TOWN_NAME;
            //if (Math.random() % 5 == 0)
            //    this.IsFromWraEMIS = false;
            if (this.IsFromWraEMIS) {
                //組group
                if (_floodkey.indexOf(_key) < 0) {
                    _floodkey.push(_key);
                    _floodGroup.push({ key: _key, g: [this] });
                }
                else {
                    var _g = $.grep(_floodGroup, function (_gg) {
                        return _gg.key == _key;
                    })[0];
                    _g.g.push(this);

                }
                _r.flood.push(this);
            }
            else {
                //組group
                if (_handdrawfloodkey.indexOf(_key) < 0) {
                    _handdrawfloodkey.push(_key);
                    _handdrawfloodGroup.push({ key: _key, g: [this] });
                }
                else {
                    var _g = $.grep(_handdrawfloodGroup, function (_gg) {
                        return _gg.key == _key;
                    })[0];
                    _g.g.push(this);

                }
                _r.handdrawflood.push(this);
            }


        });
        //flood找出最大淹水深度+高程,並改同一group計算值
        $.each(_floodGroup, function () {
            var maxdata = this.g[0];
            var maxdataidx = 0;
            if (this.g.length != 1) {
                ////找出最大淹水深度+高程

                $.each(this.g, function (_idx) {
                    if ((this.DEPTH / 100 + this.Z_D) > (maxdata.DEPTH / 100 + maxdata.Z_D)) {
                        maxdata = this;
                        maxdataidx = _idx;
                    }
                });

            }
            $.each(this.g, function (_idx) {
                if (_idx != maxdataidx) {
                    this._Land = this.Land;
                    this.Land = maxdata.Land;
                    this._AffectStat = this.AffectStat;
                    this.AffectStat = maxdata.AffectStat;
                }

                //infoField用
                this.AffectHouse = maxdata.AffectStat ? maxdata.AffectStat.TotalHouse : 0;
                this.AffectArea = maxdata.AffectStat ? maxdata.AffectStat.TotalArea : 0;
                this.AffectHouse30cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalHouse30cmUp : 0;
                this.AffectArea30cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalArea30cmUp : 0;
                this.AffectHouse50cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalHouse50cmUp : 0;
                this.AffectArea50cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalArea50cmUp : 0;
            });
            _r.statistics.push(maxdata); //加入statistics
            _r.floodarea.push(maxdata);     //加入floodarea
        });
        //handdrawflood找出最大淹水深度+高程,並改同一group計算值
        $.each(_handdrawfloodGroup, function () {
            var maxdata = this.g[0];
            if (this.g.length != 1) {
                ////找出最大淹水深度+高程

                $.each(this.g, function () {
                    if ((this.DEPTH / 100 + this.Z_D) > (maxdata.DEPTH / 100 + maxdata.Z_D))
                        maxdata = this;
                });
            }
            $.each(this.g, function () {
                this._Land = this.Land;
                this.Land = maxdata.Land;
                this._AffectStat = this.AffectStat;
                this.AffectStat = maxdata.AffectStat;

                //infoField用
                this.AffectHouse = maxdata.AffectStat ? maxdata.AffectStat.TotalHouse : 0;
                this.AffectArea = maxdata.AffectStat ? maxdata.AffectStat.TotalArea : 0;
                this.AffectHouse30cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalHouse30cmUp : 0;
                this.AffectArea30cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalArea30cmUp : 0;
                this.AffectHouse50cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalHouse50cmUp : 0;
                this.AffectArea50cmUp = maxdata.AffectStat ? maxdata.AffectStat.TotalArea50cmUp : 0;
            });
            _r.floodarea.push(maxdata);     //加入floodarea
        });

        return _r;
    }

    //
    var estimateFloodingComputeForLightweightDatas = function (floodings, callback) {
        getData(app.CSgdsRoot + "WS/FloodComputeWS.asmx/EstimateFlooding", JSON.stringify({ floodings: floodings }), function (d) {
            callback(convertFloodToUiObject(d));
        }, { type: "POST" });
    }

    //取淹水演算結果
    var loadFloodComputeForLightweightDatas = function (st, et, countyID, datatype, callback) {
        //st = '2018/08/22 16:55:00';
        //et = '2018/08/31 17:30:00';
        //datatype = 0;
        countyID = 2;
        getData(app.CSgdsRoot + "WS/FloodComputeWS.asmx/GetFloodComputeForLightweightData", JSON.stringify({ beginDT: st, endDT: et, computeDistance: 500, CountyID: countyID, dataType: datatype }), function (d) {
            callback(convertFloodToUiObject(d));
        }, { type: "POST" });
    }


    var getFHYFloodSensorInfoLast24Hours_Address = function (address, callback) {
        getData(app.CSgdsRoot + "WS/FHYBrokerWS.asmx/GetFHYFloodSensorInfoLast24Hours_Address", JSON.stringify({ 'address': address }), function (d) {
            callback(d);
        }, { type: "POST" });
    }
    var getFHYFloodSensorStation = function (callback) {
        getData(app.CSgdsRoot + 'WS/FHYBrokerWS.asmx/GetFHYFloodSensorStationByCityCode', JSON.stringify({ cityCode:64}), callback, { type: 'POST' });
    }
    var wrsFloodingSensor;
    var getFHYFloodSensorInfoRt = function (dt, callback) {
        //console.log("helper.misc.getRequestParas()['fsource']=='fhy':" + (helper.misc.getRequestParas()['fsource'] == 'fhy'))
        if (helper.misc.getRequestParas()['fsource']=='fhy')
            getData(app.CSgdsRoot + 'WS/FHYBrokerWS.asmx/GetFHYFloodSensorInfoRt', undefined, callback, { type: 'POST' });
        else
            getData(app.siteRoot + "api/khfloodinfo/sta_info/lastest/wrs_flooding_sensor", undefined, function (ds) {
                wrsFloodingSensor = ds;
                ds.sort(function (a,b) { //不確認來源資料同一站是否有2筆，故用降冪取第一筆
                    if (a.time != undefined && b.time != undefined)
                        return helper.format.JsonDateStr2Datetime(b.time).getTime() - helper.format.JsonDateStr2Datetime(a.time).getTime();
                    return -999999999;
                });
                var r = [];
                r = $.map(ds, function (d) {
                    //if (d.uuid.depth == "4a62d45c-a36d-4f43-b50a-e7d6337d2a70") {//文昌路與文化路口
                    //    console.log(d);
                    //    console.log("helper.format.JsonDateStr2Datetime(d.time):" + helper.format.JsonDateStr2Datetime(d.time));
                    //}
                    
                    return { SensorUUID: d.uuid.depth, Depth: d.obs_value, SourceTime: helper.format.JsonDateStr2Datetime(d.time), TransferTime: helper.format.JsonDateStr2Datetime(d.time), ToBeConfirm: false };
                });
                return callback(r);
            });
    }
    var getFHYFloodSensorInfoLast24Hours = function (id, callback) {
        getData(app.CSgdsRoot + 'WS/FHYBrokerWS.asmx/GetFHYFloodSensorInfoLast24Hours', JSON.stringify({ sensorUUID: id }), callback, { type: 'POST' });
    }
    var getFHYFloodSensorInfoByDuration = function (d, callback) {

        var s = new Date().addHours(-24);
        var e = new Date();
        if (d.qsdt) {
            s = new Date(d.qsdt);
            e = new Date(d.qedt);
        }
        
        if (helper.misc.getRequestParas()['fsource'] == 'fhy') {
            s = s.DateFormat('yyyy/MM/dd HH:mm:ss');
            e = e.DateFormat('yyyy/MM/dd HH:mm:ss');
            getData(app.CSgdsRoot + 'WS/FHYBrokerWS.asmx/GetFHYFloodSensorInfoByDuration', JSON.stringify({ sensorUUID: d.SensorUUID, start: s, end: e }), callback, { type: 'POST' });
        } else {
            var uuid = d.SensorUUID;
            s = s.DateFormat('yyyy-MM-dd');
            e = e.DateFormat('yyyy-MM-dd');
            var wraFs = $.grep(wrsFloodingSensor, function (f) {
                return f.uuid.depth == uuid;
            })[0];
            getData(app.siteRoot + "api/khfloodinfo/sta_info/wrs_flooding_sensor/" + wraFs.stn_id + '/' + s+'/'+e, undefined, function (ds) {
                ds.sort(function (a, b) { //不確認來源資料同一站是否有2筆，故用降冪取第一筆
                    if (a.time != undefined && b.time != undefined)
                        return helper.format.JsonDateStr2Datetime(b.time).getTime() - helper.format.JsonDateStr2Datetime(a.time).getTime();
                    return -999999999;
                });
                var r = [];
                r = $.map(ds, function (d) {
                    //if (d.uuid.depth == "4a62d45c-a36d-4f43-b50a-e7d6337d2a70") {//文昌路與文化路口
                    //    console.log(d);
                    //    console.log("helper.format.JsonDateStr2Datetime(d.time):" + helper.format.JsonDateStr2Datetime(d.time));
                    //}

                    return { SensorUUID: uuid, Depth: d.obs_value, SourceTime: helper.format.JsonDateStr2Datetime(d.time), TransferTime: helper.format.JsonDateStr2Datetime(d.time), ToBeConfirm: false };
                });
                return callback(r);
            });
        }
        //getData('http://localhost:1926/WS/FHYBrokerWs.asmx/GetFHYFloodSensorInfoByDuration', JSON.stringify({ sensorUUID: d.SensorUUID, start: s, end: e }), callback, { type: 'POST' });
    }
  
    var getFHYTown = function (cityCode, callback) {
        var k = 'fhyTown' + cityCode;
        if (window[k]) {
            if (callback)
                callback(window[k]);
        }
        else
            getData(app.CSgdsRoot + "WS/FHYBrokerWS.asmx/GetFHYTown", JSON.stringify({ cityCode: cityCode }), function (d) {
                window[k] = d;
                if(callback)
                    callback(window[k])
            }, { type: 'POST' });
    }
    var getFHYTownNameByCode = function (tcode) {
        if (window['fhyTown64']) {
            return $.grep(window['fhyTown64'], function (t) {
                return t.Code == tcode;
            })[0].Name.zh_TW;
        }
        else
            return tcode;
    }
    var getRainBase = function (callback) {
        getData(app.siteRoot + "api/rain/base", undefined, function (d) {
            callback(d);
        });
    }

    var getRainRt = function (dt, callback) {
        getData(app.siteRoot + "api/rain/rt", undefined, function (d) {
            callback(d);
        });
    }

    var getRainSerInfo = function (d, callback) {
        var fhy = d.Fhy || false;
        var u = app.siteRoot + "api/rain/timeser/" + d.ST_NO + "/" + d.Source + "/" + fhy+ (d.qsdt? "/" + d.qsdt + "/" + d.qedt:"") ;
        getData(u,undefined, function (d) {
            callback(d);
        });
    }
    var getSewerRt = function (dt, callback) {
        //getData(app.siteRoot + "api/khfloodinfo/sta_info/lastest/waterlevel", undefined, function (d) {
        //    var r = $.grep(d["水利局"], function (i) {
        //        return i.stn_no.indexOf('KCRS') >= 0;
        //    })
        //    callback(r);
        //});
        getData(app.siteRoot + "api/sewer/rt", undefined, function (d) {
            callback(d);
        });
    }
    var getSewerSerInfo = function (d, callback) {
        var u = app.siteRoot + "api/sewer/history/" + (d.StationID.indexOf("KCRS") >= 0 ? d.StationID : d['dev_id']) ;
        if (d.qsdt)
            u += "/" + d.qsdt + "/" + d.qedt;
        getData(u, undefined, function (d) {
            callback(d);
        });
    }

    var getWaterRt = function (dt,callback) {
        getData(app.siteRoot + "api/khfloodinfo/sta_info/lastest/waterlevel", undefined, function (d) {
            var rds = [];
            var r = $.grep(d["水利局"], function (i) {
                //return true; //全show 20230926 , 暫緩20230926 16:36
                return i.stn_no.indexOf('KCRS') < 0;
            })

            rds = rds.concat(r, d["水利署"]);
            callback(rds);
        });
    }
    var getWaterSerInfo = function (d, callback) {
        var s = "wrs_waterlevel";
        if (d.source == "水利署")
            s = "wra_waterlevel";
        /*getData(app.siteRoot + "api/khfloodinfo/sta_info/waterlevel/" + d.StationID, undefined, function (d) {*/
        var u = d.qsdt ? //d.qsdt來至區間篩選
            app.siteRoot + "api/khfloodinfo/sta_info/" + s + "/" + d.StationID + "/" + d.qsdt + "/" + d.qedt :
            app.siteRoot + "api/khfloodinfo/sta_info/waterlevel/" + d.StationID;

        //getData(app.siteRoot + "api/khfloodinfo/sta_info/" + s + "/" + d.StationID + "/" + d.qsdt + "/" + d.qedt, undefined, function (d) {
        getData(u, undefined, function (d) {
            callback(d);
        });
    }

    var getMovingPumpSerInfo = function (d, callback) {
        getData(app.siteRoot + "api/khfloodinfo/sta_info/moving_pump/" + d.pump_id + "/" + d.qsdt + "/" + d.qedt, undefined, function (d) {
            callback(d)
        });
    }

    var getMovingPump = function (dt, callback) {
        getData(app.siteRoot + "api/khfloodinfo/sta_info/lastest/moving_pump", undefined, function (d) {
            callback(d)
        });
    }

    var getReservoirBase = function (callback) {
        $.BasePinCtrl.helper.getWraFhyApi("Reservoir/Station?$filter=StationNo eq '30802' or StationNo eq '30901' or StationNo eq '30503'", undefined, function (d) {
            callback(d.Data);
        })
    }
    var getReservoirRt = function (dt, callback) {
        $.BasePinCtrl.helper.getWraFhyApi("Reservoir/Info/RealTime?$filter=StationNo eq '30802' or StationNo eq '30901' or StationNo eq '30503'", undefined, function (d) {
            callback(d.Data);
        })
    }

    var get河川水位CCTV = function (callback) {
        getKHCCTV(function (cs) {//八涳橋
            var ds = $.grep(cs, function (c) { return c.type == '河川水位'; });
            ds = $.grep(ds, function (c) { return c.stn_name && c.stn_name.indexOf('八涳橋')<0; });
            callback(ds);
        });
    }
    var get滯洪池CCTV = function (callback) {
        getKHCCTV(function (cs) {
            callback($.grep(cs, function (c) { return c.type == '滯洪池'; }));
        });
    }
    var get抽水截流站CCTV = function (callback) {
        getKHCCTV(function (cs) {
            callback($.grep(cs, function (c) { return c.type == '抽水截流站'; }));
        });
    }
    var get車行地下道CCTV = function (callback) {
        getKHCCTV(function (cs) {
            callback($.grep(cs, function (c) { return c.type == '車行地下道'; }));
        });
    }
    var getKHCCTV = function (callback) {
        var k = 'getKHCCTV';
        if (window[k]) {
            callback(window[k]);
        }
        else
            getData(app.siteRoot + encodeURIComponent("Data/高雄自建cctvlist.json"), undefined, function (d) {
                $.each(d, function () {
                    this.id = this.cctv_stn_series;
                    this.X = this.lon;
                    this.Y = this.lat;
                    this.urls = $.map(this.cctv_series, function (s) { return { id: s.channel, name: s.name, iskh: true } }); //iskh>>snapshotUrl用
                    
                })
                window[k] = d;
                callback(d);
            }, { contentType: undefined });
    }

    var getAllCCTV = function (callback) {
        get即時監視影像CCTV(callback);
        //var khcctvs, othercctvs;
        //getKHCCTV(function (cs) {
        //    khcctvs = cs;
        //    if (othercctvs)
        //        callback(khcctvs.concat(othercctvs));
        //});
        //get即時監視影像CCTV(function (cs) {
        //    othercctvs = cs;
        //    if (khcctvs)
        //        callback(khcctvs.concat(othercctvs));
        //});
    }

    var get抽水站base = function (callback) {
        getKhMechanicalBaseByType(callback, '抽水站');
    }
    var get抽水站Rt = function (dt, callback) {
        getKhMechanicalRtByType(callback, "抽水站", ['device', 'stage'])
    }

    var get截流站base = function (callback) {
        getKhMechanicalBaseByType(callback, '截流站');
    }
    var get截流站Rt = function (dt, callback) {
        getKhMechanicalRtByType(callback, "截流站", ['device', 'stage'])
    }
    var get滯洪池base = function (callback) {
        getKhMechanicalBaseByType(callback, '滯洪池');
    }
    var get滯洪池Rt = function (dt, callback) {
        getKhMechanicalRtByType(callback, "滯洪池", ['device', 'stage'])
    }
    var get橡皮壩base = function (callback) {
        getKhMechanicalBaseByType(callback, '橡皮壩');
    }
    var get橡皮壩Rt = function (dt, callback) {
        getKhMechanicalRtByType(callback, "橡皮壩", ['device', 'stage'])
    }
    var get車行地下道base = function (callback) {
        getKhMechanicalBaseByType(callback, '車行地下道');
    }
    var get車行地下道Rt = function (dt, callback) {
        getKhMechanicalRtByType(callback, "車行地下道", ['device', 'stage'])
    }
    
    var getKhMechanicalRtByType = function (callback, t, mtyps) { //mtyps:[device, stage]
        var r = {};
        var c = 0;
        $.each(mtyps, function () {
            var mt = this;
            helper.data.get(app.siteRoot + 'api/khfloodinfo/sta_info/wrs_mechanical_type_data/' + t + '/' + mt, function (d) {
                r[mt] = d;
                if (++c == mtyps.length)
                    callback(r);
            });
            //getData(app.siteRoot + 'api/khfloodinfo/sta_info/wrs_mechanical_type_data/' + t + '/' + mtyps[i], undefined, function (d) {
            //    rs = rs.concat(d);
            //    if (++c == mtyps.length)
            //        callback(d)
            //});
        });
    }

    var getKhMechanicalBaseByType = function (callback, t) {
        getAllKhMechanical(function (am) {
            var r = [];
            for (var k in am) {
                if (am[k].stn_type == t)
                    r.push(am[k]);
            }
            callback(r);
        });
    }
    var getAllKhMechanical = function (callback) {
        helper.data.get(app.siteRoot + 'api/khfloodinfo/sta_info/wrs_mechanical_base_data', callback, undefined, true);
        //var k = 'getAllKhMechanical';
        //if (window[k]) {
        //    callback(window[k]);
        //}
        //else
        //    getData(app.siteRoot +'api/khfloodinfo/sta_info/wrs_mechanical_base_data', undefined, function (d) {
        //        window[k] = d;
        //        callback(d)
        //    });
    }
    //get寶珠溝即時資訊info
    var get寶珠溝即時資訊info = function (callback) {
        helper.data.get(app.siteRoot + 'api/bc/interception/info', callback, undefined, false);
    }
    var getBCDinfo = function (dt,callback) {
        helper.data.get(app.siteRoot + 'api/bc/bcd/rt', callback, undefined, false);
    }

    var getBcSectioninfo = function ( callback) {
        helper.data.get(app.siteRoot + 'api/bc/section/rt', callback, undefined, false);
    }

    var getSopdRtinfo = function (dt, callback) {
        var adjv = window.sopdAdjustv || 0;
        /*helper.data.get(app.siteRoot + 'api/bc/sopd/rt', callback, undefined, false);*/
        helper.data.get(app.siteRoot + 'api/bc/sopd/adjust/rt/'+adjv, callback, undefined, false);
    }

    var getJson = function (url,callback, options) {
        getData(app.siteRoot + "api/getjson?url="+encodeURIComponent(url), undefined, function (d) {
            callback(d);
        }, options);
    }
    var get即時監視影像CCTV = function (callback) {

        var cscounttemp = 0;
        var k = 'getOtherHCCTV';
        if (window[k]) {
            callback(window[k]);
        }
        else {
            var cctvbase = [];
            var ddd = Date.now();
            var fmgok = false, cextraok = false;
            //fmgok = true;
            $.get(app.siteRoot + 'api/fmg/get/allstabase', function (ss) {
                var cts = [];
                $.each(ss, function () {
                    if (this.x_tm97 != undefined) {

                        var coor = helper.gis.TWD97ToWGS84(this.x_tm97, this.y_tm97);
                        this.type = 1;
                        this.X = coor.lon;
                        this.Y = coor.lat;
                        this.org = this.source_name;
                        cts.push(this);
                    }
                });
                cctvbase = cctvbase.concat(cts);
                fmgok = true;
                if (fmgok && cextraok) {
                    window[k] = cctvbase;
                    callback(cctvbase);
                }
            });
            
            $.get(app.CSgdsRoot + "kml/cctv_extra.json", function (d) {
                var cts = [];
                $.each(d, function () {
                    if (this.lon && this.city == '高雄市') {// helper.gis.pointInPolygon([this.lon, this.lat], app.hkbounds)) {
                        this.type = 99;
                        this.X = this.lon;
                        this.Y = this.lat;
                        this.counname = this.city;
                        this.town_name = this.town;
                        this.source_name = this.org;
                        this.urls = [{ id: this.id, name: this.name, url: this.url }];
                        //this.isvideo = this.url.indexOf('/jpg.php') < 0 && this.url.indexOf('/rt.jpg') < 0 && this.url.indexOf('/Image') < 0 && this.url.indexOf('/images') < 0;
                        this.isvideo = this.url.indexOf('/jpg.php') < 0 && !this.url.endsWith('.jpg') && this.url.indexOf('/Image') < 0 && this.url.indexOf('/images') < 0;
                        cts.push(this);
                    }
                })
                cctvbase = cctvbase.concat(cts);
                cextraok = true;
                if (fmgok && cextraok) {
                    window[k] = cctvbase;
                    callback(cctvbase);
                }
            });

        }

    }

    var getFmgOneCCTV = function (id, sourceid) {
        var r;
        helper.data.get(app.siteRoot + 'api/fmg/get/cctv/' + id + '/' + sourceid, function (c) {
            r = c;
        }, { async: false },true);
        //getJson(fmgcctvsource + 'cctv/' + id + '?sourceid=' + sourceid + '&token=' + fmgcctvtoken, function (c) {
        //    r = c;
        //}, { async: false });
        return r;
    }

    var getTideBase = function (callback) {
        getData(app.siteRoot + encodeURIComponent("Data/高雄潮位站.json"), undefined, function (d) {
            callback(d);
        }, { contentType:undefined});
    }

    var getTideRt = function (dt, callback) {
        getData(app.siteRoot + "api/getjson?url="+encodeURIComponent("https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-B0075-001?Authorization=CWB-3ADFC2B7-CF1B-42BF-969D-28CCC65F2720&format=JSON&StationID=C4P01,1786&sort=DataTime"), undefined, function (d) {
            var rs = [];
            if (d.Success) {
                $.each(d.Records.SeaSurfaceObs.Location, function () {
                    //排除無資料
                    var sds = $.grep(this.StationObsTimes.StationObsTime, function (s) {
                        return s.WeatherElements.TideHeight != 'None';
                    });
                    var rt = sds[sds.length - 1];//最新一筆
                    var t = { id: this.Station.StationID, time: rt.DateTime, height: rt.WeatherElements.TideHeight, status: rt.WeatherElements.TideLevel, sers: [] };
                    //時間序列資料
                    t.sers = $.map(sds, function (_t) { return { time: _t.DateTime, height: parseFloat( _t.WeatherElements.TideHeight) } });
                    rs.push(t);
                });
            }
            callback(rs);
        });
    }

    var getKhfloodinfoToke = function () {
        var k = 'getKhfloodinfoToke';
        if (!window[k] || (Date.now() - window[k].t) > 5 * 60 * 1000) {
            getData(app.siteRoot + "api/khdata/token", undefined, function (d) {
                window[k] = { t: Date.now(), token: d };
            }, { async: false });
        }
        return window[k].token.result;
    }



    //預抓資料
    var preInitData = function () {
        getFHYTown('64');
        //boundary.helper.GetBoundaryData(boundary.data.County, function (b) { });
        //boundary.helper.GetBoundaryData(boundary.data.Town, function (b) { });
        //datahelper.getLandUseType();
        $('body').trigger('preInitData-completed');
    }
      
    getKhSfmGeojsonData = function (callback) {

        ////33333約30秒
        var _kmlCtrl = this;
        if (app.getKhSfmGeojsonData) {
            var st1 = Date.now();
            callback(JSON.parse(JSON.stringify(app.getKhSfmGeojsonData)));
            console.log('JSON.parse:' + (Date.now() - st1));
        } else {

            if (!window.loadKhSfmGeojsonDataing) {
                window.loadKhSfmGeojsonDataing = [];
                var kcl = new LKmlCtrl(_kmlCtrl, function () {
                    kcl.loadKml(datahelper.khSfmgridkml, function (ds) {
                        app.getKhSfmGeojsonData = ds;
                        callback(app.getKhSfmGeojsonData); //呼叫kcl.loadKml者
                        for (var i = 0; i < window.loadKhSfmGeojsonDataing.length; i++)
                            getKhSfmGeojsonData(window.loadKhSfmGeojsonDataing[i]);
                        //window.loadTainanGeojsonDataing(app.tainanGeojsonData);
                    });
                });
            }
            else
                window.loadKhSfmGeojsonDataing.push(callback);//不用push自己，以免多parse json時間

        }
    }


    window.datahelper = {
        preInitData: preInitData,                                                   //初始基本資料

        getKhfloodinfoToke: getKhfloodinfoToke,                                     //取KhfloodinfoToke，CCTV用

        getRainBase: getRainBase,                                                   //雨量站站資訊(含水利署、水利局)
        getRainRt: getRainRt,                                                       //雨量站即時資訊(含水利署、水利局)
        getRainSerInfo: getRainSerInfo,                                             //水位歷線資料

        getWaterRt: getWaterRt,                                                     //水位站資訊(含水利署、水利局)
        getWaterSerInfo: getWaterSerInfo,                                           //水位歷線資料

        get抽水站base: get抽水站base,                                               //抽水站基本資料
        get抽水站Rt: get抽水站Rt,                                                   //抽水站即時資料
        get截流站base: get截流站base,                                               //截流站基本資料
        get截流站Rt: get截流站Rt,                                                   //截流站即時資料
        get滯洪池base: get滯洪池base,                                               //滯洪池基本資料
        get滯洪池Rt: get滯洪池Rt,                                                   //滯洪池即時資料
        get橡皮壩base: get橡皮壩base,                                               //橡皮壩基本資料
        get橡皮壩Rt: get橡皮壩Rt,                                                   //橡皮壩即時資料
        get車行地下道base: get車行地下道base,                                       //車行地下道基本資料
        get車行地下道Rt: get車行地下道Rt,                                           //車行地下道即時資料

        get寶珠溝即時資訊info: get寶珠溝即時資訊info,                               //寶珠溝即時資訊
        getBCDinfo: getBCDinfo,                                                     //寶珠溝即時展示資訊
        getBcSectioninfo: getBcSectioninfo,                                         //寶珠溝即時斷面資訊
        getSopdRtinfo: getSopdRtinfo,                                                   //警戒設施(智慧操作)資訊
        

        getKHCCTV: getKHCCTV,                                                       //高雄自建CCTV
        get河川水位CCTV: get河川水位CCTV,
        get滯洪池CCTV: get滯洪池CCTV,
        get抽水截流站CCTV: get抽水截流站CCTV,
        get車行地下道CCTV: get車行地下道CCTV,
        get即時監視影像CCTV: get即時監視影像CCTV,
        getFmgOneCCTV: getFmgOneCCTV,
        getAllCCTV: getAllCCTV,                                                     //六宮格用

        getMovingPump: getMovingPump,                                               //移動抽水機即時資料
        getMovingPumpSerInfo: getMovingPumpSerInfo,                                 //移動抽水機歷史資料

        getSewerRt: getSewerRt,                                                     //下水道
        getSewerSerInfo: getSewerSerInfo,                                           //下水道歷史資料
        

        getTideBase: getTideBase,                                                   //潮位基本資料
        getTideRt: getTideRt,                                                       //潮位即時資料

        getReservoirBase: getReservoirBase,                                         //水庫基本資料
        getReservoirRt: getReservoirRt,                                             //水庫即時資料

        getLandUseType: getLandUseType,                                             //土地利用種類
        loadWraEvents: loadWraEvents,                                               //取水利署事件清單

        loadFloodComputeForLightweightDatas: loadFloodComputeForLightweightDatas,   //取積淹水演算資料(不含DEM,Adress)
        loadDEMCalculateData: loadDEMCalculateData,                                 //取淹水網格DEM資料
        estimateFloodingComputeForLightweightDatas: estimateFloodingComputeForLightweightDatas, //災情預估

        //淹水感測用
        getFHYFloodSensorInfoLast24Hours_Address: getFHYFloodSensorInfoLast24Hours_Address, //取淹水感測最後24小時資料
        getFHYFloodSensorStation: getFHYFloodSensorStation,
        getFHYFloodSensorInfoRt: getFHYFloodSensorInfoRt,
        getFHYFloodSensorInfoLast24Hours: getFHYFloodSensorInfoLast24Hours,
        getFHYFloodSensorInfoByDuration: getFHYFloodSensorInfoByDuration,
        getFHYTown: getFHYTown,
        getFHYTownNameByCode: getFHYTownNameByCode,
        AllTW: '全臺',


        getKhSfmGeojsonData: getKhSfmGeojsonData,
        khSfmgridkml: app.siteRoot + 'Data/寶珠溝網格.kmz'
    };

})(window);
