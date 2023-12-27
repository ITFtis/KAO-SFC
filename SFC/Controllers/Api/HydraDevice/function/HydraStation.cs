using SFC.Models.Api.HydraDevice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Controllers.Api.HydraDevice.function
{
    public class HydraStation
    {
        // 取得感測器基本資料
        internal static IEnumerable<ApiHydraDevice> GetDevices()
        {
            string key = "Api/HydroDevice/GetDevices";
            var devices = DouHelper.Misc.GetCache<IEnumerable<ApiHydraDevice>>(24 * 3600 * 1000, key);
            if (devices != null)
                return devices;

            // 取得資料庫內容
            var db = Api.DataController.DbContext;

            // 取得資料庫內容
            devices = db.HydraDeviceBase.Join(
                db.HydraDeviceType,
                (device => device.device_type),
                (type => type.TypeID),
                (device, type) =>
                new
                {
                    device = device,
                    type = type
                }).ToList().Select(e => new ApiHydraDevice
                {
                    Id = e.device.device_id,
                    StationId = e.device.stn_id,
                    Name = e.device.device_name,
                    Type = e.type.TypeName,
                    Enable = e.device.enable
                }).ToList();

            //存入cache
            DouHelper.Misc.AddCache(devices, key);
            return devices;
        }

        internal static List<ApiHydraDevice> GetDevices(string stationID)
        {
            return GetDevices().Where(e => e.StationId == stationID).ToList();
        }
        internal static ApiHydraDevice GetDevice(string stationID, string deviceID)
        {
            var device = GetDevices().Where(e => e.StationId == stationID && e.Id == deviceID).FirstOrDefault();
            return device == null ? new ApiHydraDevice() : device;
        }

        // 取得基本測站資料
        internal static IEnumerable<ApiHydraStation> GetStations()
        {
            string key = "Api/HydroDevice/GetStations";
            var stations = DouHelper.Misc.GetCache<IEnumerable<ApiHydraStation>>(24 * 3600 * 1000, key);
            if (stations != null)
                return stations;

            // 取得資料庫內容
            var db = Api.DataController.DbContext;
            stations = db.HydraStationBase.Where(e => e.enable == true).ToList()
               .Select(station => new ApiHydraStation
               {
                   Id = station.stn_id,
                   Name = station.stn_name,
                   Lat = station.Lat,
                   Lon = station.Lon,
                   Desc = station.stn_name, //過去有分主次頁面的名稱
                   MechanicalInfos = GetDevices(station.stn_id)
               }).ToList();

            //存入cache
            DouHelper.Misc.AddCache(stations, key);
            return stations;
        }

        internal static ApiHydraStation GetStaiton(string stationId)
        {
            var station = GetStations().Where(e => e.Id == stationId).FirstOrDefault();
            return station == null ? new ApiHydraStation() : station;
        }

    }
}