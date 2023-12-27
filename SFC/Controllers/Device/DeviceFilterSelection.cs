using Dou.Misc.Attr;
using SFC.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace SFC.Controllers.Device
{
    public class DeviceFilter_Manufactures : SelectItemsClass
    {
        public const string cacheKey = "SFC.Controllers.Device.DeviceFilter_Manufactures, SFC";
        public override IEnumerable<KeyValuePair<string, object>> GetSelectItems()
        {
            var manufatures = DouHelper.Misc.GetCache<IEnumerable<KeyValuePair<string, object>>>(24 * 3600 * 1000, cacheKey);
            if (manufatures != null)
                return manufatures;

            var selections = Api.DataController.getAllManifactures()
                .Select(e => new KeyValuePair<string, object>(getManufatureID(e), e)).ToList();
            selections.Insert(0, new KeyValuePair<string, object>(getManufatureID("all"), "-所有-"));
            DouHelper.Misc.AddCache(manufatures, cacheKey);

            return selections;
        }

        public String getManufatureID(String name)
        {
            switch (name)
            {
                case "昕傳科技":
                    return "shinTran";
                case "勝邦科技":
                    return "Procal";
                case "開創水資源":
                    return "KaiTrun";
                default:
                    return "all";
            }
        }
    }


    public class DeviceFilter_Year : SelectItemsClass
    {
        public const string cacheKey = "SFC.Controllers.Device.DeviceFilter_Year, SFC";
        public override IEnumerable<KeyValuePair<string, object>> GetSelectItems()
        {
            List<KeyValuePair<string, object>> outList = new List<KeyValuePair<string, object>>();

            for (int year = 2023; year <= DateTime.Now.Year; year++)
            {
                outList.Add(new KeyValuePair<string, object>(year + "", year));
            }
            return outList;
        }
    }

    public class DeviceFilter_County : SelectItemsClass
    {
        public const string cacheKey = "SFC.Controllers.Device.DeviceFilter_County, SFC";
        public override IEnumerable<KeyValuePair<string, object>> GetSelectItems()
        {
            var counties = DouHelper.Misc.GetCache<IEnumerable<KeyValuePair<string, object>>>(24 * 3600 * 1000, cacheKey);
            if (counties != null)
                return counties;

            var selections = Api.DataController.GetAllCounty()
                .Select(e => new KeyValuePair<string, object>(e.Id,e.CountyName)).ToList();
            selections.Insert(0, new KeyValuePair<string, object>("all", "-所有-"));
            DouHelper.Misc.AddCache(selections, cacheKey);

            return selections;
        }
    }

    public class DeviceFilter_Stations : SelectItemsClass
    {
        public const string cacheKey = "SFC.Controllers.Device.DeviceFilter_Stations, SFC";
        public override IEnumerable<KeyValuePair<string, object>> GetSelectItems()
        {
            var counties = DouHelper.Misc.GetCache<IEnumerable<KeyValuePair<string, object>>>(24 * 3600 * 1000, cacheKey);
            if (counties != null)
                return counties;

            var selections = Api.DataController.getAllStations()
                .Select(e => new KeyValuePair<string, object>(e.stt_no, e.stt_name)).ToList();
            DouHelper.Misc.AddCache(selections, cacheKey);
            return selections;
        }
    }

    public class DeviceFilter_ComplesStations : SelectItemsClass
    {
        public const string complexKey = "SFC.Controllers.Device.DeviceFilter_ComplesStations, SFC";

        public override IEnumerable<KeyValuePair<string, object>> GetSelectItems()
        {
            var stations = DouHelper.Misc.GetCache<IEnumerable<KeyValuePair<string, object>>>(24 * 3600 * 1000, complexKey);
            if (stations != null)
                return stations;

            var db = Api.DataController.DbContext;
            var selection = from device in db.DeviceBases
                            join station in db.StationBases
                            on device.stt_no equals station.stt_no

                            select new ComplesStations
                            {
                                stationName = station.stt_name,
                                stationID = device.stt_no,
                                manufacture = device.manufacturer,
                                countyID = station.county_code
                            };


            DouHelper.Misc.AddCache(selection.ToList().Select(e =>
            {
                e.manufacture = new DeviceFilter_Manufactures().getManufatureID(e.manufacture);

                return new KeyValuePair<string, object>(e.stationID.ToString(),
                    Newtonsoft.Json.JsonConvert.SerializeObject(new
                    {
                        v = e.stationName,
                        county = e.countyID,
                        manufacture = e.manufacture
                    }));
            }).ToList(), complexKey);
            return new DeviceFilter_ComplesStations().GetSelectItems();
        }
    }


    public class ComplesStations
    {
        public string stationName { get; set; }
        public string stationID { get; set; }
        public string manufacture { get; set; }
        public string countyID { get; set; }
    }

}