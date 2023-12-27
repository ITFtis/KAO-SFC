
$(document).ready(function () {
    var currentevent = undefined;
    datahelper.preInitData();
    mapHelper.createMap('leaflet', function () {
        setTimeout(function () {
            $('#basemapDiv').on($.MapBaseLayer.events.initUICompleted, function () {
                $('#basemapDiv').MapBaseLayer('setDisplayLayer', '黑階');
            });
        });

        var $_mainContainer = $('#main-ctrl');

        //組tab
        var $_tab = helper.bootstrap.genBootstrapTabpanel($_mainContainer, undefined, undefined,
            ['綜整資訊', '雨量站', '水位站', '淹水感測', '下水道', '&nbsp;&nbsp;災 情&nbsp;&nbsp;'],
            ['<div class="fsta-c">', '<div class="rain-c meter">', '<div class="water-c meter">', '<div class="fsensor-c meter">', '<div class="sewer-c meter">', '<div class="rdisaster-c meter">']
        );
        $_tab.appendTo($_mainContainer).find('.nav').addClass('nav-fill');

        //統計
        var $_fsta= $_tab.find('.fsta-c').fsta().on('change-tab-index', function (e, i) {
            $_tab.find('.nav-item>.nav-link:eq('+i+')').tab("show");
        });

        //雨量
        $_tab.find('.rain-c').rain({ map: app.map }).on('get-data-complete', function (e, ds) {
            $_fsta.fsta('setRainData', ds); //get-data-complete取雨量資料完 , 計算雨量統計資料
        });
        //水位
        $_tab.find('.water-c').water({ map: app.map }).on('get-data-complete', function (e, ds) {
            $_fsta.fsta('setWaterData', ds);
        });
        //淹水感測
        $_tab.find('.fsensor-c').fsensor({ map: app.map }).on('get-data-complete', function (e, ds) {
            $_fsta.fsta('setFloorData', ds);
        });
        //下水道
        $_tab.find('.sewer-c').sewer({ map: app.map }).on('get-data-complete', function (e, ds) {
            $_fsta.fsta('setSewerData', ds);
        });
        //通報災情
        $_tab.find('.rdisaster-c').rdisaster({ map: app.map }).on('get-data-complete', function (e, ds) {
            //$_fsta.fsta('setSewerData', ds);
        });

        //災情
        var initCurrentEvent = function () { 
            if (!currentevent)
                return;
            $_tab.find('.rdisaster-c').rdisaster('setEvent', currentevent);
        }
        //取水利署事件
        window.datahelper.loadWraEvents(function (d) {
            var _eventid = helper.misc.getRequestParas()['eventid'];
            //_eventid = 'T2004';
            //_eventid = 'R00443';// 'T2004';
            if (_eventid) {
                currentevent = $.grep(d, function (d) { return d.EventNo == _eventid; })[0];
                currentevent.Enabled = true;
            }
            else
                currentevent = d[0];
            if (currentevent.Enabled) {
                initCurrentEvent();
            }
        });
        //
        //$('#bgg-ctrl').on($.menuctrl.eventKeys.popu_init_before, function () {
        //    alert('$.menuctrl.eventKeys.popu_init_before');
        //}).on($.menuctrl.eventKeys.init_ctrl_menu_completed, function () {
        //    alert('$.menuctrl.eventKeys.init_ctrl_menu_completed');
        //});
        $('#bgg-ctrl-link').on('click', function () {
            if ($(this).hasClass('selected')) {
                var $_bggctrl = $("#bgg-ctrl");
                helper.misc.showBusyIndicator($_bggctrl);
                datahelper.get寶珠溝即時資訊info(function (ds) {

                    helper.misc.hideBusyIndicator($_bggctrl);
                    var _heads = [];
                    var _contents = [];
                    $.each(ds, function (_i, _v) {
                        if (!_v.Enabled)
                            return;
                        _heads.push(_v.Name);
                        _contents.push('<div class="s-container" data-key="' + _v.Id + '">' +
                                '<div class="row text-center" style="margin:0;"><h3>' + _v.Desc + '</h3></div>' +
                                '<div class="row" style="margin:0;">' +
                                '<div class="col-6"><img  src="' + app.siteRoot+'images/' + _v.Id+'.jpg" style="width:100%"></div>' +
                                    '<div class="info col-6"></div>' +
                                '</div>'+
                            '</div>');
                    })
                    helper.bootstrap.genBootstrapTabpanel($_bggctrl.empty(), undefined, undefined, _heads, _contents);
                    //.text(JSON.stringify(ds));
                    $.each(ds, function (_i, _v) {
                        var ss = MechanicalInfoContent(_v.MechanicalInfos);
                        ss.appendTo($_bggctrl.find('.s-container[data-key="' + _v.Id + '"]  .info').empty());
                        return;
                        //$('<table>').appendTo($_bggctrl.find('.s-container[data-key="'+_v.Id+'"]  .info').empty()).bootstrapTable({
                        //striped: true, //showHeader: false,
                        //classes: 'table table-bordered table-striped table-sm',
                        //columns: [
                        //    { field: 'Name', title: '監控項目' },
                        //    //{ field: 'Value', title: '狀態/資料', align: 'center', class: 'ps-0 pe-0', formatter: function (v) { return v == 'Other' ? v + 'm' : v; }   },
                        //    { field: 'Status', title: '狀態/資料', align: 'center', class: 'ps-0 pe-0', formatter: function (v, d) { return v == '999' ? '<lable ' + (d.Name.indexOf('H') >= 0 ?' class="text-danger"':'')+'>'+ d.Value + 'm</lable>' : '<div class="mechanical-status bbg-'+v+'"></div>'; } },
                        //    { field: 'Time', title: '資料時間', align: 'center', formatter: function (v) { return !v ? '-' : JsonDateStr2Datetime(v).DateFormat('MM-dd HH:mm:ss'); } },
                        //],
                        //data:_v.MechanicalInfos
                    //});
                    });
                    //$('<table>').appendTo($_bggctrl.find(".info").empty()).bootstrapTable({
                    //    striped: true, //showHeader: false,
                    //    classes: 'table table-bordered table-striped table-sm',
                    //    columns: [
                    //        { field: 'Name', title: '監控項目' },
                    //        //{ field: 'Value', title: '狀態/資料', align: 'center', class: 'ps-0 pe-0', formatter: function (v) { return v == 'Other' ? v + 'm' : v; }   },
                    //        { field: 'Status', title: '狀態/資料', align: 'center', class: 'ps-0 pe-0', formatter: function (v, d) { return v == '999' ? '<lable ' + (d.Name.indexOf('H') >= 0 ?' class="text-danger"':'')+'>'+ d.Value + 'm</lable>' : '<div class="mechanical-status bbg-'+v+'"></div>'; } },
                    //        { field: 'Time', title: '資料時間', align: 'center', formatter: function (v) { return !v ? '-' : JsonDateStr2Datetime(v).DateFormat('MM-dd HH:mm:ss'); } },
                    //    ],
                    //    data: ds[0].MechanicalInfos
                    //});
                });
            }
        });
    });
})
