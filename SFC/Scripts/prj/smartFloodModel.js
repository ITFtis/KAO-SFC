var flood2dSLrootUrl = "https://www.dprcflood.org.tw/SFC/Data/OUTSWMM/";

(function ($) {
    'use strict';
    var pluginName = 'smartFloodModel'
    var pluginclass = function (element, e) {
        //console.log("init position");
        var current = this;
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.$element = $(element);
        //this.$pumpPreRun = $('#pumpPreRun');
        //this.pumpPreRun = undefined;
    };
    pluginclass.prototype.init = function (options) {
        var that = this;
        //console.log("smartFloodModel.............1");
        //this.$element.on($.menuctrl.eventKeys.popu_init_after, function () {
        //    console.log("smartFloodModel.............2");
            that.initUI();
        //    console.log("smartFloodModel.............3");
        //    //that.pumpPreRun = new pumpPreRun($('#pumpPreRun'));
        //});
    };
    pluginclass.prototype.initUI = function (options) {
        var that = this;
        this.$element.empty();

        var overwriteShowOneLabel = function ($_ctrl) {
            var temp1showOneLabel = $_ctrl.instance.__pinctrl.instance._mapctrl._showOneLabel;
            $_ctrl.instance.__pinctrl.instance._mapctrl._showOneLabel = function (b, _g) {
                if (b) {

                    var d1 = $.grep($_rtctrl.fdatas, function (d) { return _g.attributes.name == d.name });
                    var d2 = $.grep($_f1ctrl.fdatas, function (d) { return _g.attributes.name == d.name });
                    _g.labelpin.symbol.setOffset(0, 30);//.setText('一:' + (d1.length > 0 ? d1[0].value : '---') + ' / 二:' + (d2.length > 0 ? d2[0].value : '---'))
                    var _x = parseInt($(_g.labelpin.getNode()).attr("x"));
                    $(_g.labelpin.getNode()).addClass('pin_label pin_label_flooding').text("").html(
                        '<tspan>' + '一:' + (d1.length > 0 ? d1[0].value : '---') +
                        '</tspan><tspan dy="1.1em" x="' + (_x) + '">' + '二:' + (d2.length > 0 ? d2[0].value : '---') + '</tspan>');
                }
                temp1showOneLabel.call($_ctrl.instance.__pinctrl.instance._mapctrl, b, _g);

            }
        }
       

        //事件
        this.$element.addClass('flooding-simulation meter');
        $('<div class =""><label>事件時間</label></div>').appendTo(this.$element);
        var $_eventContainer = $('<div class ="row event-container"></div>').appendTo(this.$element);
        var $eventYearSelect = $('<div class="col-3"><select class="form-control wra-event-year"></div>').appendTo($_eventContainer).find('select');
        var $eventSelect = $('<div class="col-9"><select class="form-control wra-events"></div>').appendTo($_eventContainer).find('select');
        var $timeSelect = $('<div class="col-12"><select class="form-control"></div>').appendTo($_eventContainer).find('select');
        var $activeCB = $('<label><input type="checkbox">輪播</label>').appendTo($_eventContainer).hide().find('input');///////目前不顯示

        
        //模擬一ctrl
        var $_rtctrl = createFloodSLKmlCtrl(this.$element, '即時', ['#FFB5B5', '#FF7575', '#FF2D2D', '#EA0000', '#AE0000']);
        var $_f1ctrl = createFloodSLKmlCtrl(this.$element, '未來1小時', ['#FFF0AC', '#FFE66F', '#FFDC35', '#EAC100', '#C6A300']);
        var $_f2ctrl = createFloodSLKmlCtrl(this.$element, '未來2小時', ['#FFA6FF', '#FF77FF', '#FF00FF', '#D200D2', '#930093']);
        var $_f3ctrl = createFloodSLKmlCtrl(this.$element, '未來3小時', ['#C4E1E1', '#A3D1D1', '#81C0C0', '#5CADAD', '#408080']);
        var $_f6ctrl = createFloodSLKmlCtrl(this.$element, '未來4小時', ['#E2C2DE', '#D2A2CC', '#C07AB8', '#AE57A4', '#8F4586']);
        var $_f12ctrl = createFloodSLKmlCtrl(this.$element, '未來5小時', ['#DEDEBE', '#CDCD9A', '#B9B973', '#A5A552', '#808040']);
        var $_f24ctrl = createFloodSLKmlCtrl(this.$element, '未來6小時', ['#C4E1E1', '#A3D1D1', '#81C0C0', '#5CADAD', '#408080']);

        
        //var $_pumpreprunbtn = $('<div class ="col-xs-12"><div class="btn btn-default pull-right" disabled>抽水機預佈模擬</div></div>').appendTo(this.$element).find('.btn').on('click', function () {
        //    this.pumpPreRun.setDateTime(new Date(parseInt($timeSelect.val())));
        //    //this.pumpPreRun.setDateTime(new Date('2020/12/06 11:00:00'));
        //    setTimeout(function () {
        //        var z = parseInt(this.pumpPreRun.$element.closest('.jsPanel').css('z-index'));
        //        this.pumpPreRun.$element.closest('.jsPanel').css('z-index', z + 10);//確定在上層
        //    }.bind(this));
        //}.bind(this));

         //Init 事件
        if (true) {
            
            var cy = new Date().getFullYear();
            for (var i = cy; i >= 2023; i--)
                $('<option value="' + i + '">' + i + '</option>').appendTo($eventYearSelect);
            $eventYearSelect[0].selectedIndex = 0;
            $eventYearSelect.on('change', function () {
                helper.misc.showBusyIndicator($_eventContainer);
                $eventSelect.empty();
                $.BasePinCtrl.helper.getWraFhyApi("Event/Year/" + $eventYearSelect.val(), undefined, function (d) {
                    helper.misc.hideBusyIndicator($_eventContainer);
                    var bdatat = new Date('2023/07/01'); //日期後才有資料
                    if (d.Data) {
                        $.each(d.Data, function () {
                            if (!this.IsActive && JsonDateStr2Datetime(this.EndTime) < bdatat)
                                return;
                            var $_p = $('<option value="' + this.EventNo + '">' + this.EventName + '</option>').appendTo($eventSelect);
                            
                            var sdt = JsonDateStr2Datetime(this.BeginTime);
                            var edt = JsonDateStr2Datetime(this.EndTime) || new Date();//IsActive EndTime是null
                            //edt = edt.getTime() > new Date().getTime() ? new Date() : edt;
                            $_p.attr('data-BeginDate', sdt.DateFormat('yyyy/MM/dd HH:mm:00'));//  new Date(sdt.getFullYear(), sdt.getMonth(), sdt.getDate(), sdt.getHours(), sdt.getMinutes()-sdt.getMinutes() % 10);
                            $_p.attr('data-EndDate', edt.DateFormat('yyyy/MM/dd HH:mm:00'));// 
                        });
                    }
                    $eventSelect[0].selectedIndex = 0;
                    $eventSelect.trigger('change');
                })
            }).trigger('change');
            $eventSelect.on('change', function () {
                $timeSelect.empty();
                var $_optui = $eventSelect.find('option:selected');
                //optui.BeginDate == undefined optui.EndDate == undefined>>即時
                var nowTime = new Date(new Date().DateFormat('yyyy/MM/dd HH:') + new Date().DateFormat('mm')[0] + '0:00').getTime();// new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), new Date().getHours(), new Date().getMinutes() - new Date().getMinutes() % 10).getTime();
                var sdt = new Date( $_optui.attr('data-BeginDate'));// ? new Date(optui.BeginDate.getTime()) : new Date(nowTime - 24 * 60 * 60 * 1000);
                var edt = new Date($_optui.attr('data-EndDate'));//? new Date(optui.EndDate.getTime()) : new Date(nowTime);
                //整10分為一單位
                sdt = new Date(sdt.setMinutes(sdt.getMinutes() - (sdt.getMinutes() % 10)));
                edt = new Date(edt.setMinutes(edt.getMinutes() - (edt.getMinutes() % 10)));
                while (edt.getTime() >= sdt.getTime()) {
                    $('<option value="' + edt.getTime() + '">' + edt.DateFormat('yyyy/MM/dd HH:mm') + '</option>').appendTo($timeSelect);
                    //edt.addMinutes(-60);
                    //$('<option value="' + edt.getTime() + '">' + edt.DateFormat('yyyy/MM/dd HH:mm') + '</option>').appendTo($timeSelect);
                    edt.addMinutes(-10);
                }
                $timeSelect[0].selectedIndex = 0;
                $timeSelect.trigger('change');
            });

            //切換時間
            $timeSelect.on('change', function () {
                var _dt = new Date(parseInt($timeSelect.val()));
                var _temp = 0;
                var _callback = function () {
                    if (++_temp == 2)
                        setTimerActive($activeCB.is(':checked'));
                    //console.log('callback');
                }
                setFloodSLKmlCtrlFilter($_rtctrl, _dt, '.BC.DEPTH.RT.txt', _callback);
                setFloodSLKmlCtrlFilter($_f1ctrl, _dt, '.BC.DEPTH.1H.txt', _callback);
                setFloodSLKmlCtrlFilter($_f2ctrl, _dt, '.BC.DEPTH.2H.txt', _callback);
                setFloodSLKmlCtrlFilter($_f3ctrl, _dt, '.BC.DEPTH.3H.txt', _callback);
                setFloodSLKmlCtrlFilter($_f6ctrl, _dt, '.BC.DEPTH.4H.txt', _callback);
                setFloodSLKmlCtrlFilter($_f12ctrl, _dt, '.BC.DEPTH.5H.txt', _callback);
                setFloodSLKmlCtrlFilter($_f24ctrl, _dt, '.BC.DEPTH.6H.txt', _callback);
                //$.ajax({
                //    type: "GET",
                //    url: flood2dSLrootUrl + _dt.DateFormat('yyyy/MM/dd/') + _dt.DateFormat('yyyyMMdd.HH00') + '.TN.PUMP.VOL.txt'
                //}).done(function (str, s) {
                //    $_pumpreprunbtn.attr('disabled', false);
                //}).fail(function (str, s) {
                //    $_pumpreprunbtn.attr('disabled', true);
                //});
                //this.pumpPreRun.setDateTime(undefined);
               
            }.bind(this));

        }
        
        //輪播
        $activeCB.on('click', function () {
            setTimerActive($activeCB.is(':checked'));
        });
        var timerActiveFlag;
        var setTimerActive = function (b) {
            clearTimeout(timerActiveFlag);
            if (b) {
                timerActiveFlag =setTimeout(function () {
                    if ($timeSelect[0].selectedIndex ==0)
                        $timeSelect[0].selectedIndex = $timeSelect.find('option').length - 1;
                    else
                        $timeSelect[0].selectedIndex = $timeSelect[0].selectedIndex-1 ;

                    $timeSelect.trigger('change');
                    //setTimerActive(true);//下載資料完成會呼叫
                }, 1000);
            }
            
        };
    }

    
    $.fn[pluginName] = function (arg) {

        var args, instance;

        if (!(this.data(pluginName) instanceof pluginclass)) {

            this.data(pluginName, new pluginclass(this[0]));
        }

        instance = this.data(pluginName);


        if (typeof arg === 'undefined' || typeof arg === 'object') {

            if (typeof instance.init === 'function') {
                instance.init(arg);
            }
            this.instance = instance;
            return this;

        } else if (typeof arg === 'string' && typeof instance[arg] === 'function') {

            args = Array.prototype.slice.call(arguments, 1);

            return instance[arg].apply(instance, args);

        } else {

            $.error('Method ' + arg + ' does not exist on jQuery.' + pluginName);

        }
    };
})(jQuery);
var floodSL = window.floodSL || { polyStyles: undefined, options: undefined };

floodSL.polyStyles = [
    { name: '0.1', min: 0.1, max: 0.3, strokeColor: '#f7e98a', strokeOpacity: 1, strokeWeight: 1, fillColor: '#f7e98a', fillOpacity: 1, classes: 'water_normal' },
    { name: '0.3', min: 0.3, max: 0.5, strokeColor: '#fcb52d', strokeOpacity: 1, strokeWeight: 1, fillColor: '#fcb52d', fillOpacity: 1, classes: 'water_normal' },
    { name: '0.5', min: 0.5, max: 1, strokeColor: '#f07e22', strokeOpacity: 1, strokeWeight: 1, fillColor: '#f07e22', fillOpacity: 1, classes: 'water_normal' },
    { name: '1.0', min: 1, max: 2, strokeColor: '#fc0d1b', strokeOpacity: 1, strokeWeight: 1, fillColor: '#fc0d1b', fillOpacity: 1, classes: 'water_normal' },
    { name: '2.0', min: 2, max: 99999, strokeColor: '#ba0713', strokeOpacity: 1, strokeWeight: 1, fillColor: '#ba0713', fillOpacity: 1, classes: 'water_normal' }
];
floodSL.options = {
    name: '圖層控制', clickable: false, useLabel: false, useList: false,
    enabledStatusFilter: true,
    url: datahelper.getKhSfmGeojsonData,
    polyStyles: floodSL.polyStyles,
    legendIcons: floodSL.polyStyles,
    filter: function (g) { return false; },
    checkDataStatus: function (g) {
        var r = this.settings.polyStyles[0];
        for (var i = this.settings.polyStyles.length - 1; i >= 0; i--) {
            if (g.value <= this.settings.polyStyles[i].max && g.value >= this.settings.polyStyles[i].min) {
                r = this.settings.polyStyles[i];
                break;
            }
        }
        return r;
        //var c = '#' + helper.format.paddingLeft(Math.floor(Math.random() * 255).toString(16), '0', 2) + helper.format.paddingLeft(Math.floor(Math.random() * 255).toString(16), '0', 2) + helper.format.paddingLeft(Math.floor(Math.random() * 255).toString(16), '0', 2);
        //return { strokeColor: c, strokeOpacity: 1, strokeWeight: 1, fillColor: c, fillOpacity: 1 }//, classes: 'water_normal'}
    },
    type: $.BasePinCtrl.type.polygon
};
var createFloodSLKmlCtrl = function (_$element, _name, _colors) {
    var _legends = JSON.parse(JSON.stringify(floodSL.polyStyles));
    _legends[0].strokeColor = _legends[0].fillColor = _colors[0];
    _legends[1].strokeColor = _legends[1].fillColor = _colors[1];
    _legends[2].strokeColor = _legends[2].fillColor = _colors[2];
    _legends[3].strokeColor = _legends[3].fillColor = _colors[3];
    _legends[4].strokeColor = _legends[4].fillColor = _colors[4];
    var $_ctrl = $('<div ></div>').appendTo(_$element).KmlCtrl($.extend({}, floodSL.options, {
        map: app.map,
        polyStyles: _legends,
        legendIcons: _legends,
        name: _name + '<label class="no-data-message" style="display: none;color:gray;"><無資料></label><label class="total-area-message"></label>',
    })).on($.BasePinCtrl.eventKeys.pinShowChange, function () {
        //if ($reorderLayerCtr == null) $reorderLayerCtr = $_type1ctrl;
    }).on($.BasePinCtrl.eventKeys.repaintPinCompleted, function (evt, ds) {
        //totalArea($_type1ctrl, ds);
    }).on($.BasePinCtrl.eventKeys.pinShowChange, function (evt, _show) {
        //_show ? $_type1ctrl.find('.total-area-message').show() : $_type1ctrl.find('.total-area-message').hide();///////目前不顯示
    });
    return $_ctrl;
}

var setFloodSLKmlCtrlFilter = function ($_ctrl, _dt, _filetype, _callback) {
    if (isNaN(_dt)) {
        _callback('fail');
        return;
    }
    //_dt = new Date('2020/04/21 01:00:00');
    //http開頭是移動式抽水機預佈模式
    var _url = _filetype.toUpperCase().indexOf('HTTP') == 0 ? _filetype : flood2dSLrootUrl + _dt.DateFormat('yyyy/MM/dd/') + _dt.DateFormat('yyyyMMdd.HHmm') + _filetype;
    var fdatas = $_ctrl.fdatas = [];
    $.ajax({
        type: "GET",
        url: _url
    }).done(function (str, s) {
        $_ctrl.find('.no-data-message').hide();
        $(str.split(/[\r\n]+/g)).each(function (i) {
            var _ifos = $.grep(this.split(' '), function (s) { return '' != s; });
            if (_ifos.length == 2)
                fdatas.push({ name: parseInt(_ifos[0]), 'sn': parseInt(_ifos[0]), 'value': parseFloat(_ifos[1]) });
                //fdatas.push({ name: parseInt(_ifos[0]), 'sn': parseInt(_ifos[0]), 'value': Math.random() * 3.5 });// parseFloat(_ifos[1]) });
        });

        var minv = $_ctrl.instance.settings.polyStyles[0].min;
        //console.log(_filetype + '>>' + fdatas.length);
        $_ctrl.instance.setFilter(function (g) {
            g.value = fdatas[parseInt(g.placemarkName) - 1].value;// Math.random() * 3;
            return g.value >= minv;
        });
        _callback('done');
    }).fail(function (str, s) {
        $_ctrl.instance.setFilter(function (g) {
            return false;
        });
        $_ctrl.find('.no-data-message').html('<無資料>').show();
        _callback('fail');
    });
}

