
window.fitkhbounds = false;
window.baselayername = "銀白";
window.fullbc = true; //寶珠溝範圍佔滿，不用設邊界
window.sopdAdjustv = helper.misc.getRequestParas()['adjust'] || 0;
$(document).ready(function () {
    window.sopdAdjustv = window.sopdAdjustv == 'undefined' ? 0 : window.sopdAdjustv;
    var $_sopdpinctrl;
    var $_gnav = $('#mainmenu > .container-fluid > .navbar-collapse > .nav >.dropdown.nav-item > ul');
    var $_popu_ctrl_container = $('.popu-ctrl-container');
    $('#mainmenu a[href="#main-ctrl"]').removeClass("popu-ctrl-menu").addClass("posit-ctrl-menu").attr("data-display-direction", "up-down")
        .empty().attr('data-glyphicon', 'glyphicon-alert').parent().appendTo($_gnav);
    var $_mctrl = $('#main-ctrl');
    $('<div class="title glyphicon glyphicon-alert">設施操作提醒</div>').appendTo($_mctrl);
    var $_acontent = $('<div class="alert-content">--</div>').appendTo($_mctrl);

    mapHelper.createMap('leaflet', function () {
        console.log($("#map").height());
        $('.tools-group-panel a[href="#main-ctrl"]').trigger('setActive', true);
        //datahelper.getSopdRtinfo(function(ainfos){
        //    helper.misc.hideBusyIndicator($_mctrl);
        //    paintAlertInfo(ainfos);
        //});
        var $_body = $('body');
        

        helper.misc.showBusyIndicator($_mctrl);
        $_sopdpinctrl = InitSopdCtrl($_body).on($.BasePinCtrl.eventKeys.afterSetdata, function (e, ds) {
            helper.misc.hideBusyIndicator($_mctrl);
            paintAlertInfo(ds);
        }).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).on($.BasePinCtrl.eventKeys.repaintPinCompleted, function () {
            var plusclass = ' actived-pin';
            $.each($_sopdpinctrl.instance.__pinctrl.instance._mapctrl.graphics, function () {
                var _icon = this.getIcon() || this;
                var cns = _icon.options.className+plusclass;
                this.setZIndexOffset(0);
                _icon.options.className = cns;
                this.setIcon(_icon);

            })
        }).hide();
        //截流站
        Init截流站Ctrl($_body).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
        //滯洪池
        Init滯洪池Ctrl($_body).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
        //抽水站
        Init抽水站Ctrl($_body).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
        //淹感
        var $_temp1 = $('<div>').appendTo($_body).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $_temp1.find('.legend-disable').trigger('click');
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
        InitFloodSensor($_temp1, {
            pinInfoContent: function (data, infofields) {
                return appendQueryDurationPinInfoContent.call(this, data, infofields, FloodSensorOptions.pinInfoContent, $_temp1, "SensorName", "SensorName", "淹水感測")
            },
            displayChartDatas: function (ds) {
                this.exportdatas = $.map(ds, function (d) { return { SourceTime: helper.format.JsonDateStr2Datetime(d.SourceTime).DateFormat('yyyy/MM/dd HH:mm:ss'), Depth: d.Depth } });
                return ds;
            }
        });
        //雨量
        var $_temp2 = $('<div>').appendTo($_body).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $_temp2.find('.legend-disable').trigger('click');
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
        InitRainCtrl($_temp2, {
            pinInfoContent: function (data, infofields) { return appendQueryDurationPinInfoContent.call(this, data, infofields, $.RainCtrl.defaultSettings.pinInfoContent, $_temp2, "StationID", "CName", "雨量站") },
            displayChartDatas: function (ds) {
                this.exportdatas = $.map(ds, function (d) { return { DATE: helper.format.JsonDateStr2Datetime(d.DATE).DateFormat('yyyy/MM/dd HH:mm:ss'), M10: d.M10 } });
                return ds; //如需日累計可從ds處裡
            }
        }, true);
        //水位
        var $_temp3 = $('<div>').appendTo($_body).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $_temp3.find('.legend-disable').trigger('click');
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
        InitWaterCtrl($_temp3, {
            pinInfoContent: function (data, infofields) { return appendQueryDurationPinInfoContent.call(this, data, infofields, $.WaterCtrl.defaultSettings.pinInfoContent, $_temp3, "StationID", "CName", "水位站") },
            displayChartDatas: function (ds) {
                this.exportdatas = ds;
                return ds;
            }
        });
        //下水道
        var $_temp4 = $('<div>').appendTo($_body).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $_temp4.find('.legend-disable').trigger('click');
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
        InitSewerCtrl($_temp4);

        Init寶珠溝邊線Ctrl($($_body), undefined, false).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            $(this).find('.pinswitch').prop('checked', true).trigger('change');
        }).hide();
    });

    var paintAlertInfo = function (ainfos) {
        $_acontent.text('無達警戒資料');
        if (ainfos && ainfos.length > 0) {
            var heads = $.map(ainfos, function (a) { return a.Name });
            var contents = $.map(ainfos, function (a) {
                var $_a = $('<div class="one-alert">');
                $('<div class="alert-situation-t">情境別:</div>').appendTo($_a);
                $('<div class="alert-situation-c">' + a.Situation.Name + '</div>').appendTo($_a);
                $('<div class="alert-situation-t">狀況:</div>').appendTo($_a);
                $('<div class="alert-situation-c">' + a.Situation.Desc + '</div>').appendTo($_a);
                $('<div class="alert-situation-t">建議動作:</div>').appendTo($_a);
                $('<div class="alert-situation-c">' + a.Situation.Operate + '</div>').appendTo($_a);
                if (a.OperateSop)
                    $('<div class="alert-situation-l"><a href="' + app.siteRoot + 'Data/智慧操作SOP/'+a.Name+'SOP.jpg' + '" target="sop">檢視設施操作S.O.P</a></div>').appendTo($_a);
                return $_a.html();
            });
            helper.bootstrap.genBootstrapAccordion($_acontent.empty(), undefined, undefined, heads, contents);
            $_acontent.find('button').on('click', function () {
                console.log($(this).text());
                var n = $(this).text();
                $.each($_sopdpinctrl.instance.__pinctrl.instance._mapctrl.graphics, function () {
                    if (this.attributes.Name == n) {
                        app.map.panTo(this.getLatLng());
                        return false;
                    }

                })
            });
        }
    }
});