
window.fitkhbounds = false;
window.baselayername = "銀白";
window.fullbc = true; //寶珠溝範圍佔滿，不用設邊界
$(document).ready(function () {
    var $_gnav = $('#mainmenu > .container-fluid > .navbar-collapse > .nav >.dropdown.nav-item > ul');
    var $_popu_ctrl_container = $('.popu-ctrl-container');
    var $_bc, $_bcgrid, $_arrowctrl;
    var chart, currentLineWidth = 4;;
    $('#mainmenu a[href="#main-ctrl"]').remove();
    helper.misc.showBusyIndicator();
    datahelper.getBCDinfo(undefined, function (bs) {
        helper.misc.hideBusyIndicator();

        //剖面chart
        $('<li class="nav-item"><a href="#chart-ctrl" class="nav-link  popu-ctrl-menu" data-theme="primary" data-default-top="60" data-default-width="' + $('body').width() * 3 / 5 + '" data-default-height="' + $('body').height() * 3 / 5 + '"  data-glyphicon="glyphicon-stats">寶珠溝縱面圖</a></li>').appendTo($_gnav)
            .find('a').on($.menuctrl.eventKeys.popu_init_after, function () {
                

            }).on($.menuctrl.eventKeys.ctrl_show_change, function (e, s) {
                if(s)
                    paintChartTimer();
            });
        var $_functrl = $('<div id="chart-ctrl" class="chart-ctrl"><div class="chart"></div><div class="d-flex justify-content-between"></div>').appendTo($_popu_ctrl_container).find('.d-flex');
        $('<div><label>圖表背景透明度:</label><input type="range" value="1" max="1" min="0" step=".1"></div>').appendTo($_functrl).find('input').on('change input', function () {
            $('body')[0].style.setProperty('--chart_bg',this.value);
        });
        $('<div><label>圖表線(Linw)寬度:</label><input type="range" value="'+currentLineWidth+'" max="10" min="2" step="1"></div>').appendTo($_functrl).find('input').on('change input', function () {
            currentLineWidth = this.value;
            updateChart();
            if (chart)
                chart.update({ plotOptions: { line: { lineWidth: this.value} } });
        });
        //</div><div><label>圖表背景透明度:</label><input type="range" value="1" max="1" min="0" step=".1">
        '<div class="d-flex justify-content-between">'
        //訊息指示線
        $_arrowctrl = $('<li class="nav-item"><a id="arrow-ctrl" href="#" class="nav-link selected" data-glyphicon="glyphicon-comment">訊息指示線</a></li>').appendTo($_gnav).find('a').on('click', function () {
            $(this).toggleClass('selected');
            paintAllArrow(false);
        }).on("mouseover", function () {
            //if (!this.flag) {
            //    $(this).removeAttr("href");
            //    $('<div class="arrow-ctrl-panel"><input type="range"><input type="checkbox"></div>').appendTo($(this));
            //}
            //this.flag = true;
        });
        //產浮動訊息視窗
        bs.forEach(function (_v, _i, _a) { 
            var _id = _v.Name.replace('/', '-');
            var _n = _v.Name;
            $(' <li class="nav-item"><a href="#bc-st-info-' + _id + '" class="nav-link popu-ctrl-menu" data-default-show="true" data-default-width="240" data-default-top="' + (70 + 10 * _i) + '" data-default-left="' + (100 * _i) + '" data-glyphicon="glyphicon-scale">' + _n + '</a></li>').appendTo($_gnav).hide();
            $('<div id="bc-st-info-' + _id + '" class="bc-st-info">').appendTo($_popu_ctrl_container);
        });
        
        //初始地圖
        mapHelper.createMap('leaflet', function () {

            $_bc = InitBCDCtrl($('body')).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
                $(this).find('.pinswitch').prop('checked', true).trigger('change');
            }).on($.BasePinCtrl.eventKeys.afterSetdata, function (e, ds, dds) { //抓完資料刷新所以訊息
                setTimeout(function () {
                    paintAllArrow(true);
                }, 260);
                paintChartTimer();
            }).hide();
            $_bc.instance.__pinctrl.instance._mapctrl.showInfoWindow = function (g, c) { //點選清單後會觸發
                var $_c = $_popu_ctrl_container.find('.tools-group-panel a[href="#bc-st-info-' + g.attributes.Name.replace('/', '-') + '"]');
                $_c.trigger('setActive', [!$_c.hasClass('selected')]);
                //setInfoContent(g.attributes);
                setTimeout(function () {
                    paintArrow(g,true);
                }, $_c.hasClass('selected')?500:0);
            }

            var mapreviewchangetimer;
            app.map.on('zoom move', function () {
                clearTimeout(mapreviewchangetimer);
                mapreviewchangetimer = setTimeout(function () { paintAllArrow(false) }, 10);
            });
            var winodwresizetimer;
            $(window).on('resize', function () {
                clearTimeout(winodwresizetimer);
                winodwresizetimer = setTimeout(function () { paintAllArrow(false); }, 100);
            })
           
            //邊界
            var $_bcb = Init寶珠溝邊線Ctrl($('body'), undefined, false).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
                $_bcb.find('.pinswitch').prop('checked', true).trigger('change');
                //網格,用在邊界處裡完，確保上下層問題
                $_bcgrid = InitBCD網格Ctrl($('body')).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
                    $(this).find('.pinswitch').prop('checked', true).trigger('change');
                }).hide();
                setTimeout(function () {
                    var of = $_bcgrid.instance.__pinctrl.instance._mapctrl.onFocusGraphic;
                    $_bcgrid.instance.__pinctrl.instance._mapctrl.onFocusGraphic = function (g, fromlist, gearChart) {
                        of.call(this, g, fromlist);
                        if (gearChart == undefined) //來致滑鼠移入grid
                        {
                            focusGrigAndeChart(g.attributes.DX, false);
                        }
                    }
                    var ff = $_bcgrid.instance.__pinctrl.instance._mapctrl.offFocusGraphic;
                    $_bcgrid.instance.__pinctrl.instance._mapctrl.offFocusGraphic = function (g, fromlist, gearChart) {
                        ff.call(this, g, fromlist);
                    }
                }, 500);
            }).hide();
        });

    });

    //設定訊息視窗內文
    var setInfoContent = function (d) {
        var _html = $_bc.instance.settings.pinInfoContent.call($_bc.instance, d);

        var _tid = 'bc-st-info-' + d.Name.replace('/', '-');
        var _wc = d.Rt != undefined && d.Warn != undefined ? (parseFloat(d.Rt) >= parseFloat(d.Warn) ? 'warning' : '') : '';
        var $_jp = $_popu_ctrl_container.find('.jsPanel-' + _tid);
        if ($_jp.length != 0) { //尚未被create(未顯示)
            $_jp.removeClass('warning').addClass('').addClass(_wc);//[0].pin_name = _cd.Name;
            $_jp[0].pin_name = d.Name;
            var $_c = $_popu_ctrl_container.find('#' + _tid).empty();
            $(_html).appendTo($_c);
        }
    }
    //依名稱取Graaphic
    var getGraaphicByName = function (n) {
    return $.grep($_bc.instance.__pinctrl.instance._mapctrl.graphics, function (_g) {
        return _g.attributes.Name == n;
    })[0];
}
    //畫所有訊息標線
    var paintAllArrow = function (resetInfo) {
        console.log('paintAllArrow');
        var gs = $_bc.instance.__pinctrl.instance._mapctrl.graphics;
        gs.forEach(function (g) {
            paintArrow(g, resetInfo);
        });
    }
    
    //畫訊息標線
    var paintArrow = function (g, resetInfo) {
        //console.log('paintArrow '+g.attributes.Name);
        var nc = g.attributes.Name.replace('/', '-')
        var $_jp = $_popu_ctrl_container.find(' > .jsPanel-bc-st-info-' + nc);
        if ($_jp.length == 0) //從未開啟
            return;
        if (!$_jp[0].listen_event) {
            $_jp.on('drag resize', function (e) {
                paintArrow(getGraaphicByName(this.pin_name), false);
            });
            $_jp.find('>.jsPanel-hdr .glyphicon-remove').on('click', function () {
                var _n = $(this).closest('.jsPanel')[0].pin_name;
                setTimeout(function () { paintArrow(getGraaphicByName(_n), false); }, 10);
            });

            $_jp[0].listen_event = true;
        }

        if ($_jp[0].arrow) {
            $_jp[0].arrow.remove();
            $_jp[0].arrow = null;
        }
        //console.log("$_arrowctrl.hasClass('selected'):" + $_arrowctrl.hasClass('selected'));
        if (!$_jp.hasClass('selected') || !$_arrowctrl.hasClass('selected'))
            return;
        
        if (resetInfo)
            setInfoContent(g.attributes);

        var latlng1 = g.getLatLng();
        
        var _atop = $('body').hasClass('full-body-content') ? 0 : $('body header').height();;
        var x = $_jp.position().left;//+ $_jp.width() ;
        var y = $_jp.position().top - _atop;// + $_jp.height()/2;
        var w = $_jp.width();
        var h = $_jp.height();
        var xys = [{ x: x, y: y + h / 2 }, { x: x + w, y: y + h / 2 }, { x: x + w / 2, y: y }, { x: x + w / 2, y: y + h }];

        var gpixel = app.map.latLngToContainerPoint(latlng1);
        var minl = 999999999999;
        var minxy = null;
        xys.forEach(function (xy) {
            var l = Math.pow(xy.x - gpixel.x, 2) + Math.pow(xy.y - gpixel.y, 2);
            if (l < minl) {
                minxy = xy;
                minl = l;
            }
        });

        var pw = 6;
        var _cp = app.map.containerPointToLayerPoint({ x: x, y: y });
        //var latlng2 = app.map.layerPointToLatLng(_cp);
        var latlng2 = app.map.containerPointToLatLng(minxy);
        var latlng3, latlng4;
        if (minxy.x == x + w / 2) {
            latlng3 = app.map.containerPointToLatLng({ x: minxy.x + pw, y: minxy.y });
            latlng4 = app.map.containerPointToLatLng({ x: minxy.x - pw, y: minxy.y });
        }
        else {
            latlng3 = app.map.containerPointToLatLng({ x: minxy.x, y: minxy.y + pw });
            latlng4 = app.map.containerPointToLatLng({ x: minxy.x, y: minxy.y - pw });
        }

        
        $_jp[0].arrow = L.polygon([latlng1, latlng3, latlng2, latlng4, latlng1], { fillColor: '#345d84', weight: 0, fillOpacity:.5 }).addTo(app.map);
    }

    //畫chart
    var paintChartTimerTemp;
    var paintChartTimer = function () {
        clearTimeout(paintChartTimerTemp);
        paintChartTimerTemp = setTimeout(paintChart, 100);
    }
    var updateChartTimerTemp;
    var updateChart = function () {
        clearTimeout(updateChartTimerTemp);
        updateChartTimerTemp = setTimeout(function () {
            var $_chart = $('.jsPanel-chart-ctrl .chart');
            if (chart)
                chart.update({
                    chart: { height: $_chart.height() },
                    plotOptions: { line: { lineWidth: currentLineWidth } }
                });
        }, 100);
    }
    var paintChart = function () {
        var $_jp = $('.jsPanel-chart-ctrl.selected');
        if ($_jp.length == 0)
            return;

        var $_chart = $_jp.find('.chart');
        if (!$_jp[0].listen_event) {
            $_jp.on('resize', function () {
                //paintChartTimer();
                updateChart();
            })
            $_jp[0].listen_event = true;
        }
        

        helper.misc.showBusyIndicator();
        datahelper.getBcSectioninfo(function (ds) {
            helper.misc.hideBusyIndicator();
            $_chart.empty();
            var seriespara =
            {
                warn: [],
                level: {
                    name: '堤頂高/路面高', color: '#006400', type: 'line', yAxis: 0, xValue: "DX", info: "Value", unit: 'mm', marker: {enabled: false }},
                wave: { enabled: false }
            };
            chart =charthelper.showMeterChart($_chart, undefined, ds.Top, "寶珠溝縱面圖", '水位(mm)', undefined, seriespara, function (opts) {
                opts.chart.backgroundColor = 'rgba(0,0,0,0)';

                opts.plotOptions.line.lineWidth = 3;

                opts.tooltip.useHTML = true;
                opts.tooltip.formatter = function (evt) {
                    var _r = ['<div class="tooltip-title">日期:</div><div class="tooltip-value">' + helper.format.JsonDateStr2Datetime(ds.Time).DateFormat('MM/dd HH:mm') + '</div>'];
                    $.each(this.points, function () {
                        var thisp = this;
                        
                        _r.push('<div class="tooltip-title">' + this.series.name + ':</div><div class="tooltip-value">' + (this.y != undefined ? (this.y).toFixed(2) + ' ' + (this.series.userOptions.unit || 'mm') : '-') + '</div>');
                        if (this.point._type)
                            _r.push('<div class="tooltip-title">類別:</div><div class="tooltip-value">' + this.point._type+'</div>');
                        if (this.point._mark)
                            _r.push('<div class="tooltip-title">地標:</div><div class="tooltip-value">' + this.point._mark + '</div>');
                    });
                    return _r.join('<br>');

                };
                
                opts.xAxis.labels.formatter = function () {
                    return this.value+"";
                };
                opts.xAxis.type = undefined;

                opts.yAxis.min = -1;
                opts.yAxis.max = 16;

                opts.legend.enabled = true;

                var beds = { name: '渠底高', index: 9, color: '#556B2F', type: 'line', unit: 'mm', dashStyle: 'Dash', marker: { enabled: false }, data: [] };
                var rts = { name: '即時', color: '#0000FF', type: 'line', unit: 'mm', marker: { enabled: false }, data: [] };
                var h1s = { name: '未來1H', color: '#666666', type: 'line', unit: 'mm', dashStyle: 'Dash', marker: { enabled: false }, data: [] };
                var h2s = { name: '未來2H', color: '#AAAAAA', type: 'line', unit: 'mm', dashStyle: 'Dash', marker: { enabled: false }, data: [] };
                $.each(ds.Bed, function (_i, _v) {
                    beds.data.push({ x: _v.DX, y: _v.Value, _type: _v.Type, _mark: _v.Mark });
                    if (ds.Rt && ds, ds.Rt.length > 0)
                        rts.data.push({ x: ds.Rt[_i].DX, y: ds.Rt[_i].Value });
                    if (ds.H1 && ds, ds.H1.length > 0)
                        h1s.data.push({ x: ds.H1[_i].DX, y: ds.H1[_i].Value });
                    if (ds.H2 && ds, ds.H2.length > 0)
                        h2s.data.push({ x: ds.H2[_i].DX, y: ds.H2[_i].Value });
                });
                opts.series.push(beds);
                opts.series.unshift(h2s);
                opts.series.unshift(h1s);
                opts.series.unshift(rts);
                
            }, function (_i, _x, _y) {
                focusGrigAndeChart(_x, true);
            });
        });
    }

    //
    var tempgraphic = null;
    var focusGrigAndeChart = function (dx, isGrid) {
        var gs = $_bcgrid.instance.__pinctrl.instance._mapctrl.graphics;
        if (tempgraphic)
            $_bcgrid.instance.__pinctrl.instance._mapctrl.offFocusGraphic(tempgraphic);
        if (isGrid) {
            $.each(gs, function (_i, _g) {
                if (_g.attributes.DX == dx) {
                    //$_bcgrid.instance.__pinctrl.instance._mapctrl.onFocusRowIndex(_i);
                    $_bcgrid.instance.__pinctrl.instance._mapctrl.onFocusGraphic(_g, false, false);
                    tempgraphic = _g;
                    return false;
                }
            });
        }
        else {
            charthelper.chartGearingByX(dx, [chart]);
        }
    }
});