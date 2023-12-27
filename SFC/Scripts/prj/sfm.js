
window.fitkhbounds = false;
window.baselayername = "銀白";
$(document).ready(function () {
    var currentevent = undefined;
    mapHelper.createMap('leaflet', function () {
        $('#main-ctrl').smartFloodModel();
        var $_bc = Init寶珠溝邊線Ctrl($('body', undefined, false)).on($.BasePinCtrl.eventKeys.initUICompleted, function () {
            //setTimeout(function () {
                $_bc.find('.pinswitch').prop('checked', true).trigger('change');
            //}, 100);
        }).hide();
    });
});