var eventid = helper.misc.getRequestParas()['eventid'];// || "T2004";
var currentevent = undefined;
var currentDisasters = [];
var $_floodpin = undefined;
$(document).ready(function () {
    $('<div id="basemapDiv">').appendTo($('body')).hide();
    mapHelper.createMap('leaflet', function () {
        var $_statown = $('.sta-town');
        datahelper.getFHYTown("64", function (ts) {
            $.each(ts, function () {
                $('<div class="town-data" data-town="' + this.Name.zh_TW + '"><div class="town-border">' +
                    '<div class="town-title"><label>' + this.Name.zh_TW + '</label></div>' +
                    '<div class="data">' +
                    '<label class="t">-</label> <label class="f">-</label>/<label class="uf">-</label></div>' +
                    '<div class="no-data d-none"><label>-</label></div>' +
                    '</div></div>').appendTo($_statown);
            })

            //淹水
            var _floodPinOptions = $.extend({ map: app.map }, floodPinOptions);
            _floodPinOptions.checkDataStatus = function (data, index) {
                if (data.SourceCode && data.SourceCode == 7)
                    return data.IS_RECESSION ? this.settings.legendIcons[2] : this.settings.legendIcons[3];
                else
                    return data.IS_RECESSION ? this.settings.legendIcons[0] : this.settings.legendIcons[1];
            },
                _floodPinOptions.loadInfo = function (dt, callback) {
                    return callback(currentDisasters);
                };
            _floodPinOptions.stTitle = function (d) { return d.Described ? d.Described : '-' };
            _floodPinOptions.listContainer = 'inner';
            //_floodPinOptions.listContainer = '.list-container';
            _floodPinOptions.listOptions = _floodPinOptions.listOptions || {};
            _floodPinOptions.listOptions.classes = "table table-striped table-bordered";
            _floodPinOptions.listTheme = 'none';
            _floodPinOptions.clickable = false;
            _floodPinOptions.filter = function (d) {
                return d.COUNTY_NAME == "高雄市";
            };
            $_floodpin = $('<div>').appendTo($('.list-container'));//.hide();
            $_floodpin.PinCtrl(_floodPinOptions).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
                var $_this = $(this);
                var $filterContainer = $('<div class="row filter-container">').insertBefore($_this);
                var $townSelect = $('<div class="col-6" style="padding-right:0;"><select class="form-control"></select></div>').appendTo($filterContainer).find('select');
                $('<option value="0">全區</option>').appendTo($townSelect);
                $.each(ts, function () {
                    $('<option value="' + this.Name.zh_TW + '">' + this.Name.zh_TW + '</option>').appendTo($townSelect);
                });
                setTimeout(function () {
                    var dssd = $('.search', $_floodpin);
                    $('.search', $_floodpin).appendTo($('<div class="col-6" style="padding-left:0;">').appendTo($filterContainer));
                });
                $townSelect.on('change', function () {
                    var _tid = $townSelect.val();
                    $_floodpin.PinCtrl('setFilter', function (d) {
                        return _tid == '0' ? d.COUNTY_NAME == "高雄市" : _tid == d.TOWN_NAME;
                    });
                })
                //$('<div class="col-xs-12 col-12"><label>備註:<span class="color-blue">藍色-已退水</span>;<span class="color-red">紅色-未退水</span></label></div>').appendTo($_floodpin);
            }).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
                $_floodpin.find('.pinswitch').prop('checked', true).trigger('change');
                $_floodpin.find('.pinlist').prop('checked', true).trigger('change');

            });//.on($.BasePinCtrl.eventKeys.repaintPinCompleted);


            loadData();
        });

    });
});

var loadData = function () {
    helper.misc.showBusyIndicator();
    window.datahelper.loadWraEvents(function (d) {
        if (eventid) {
            currentevent = $.grep(d, function (d) { return d.EventNo == eventid })[0];
            currentevent.Enabled = true;
        }
        else
            currentevent = d[0];
        if (currentevent.Enabled) {
            currentDisasters = undefined;
            $.BasePinCtrl.helper.ajaxGeneralRequest({
                url: app.CSgdsRoot + "WS/FHYBrokerWS.asmx/GetEMISFlooding",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                type: "POST",
                data: JSON.stringify({ beginDT: JsonDateStr2Datetime(currentevent.BeginDate), endDT: JsonDateStr2Datetime(currentevent.EndDate) })
            }, function (d) {
                currentDisasters = d.d;
                reapint();
            });
            
            var _title = '災情看板-' + currentevent.EventName ;
            $('.event-title-container .event-title').text(_title);
        } else {
            currentDisasters = [];
            reapint();
            $('.event-title-container .event-title').text('災情看板-目前無開設事件');
        }
        //T2004

        setTimeout(loadData, 5 * 60 * 1000);
    });
    $('.event-title-container .dt').text('資料更新: ' + new Date().DateFormat('MM/dd HH:mm:ss'));
    $('.event-title-container .dtt').html('資料統計時間:<br> ' + (new Date().getFullYear() - 1911) + new Date().DateFormat('/MM/dd HH:mm'));
}
var reapint = function () {
    //console.log('1');
    //if (currentDisasters == undefined || (!app.printscreen && app.currentFacilitys == null))
    //    return;
    //console.log('2222');
    repaintStaDisaster();   //積淹水災情統計
    repaintStaCounty();     //積淹水災情縣市統計
    repaintMap();           //地圖
    //repaintInfo();          //未退水或搶修險災情(曾經最大淹水深度)
    helper.misc.hideBusyIndicator();
}

//地圖
var repaintMap = function () {
    $_floodpin.PinCtrl('setData', currentDisasters);
}

//積淹水災情統計
var repaintStaDisaster = function () {
    var kns = $.grep(currentDisasters, function (d) { return d.COUNTY_NAME == "高雄市"; });
    var $_sta = $('.sta-disaster');
    if (!currentevent.Enabled)
        $_sta.find('.data').text(app.empty);
    else {
        $_sta.find('.t').text(kns.length);
        $_sta.find('.f').text($.grep(kns, function (d) { return !d.IS_RECESSION }).length);
        $_sta.find('.uf').text($.grep(kns, function (d) { return d.IS_RECESSION }).length);
    }
}
//積淹水災情縣市統計
var repaintStaCounty = function () {
    var kns = $.grep(currentDisasters, function (d) { return d.COUNTY_NAME == "高雄市"; });
    var $_sta = $('.sta-town');
    var hclass = 'd-none';
    $_sta.find('.town-border').removeClass('no-data-status');
    $_sta.find('.town-data .data').removeClass(hclass);
    $_sta.find('.town-data .no-data').addClass(hclass);
    if (!currentevent.Enabled) {
        $_sta.find('.town-data .data').addClass(hclass);
        $_sta.find('.town-data .no-data').removeClass(hclass);
    }
    else {
        $_sta.find('.data > label').text('0');
        var _town = {};
        $.each(currentDisasters, function () {
            if (!_town[this.TOWN_NAME])
                _town[this.TOWN_NAME] = { t: 0, f: 0, uf: 0 };
            _town[this.TOWN_NAME].t++;
            this.IS_RECESSION ? _town[this.TOWN_NAME].uf++ : _town[this.TOWN_NAME].f++;
        });
        for (var tn in _town) {
            var $_temp = $_sta.find('.town-data[data-town="' + tn + '"]');
            $_temp.find('.t').text(_town[tn].t);
            $_temp.find('.f').text(_town[tn].f);
            $_temp.find('.uf').text(_town[tn].uf);
        }
    }
    var $_at = $_sta.find('.data .t');
    $.each($_at, function () {
        var $_this = $(this);
        if ($_this.text() == 0) {
            $_this.closest('.data').addClass(hclass);
            $_this.closest('.town-data').find('.no-data').removeClass(hclass);
            $_this.closest('.town-border').addClass('no-data-status');
        }
    });
}
