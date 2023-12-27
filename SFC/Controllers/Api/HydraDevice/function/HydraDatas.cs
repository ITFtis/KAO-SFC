using SFC.Models;
using SFC.Models.Api.HydraDevice;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SFC.Controllers.Api.HydraDevice.function
{
    /*
     取得設管科資料
     */
    public class HydraDatas
    {
        internal static IEnumerable<ApiHydraDevice> GetDeviceRealTime()
        {
            return HydraStation.GetDevices().Select(e => new ApiHydraDevice(e)).ToList()
                .GroupJoin(HydraDatas.GetRealTimes(),
                    (device => device.Id),
                    (realTime => realTime.deviceId),
                    (device, realTimes) =>
                    {
                        device.Values = realTimes.ToList();
                        return device;
                    }
                );
        }

        static object GetRealTimesLock = new object();
        internal static IEnumerable<ApiHydraDeviceValue> GetRealTimes(string deviceId = null)
        {
            string key = "Api/HydroDevice/GetRealTimes";
            lock (GetRealTimesLock)
            {
                var apiRealTimeValues = DouHelper.Misc.GetCache<IEnumerable<ApiHydraDeviceValue>>(3 * 60 * 1000, key);
                if (apiRealTimeValues != null)
                    return apiRealTimeValues;
            
                //取得感測器Id清單
                var deviceIds = deviceId == null ?
                    HydraStation.GetDevices().Where(e => e.Enable).Select(e => e.Id).ToList() : //預設找全部
                    HydraStation.GetDevices().Where(e => e.Enable && e.Id == deviceId).Select(e => e.Id).ToList();

                // 取得資料庫內容
                var db = Api.DataController.DbContext;
                apiRealTimeValues = db.HydraDeviceRealTime
                    .Where(e => deviceIds.Contains(e.device_id) && (e.device_status != null || e.value != null)).GroupBy(e => e.device_id) //僅取得目前啟用的感測器資料，並同時清除垃圾資料
                    .Select(datas => new { deviceId = datas.Key, dateTime = datas.Max(e => e.datatime) }) //取得每個感測器最新時間
                    .Join(db.HydraDeviceRealTime, //重新去資料庫裏面取那一筆全部資料出來
                        (latesTime => latesTime),
                        (datas => new { deviceId = datas.device_id, dateTime = datas.datatime }),
                        (latesTime, datas) => datas).ToList()

                    // 轉換格式
                    .Select(e => parseApiValue(e)).ToList();

                //存入cache
                DouHelper.Misc.AddCache(apiRealTimeValues, key);
                return apiRealTimeValues;
            }
        }

        internal static IEnumerable<ApiHydraDeviceValue> GetHistorical(string deviceId, DateTime startDate, DateTime endDate)
        {
            // 取得資料庫內容
            var db = Api.DataController.DbContext;

            return db.HydraDeviceRealTime
                .Where(e => e.device_id == deviceId && e.datatime >= startDate && e.datatime <= endDate
                                && (e.value != null || e.device_status != null)
                ).ToList()
                .Select(e => parseApiValue(e));
        }




        private static ApiHydraDeviceValue parseApiValue(HydraDeviceRealTime realTime)
        {
            // 確認丟進來的realTime是否正常
            if (realTime.value == null && realTime.device_status == null)
                return null;

            var deviceBase = DataController.GetAllHydraDevices().Where(e => e.device_id == realTime.device_id).FirstOrDefault();
            if (deviceBase == null)
                return null;


            // 判斷該提供什麼資料出去
            if (realTime.device_status == null) //水位數值
                return new ApiHydraDeviceValue
                {
                    deviceId = realTime.device_id,
                    Time = realTime.datatime,
                    Value = realTime.value.Value,
                    Display = realTime.value.Value.ToString("0.00"),
                };

            else // 啟閉狀態
                return new ApiHydraDeviceValue
                {
                    deviceId = realTime.device_id,
                    Time = realTime.datatime,
                    Value = Convert.ToInt32(realTime.device_status.Value),
                    Display = realTime.device_status.Value ? deviceBase.status_true : deviceBase.status_false
                };
        }
    }
}