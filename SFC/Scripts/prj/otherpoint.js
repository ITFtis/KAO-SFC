//防汛點位
(function ($) {
    'use strict';
    var pluginName = 'otherpoint';

    var pluginclass = function (element, e) {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        this.$element = $(element);
        this.settings = { map:undefined };


    };
    pluginclass.prototype = {
        constructor: pluginclass,
        init: function (options) {

            var current = this;

            $.extend(this.settings, options);
            current.initUi();

        },
        initUi: function () {
            var that = this;
            $('<div class="other-clear-all-layer glyphicon glyphicon-erase btn btn-sm btn-outline-info" style="position:fixed;right:3rem;padding:1px 3px;top:4px;">關閉圖層</div>')
                .appendTo(this.$element).on('click', function () {
                that.$element.find('.pinswitch:checked').prop("checked", false).trigger('change');
            });

            $('<div class="item-title">氣象圖資</div>').appendTo(this.$element);
            Init雷達迴波圖(this.$element).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
                //$(this).find('.pinswitch').prop('checked', true).trigger('change');
            });
            Init累積雨量圖(this.$element).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
                //$(this).find('.pinswitch').prop('checked', true).trigger('change');
            });

            InitQpf060minRt(this.$element);

            $('<div class="item-title">防災點位</div>').appendTo(this.$element);
            InitMovingPumpCtrl(this.$element);
            InitReservoirCtrl(this.$element);
            InitTideCtrl(this.$element);
            InitRainCtrl($('<div class="row"><div class="col-md-12"></div></div>').appendTo(this.$element), {
                enabledStatusFilter: false, cluster: true, name: "雨量站(全省)",
                canFullInfowindow: true,
                listContainer: '.popu-ctrl-container',
                listTheme: 'gbright',
                loadBase: $.RainCtrl.defaultSettings.loadBase,
                loadInfo: $.RainCtrl.defaultSettings.loadInfo,
                hourlyFieldsInfo: $.RainCtrl.defaultSettings.loadHourlyInfo,
                getDurationOptions: $.RainCtrl.defaultSettings.getDurationOptions
            },true);

            $('<div class="item-title">CCTV</div>').appendTo(this.$element);
            Init河川水位CCTVCtrl(this.$element);
            Init滯洪池CCTVCtrl(this.$element);
            Init抽水截流站CCTVCtrl(this.$element);
            Init車行地下道CCTVCtrl(this.$element);
            Init即時監視影像CCTVCtrl(that.$element);

            $('<div class="item-title">機電設備</div>').appendTo(this.$element);
            Init抽水站Ctrl(this.$element);
            Init截流站Ctrl(this.$element);
            Init滯洪池Ctrl(this.$element);
            Init橡皮壩Ctrl(this.$element);
            Init車行地下道Ctrl(this.$element);

            $('<div class="item-title">其他</div>').appendTo(this.$element);
            InitDistrictCtrl(this.$element);
            Init寶珠溝邊線Ctrl(this.$element);
        }
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